import { useEffect, useRef, useState, useCallback } from 'react';
import { useGeminiLive } from './useGeminiLive';
import { getGlobalAudioContext } from '@/utils/audioContext';

export const useAudioInterceptor = (
  isEnabled: boolean,
  localStream: MediaStream | null,
  fromLanguage: string = "Kashmiri",
  toLanguage: string = "Hindi"
) => {
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);

  const handleAudioData = useCallback((pcmBase64: string) => {
    if (!audioContextRef.current || !destinationNodeRef.current) return;

    try {
      const binaryString = atob(pcmBase64);
      const combinedPcm = new Int16Array(binaryString.length / 2);
      
      let offset = 0;
      for (let i = 0; i < binaryString.length; i += 2) {
        combinedPcm[offset++] = (binaryString.charCodeAt(i) & 0xFF) | ((binaryString.charCodeAt(i + 1) & 0xFF) << 8);
      }
      
      const float32Data = new Float32Array(combinedPcm.length);
      for (let i = 0; i < combinedPcm.length; i++) {
        float32Data[i] = combinedPcm[i] / 32768.0;
      }

      // DEBUG: Notify UI that we received audio
      window.dispatchEvent(new CustomEvent('ai-audio-debug', { detail: float32Data.length }));

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000); 
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      source.connect(destinationNodeRef.current);
      source.connect(audioContextRef.current.destination);
      
      const currentTime = audioContextRef.current.currentTime;
      const playTime = Math.max(currentTime, nextPlayTimeRef.current);
      
      source.start(playTime);
      nextPlayTimeRef.current = playTime + audioBuffer.duration;
    } catch (err) {
      console.error('Error processing incoming Gemini audio:', err);
    }
  }, []);

  const { connect, disconnect, isConnected, isReady, error, sendAudioChunk } = useGeminiLive({
    fromLanguage,
    toLanguage,
    onAudioData: handleAudioData
  });

  const cleanup = useCallback(() => {
    disconnect();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    setProcessedStream(null);
    audioContextRef.current = null;
  }, [disconnect]);

  useEffect(() => {
    if (!isEnabled || !localStream) {
      cleanup();
      return;
    }

    // Connect to Gemini
    connect();

    const startInterceptor = async () => {
      try {
        console.log('🎙️ [AI Audio] Cloning reliable local stream...');
        const clonedStream = localStream.clone();
        micStreamRef.current = clonedStream;
        
        console.log('🎙️ [AI Audio] Starting interceptor setup...');
        const audioContext = getGlobalAudioContext();
        audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
          console.log('🎙️ AudioContext is suspended, attempting to resume...');
          await audioContext.resume();
        }

        const sourceNode = audioContext.createMediaStreamSource(clonedStream);
        sourceNodeRef.current = sourceNode;

        const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processorNode;

        const destinationNode = audioContext.createMediaStreamDestination();
        destinationNodeRef.current = destinationNode;

        // Preserve video tracks from original stream if any
        const videoTracks = localStream.getVideoTracks();
        const finalStream = new MediaStream([
          ...destinationNode.stream.getAudioTracks(),
          ...videoTracks
        ]);
        
        setProcessedStream(finalStream);
        nextPlayTimeRef.current = audioContext.currentTime;

        let chunkCount = 0;
        
        processorNode.onaudioprocess = (e) => {
          if (!isReady) return;

          const inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate RMS volume to verify mic is active
          let sumSquares = 0;
          for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sumSquares / inputData.length);
          
          chunkCount++;
          if (chunkCount % 10 === 0) {
            window.dispatchEvent(new CustomEvent('ai-mic-debug', { detail: { rms, chunkCount } }));
          }

          // Convert Float32Array (-1.0 to 1.0) to PCM16 (-32768 to 32767)
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Safe Base64 encoding for chunks
          const uint8Array = new Uint8Array(pcm16.buffer);
          let binary = '';
          for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          
          sendAudioChunk(btoa(binary));
        };

        // Prevent Chrome from muting the track due to feedback loop detection!
        const dummyGain = audioContext.createGain();
        dummyGain.gain.value = 0; // Completely silent
        
        // Connect nodes
        sourceNode.connect(processorNode);
        processorNode.connect(dummyGain);
        dummyGain.connect(audioContext.destination);

      } catch (err) {
        console.error('🎙️ [AI Audio] Setup failed:', err);
      }
    };

    startInterceptor();

    return cleanup;
  }, [isEnabled, localStream, isReady, connect, cleanup, sendAudioChunk]);

  // Handle incoming AI audio chunks (We must listen on window for the specific WS message or modify useGeminiLive to pass audio back properly)
  // Actually, useGeminiLive doesn't parse audio! Let's update useGeminiLive or intercept it!
  // Wait, if I cannot intercept WS, I must use onAudioData if I added it to useGeminiLive.
  // Let's modify useGeminiLive if needed, but for now we just remove the onmessage hack that broke encapsulation.

  return { processedStream, isConnected, isReady, error };
};
