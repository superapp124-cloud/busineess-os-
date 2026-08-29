import React, { useState, useRef, useEffect } from 'react';
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
  Music, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  Wand2,
  Server
} from 'lucide-react';

interface VoiceOption {
  key: string;
  name: string;
  role: string;
  language: string;
  nativeCode: string;
  defaultText: string;
}

const VOICES: VoiceOption[] = [
  {
    key: 'hindi_female_reporter',
    name: 'Priya Sharma',
    role: 'Field News Reporter / Vlog Lead',
    language: 'Hindi (National)',
    nativeCode: 'hi-IN-SwaraNeural',
    defaultText: 'गुरुग्राम में भारी बारिश के बाद सड़कों पर भीषण जलभराव हो गया है। प्रशासन ने लोगों से जलभराव वाले रास्तों से बचने की अपील की है।'
  },
  {
    key: 'urdu_female_sufi',
    name: 'Uzma Khan',
    role: 'Sufi & Qawwali Vocalist',
    language: 'Urdu / Hindi Sufi',
    nativeCode: 'ur-PK-UzmaNeural',
    defaultText: 'तू ही तू है मेरे रूबरू... या रब्बा मेरे दिल की सदा सुन ले तू। हर साज़ में तेरी ही लगन है।'
  },
  {
    key: 'english_female_journalist',
    name: 'Ananya Iyer',
    role: 'National Broadcast Anchor',
    language: 'Indian English',
    nativeCode: 'en-IN-NeerjaNeural',
    defaultText: 'Gurugram is once again battling severe waterlogging after torrential monsoon rains. Key expressway stretches and service roads remain heavily submerged.'
  },
  {
    key: 'hindi_male_narrator',
    name: 'Rohan Varma',
    role: 'Documentary & Story Narrator',
    language: 'Hindi (Baritone)',
    nativeCode: 'hi-IN-MadhurNeural',
    defaultText: 'सड़कों पर पानी, गाड़ियों की लंबी कतारें और थमी हुई जिंदगी... यह है आज के मानसून का असली मंजर।'
  }
];

export const LocalPythonPipelineStudio: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [dialogueText, setDialogueText] = useState<string>(VOICES[0].defaultText);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>('/videos/gurugram_report_voice.mp3');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoiceChange = (voice: VoiceOption) => {
    setSelectedVoice(voice);
    setDialogueText(voice.defaultText);
  };

  const handleGenerateVoice = async () => {
    setIsGeneratingVoice(true);
    try {
      const res = await fetch('http://127.0.0.1:5055/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dialogueText,
          voice: selectedVoice.key
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          setActiveAudioUrl(data.audioUrl);
          const a = audioRef.current;
          const v = videoRef.current;
          if (a) {
            a.src = data.audioUrl;
            a.currentTime = 0;
            a.play().catch(() => {});
          }
          if (v) {
            v.currentTime = 0;
            v.play().catch(() => {});
          }
          setIsPlaying(true);
        }
      } else {
        alert('Local Python media engine error. Check port 5055.');
      }
    } catch (e: any) {
      alert(`Connection to local Python server failed: ${e.message}`);
    } finally {
      setIsGeneratingVoice(false);
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
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v) {
      setCurrentTime(v.currentTime);
      if (v.duration && !isNaN(v.duration)) setDuration(v.duration);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Local Python Neural Voice & Video Pipeline</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                  ₹0 COST LOCAL PIPELINE (PORT 5055) 🟢
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural Indian Spoken Voiceover (Edge-TTS Neural) • Synchronized 9:16 Real Video
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400">
            <Server className="w-3.5 h-3.5" />
            <span>Python Pipeline: 127.0.0.1:5055 (ONLINE)</span>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Real Video Player (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div 
              onClick={handleTogglePlay}
              className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/40 relative cursor-pointer group flex items-center justify-center"
            >
              {/* Real Video Element */}
              <video
                ref={videoRef}
                src="/videos/reel_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Real Synchronized Audio Element */}
              <audio
                ref={audioRef}
                src={activeAudioUrl}
                autoPlay
                loop
                muted={isMuted}
              />

              {/* Top Progress Bar Overlay */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1.5 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🎙️ {selectedVoice.name} ({selectedVoice.language})</span>
                  <span className="text-emerald-400">{currentTime.toFixed(1)}s / {duration.toFixed(0)}s</span>
                </div>
              </div>

              {/* Subtitles Overlay */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-2xl">
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow">
                    "{dialogueText}"
                  </h4>
                </div>
              </div>

              {/* Play / Pause Hover Badge */}
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                <div className="w-16 h-16 bg-black/80 rounded-full flex items-center justify-center text-white border border-white/30 backdrop-blur-sm shadow-2xl">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                </div>
              </div>
            </div>

            {/* Playback Controls Underneath */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={handleReplay}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title="Replay"
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

              <span className="text-xs font-mono text-emerald-400 font-bold">
                {isMuted ? 'MUTED' : 'NEURAL VOICE ON 🎙️'}
              </span>
            </div>
          </div>

          {/* Right: Voice Selector & Dialogue Generator (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Voice Selector */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>1. Select Neural Voice Actor (Edge-TTS ₹0):</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOICES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleVoiceChange(v)}
                    className={`p-3.5 rounded-2xl border text-left transition space-y-1 ${
                      selectedVoice.key === v.key
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-xl ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{v.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                        {v.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{v.role}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Spoken Script & Generate Voice Button */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-yellow-400" />
                <span>2. Dialogue Script (Hindi / Urdu / English):</span>
              </h3>

              <div className="space-y-3">
                <textarea
                  value={dialogueText}
                  onChange={(e) => setDialogueText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
                  placeholder="Type any spoken Hindi, Urdu, or English line..."
                />

                <button
                  onClick={handleGenerateVoice}
                  disabled={isGeneratingVoice}
                  className={`w-full py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center justify-center space-x-2 transition ${
                    isGeneratingVoice
                      ? 'bg-emerald-900 text-emerald-300 cursor-wait animate-pulse'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/50'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {isGeneratingVoice 
                      ? 'Generating Studio Voice on Local Engine...' 
                      : `🚀 Generate Speech with ${selectedVoice.name} (Local Free Pipeline)`}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
