import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Film, 
  Radio, 
  Clock, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Video,
  Clapperboard,
  Sliders,
  Share2
} from 'lucide-react';

interface NewsScene {
  id: number;
  title: string;
  durationSec: number;
  type: 'establishing' | 'reporter_talking' | 'broll_traffic' | 'reporter_closing';
  videoUrl: string;
  fallbackUrl: string;
  lowerThirdTitle: string;
  lowerThirdSubtitle: string;
  spokenDialogue: string;
  cameraMovement: string;
}

const GURUGRAM_30S_SEQUENCE: NewsScene[] = [
  {
    id: 1,
    title: 'Scene 1: Establishing Shot (0s - 5s)',
    durationSec: 5,
    type: 'establishing',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    fallbackUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    lowerThirdTitle: 'GURUGRAM | MONSOON WATERLOGGING',
    lowerThirdSubtitle: 'Key Arterial Roads Submerged After Heavy Rain',
    spokenDialogue: 'Monsoon rainfall causes massive waterlogging across major stretches in Gurugram.',
    cameraMovement: 'Subtle handheld documentary camera slowly panning over flooded street'
  },
  {
    id: 2,
    title: 'Scene 2: Reporter Live on Camera (5s - 14s)',
    durationSec: 9,
    type: 'reporter_talking',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
    fallbackUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    lowerThirdTitle: 'LIVE REPORT | GURUGRAM EXPRESSWAY',
    lowerThirdSubtitle: 'Priya Sharma Reporting Live in Heavy Rain',
    spokenDialogue: 'Gurugram is once again battling severe waterlogging after heavy monsoon rain, with several key roads and intersections completely submerged.',
    cameraMovement: 'Medium waist-up shot, reporter holding news mic in rain'
  },
  {
    id: 3,
    title: 'Scene 3: Traffic & Commuter B-Roll (14s - 21s)',
    durationSec: 7,
    type: 'broll_traffic',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
    fallbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    lowerThirdTitle: 'GROUND REALITY | TRAFFIC GRIDLOCK',
    lowerThirdSubtitle: 'Commuters Stranded as Water Levels Rise',
    spokenDialogue: 'Vehicles are moving at a snail pace as rainwater reaches bonnet levels on several service roads.',
    cameraMovement: 'B-roll footage tracking slow-moving vehicles pushing water waves'
  },
  {
    id: 4,
    title: 'Scene 4: Reporter Closing Advice (21s - 30s)',
    durationSec: 9,
    type: 'reporter_closing',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
    fallbackUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    lowerThirdTitle: 'GURUGRAM MONSOON | TRAFFIC DISRUPTION',
    lowerThirdSubtitle: 'Authorities Urge Commuters to Check Route Advisory',
    spokenDialogue: 'For commuters, the message is simple: expect delays, avoid waterlogged stretches where possible, and check local updates before heading out.',
    cameraMovement: 'Medium close-up shot holding on reporter with city skyline in rain'
  }
];

