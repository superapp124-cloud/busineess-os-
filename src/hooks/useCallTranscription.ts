import { useEffect, useRef, useState } from 'react';

export const useCallTranscription = (isActive: boolean, onResult?: (text: string) => void, localStream?: MediaStream | null) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const onResultRef = useRef(onResult);
  
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!isActive) {
      setIsListening(false);
      return;
    }

    let recognition: any = null;

    // Try standard Web Speech API first (for Chrome/Web users)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript.trim() && onResultRef.current) onResultRef.current('Host: ' + finalTranscript.trim() + '\n');
        };
        recognition.onerror = (e: any) => {
          console.log('[Transcription Hook] SpeechRecognition error:', e.error);
          if (recognition) {
            try { recognition.stop(); } catch (err) {}
          }
          startWhisperFallback();
        };
        recognition.start();
      } catch (err) {
        startWhisperFallback();
      }
    } else {
      startWhisperFallback();
    }

    function startWhisperFallback() {
      console.log('[Transcription Hook] Initializing Whisper fallback pipeline...');
      // Initialize Web Worker for Local AI Whisper
      if (!workerRef.current) {
        console.log('[Transcription Hook] Creating new Whisper Web Worker...');
        workerRef.current = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' });
        workerRef.current.onmessage = (e) => {
          if (e.data.type === 'progress') {
            if (e.data.data?.status === 'initiate') setDownloadProgress(0);
            if (e.data.data?.progress) setDownloadProgress(Math.round(e.data.data.progress));
            if (e.data.data?.status === 'done' && e.data.data?.file?.includes('decoder')) setDownloadProgress(100);
          }
          else if (e.data.type === 'result' && onResultRef.current && e.data.text?.trim()) {
            console.log('[Transcription Hook] Received raw text from worker:', e.data.text);
            
            // Filter out common Whisper hallucination tokens (e.g. [Music], [BLANK_AUDIO], (whirring), etc.)
            let cleanedText = e.data.text.trim();
            cleanedText = cleanedText.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();

            // Ignore if the text was only hallucination tokens or single non-speech words like "you" hallucinated
            if (cleanedText.length > 2 && cleanedText.toLowerCase() !== 'you') {
              onResultRef.current('Host: ' + cleanedText + '\n');
            }
            
            setDownloadProgress(null); // Clear progress when we get first result
          }
          else if (e.data.type === 'error' && onResultRef.current) {
            console.error('[Transcription Hook] Whisper AI Worker Error:', e.data.error);
            setDownloadProgress(null);
          }
        };
      } else {
        console.log('[Transcription Hook] Reusing existing Whisper worker.');
      }

      setIsListening(true);
      
      const startAudioProcessor = (stream: MediaStream) => {
        console.log('[Transcription Hook] Audio stream received, setting up AudioContext processor. Tracks:', stream.getAudioTracks().length);
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          
          let audioBuffer: Float32Array = new Float32Array(0);
          // We capture ~5 seconds of audio at 16kHz (80,000 samples)
          const CHUNK_SIZE = 80000; 

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const newBuffer = new Float32Array(audioBuffer.length + inputData.length);
            newBuffer.set(audioBuffer);
            newBuffer.set(inputData, audioBuffer.length);
            audioBuffer = newBuffer;

            if (audioBuffer.length >= CHUNK_SIZE) {
              // Calculate RMS volume for basic Voice Activity Detection (VAD)
              let sumSquares = 0;
              for (let i = 0; i < audioBuffer.length; i++) {
                sumSquares += audioBuffer[i] * audioBuffer[i];
              }
              const rms = Math.sqrt(sumSquares / audioBuffer.length);
              
              // Only dispatch if RMS is above a small threshold, otherwise it's just silence (which causes hallucinations)
              if (rms > 0.005) {
                console.log(`[Transcription Hook] Accumulated ${audioBuffer.length} samples. RMS: ${rms.toFixed(4)}. Dispatching to worker...`);
                try {
                  workerRef.current?.postMessage({ type: 'transcribe', audioData: audioBuffer });
                } catch (err: any) {
                  console.error('[Transcription Hook] Failed to postMessage to worker:', err);
                }
              } else {
                console.log(`[Transcription Hook] Audio is completely silent (RMS: ${rms.toFixed(4)}). Skipping Whisper transcription to avoid hallucinations.`);
              }
              audioBuffer = new Float32Array(0);
            }
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
          
          if (audioCtx.state === 'suspended') {
            console.warn('[Transcription Hook] AudioContext is suspended. Attempting to resume...');
            audioCtx.resume().then(() => {
              console.log('[Transcription Hook] AudioContext resumed successfully. State:', audioCtx.state);
            }).catch(e => console.error('[Transcription Hook] Failed to resume AudioContext:', e));
          } else {
            console.log('[Transcription Hook] Audio processing pipeline fully wired up. AudioContext state:', audioCtx.state);
          }
        } catch (err: any) {
          console.error('[Transcription Hook] Failed to attach audio processor:', err);
          setError('Failed to attach audio processor: ' + err.message);
          setIsListening(false);
        }
      };

      if (localStream) {
        console.log('[Transcription Hook] Using provided localStream for transcription.');
        startAudioProcessor(localStream);
      } else {
        console.log('[Transcription Hook] No localStream provided, requesting microphone access...');
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(startAudioProcessor)
          .catch(err => {
            console.error('[Transcription Hook] Microphone access denied:', err);
            setError('Microphone access denied: ' + err.message);
          });
      }
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isActive, localStream]);

  return { isListening, error, downloadProgress };
};
