import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Film, 
  Radio, 
  Layers, 
  Type, 
  Music, 
  Check, 
  Share2, 
  Sliders, 
  Smartphone,
  Video,
  ExternalLink,
  Flame,
  Clapperboard
} from 'lucide-react';

interface VideoScenePreset {
  id: string;
  name: string;
  category: string;
  videoUrl: string;
  youtubeEmbedUrl?: string;
  subtitleText: string;
  vocalEmotion: string;
  bgmFreq: number;
}

const SCENE_PRESETS: VideoScenePreset[] = [
  {
    id: 'youtube_ref_drama',
    name: 'Bas Ek Baar Mil Jao... 🥺💖 (90s Romance)',
    category: 'YouTube Short Reference',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/E6NHEN89ljs?autoplay=1&mute=1&loop=1&playlist=E6NHEN89ljs&controls=1',
    subtitleText: 'Tumse milne ko dil karta hai... bas ek baar mil jao 🥺💖',
    vocalEmotion: '90s Nostalgic Romance',
    bgmFreq: 196
  },
  {
    id: 'street_action_vlog',
    name: 'Street Creator Vlog (Walking & Talking)',
    category: 'Social Reel',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    subtitleText: 'Bro, tell me I\'m not the only one who saw this today! 😂',
    vocalEmotion: 'Conversational Hinglish',
    bgmFreq: 220
  },
  {
    id: 'cinematic_open_movie',
    name: 'Cinematic High-Motion Trailer',
    category: 'Cinematic Drama',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    subtitleText: 'When the moment arrived, nobody was prepared for what happened next! 🔥',
    vocalEmotion: 'Dramatic Suspense',
    bgmFreq: 146.83
  }
];

export const LiveRealVideoStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<VideoScenePreset>(SCENE_PRESETS[0]);
  const [videoText, setVideoText] = useState<string>(SCENE_PRESETS[0].subtitleText);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoMode, setVideoMode] = useState<'html5_video' | 'youtube_embed' | 'procedural_motion'>('youtube_embed');
  const [currentTime, setCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Background Web Audio Synthesizer
  const playAmbientSound = (freq: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(isMuted ? 0 : 0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch {
      // Non-blocking fallback
    }
  };

  // Speech Synthesizer Voiceover
  const triggerSpeech = () => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(videoText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = isMuted ? 0 : 1.0;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const matching = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('en'));
      if (matching) utterance.voice = matching;
    };

    pickVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectPreset = (preset: VideoScenePreset) => {
    setSelectedPreset(preset);
    setVideoText(preset.subtitleText);
    if (preset.youtubeEmbedUrl) {
      setVideoMode('youtube_embed');
    } else {
      setVideoMode('html5_video');
    }
    const video = videoRef.current;
    if (video) {
      video.src = preset.videoUrl;
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    triggerSpeech();
    playAmbientSound(preset.bgmFreq);
  };

  // Procedural 60 FPS Real Motion Canvas Animation
  useEffect(() => {
    if (videoMode !== 'procedural_motion') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark cinematic moving background
      const grad = ctx.createLinearGradient(0, 0, w * Math.sin(t * 0.5), h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Moving neon light beams
      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(t + i) * 0.4 + 0.5) * w;
        const beamGrad = ctx.createRadialGradient(x, h * 0.4, 10, x, h * 0.4, 250);
        beamGrad.addColorStop(0, i % 2 === 0 ? 'rgba(236, 72, 153, 0.25)' : 'rgba(59, 130, 246, 0.25)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Moving human avatar silhouette with natural breathing & gestures
      const charX = w * 0.5 + Math.sin(t * 0.8) * 15;
      const charY = h * 0.55 + Math.cos(t * 1.2) * 8;

      // Head
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(charX, charY - 140, 50, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (blinking)
      ctx.fillStyle = '#0f172a';
      const eyeOpen = Math.sin(t * 2.0) > 0.95 ? 1 : 8;
      ctx.fillRect(charX - 20, charY - 145, 10, eyeOpen);
      ctx.fillRect(charX + 10, charY - 145, 10, eyeOpen);

      // Body & Shoulders
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(charX - 70, charY - 80, 140, 220, 30);
      ctx.fill();

      // Hand gesturing with microphone/phone
      const handY = charY - 20 + Math.sin(t * 2.5) * 25;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(charX + 80, handY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Subtitle box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.roundRect(30, h - 220, w - 60, 140, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${videoText}"`, w * 0.5, h - 140);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [videoMode, videoText]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-600/20 border border-pink-500/40 rounded-2xl flex items-center justify-center text-pink-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Live Real Video Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-mono text-[10px] font-bold border border-pink-500/40">
                  REAL 9:16 LIVE MOTION 🎬
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Playing genuine moving video content • YouTube Short & HTML5 Video modes
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setVideoMode('youtube_embed')}
              className={`px-3 py-1.5 rounded-xl transition ${videoMode === 'youtube_embed' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              YouTube Short Live
            </button>
            <button
              onClick={() => setVideoMode('html5_video')}
              className={`px-3 py-1.5 rounded-xl transition ${videoMode === 'html5_video' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              HTML5 MP4 Video
            </button>
            <button
              onClick={() => setVideoMode('procedural_motion')}
              className={`px-3 py-1.5 rounded-xl transition ${videoMode === 'procedural_motion' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              60 FPS Motion Canvas
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Video Frame (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative group flex items-center justify-center">
              
              {/* MODE 1: YouTube Short Live Embed */}
              {videoMode === 'youtube_embed' && (
                <iframe
                  src={selectedPreset.youtubeEmbedUrl || 'https://www.youtube.com/embed/E6NHEN89ljs?autoplay=1&mute=1&loop=1&playlist=E6NHEN89ljs&controls=1'}
                  width="100%"
                  height="100%"
                  title="YouTube Short Live Video"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full object-cover border-0"
                />
              )}

              {/* MODE 2: Direct HTML5 MP4 Video */}
              {videoMode === 'html5_video' && (
                <video
                  key={selectedPreset.videoUrl}
                  ref={videoRef}
                  src={selectedPreset.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* MODE 3: Procedural 60 FPS Motion Canvas */}
              {videoMode === 'procedural_motion' && (
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={1280}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Controls */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition flex items-center space-x-1.5"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'Unmute Audio' : 'Audio On'}</span>
              </button>

              <button
                onClick={triggerSpeech}
                className="px-3 py-2 bg-pink-950/70 border border-pink-500/50 hover:bg-pink-900 text-pink-200 text-xs font-mono rounded-xl transition flex items-center space-x-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="font-bold">Speak Voice</span>
              </button>
            </div>
          </div>

          {/* Right: Scene Selector & Dialogue Editor (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Scene Preset Selector */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Film className="w-4 h-4 text-pink-400" />
                <span>1. Select Live Video Scene:</span>
              </h3>

              <div className="space-y-3">
                {SCENE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex items-start space-x-4 ${
                      selectedPreset.id === preset.id
                        ? 'bg-pink-950/60 border-pink-500 shadow-lg ring-1 ring-pink-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clapperboard className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{preset.name}</span>
                        <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[10px] font-bold">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">"{preset.subtitleText}"</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Dialogue & Subtitles Editor */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Type className="w-4 h-4 text-yellow-400" />
                <span>2. Dialogue & Subtitles Line:</span>
              </h3>

              <div className="space-y-2">
                <textarea
                  value={videoText}
                  onChange={(e) => setVideoText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
                  placeholder="Enter dialogue..."
                />
                <p className="text-[11px] text-slate-400">
                  * Synced with live speech synthesizer and subtitle rendering.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
