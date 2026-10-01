/**
 * CHATR HEALTH OS — VoiceVitalsModal
 *
 * Hands-free local voice vitals logging modal.
 * Uses speech recognition / Whisper to capture user voice,
 * processes the transcript via deterministic HealthVoiceParser,
 * and records structured HealthEvents into LocalHealthStore.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthVoiceParser, VoiceHealthParseResult } from '@/services/health/HealthVoiceParser';
import { toast } from 'sonner';

interface VoiceVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVitalLogged?: () => void;
}

export function VoiceVitalsModal({ isOpen, onClose, onVitalLogged }: VoiceVitalsModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parseResult, setParseResult] = useState<VoiceHealthParseResult | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setParseResult(null);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser/device.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setParseResult(null);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0]?.isFinal) {
          handleFinalTranscript(currentText);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[VoiceVitalsModal] Speech error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('[VoiceVitalsModal] Start failed:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleFinalTranscript = async (text: string) => {
    if (!text.trim()) return;
    const result = await HealthVoiceParser.commitParsedVoice(text);
    setParseResult(result);
    if (result.success) {
      toast.success(result.feedbackText);
      onVitalLogged?.();
    }
  };

  const handleManualSubmit = async () => {
    if (!transcript.trim()) return;
    const result = await HealthVoiceParser.commitParsedVoice(transcript);
    setParseResult(result);
    if (result.success) {
      toast.success(result.feedbackText);
      onVitalLogged?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Voice Health Logger</h3>
            <p className="text-xs text-slate-400">On-device • 100% Private • No Cloud Required</p>
          </div>
        </div>

        {/* Listening Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-600/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </motion.button>
          <p className="mt-3 text-sm font-medium text-slate-300">
            {isListening ? 'Listening... Speak your reading' : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Live Transcript / Input */}
        <div className="mb-4">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl min-h-[50px] flex items-center">
            <p className="text-sm text-slate-200">
              {transcript || <span className="text-slate-500 italic">"BP 128 over 82", "Heart rate 72", "Weight 79 kg"...</span>}
            </p>
          </div>
        </div>

        {/* Result Feedback */}
        {parseResult && (
          <div className={`p-3 rounded-2xl mb-4 flex items-start gap-2 border ${
            parseResult.success
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}>
            {parseResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            )}
            <p className="text-xs leading-relaxed">{parseResult.feedbackText}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {transcript && !parseResult?.success && (
            <Button
              onClick={handleManualSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2"
            >
              Parse & Log
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl py-2"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