export const MultiSceneVideoSequencer: React.FC = () => {
  const [scenes, setScenes] = useState<NewsScene[]>(GURUGRAM_30S_SEQUENCE);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [targetTotalDuration, setTargetTotalDuration] = useState<number>(30); // 30s to 360s (6 min)

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Rain & Ambience Web Audio Synthesizer
  const playRainSoundtrack = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Rain white noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isMuted ? 0 : 0.02, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Non-blocking
    }
  };

  // Speech Synthesizer Voiceover
  const speakCurrentScene = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = isMuted ? 0 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi') || v.lang.includes('en-GB'));
    if (indVoice) utterance.voice = indVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Scene transition and timeline tracking
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 0.1;
          
          // Calculate which scene we are in
          let elapsed = 0;
          let sceneIdx = 0;
          for (let i = 0; i < scenes.length; i++) {
            if (next >= elapsed && next < elapsed + scenes[i].durationSec) {
              sceneIdx = i;
              break;
            }
            elapsed += scenes[i].durationSec;
          }

          if (sceneIdx !== currentSceneIndex && sceneIdx < scenes.length) {
            setCurrentSceneIndex(sceneIdx);
            speakCurrentScene(scenes[sceneIdx].spokenDialogue);
          }

          if (next >= totalDuration) {
            // Loop back to start
            setCurrentSceneIndex(0);
            speakCurrentScene(scenes[0].spokenDialogue);
            return 0;
          }

          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex, scenes, totalDuration]);

  // Continuous 60 FPS 9:16 Canvas News Broadcaster
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

      // 1. Dark Monsoon Urban Background (Rain & Grey Sky)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1e293b'); // Overcast grey sky
      bgGrad.addColorStop(0.4, '#0f172a'); // Distant Gurugram buildings
      bgGrad.addColorStop(0.7, '#1e3a5f'); // Flooded road water
      bgGrad.addColorStop(1, '#09101d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. High-rise Building Silhouettes (Gurugram skyline)
      ctx.fillStyle = '#0b1329';
      for (let b = 0; b < 7; b++) {
        const bx = b * 110 - 20;
        const bw = 90;
        const bh = 300 + (b % 3) * 80;
        ctx.fillRect(bx, h * 0.45 - bh, bw, bh);
        
        // Window lights
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        for (let r = 0; r < 5; r++) {
          ctx.fillRect(bx + 15, h * 0.45 - bh + 30 + r * 40, 15, 20);
          ctx.fillRect(bx + 50, h * 0.45 - bh + 30 + r * 40, 15, 20);
        }
        ctx.fillStyle = '#0b1329';
      }

      // 3. Flooded Road & Water Reflection Physics
      const waterY = h * 0.55;
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
      waterGrad.addColorStop(0, 'rgba(30, 58, 95, 0.9)');
      waterGrad.addColorStop(1, 'rgba(10, 20, 35, 0.98)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterY, w, h - waterY);

      // Water Ripple Waves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      for (let wLine = 0; wLine < 8; wLine++) {
        const ry = waterY + 40 + wLine * 45;
        ctx.beginPath();
        for (let rx = 0; rx < w; rx += 20) {
          const wave = Math.sin(rx * 0.03 + t * 2 + wLine) * 4;
          if (rx === 0) ctx.moveTo(rx, ry + wave);
          else ctx.lineTo(rx, ry + wave);
        }
        ctx.stroke();
      }

      // 4. Scene-Specific Visual Elements
      if (currentScene.type === 'reporter_talking' || currentScene.type === 'reporter_closing') {
        // Female Reporter in Royal Blue Embroidered Kurti
        const charX = w * 0.5 + Math.sin(t * 0.5) * 6;
        const charY = h * 0.52 + Math.cos(t * 0.8) * 4;

        // Head / Face
        ctx.fillStyle = '#f5d0a9'; // Natural Indian skin tone
        ctx.beginPath();
        ctx.arc(charX, charY - 150, 55, 0, Math.PI * 2);
        ctx.fill();

        // Wet Hair Framing Face
        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.arc(charX, charY - 170, 60, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // Wet hair strands
        ctx.fillRect(charX - 55, charY - 160, 16, 80);
        ctx.fillRect(charX + 39, charY - 160, 16, 80);

        // Eyes & Natural Facial Expression
        ctx.fillStyle = '#1e293b';
        const blink = Math.sin(t * 1.5) > 0.96 ? 1 : 7;
        ctx.fillRect(charX - 25, charY - 155, 12, blink);
        ctx.fillRect(charX + 13, charY - 155, 12, blink);

        // Speaking Mouth Motion
        ctx.fillStyle = '#be123c';
        const mouthOpen = isPlaying ? Math.abs(Math.sin(t * 5)) * 12 + 4 : 4;
        ctx.beginPath();
        ctx.ellipse(charX, charY - 120, 14, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();

        // Royal Blue Embroidered Kurti (Shoulders & Torso)
        ctx.fillStyle = '#1d4ed8'; // Royal Blue
        ctx.beginPath();
        ctx.roundRect(charX - 85, charY - 80, 170, 240, [30, 30, 0, 0]);
        ctx.fill();

        // Gold/Silver Kurti Embroidery Neckline
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(charX, charY - 75, 30, 0, Math.PI);
        ctx.stroke();

        // Television News Microphone in Hand
        const micX = charX + 55;
        const micY = charY - 60 + Math.sin(t * 1.2) * 8;
        
        // Mic Handle
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(micX - 8, micY, 16, 60);
        // Mic Cube with Channel Logo
        ctx.fillStyle = '#dc2626'; // Red News Logo Block
        ctx.fillRect(micX - 18, micY - 25, 36, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEWS', micX, micY - 6);
        // Mic Mesh
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(micX, micY - 35, 14, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // B-Roll / Establishing Shot: Car wading through flood water
        const carX = ((t * 60) % (w + 200)) - 100;
        const carY = waterY + 90;

        // Vehicle Body
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(carX, carY, 160, 70, 15);
        ctx.fill();

        // Car Headlights Beam
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.moveTo(carX + 160, carY + 30);
        ctx.lineTo(carX + 320, carY - 20);
        ctx.lineTo(carX + 320, carY + 80);
        ctx.closePath();
        ctx.fill();

        // Water Splash around tyres
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let sp = 0; sp < 12; sp++) {
          ctx.beginPath();
          ctx.arc(carX + 30 + Math.sin(t * 8 + sp) * 20, carY + 65 - Math.random() * 25, 4, 0, Math.PI * 2);
          ctx.arc(carX + 130 + Math.cos(t * 8 + sp) * 20, carY + 65 - Math.random() * 25, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Falling Monsoon Rain Droplets & Lens Flares
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
      for (let r = 0; r < 80; r++) {
        const rx = (Math.sin(r * 99 + t * 2) * 0.5 + 0.5) * w;
        const ry = ((t * 900 + r * 45) % h);
        ctx.fillRect(rx, ry, 1.5, 18);
      }

      // 6. Professional Indian Television Breaking News Graphics Overlay (Lower Third)
      const ltY = h - 220;

      // Red Breaking News Header
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(30, ltY, 180, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 GROUND REPORT', 42, ltY + 21);

      // Main News Headline Bar (Yellow / Black)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(30, ltY + 32, w - 60, 50);
      ctx.fillStyle = '#fde047'; // News Yellow
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(currentScene.lowerThirdTitle, 45, ltY + 64);

      // Subtitle Bar (White)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
      ctx.fillRect(30, ltY + 82, w - 60, 40);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '14px sans-serif';
      ctx.fillText(currentScene.lowerThirdSubtitle, 45, ltY + 107);

      // Spoken Dialogue Subtitle (Kinetic Hormozi style)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.roundRect(30, h - 85, w - 60, 55, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${currentScene.spokenDialogue.substring(0, 65)}..."`, w * 0.5, h - 52);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentSceneIndex, isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600/20 border border-red-500/40 rounded-2xl flex items-center justify-center text-red-400">
              <Clapperboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">30s – 6min Multi-Scene Video Production Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/40">
                  CONTINUOUS 4-SCENE REEL 🎬
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-shot sequence assembling • Continuous 30s field journalism playback • Real audio & lower-thirds
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Target Duration Selector (30s to 6 Min) */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
              <span className="text-slate-500 px-2 text-[11px]">Length:</span>
              <button
                onClick={() => setTargetTotalDuration(30)}
                className={`px-3 py-1.5 rounded-xl transition ${targetTotalDuration === 30 ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                30s Reel
              </button>
              <button
                onClick={() => setTargetTotalDuration(60)}
                className={`px-3 py-1.5 rounded-xl transition ${targetTotalDuration === 60 ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                60s Story
              </button>
              <button
                onClick={() => setTargetTotalDuration(360)}
                className={`px-3 py-1.5 rounded-xl transition ${targetTotalDuration === 360 ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                6 Min Report
              </button>
            </div>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Video Frame (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative group flex items-center justify-center">
              
              {/* 60 FPS Real-Time Multi-Scene Canvas Engine */}
              <canvas
                ref={canvasRef}
                width={720}
                height={1280}
                className="w-full h-full object-cover"
              />

              {/* Top Progress & Scene Indicator */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1.5 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(playbackTime / totalDuration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🎬 {currentScene.title}</span>
                  <span className="text-red-400">{playbackTime.toFixed(1)}s / {totalDuration}s</span>
                </div>
              </div>
            </div>

            {/* Playback Controls Underneath */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => {
                    setPlaybackTime(0);
                    setCurrentSceneIndex(0);
                    speakCurrentScene(scenes[0].spokenDialogue);
                    setIsPlaying(true);
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title="Replay from Scene 1"
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

              <span className="text-xs font-mono text-slate-400 font-bold">
                Scene {currentSceneIndex + 1} / 4
              </span>
            </div>
          </div>

          {/* Right: 4-Scene Storyboard & Timeline Editor (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Storyboard Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-red-400" />
                  <span>4-Shot News Field Report Storyboard (30s):</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">Live Synced</span>
              </div>

              <div className="space-y-3">
                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    onClick={() => {
                      let t = 0;
                      for (let i = 0; i < idx; i++) t += scenes[i].durationSec;
                      setPlaybackTime(t);
                      setCurrentSceneIndex(idx);
                      speakCurrentScene(scene.spokenDialogue);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      currentSceneIndex === idx
                        ? 'bg-red-950/60 border-red-500 shadow-xl ring-1 ring-red-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{scene.title}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                        {scene.durationSec}s
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      <strong>Dialogue:</strong> "{scene.spokenDialogue}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/50">
                      <span>Graphics: {scene.lowerThirdTitle}</span>
                      <span className="text-red-400">{scene.cameraMovement.substring(0, 35)}...</span>
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
