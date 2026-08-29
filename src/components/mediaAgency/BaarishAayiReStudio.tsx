import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Music, 
  Sparkles, 
  Flame, 
  Heart, 
  CloudRain, 
  Radio, 
  Layers, 
  Share2, 
  Film,
  Zap
} from 'lucide-react';
import { BAARISH_AAYI_RE_SONG, SongSection } from '@/services/mediaAgency/production/BaarishAayiReEngine';

export const BaarishAayiReStudio: React.FC = () => {
  const [sections] = useState<SongSection[]>(BAARISH_AAYI_RE_SONG);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(3); // Default to Chorus Hook
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalDuration = sections.reduce((sum, s) => sum + s.durationSec, 0);
  const currentSection = sections[currentSectionIndex] || sections[0];

  // 105 BPM Hindi Pop & Rain Audio Synthesizer
  const playMusicalBeat = (freq: number, energy: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (isMuted) return;

      const now = ctx.currentTime;

      // 1. Kick / Dholak Bass Drum (105 BPM = ~0.57s beat)
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(120, now);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      kickGain.gain.setValueAtTime(energy === 'peak' ? 0.25 : 0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);

      // 2. Melodic Pop Chord Pad
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = energy === 'peak' ? 'sawtooth' : 'triangle';
      padOsc.frequency.setValueAtTime(freq, now);
      padGain.gain.setValueAtTime(0.04, now);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      padOsc.connect(padGain);
      padGain.connect(ctx.destination);
      padOsc.start(now);
      padOsc.stop(now + 0.8);

    } catch {
      // Non-blocking fallback
    }
  };

  // Sings the Hindi Lyrics
  const singLyrics = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.2; // Cheerful, melodious pitch
    utterance.volume = isMuted ? 0 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN'));
    if (indVoice) utterance.voice = indVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Playback timer & section progression
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 0.1;
          
          // Trigger 105 BPM rhythm pulse every 0.57 seconds
          if (Math.floor(next / 0.57) !== Math.floor(prev / 0.57)) {
            playMusicalBeat(currentSection.chordRootFreq, currentSection.energyLevel);
          }

          // Check section bounds
          let elapsed = 0;
          let secIdx = 0;
          for (let i = 0; i < sections.length; i++) {
            if (next >= elapsed && next < elapsed + sections[i].durationSec) {
              secIdx = i;
              break;
            }
            elapsed += sections[i].durationSec;
          }

          if (secIdx !== currentSectionIndex && secIdx < sections.length) {
            setCurrentSectionIndex(secIdx);
            singLyrics(sections[secIdx].lyricsHindi.join(' '));
          }

          if (next >= totalDuration) {
            setPlaybackTime(0);
            setCurrentSectionIndex(0);
            return 0;
          }

          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSectionIndex, currentSection, sections, totalDuration]);

  // 60 FPS Dynamic Music Video Visuals Canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Dynamic Cinematic Gradient Background
      const isChorus = currentSection.type === 'chorus' || currentSection.type === 'final_chorus';
      const bgGrad = ctx.createLinearGradient(0, 0, w * Math.sin(t * 0.5), h);

      if (isChorus) {
        // High-energy vibrant Monsoon Sunset & Neon Pink/Blue
        bgGrad.addColorStop(0, '#311042');
        bgGrad.addColorStop(0.5, '#701a75');
        bgGrad.addColorStop(1, '#0f172a');
      } else if (currentSection.type === 'bridge') {
        // Emotional Dark Blue Moonlight Rain
        bgGrad.addColorStop(0, '#0c1a30');
        bgGrad.addColorStop(0.6, '#1e1b4b');
        bgGrad.addColorStop(1, '#020617');
      } else {
        // Fresh Green & Overcast Grey Monsoon Atmosphere
        bgGrad.addColorStop(0, '#064e3b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#022c22');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Pulsing Neon Bokeh & Rain Droplet Glows
      for (let i = 0; i < 15; i++) {
        const bx = (Math.sin(t * 0.5 + i * 1.5) * 0.45 + 0.5) * w;
        const by = (Math.cos(t * 0.3 + i * 2.0) * 0.45 + 0.5) * h;
        const bRad = 30 + Math.sin(t * 2 + i) * 15;

        const bokehGrad = ctx.createRadialGradient(bx, by, 5, bx, by, bRad);
        bokehGrad.addColorStop(0, isChorus ? 'rgba(244, 114, 182, 0.4)' : 'rgba(56, 189, 248, 0.3)');
        bokehGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bokehGrad;
        ctx.beginPath();
        ctx.arc(bx, by, bRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Falling Rain Streak Effects
      ctx.fillStyle = isChorus ? 'rgba(251, 207, 232, 0.6)' : 'rgba(224, 242, 254, 0.5)';
      for (let r = 0; r < 90; r++) {
        const rx = (Math.sin(r * 44 + t * 2) * 0.5 + 0.5) * w;
        const ry = (t * 1100 + r * 35) % h;
        ctx.fillRect(rx, ry, 2, 24);
      }

      // 4. Character / Umbrella Dance Silhouette
      const charX = w * 0.5 + Math.sin(t * 1.5) * 20;
      const charY = h * 0.52 + Math.cos(t * 2.0) * 10;

      // Yellow Umbrella Twirling
      const umbrellaAngle = t * 1.2;
      ctx.save();
      ctx.translate(charX, charY - 170);
      ctx.rotate(Math.sin(umbrellaAngle) * 0.2);

      // Umbrella Dome
      ctx.fillStyle = '#facc15'; // Bright Yellow Umbrella
      ctx.beginPath();
      ctx.arc(0, 0, 75, Math.PI, Math.PI * 2);
      ctx.fill();
      // Umbrella Highlights
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 75, Math.PI, Math.PI * 2);
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, 0, 6, 95);
      ctx.restore();

      // Dancing Silhouette
      ctx.fillStyle = '#ec4899'; // Vibrant Pink Kurti
      ctx.beginPath();
      ctx.roundRect(charX - 35, charY - 80, 70, 130, 20);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(charX, charY - 110, 25, 0, Math.PI * 2);
      ctx.fill();

      // Water Splash Ripples at Feet
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      for (let sp = 0; sp < 4; sp++) {
        const sRad = (t * 80 + sp * 35) % 80;
        const sAlpha = Math.max(0, 1 - sRad / 80);
        ctx.strokeStyle = `rgba(255, 255, 255, ${sAlpha})`;
        ctx.beginPath();
        ctx.ellipse(charX, charY + 65, sRad * 1.5, sRad * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Song Title Header Tag
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(30, 30, w - 60, 50, 15);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'black 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎵 बारिश आई रे (Monsoon Anthem)', w * 0.5, 62);

      // 6. Kinetic Devanagari Karaoke Lyrics Display (Lower Third)
      const lyricsBoxY = h - 260;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.roundRect(24, lyricsBoxY, w - 48, 170, 24);
      ctx.fill();
      ctx.strokeStyle = isChorus ? '#ec4899' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Section Badge
      ctx.fillStyle = isChorus ? '#ec4899' : '#38bdf8';
      ctx.roundRect(40, lyricsBoxY - 16, 160, 32, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentSection.title.substring(0, 22), 120, lyricsBoxY + 5);

      // Hindi Lyrics Text Lines
      ctx.font = 'bold 22px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';

      const lines = currentSection.lyricsHindi.slice(0, 3);
      lines.forEach((line, lIdx) => {
        ctx.fillStyle = lIdx === 0 ? '#fde047' : '#f1f5f9';
        ctx.fillText(line, w * 0.5, lyricsBoxY + 45 + lIdx * 38);
      });

      // 7. Audio Equalizer Wave Bars at Bottom
      const eqY = h - 50;
      for (let eq = 0; eq < 28; eq++) {
        const eqH = isPlaying ? Math.abs(Math.sin(t * 6 + eq * 0.4)) * 30 + 6 : 4;
        ctx.fillStyle = isChorus ? '#ec4899' : '#38bdf8';
        ctx.fillRect(35 + eq * 23, eqY - eqH, 14, eqH);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentSectionIndex, currentSection, isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-pink-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-600/20 border border-pink-500/40 rounded-2xl flex items-center justify-center text-pink-400 shadow-lg shadow-pink-950">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">“बारिश आई रे” — Official Monsoon Anthem</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-mono text-[10px] font-bold border border-pink-500/40">
                  105 BPM HINDI POP REEL 🌧️
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Catchy Viral Hook • Kinetic Devanagari Lyrics • Multi-Section Music Video Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const chorusIdx = sections.findIndex(s => s.type === 'chorus');
                if (chorusIdx !== -1) {
                  let t = 0;
                  for (let i = 0; i < chorusIdx; i++) t += sections[i].durationSec;
                  setPlaybackTime(t);
                  setCurrentSectionIndex(chorusIdx);
                  singLyrics(sections[chorusIdx].lyricsHindi.join(' '));
                  setIsPlaying(true);
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-yellow-500 hover:from-pink-500 hover:to-yellow-400 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-pink-900/40 transition"
            >
              <Flame className="w-4 h-4 text-yellow-200" />
              <span>Jump to Catchy Hook (बारिश आई रे)</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Music Video Reel Frame (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-500/40 relative group flex items-center justify-center">
              
              {/* 60 FPS Real-Time Music Video Canvas */}
              <canvas
                ref={canvasRef}
                width={720}
                height={1280}
                className="w-full h-full object-cover"
              />

              {/* Top Progress Bar */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1.5 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(playbackTime / totalDuration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🎵 {currentSection.title}</span>
                  <span className="text-pink-400">{playbackTime.toFixed(1)}s / {totalDuration}s</span>
                </div>
              </div>
            </div>

            {/* Playback Controls Underneath */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => {
                    setPlaybackTime(0);
                    setCurrentSectionIndex(0);
                    singLyrics(sections[0].lyricsHindi.join(' '));
                    setIsPlaying(true);
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title="Replay from Intro"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              <button
                onClick={() => singLyrics(currentSection.lyricsHindi.join(' '))}
                className="px-3 py-2 bg-pink-950/70 border border-pink-500/50 hover:bg-pink-900 text-pink-200 text-xs font-mono rounded-xl transition flex items-center space-x-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="font-bold">Sing Vocals</span>
              </button>
            </div>
          </div>

          {/* Right: Full Song Lyrics & Section Storyboard (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Song Sections List */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  <span>Song Structure & Lyrics (Click to Play Section):</span>
                </h3>
                <span className="text-xs font-mono text-pink-400 font-bold">{sections.length} Sections</span>
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    onClick={() => {
                      let t = 0;
                      for (let i = 0; i < idx; i++) t += sections[i].durationSec;
                      setPlaybackTime(t);
                      setCurrentSectionIndex(idx);
                      singLyrics(section.lyricsHindi.join(' '));
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      currentSectionIndex === idx
                        ? 'bg-pink-950/60 border-pink-500 shadow-xl ring-1 ring-pink-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>{section.title}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[10px] font-bold">
                        {section.durationSec}s • {section.energyLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {section.lyricsHindi.map((line, lIdx) => (
                        <p key={lIdx} className="text-xs font-medium text-slate-200">
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <span>🎬 {section.visualScene.substring(0, 45)}...</span>
                      <span className="text-pink-400 font-bold">{section.cameraMovement.substring(0, 25)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
