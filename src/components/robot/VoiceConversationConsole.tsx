/**
 * CHATR-Meera Voice & Conversation Console
 * Live audio visualizer, multi-lingual language selector, and interactive spoken dialogue.
 */

import React, { useState, useEffect } from 'react';
import { meeraVoice } from '../../utils/speechTts';

interface Message {
  id: string;
  sender: 'user' | 'meera';
  text: string;
  time: string;
}

interface VoiceConversationConsoleProps {
  onSendCommand?: (cmd: string) => void;
}

export const VoiceConversationConsole: React.FC<VoiceConversationConsoleProps> = ({ onSendCommand }) => {
  const [selectedLang, setSelectedLang] = useState('Hindi (Hinglish)');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Kitchen se paani ki bottle mere paas le aao',
      time: '13:51',
    },
    {
      id: '2',
      sender: 'meera',
      text: 'Theek hai, main kitchen se paani ki bottle le kar aapke paas aa rahi hoon.',
      time: '13:52',
    },
  ]);

  useEffect(() => {
    const unsub = meeraVoice.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    if (onSendCommand) {
      onSendCommand(text);
    }

    // Auto-reply from Meera
    setTimeout(async () => {
      let replyText = 'Ji, main is task ko execute kar rahi hoon.';
      if (text.toLowerCase().includes('paani') || text.toLowerCase().includes('bottle')) {
        replyText = 'Theek hai, main kitchen se paani ki bottle le kar aapke paas aa rahi hoon.';
      } else if (text.toLowerCase().includes('namaste') || text.toLowerCase().includes('hello')) {
        replyText = 'Namaste! Main Meera hoon, CHATR humanoid assistant.';
      }

      const meeraMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'meera',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, meeraMsg]);
      await meeraVoice.speak(replyText, 'hi-IN');
    }, 600);
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.includes('Hindi') ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Mic error:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl h-full justify-between">
      {/* Top Header & Waveform */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-sm">🎙️</span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              VOICE & CONVERSATION
            </span>
          </div>

          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none font-medium"
          >
            <option>Hindi (Hinglish)</option>
            <option>Hindi (Devanagari)</option>
            <option>English</option>
            <option>Urdu</option>
            <option>Punjabi</option>
            <option>Bengali</option>
            <option>Tamil</option>
            <option>Telugu</option>
          </select>
        </div>

        {/* Animated Audio Waveform */}
        <div className="h-10 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-center gap-1 px-4 overflow-hidden">
          {[12, 24, 18, 32, 20, 14, 28, 36, 22, 16, 30, 24, 14, 26, 34, 18, 22, 12].map(
            (height, i) => (
              <span
                key={i}
                style={{
                  height: isSpeaking || isListening ? `${height}px` : '6px',
                  transition: 'height 0.15s ease',
                }}
                className={`w-1.5 rounded-full ${
                  isSpeaking
                    ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                    : isListening
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : 'bg-slate-700'
                }`}
              />
            )
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[160px] pr-1 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'meera' && (
              <img
                src="/assets/meera_avatar.jpg"
                alt="Meera Avatar"
                className="w-7 h-7 rounded-full object-cover border border-cyan-400 shadow-md shrink-0 mt-0.5"
              />
            )}
            <div
              className={`max-w-[82%] p-2.5 rounded-2xl leading-relaxed shadow ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tr-sm'
                  : 'bg-cyan-950/70 text-cyan-100 border border-cyan-700/60 rounded-tl-sm'
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Voice Input & Action Bar */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={toggleMic}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title="Click to speak into microphone"
        >
          🎤
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type or speak a household command..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />

        <button
          onClick={() => handleSend()}
          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
};
