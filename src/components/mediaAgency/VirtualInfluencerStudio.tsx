import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Mic, 
  Music, 
  Sliders, 
  Wand2, 
  CheckCircle2, 
  Heart,
  Flame,
  Radio,
  Share2,
  Activity,
  MessageSquare,
  Footprints,
  Film,
  UserCheck,
  TrendingUp,
  Award,
  Send,
  Zap
} from 'lucide-react';
import { 
  VIRTUAL_INFLUENCERS, 
  VirtualInfluencerProfile, 
  InfluencerActivityMode, 
  directInfluencerPerformance 
} from '@/services/mediaAgency/influencer/VirtualInfluencerEngine';

export const VirtualInfluencerStudio: React.FC = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<VirtualInfluencerProfile>(VIRTUAL_INFLUENCERS[0]);
  const [currentMode, setCurrentMode] = useState<InfluencerActivityMode>('podcast');
  const [scriptText, setScriptText] = useState<string>(VIRTUAL_INFLUENCERS[0].defaultPrompts.podcast);
  const [vocalAudioUrl, setVocalAudioUrl] = useState<string>('/audio/real/lofi_chill.m4a');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Influencer Live in Studio');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const performance = directInfluencerPerformance(selectedInfluencer.id, currentMode, scriptText);

  // Handle Mode Change
  const handleModeChange = (mode: InfluencerActivityMode) => {
    setCurrentMode(mode);
    const newScript = selectedInfluencer.defaultPrompts[mode];
    setScriptText(newScript);
    
    const perf = directInfluencerPerformance(selectedInfluencer.id, mode, newScript);
    setVocalAudioUrl(perf.audioSrc);

    const v = videoRef.current;
    const a = audioRef.current;
    if (v) { v.src = perf.videoSrc; v.currentTime = 0; v.play().catch(() => {}); }
    if (a) { a.src = perf.audioSrc; a.currentTime = 0; a.play().catch(() => {}); }
    setIsPlaying(true);
    setStatusMessage(`Switched to ${mode.toUpperCase()} mode`);
  };

  // Handle Influencer Switch
  const handleSelectInfluencer = (inf: VirtualInfluencerProfile) => {
    setSelectedInfluencer(inf);
    const newScript = inf.defaultPrompts[currentMode];
    setScriptText(newScript);

    const perf = directInfluencerPerformance(inf.id, currentMode, newScript);
    setVocalAudioUrl(perf.audioSrc);

    const v = videoRef.current;
    const a = audioRef.current;
    if (v) { v.src = perf.videoSrc; v.currentTime = 0; v.play().catch(() => {}); }
    if (a) { a.src = perf.audioSrc; a.currentTime = 0; a.play().catch(() => {}); }
    setIsPlaying(true);
    setStatusMessage(`Active Influencer: ${inf.name}`);
  };

  // Synthesize Custom Dialogue / Performance via Local Python Engine
  const handleGeneratePerformance = async () => {
    setIsGenerating(true);
    setStatusMessage('Directing Influencer & Synthesizing Neural Voice...');

    try {
      const res = await fetch('http://127.0.0.1:5055/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          voice: selectedInfluencer.voiceKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          setVocalAudioUrl(data.audioUrl);
          const v = videoRef.current;
          const a = audioRef.current;
          if (a) { a.src = data.audioUrl; a.currentTime = 0; a.play().catch(() => {}); }
          if (v) { v.currentTime = 0; v.play().catch(() => {}); }
          setIsPlaying(true);
          setStatusMessage(`✅ ${selectedInfluencer.name} is performing your script live!`);
        }
      }
    } catch {
      setStatusMessage('Local speech server fallback active.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlay = () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (isPlaying) {
      if (v) v.pause();
      if (a) a.pause();
      setIsPlaying(false);
    } else {
      if (v) v.play().catch(() => {});
      if (a) a.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Custom AI Virtual Influencer Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/40">
                  TALK • WALK • PODCAST • SING • DANCE 🌟
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct your own autonomous virtual influencer with full-body motion, neural speech & real master songs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={vocalAudioUrl}
              download={`${selectedInfluencer.id}_${currentMode}.mp3`}
              className="px-4 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Reel Audio</span>
            </a>
          </div>
        </div>

        {/* 1. Influencer Persona Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VIRTUAL_INFLUENCERS.map((inf) => (
            <button
              key={inf.id}
              onClick={() => handleSelectInfluencer(inf)}
              className={`p-5 rounded-3xl border text-left transition space-y-3 relative overflow-hidden ${
                selectedInfluencer.id === inf.id
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-2xl ring-1 ring-indigo-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{inf.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 fill-indigo-500/20" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                  {inf.followers} Followers
                </span>
              </div>

              <p className="text-[11px] text-indigo-300 font-mono">{inf.handle} • {inf.niche}</p>
              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{inf.bio}</p>

              <div className="flex items-center space-x-1.5 pt-1">
                {inf.languages.map((l) => (
                  <span key={l} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[9px] border border-slate-800">
                    {l}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* 2. Main Studio Grid (5 cols Reel Player + 7 cols Mode Director) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Video Reel Player (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            
            <div 
              onClick={handleTogglePlay}
              className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/40 relative cursor-pointer group flex items-center justify-center"
            >
              <video
                key={performance.videoSrc}
                ref={videoRef}
                src={performance.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              <audio
                key={vocalAudioUrl}
                ref={audioRef}
                src={vocalAudioUrl}
                autoPlay
                loop
                muted={isMuted}
              />

              {/* Top Influencer Badge */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1 pointer-events-none">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/80 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{selectedInfluencer.handle}</span>
                  </div>
                  <span className="text-indigo-400 uppercase font-bold">{currentMode} MODE</span>
                </div>
              </div>

              {/* Live Script Subtitles Overlay */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/40 shadow-2xl space-y-1.5 text-center">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-indigo-400">
                    <span>✨ {selectedInfluencer.name}</span>
                    <span>VIRALITY: {performance.viralityScore}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow leading-relaxed">
                    "{scriptText.substring(0, 80)}..."
                  </h4>
                </div>
              </div>

              {/* Hover Play/Pause Overlay */}
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                <div className="w-16 h-16 bg-black/80 rounded-full flex items-center justify-center text-white border border-white/30">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button onClick={handleTogglePlay} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button onClick={handleReplay} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="Replay">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Autonomous AI</span>
            </div>

          </div>

          {/* Right: Mode Director & Script Generation Panel (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. 5 Activity Modes Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Choose Influencer Mode:</span>
                </h3>
                <span className="text-xs font-mono text-indigo-300">{statusMessage}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { mode: 'podcast' as InfluencerActivityMode, label: '🎙️ Podcast', desc: 'Deep talk show with mic' },
                  { mode: 'talk' as InfluencerActivityMode, label: '🗣️ Talk & Vlog', desc: 'Conversational dialogue' },
                  { mode: 'sing' as InfluencerActivityMode, label: '🎶 Sing Master', desc: 'Melodic song vocals' },
                  { mode: 'dance' as InfluencerActivityMode, label: '💃 Viral Dance', desc: 'Beat-synced choreography' },
                  { mode: 'walk' as InfluencerActivityMode, label: '🚶 Street Walk', desc: 'Runway & fashion vlog' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleModeChange(item.mode)}
                    className={`p-3 rounded-2xl border text-center transition space-y-1 ${
                      currentMode === item.mode
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-900/40 ring-1 ring-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[9px] opacity-75 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Interactive Director & Script Editor */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span>Direct {selectedInfluencer.name}'s Script & Speech:</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">Local Python 5055</span>
              </div>

              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
                placeholder="Type any podcast topic, vlog dialogue, custom lyrics or question for your influencer..."
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                  <span>Voice Model:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    {selectedInfluencer.voiceKey}
                  </span>
                </div>

                <button
                  onClick={handleGeneratePerformance}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-900/40 flex items-center justify-center space-x-2 transition whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Directing...' : `🎬 Direct ${selectedInfluencer.name} Live`}</span>
                </button>
              </div>
            </div>

            {/* 3. Pre-Built Viral Scene Prompts */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>1-Click Viral Scene Templates:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: '🎙️ Episode 01: Why AI Creators are Taking Over',
                    mode: 'podcast' as InfluencerActivityMode,
                    prompt: 'Welcome to episode 1! Today we are discussing why autonomous virtual influencers are generating millions of views without human burnout.'
                  },
                  {
                    title: '🎶 Monsoon Anthem Song Performance',
                    mode: 'sing' as InfluencerActivityMode,
                    prompt: 'बारिश आई रे, बारिश आई रे! दिल की गली में धूम मचाई रे! छतों से गिरती बूंदों में भीग जाने दे।'
                  },
                  {
                    title: '💃 Trending Reel Hook Dance Step',
                    mode: 'dance' as InfluencerActivityMode,
                    prompt: 'High-energy beat drop dance choreography synced to heavy dholak and electronic kicks.'
                  },
                  {
                    title: '🚶 Mumbai Fashion Street Vlog',
                    mode: 'walk' as InfluencerActivityMode,
                    prompt: 'Walking through Bandra in full designer attire, talking casually to the camera about modern creator lifestyle.'
                  }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleModeChange(item.mode);
                      setScriptText(item.prompt);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-left transition space-y-1 group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition block">
                      {item.title}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
