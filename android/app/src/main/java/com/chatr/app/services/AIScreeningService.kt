package com.chatr.app.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.chatr.app.kernel.CallerInfo
import com.chatr.app.kernel.ChatrIntelligenceApi
import com.chatr.app.kernel.DialogueAction
import com.chatr.app.kernel.DialogueSpeaker
import com.chatr.app.kernel.DialogueTurn
import com.chatr.app.kernel.router.ModelRouter
import com.chatr.app.kernel.router.adapters.GeminiNanoAdapter
import com.chatr.app.kernel.router.adapters.MediaPipeGemmaAdapter
import com.chatr.app.ondeviceai.OnDeviceAiService
import kotlinx.coroutines.*
import java.io.File
import java.util.Locale

/**
 * AIScreeningService -- Conversational Multi-Turn AI Call Screening Service.
 *
 * Implements Phase 1B two-way dialogue loop:
 *   1. Starts when incoming GSM call is intercepted and answered.
 *   2. Routes audio to voice communication attributes.
 *   3. Greets caller via TTS.
 *   4. Captures caller response via SpeechRecognizer.
 *   5. Sends turn to ChatrIntelligenceApi for contextual reasoning.
 *   6. Repeats up to MAX_TURNS (default 5) or until user takes over.
 *   7. Broadcasts real-time turns to IncomingCallOverlayService for live transcript display.
 */
class AIScreeningService : Service() {

    private var phoneNumber: String = ""
    private var screeningMode: String = "MODE_DEFAULT"

    private var tts: TextToSpeech? = null
    private var speechRecognizer: SpeechRecognizer? = null
    private var audioManager: AudioManager? = null

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var autoStopJob: Job? = null

    private var ttsInitialized = false
    private val dialogueHistory = mutableListOf<DialogueTurn>()
    private var currentTurnCount = 0

    private val intelligenceApi: ChatrIntelligenceApi by lazy {
        val nano = GeminiNanoAdapter(applicationContext, OnDeviceAiService(applicationContext))
        val gemmaPath = File(filesDir, "llm/gemma3-1b-it-int4-v1.task").absolutePath
        val gemma = MediaPipeGemmaAdapter(applicationContext, gemmaPath)
        ModelRouter(applicationContext, listOf(nano, gemma))
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "AIScreeningService created")
        audioManager = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        phoneNumber = intent?.getStringExtra(EXTRA_PHONE_NUMBER) ?: ""
        screeningMode = intent?.getStringExtra(EXTRA_SCREENING_MODE) ?: "MODE_DEFAULT"
        Log.d(TAG, "onStartCommand - multi-turn screening call from: $phoneNumber, mode: $screeningMode")

        startForeground(NOTIFICATION_ID, buildNotification())
        scheduleAutoStop()
        configureAudioRoute()
        initializeTts()

