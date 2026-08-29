import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, CheckCircle2, Sparkles, X } from 'lucide-react';
import { DryRunContentItem } from '@/services/mediaAgency/production/DryRun001Engine';

interface Live916PlayerModalProps {
  item: DryRunContentItem;
  onClose: () => void;
}

export const Live916PlayerModal: React.FC<Live916PlayerModalProps> = ({ item, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRenderingFile, setIsRenderingFile] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const duration = 12; // 12 seconds preview duration
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedOffsetRef = useRef<number>(0);

  // Split script into timed phrases
  const phrases = [
    { text: item.hook, start: 0, end: 3.5, isHook: true },
    { text: item.script.split('.')[0] + '.', start: 3.5, end: 7.0, isHook: false },
    { text: item.script.split('.').slice(1).join('.').trim(), start: 7.0, end: 10.0, isHook: false },
    { text: item.cta, start: 10.0, end: 12.0, isHook: false }
  ];

  // Speech synthesis voiceover
  useEffect(() => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    const fullText = `${item.hook}. ${item.script}. ${item.cta}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Select an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
    if (englishVoice) utterance.voice = englishVoice;

    if (isPlaying) {
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, isMuted, item]);

  // Main Canvas Rendering Loop (30 FPS 9:16 layout: 360 x 640 logical canvas scaled for crisp display)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 360;
    const height = 640;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    startTimeRef.current = Date.now() - (elapsedOffsetRef.current * 1000);

    const render = () => {
      if (!isPlaying) return;

      const now = Date.now();
      const elapsed = ((now - startTimeRef.current) / 1000) % duration;
      setCurrentTime(elapsed);

      // 1. Background: Dynamic Animated Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const shift = (elapsed / duration) * Math.PI * 2;
      
      if (item.category.includes('AI') || item.category.includes('Enterprise')) {
        grad.addColorStop(0, `rgb(${Math.floor(15 + Math.sin(shift) * 10)}, ${Math.floor(20 + Math.cos(shift) * 10)}, 45)`);
        grad.addColorStop(1, `rgb(${Math.floor(30 + Math.cos(shift) * 15)}, 10, ${Math.floor(60 + Math.sin(shift) * 20)})`);
      } else if (item.category.includes('Career') || item.category.includes('India')) {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#064e3b');
      } else {
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e293b');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Ambient Grid / Floating Particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 20; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 20; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Top Header Ribbon (Topic & Quality Score Badge)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, 24, width - 40, 36, 10);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.category.toUpperCase(), 32, 46);

      ctx.fillStyle = '#34d399';
      ctx.font = '700 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE: ${item.qualityScore.compositeScore}/100`, width - 32, 46);
      ctx.textAlign = 'left';

      // 4. Progress Bar at Top
      const progress = elapsed / duration;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(20, 68, width - 40, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(20, 68, (width - 40) * progress, 3);

      // 5. Active Phrase Kinetic Typography
      const activePhrase = phrases.find(p => elapsed >= p.start && elapsed < p.end) || phrases[0];

      if (activePhrase) {
        ctx.save();
        ctx.textAlign = 'center';

        if (activePhrase.isHook) {
          // Large Bouncing Hook Typography
          const hookProgress = (elapsed - activePhrase.start) / (activePhrase.end - activePhrase.start);
          const scale = 1 + Math.sin(hookProgress * Math.PI) * 0.05;
          ctx.translate(width / 2, height / 2 - 30);
          ctx.scale(scale, scale);

          // Hook Label Tag
          ctx.fillStyle = '#f59e0b';
          ctx.font = '800 12px system-ui, -apple-system, sans-serif';
          ctx.fillText('⚡ 3-SECOND HOOK', 0, -50);

          // Kinetic Main Hook
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 24px system-ui, -apple-system, sans-serif';
          
          const words = activePhrase.text.split(' ');
          let line1 = '';
          let line2 = '';
          words.forEach((w, i) => {
            if (i < words.length / 2) line1 += w + ' ';
            else line2 += w + ' ';
          });

          ctx.fillText(line1.trim(), 0, -10);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(line2.trim(), 0, 26);
        } else {
          // Body Script / Subtitles
          ctx.translate(width / 2, height / 2 - 20);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(-150, -40, 300, 90, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = '700 16px system-ui, -apple-system, sans-serif';
          
          // Wrap text
          const words = activePhrase.text.split(' ');
          let line = '';
          let y = -12;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 260 && n > 0) {
              ctx.fillText(line, 0, y);
              line = words[n] + ' ';
              y += 24;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 0, y);
        }
        ctx.restore();
      }

      // 6. Live Audio Waveform Simulation at Bottom
      const waveY = height - 120;
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 24; i++) {
        const barHeight = Math.sin(elapsed * 8 + i) * 14 + 18;
        const barX = (width / 2) - 96 + (i * 8);
        ctx.beginPath();
        ctx.roundRect(barX, waveY - barHeight / 2, 4, barHeight, 2);
        ctx.fill();
      }

      // 7. Footer CTA Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, height - 70, width - 40, 44, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👉 ${item.cta}`, width / 2, height - 43);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, item]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      elapsedOffsetRef.current = currentTime;
      if ('speechSynthesis' in window) window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      startTimeRef.current = Date.now() - (elapsedOffsetRef.current * 1000);
      if ('speechSynthesis' in window) window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    elapsedOffsetRef.current = 0;
    setCurrentTime(0);
    startTimeRef.current = Date.now();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const fullText = `${item.hook}. ${item.script}. ${item.cta}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      if (!isMuted) window.speechSynthesis.speak(utterance);
    }
    setIsPlaying(true);
  };

  const handleExportMP4 = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRenderingFile(true);
    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsRenderingFile(false);
      };

      recorder.start();
      handleReplay();

      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, duration * 1000);
    } catch {
      setIsRenderingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Live 9:16 Video Player</h3>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Video Canvas Container */}
        <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800 relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleTogglePlay}
          />
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTogglePlay}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 font-bold">
            {currentTime.toFixed(1)}s / {duration}s
          </div>

          <button
            onClick={handleExportMP4}
            disabled={isRenderingFile}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 disabled:opacity-50"
          >
            {isRenderingFile ? (
              <span className="text-[10px]">Recording...</span>
            ) : downloadUrl ? (
              <a href={downloadUrl} download={`${item.id}_916.webm`} className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>Save</span>
              </a>
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>

        {/* Video Metadata Footer */}
        <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
          <div className="text-slate-300 font-bold truncate">SEO: {item.seoTitle}</div>
          <div className="truncate">Keywords: {item.keywords.join(', ')}</div>
        </div>
      </div>
    </div>
  );
};
