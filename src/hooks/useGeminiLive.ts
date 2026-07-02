import { useState, useRef, useCallback } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const HOST = 'generativelanguage.googleapis.com';
const URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;


export interface UseGeminiLiveOptions {
  fromLanguage: string;
  toLanguage: string;
  onAudioData: (pcmBase64: string) => void;
  onTextData?: (text: string) => void;
}

export const useGeminiLive = ({ fromLanguage, toLanguage, onAudioData, onTextData }: UseGeminiLiveOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    setError(null);
    const ws = new WebSocket(URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Gemini Live WS Connected');
      setIsConnected(true);
      
      // Send setup message
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.5-flash-native-audio-latest', // Working model for v1beta BidiGenerateContent
          systemInstruction: {
            parts: [{
              text: `You are a real-time translator. The user is speaking in ${fromLanguage}. You must translate what they say into ${toLanguage}. Speak only the translated text in ${toLanguage} with no additional commentary.`
            }]
          },
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede" // Natural female voice, or "Puck" for male
                }
              }
            }
          }
        }
      };
      
      ws.send(JSON.stringify(setupMessage));
    };

    ws.onmessage = async (event) => {
      try {
        let textData = event.data;
        if (event.data instanceof Blob) {
          textData = await event.data.text();
        } else if (typeof event.data !== 'string') {
          console.warn('Gemini Live WS received unknown data type');
          return;
        }
        
        const response = JSON.parse(textData);
        
        if (response.setupComplete) {
          console.log('Gemini Live Setup Complete');
          setIsReady(true);
          return;
        }

        if (response.serverContent?.modelTurn) {
          const parts = response.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
              onAudioData(part.inlineData.data);
            }
            if (part.text && onTextData) {
              onTextData(part.text);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
      }
    };

    ws.onclose = (event) => {
      console.log('Gemini Live WS Disconnected', event.code, event.reason);
      setIsConnected(false);
      setIsReady(false);
      wsRef.current = null;
      if (event.code !== 1000 && event.code !== 1005) {
        setError(`Connection closed (${event.code}): ${event.reason || 'Check API key or internet'}`);
      }
    };

    ws.onerror = (error) => {
      console.error('Gemini Live WS Error:', error);
      setError('WebSocket connection failed. Ensure your Gemini API Key is valid and has Multimodal Live API access.');
    };
  }, [fromLanguage, toLanguage, onAudioData, onTextData]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // Send client content with turnComplete to cleanly end
      try {
        wsRef.current.send(JSON.stringify({
          clientContent: {
            turnComplete: true
          }
        }));
      } catch (e) {}
      
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReady(false);
  }, []);

  const sendAudioChunk = useCallback((base64PCM: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !isReady) return;

    const message = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: "audio/pcm;rate=16000",
          data: base64PCM
        }]
      }
    };
    
    wsRef.current.send(JSON.stringify(message));
  }, [isReady]);

  return {
    isConnected,
    isReady,
    error,
    connect,
    disconnect,
    sendAudioChunk
  };
};