        return START_NOT_STICKY
    }

    override fun onDestroy() {
        Log.d(TAG, "AIScreeningService destroyed")
        restoreAudioRoute()
        cleanUp()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // -----------------------------------------------------------------------
    // Audio Routing (Uplink / Downlink)
    // -----------------------------------------------------------------------

    private fun configureAudioRoute() {
        try {
            audioManager?.mode = AudioManager.MODE_IN_COMMUNICATION
            Log.d(TAG, "Audio mode set to MODE_IN_COMMUNICATION")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to set audio mode", e)
        }
    }

    private fun restoreAudioRoute() {
        try {
            audioManager?.mode = AudioManager.MODE_NORMAL
            Log.d(TAG, "Audio mode restored to MODE_NORMAL")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to restore audio mode", e)
        }
    }

    // -----------------------------------------------------------------------
    // TTS
    // -----------------------------------------------------------------------

    private fun initializeTts() {
        tts = TextToSpeech(applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                if (screeningMode == "MODE_DELIVERY_GUIDE" || screeningMode == "MODE_AI_BOUNCER") {
                    tts?.language = Locale("hi", "IN")
                } else {
                    tts?.language = Locale.US
                }

                // Route TTS through VOICE_COMMUNICATION stream for cellular injection
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    val attrs = AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                    tts?.setAudioAttributes(attrs)
                }

                ttsInitialized = true
                Log.d(TAG, "TTS initialized - speaking greeting")
                speakGreeting()
            } else {
                Log.e(TAG, "TTS initialization failed with status: $status")
                broadcastResult(phoneNumber, RESULT_TTS_FAILED)
                stopSelf()
            }
        }
    }

    private fun speakGreeting() {
        val greeting = when (screeningMode) {
            "MODE_DELIVERY_GUIDE" -> "Hello bhaiya, Arshid sir busy hain. Aap main gate par aake security ko bata dijiye, flat number 402 hai."
            "MODE_AI_BOUNCER" -> "Namaskar. Arshid ji currently busy hain. Kya aap loan ya credit card ke silsile mein call kar rahe hain?"
            else -> "Hi, I am Chatr AI screening this call for Arshid. Who is calling and what is the purpose of your call?"
        }

        speakUtterance(greeting)
    }

    private fun speakUtterance(text: String) {
        val turn = DialogueTurn(DialogueSpeaker.CHATR, text)
        dialogueHistory.add(turn)
        broadcastTurn("CHATR", text)

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                Log.d(TAG, "TTS speaking: $text")
            }

            override fun onDone(utteranceId: String?) {
                Log.d(TAG, "TTS done speaking - listening for caller response")
                serviceScope.launch {
                    startSpeechRecognition()
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                Log.e(TAG, "TTS utterance error")
                broadcastResult(phoneNumber, RESULT_TTS_FAILED)
                stopSelf()
            }
        })

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, UTTERANCE_ID + "_" + currentTurnCount)
    }

    // -----------------------------------------------------------------------
    // Speech Recognition (Caller Downlink)
    // -----------------------------------------------------------------------

    private fun startSpeechRecognition() {
        if (!SpeechRecognizer.isRecognitionAvailable(applicationContext)) {
            Log.w(TAG, "Speech recognition not available on this device")
            broadcastResult(phoneNumber, RESULT_RECOGNITION_UNAVAILABLE)
            stopSelf()
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(applicationContext).apply {
            setRecognitionListener(buildRecognitionListener())
            startListening(buildRecognizerIntent())
        }

        Log.d(TAG, "SpeechRecognizer started listening (turn $currentTurnCount)")
    }

    private fun buildRecognizerIntent(): Intent =
        Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "en-IN")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 2_000L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3_000L)
        }

    private fun buildRecognitionListener() = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) { Log.d(TAG, "SpeechRecognizer ready") }
        override fun onBeginningOfSpeech() { Log.d(TAG, "Caller started speaking") }
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() { Log.d(TAG, "Caller stopped speaking") }

        override fun onError(error: Int) {
            val errorMsg = recognitionErrorToString(error)
            Log.w(TAG, "SpeechRecognizer error: $errorMsg ($error)")
            // If caller didn't speak or timed out, finalize screening
            if (dialogueHistory.isNotEmpty()) {
                finalizeScreening()
            } else {
                broadcastResult(phoneNumber, RESULT_NO_SPEECH)
                stopSelf()
            }
        }

        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val callerText = matches?.firstOrNull() ?: ""
            Log.d(TAG, "Caller utterance: \"$callerText\"")

            if (callerText.isNotBlank()) {
                val callerTurn = DialogueTurn(DialogueSpeaker.CALLER, callerText)
                dialogueHistory.add(callerTurn)
                broadcastTurn("CALLER", callerText)
                currentTurnCount++

                processDialogueTurn(callerText)
            } else {
                finalizeScreening()
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {}
        override fun onEvent(eventType: Int, params: Bundle?) {}
    }

    // -----------------------------------------------------------------------
    // Conversational Loop Reasoning
    // -----------------------------------------------------------------------

    private fun processDialogueTurn(callerUtterance: String) {
        if (currentTurnCount >= MAX_TURNS) {
            Log.i(TAG, "Max turns reached ($MAX_TURNS). Finalizing screening.")
            speakFarewellAndStop()
            return
        }

        serviceScope.launch {
            try {
                val callerInfo = CallerInfo(
                    phoneNumber = phoneNumber,
                    resolvedEntity = null,
                    spamRisk = 0.2f,
                    intentLabel = screeningMode
                )
                val action = intelligenceApi.conductDialogueTurn(callerInfo, callerUtterance, dialogueHistory)

                when (action) {
                    is DialogueAction.Speak -> {
                        speakUtterance(action.text)
                    }
                    is DialogueAction.EndScreening -> {
                        speakFarewellAndStop()
                    }
                    is DialogueAction.ContinueListening -> {
                        startSpeechRecognition()
                    }
                    is DialogueAction.ExtractIntent -> {
                        Log.i(TAG, "Extracted intent: ${action.intent.action}")
                        finalizeScreening()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Dialogue reasoning error", e)
                speakFarewellAndStop()
            }
        }
    }

    private fun speakFarewellAndStop() {
        val farewell = "Thank you. I have recorded your message and notified Arshid."
        val turn = DialogueTurn(DialogueSpeaker.CHATR, farewell)
        dialogueHistory.add(turn)
        broadcastTurn("CHATR", farewell)

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) {
                finalizeScreening()
            }
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                finalizeScreening()
            }
        })
        tts?.speak(farewell, TextToSpeech.QUEUE_FLUSH, null, UTTERANCE_ID + "_farewell")
    }

    private fun finalizeScreening() {
        val fullTranscript = dialogueHistory.joinToString("\n") { "${it.speaker}: ${it.text}" }
        Log.i(TAG, "Screening finished. Full transcript:\n$fullTranscript")
        broadcastResult(phoneNumber, fullTranscript)
        stopSelf()
    }

    // -----------------------------------------------------------------------
    // Broadcasts
    // -----------------------------------------------------------------------

    private fun broadcastTurn(speaker: String, text: String) {
        val intent = Intent(ACTION_SCREENING_TURN).apply {
            putExtra(EXTRA_PHONE_NUMBER, phoneNumber)
            putExtra(EXTRA_TURN_SPEAKER, speaker)
            putExtra(EXTRA_TURN_TEXT, text)
            putExtra(EXTRA_TURN_COUNT, currentTurnCount)
        }
        LocalBroadcastManager.getInstance(applicationContext).sendBroadcast(intent)
    }

    private fun broadcastResult(phoneNumber: String, screeningResult: String) {
        val intent = Intent(ACTION_SCREENING_RESULT).apply {
            putExtra(EXTRA_PHONE_NUMBER, phoneNumber)
            putExtra(EXTRA_SCREENING_RESULT, screeningResult)
        }
        LocalBroadcastManager.getInstance(applicationContext).sendBroadcast(intent)
    }

    // -----------------------------------------------------------------------
    // Notifications & Auto-stop
    // -----------------------------------------------------------------------

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Chatr AI is actively screening this call"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification() = NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("Chatr AI Screening Call...")
        .setContentText("Conversational AI receptionist active for $phoneNumber")
        .setSmallIcon(android.R.drawable.ic_btn_speak_now)
        .setPriority(NotificationCompat.PRIORITY_LOW)
        .setOngoing(true)
        .setSilent(true)
        .build()

    private fun scheduleAutoStop() {
        autoStopJob = serviceScope.launch {
            delay(AUTO_STOP_MS)
            Log.w(TAG, "AIScreeningService auto-stopping after ${AUTO_STOP_MS}ms")
            finalizeScreening()
        }
    }

    private fun cleanUp() {
        autoStopJob?.cancel()
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.destroy()
            speechRecognizer = null
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying SpeechRecognizer: ${e.message}")
        }
        try {
            tts?.stop()
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TTS: ${e.message}")
        }
    }

    private fun recognitionErrorToString(error: Int): String = when (error) {
        SpeechRecognizer.ERROR_AUDIO                -> "Audio recording error"
        SpeechRecognizer.ERROR_CLIENT               -> "Client-side error"
        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
        SpeechRecognizer.ERROR_NETWORK              -> "Network error"
        SpeechRecognizer.ERROR_NETWORK_TIMEOUT      -> "Network timeout"
        SpeechRecognizer.ERROR_NO_MATCH             -> "No recognition match"
        SpeechRecognizer.ERROR_RECOGNIZER_BUSY      -> "Recognizer busy"
        SpeechRecognizer.ERROR_SERVER               -> "Server error"
        SpeechRecognizer.ERROR_SPEECH_TIMEOUT       -> "Speech timeout"
        else                                        -> "Unknown error"
    }

    companion object {
        private const val TAG = "AIScreeningService"

        const val ACTION_SCREENING_TURN   = "com.chatr.app.SCREENING_TURN"
        const val ACTION_SCREENING_RESULT = "com.chatr.app.SCREENING_RESULT"
        const val EXTRA_PHONE_NUMBER      = "phone_number"
        const val EXTRA_SCREENING_RESULT  = "screening_result"
        const val EXTRA_SCREENING_MODE    = "screening_mode"
        const val EXTRA_TURN_SPEAKER      = "turn_speaker"
        const val EXTRA_TURN_TEXT         = "turn_text"
        const val EXTRA_TURN_COUNT        = "turn_count"

        const val RESULT_TIMEOUT                 = "__timeout__"
        const val RESULT_NO_SPEECH               = "__no_speech__"
        const val RESULT_TTS_FAILED              = "__tts_failed__"
        const val RESULT_RECOGNITION_UNAVAILABLE = "__recognition_unavailable__"

        private const val CHANNEL_ID   = "ChatrAIScreening"
        private const val CHANNEL_NAME = "Chatr AI Call Screening"
        private const val NOTIFICATION_ID = 7001
        private const val UTTERANCE_ID = "chatr_dialogue"

        private const val MAX_TURNS = 5
        private const val AUTO_STOP_MS = 45_000L

        fun start(context: Context, phoneNumber: String, mode: String = "MODE_DEFAULT") {
            val intent = Intent(context, AIScreeningService::class.java).apply {
                putExtra(EXTRA_PHONE_NUMBER, phoneNumber)
                putExtra(EXTRA_SCREENING_MODE, mode)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            Log.d(TAG, "AIScreeningService.start() called for $phoneNumber")
        }

        fun stop(context: Context) {
            val intent = Intent(context, AIScreeningService::class.java)
            context.stopService(intent)
            Log.d(TAG, "AIScreeningService.stop() called")
        }
    }
}
