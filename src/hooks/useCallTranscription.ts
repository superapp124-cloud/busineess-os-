import { useEffect, useRef, useState } from 'react';

export const useCallTranscription = (isActive: boolean, onResult?: (text: string) => void) => {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        setIsListening(false);
      }
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this environment.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim() !== '') {
        if (onResult) {
          onResult(finalTranscript);
        } else if ((window as any).electronAPI) {
          // Fallback to IPC if no callback provided
          (window as any).electronAPI.send('process-transcript-chunk', finalTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore some common harmless errors like 'no-speech'
      if (event.error !== 'no-speech') {
        setError(event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if it's supposed to be active (e.g. timeout or silence)
      if (isActive && recognitionRef.current) {
        try {
          recognition.start();
        } catch(e) {}
      } else {
        setIsListening(false);
      }
    };

    let startTimeout: any;
    try {
      // Delay speech recognition start to prevent racing WebRTC for the microphone lock
      startTimeout = setTimeout(() => {
        if (isActive && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e: any) {
            setError(e.message);
          }
        }
      }, 3000);
      
      recognitionRef.current = recognition;
    } catch (e: any) {
      setError(e.message);
    }

    return () => {
      clearTimeout(startTimeout);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent auto-restart on unmount
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isActive]);

  return { isListening, error };
};
