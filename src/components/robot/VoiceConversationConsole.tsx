/**
 * CHATR-Meera Voice & Conversation Console
 * Real Voice Interaction Loop: Local Microphone STT -> Ollama / Local NLU -> Task Engine -> MuJoCo -> Local TTS.
 * Supports Hindi, English, Urdu, Punjabi, Bengali, Tamil, Telugu with authentic Web Audio visualizer.
 */

import React, { useState, useEffect, useRef } from 'react';
import { meeraVoice, VoiceState } from '../../utils/speechTts';
import { ollamaNlu } from '../../utils/ollamaNlu';
import { SimBridgeClient } from '../../../packages/sim-bridge/src';

interface Message {
  id: string;
  sender: 'user' | 'meera';
  text: string;
  time: string;
}

const LANGUAGES = [
  { id: 'hi-IN', label: 'Hindi (Hinglish)' },
  { id: 'en-IN', label: 'English' },
  { id: 'ur-PK', label: 'Urdu' },
  { id: 'pa-IN', label: 'Punjabi' },
  { id: 'bn-IN', label: 'Bengali' },
  { id: 'ta-IN', label: 'Tamil' },
  { id: 'te-IN', label: 'Telugu' },
];

export const VoiceConversationConsole: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micBars, setMicBars] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Kitchen se paani ki bottle mere paas le aao',
      time: '14:28',
    },
    {
      id: '2',
      sender: 'meera',
      text: 'Theek hai, main kitchen se paani ki bottle lekar aapke paas aa rahi hoon.',
      time: '14:28',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubVoice = meeraVoice.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
      if (speaking) setVoiceState('RESPONDING');
      else if (!isListening) setVoiceState('IDLE');
    });

    const unsubState = meeraVoice.onVoiceStateChange((st) => setVoiceState(st));

    return () => {
      unsubVoice();
      unsubState();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening]);

  // Live Microphone Amplitude Poll
  useEffect(() => {
    let active = true;
    const pollMic = () => {
      if (isListening) {
        const amps = meeraVoice.getMicAmplitude();
        setMicBars(amps);
      }
      if (active) {
        animFrameRef.current = requestAnimationFrame(pollMic);
      }
    };
    if (isListening) {
      pollMic();
    } else {
      setMicBars([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
    }
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setVoiceState('THINKING');

    try {
      // Step 1: Parse intent via Ollama (Local AI) or deterministic local parser
      const parsed = await ollamaNlu.parseCommand(text, selectedLang);

      // Extract language-specific speech reply
      let reply = parsed.speechReply.hi;
      if (selectedLang === 'en-IN') reply = parsed.speechReply.en;
      else if (selectedLang === 'ur-PK') reply = parsed.speechReply.ur;
      else if (selectedLang === 'pa-IN') reply = parsed.speechReply.pa;
      else if (selectedLang === 'bn-IN') reply = parsed.speechReply.bn;
      else if (selectedLang === 'ta-IN') reply = parsed.speechReply.ta;
      else if (selectedLang === 'te-IN') reply = parsed.speechReply.te;

      const meeraMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'meera',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, meeraMsg]);

      // Step 2: Speak reply using local TTS
      await meeraVoice.speak(reply, selectedLang);

      // Step 3: Trigger real MuJoCo action based on parsed intent
      if (parsed.intent === 'FETCH_OBJECT') {
        setVoiceState('EXECUTING');
        await SimBridgeClient.executeTask('FETCH_OBJECT', parsed.targetObject || 'water_bottle_01');
      } else if (parsed.intent === 'WAVE') {
        setVoiceState('EXECUTING');
        await SimBridgeClient.wave();
      } else if (parsed.intent === 'STAND') {
        await SimBridgeClient.stand().catch(() => SimBridgeClient.reset(42));
      } else if (parsed.intent === 'WALK') {
        await SimBridgeClient.navigate('kitchen');
      } else if (parsed.intent === 'DANCE') {
        await SimBridgeClient.dance();
      } else if (parsed.intent === 'PUSH_TEST') {
        await SimBridgeClient.injectFault('external_push');
      }

      setVoiceState('IDLE');
    } catch (err) {
      console.error('Command processing error:', err);
      setVoiceState('ERROR');
      setTimeout(() => setVoiceState('IDLE'), 2000);
    }
  };

  const toggleMic = async () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      meeraVoice.stopMicStream();
      setIsListening(false);
      setVoiceState('IDLE');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Local Speech Recognition is not supported in this browser. Please type your command.');
      return;
    }

    try {
      await meeraVoice.startMicStream();
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceState('IDLE');
        meeraVoice.stopMicStream();
      };

      recognition.onend = () => {
        setIsListening(false);
        meeraVoice.stopMicStream();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceState('ERROR');
    }
  };

  const isDegraded = !meeraVoice.isTtsAvailable() || !meeraVoice.isSttAvailable();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl h-full font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">💬</span>
          <span className="text-xs font-bold text-slate-200 tracking-wider">VOICE & CONVERSATION</span>
          {isDegraded && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              VOICE DEGRADED
            </span>
          )}
        </div>

        {/* Multilingual Selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Real Audio Waveform Visualizer ── */}
      <div className="h-12 bg-slate-950 rounded-2xl border border-slate-800/80 p-2 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              voiceState === 'LISTENING'
                ? 'bg-blue-400 animate-ping'
                : voiceState === 'RESPONDING'
                ? 'bg-emerald-400 animate-pulse'
                : voiceState === 'THINKING'
                ? 'bg-purple-400 animate-pulse'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {voiceState === 'LISTENING'
              ? '🎙 LISTENING...'
              : voiceState === 'RESPONDING'
              ? '🔊 MEERA SPEAKING'
              : voiceState === 'THINKING'
              ? '🧠 OLLAMA NLU'
              : voiceState === 'EXECUTING'
              ? '⚡ EXECUTING TASK'
              : 'IDLE'}
          </span>
        </div>

        {/* Live Audio Amplitude Spectrum Bars */}
        <div className="flex items-center gap-1 h-6">
          {micBars.map((amp, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                voiceState === 'LISTENING'
                  ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]'
                  : isSpeaking
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  : 'bg-slate-700'
              }`}
              style={{
                height: `${Math.max(4, (isSpeaking ? (Math.sin(Date.now() * 0.01 + idx) * 0.4 + 0.6) : amp) * 24)}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Conversation Message History ── */}
      <div className="flex-1 overflow-y-auto max-h-[140px] flex flex-col gap-2 pr-1 font-sans text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[88%] rounded-2xl p-2.5 shadow ${
              m.sender === 'user'
                ? 'self-end bg-cyan-950/80 border border-cyan-700/80 text-cyan-100'
                : 'self-start bg-slate-950 border border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-slate-400 font-mono">
                {m.sender === 'user' ? 'YOU' : 'MEERA (AI)'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">{m.time}</span>
            </div>
            <p className="leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>

      {/* ── Spoken / Typed Command Input Bar ── */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={toggleMic}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title={isListening ? 'Stop listening' : 'Speak to Meera'}
        >
          {isListening ? '⏹' : '🎤'}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type or speak a household command..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};
