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
  Music, 
  Sliders, 
  Wand2, 
  CheckCircle2, 
  Heart,
  Moon,
  Flame,
  Layers,
  ExternalLink,
  Copy
} from 'lucide-react';

interface ProperSongAsset {
  id: string;
  title: string;
  genre: string;
  audioUrl: string;
  videoSrc: string;
  vocalType: string;
  lyrics: string;
  sunoPrompt: string;
  description: string;
}

const PROPER_SUNO_SONGS: ProperSongAsset[] = [
  {
    id: 'sufi_fusion_master',
    title: 'Dil Ki Zubani — Soulful Sufi Master 🕊️✨',
    genre: 'Sufi Qawwali / Coke Studio Fusion',
    audioUrl: '/audio/suno_sufi_song.m4a',
    videoSrc: '/videos/reel_video.mp4',
    vocalType: 'Powerful Female Sufi Vocalist (Natural Singing & Vibrato)',
    lyrics: 'दिल की ज़ुबानी सुनो, रूह की रवानी सुनो... तू ही तू है मेरे रूबरू, हर धड़कन में बस तू ही बसा।',
    sunoPrompt: 'Female South Asian Sufi vocal, classical qawwali harmonium drone, acoustic tabla theka, atmospheric haveli reverb, emotional vocal vibrato, 85 BPM, Coke Studio style production',
    description: '100% full song with genuine melodic singing, harmonium, acoustic tabla, and studio mixing.'
  },
  {
    id: 'hindi_romance_master',
    title: 'Bas Ek Baar Mil Jao — 90s Romantic Melody 🥺💖',
    genre: 'Classic Hindi Melodrama / Bollywood Pop',
    audioUrl: '/videos/reel_audio.m4a',
    videoSrc: '/videos/reel_video.mp4',
    vocalType: 'Emotional Hindi Vocalist',
    lyrics: 'तुमसे मिलने को दिल करता है... बस एक बार मिल जाओ, इस भीगे मौसम में मेरा हाथ थाम लो।',
    sunoPrompt: '90s Bollywood romantic ballad, acoustic guitar, gentle dholak beats, flute melody, expressive female vocals, rain soundscape, 95 BPM',
    description: 'Melodic Hindi romantic song with full acoustic instrumentation and emotional vocals.'
  }
];

export const FullSongMusicStudio: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<ProperSongAsset>(PROPER_SUNO_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectSong = (song: ProperSongAsset) => {
    setSelectedSong(song);
    const a = audioRef.current;
    const v = videoRef.current;
    if (a) {
      a.src = song.audioUrl;
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setIsPlaying(true);
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

  const handleTimeUpdate = () => {
    const a = audioRef.current;
    if (a) {
      setCurrentTime(a.currentTime);
      if (a.duration && !isNaN(a.duration)) setDuration(a.duration);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(selectedSong.sunoPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-pink-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-600/20 border border-pink-500/40 rounded-2xl flex items-center justify-center text-pink-400">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Full AI Song Studio (Suno-Quality Masters)</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-mono text-[10px] font-bold border border-pink-500/40">
                  REAL SINGING + REAL MUSIC 🎶
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete Songs with Vocal Vibrato, Harmonium, Tabla & 9:16 Video Sync (Zero TTS Beeps)
              </p>
            </div>
          </div>

          <a
            href={selectedSong.audioUrl}
            download={`${selectedSong.id}.m4a`}
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-pink-600 hover:bg-pink-500 text-white shadow-xl flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Master Song</span>
          </a>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Video Player (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div 
              onClick={handleTogglePlay}
              className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-500/40 relative cursor-pointer group flex items-center justify-center"
            >
              {/* Real Video Element */}
              <video
                key={selectedSong.videoSrc}
                ref={videoRef}
                src={selectedSong.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Real Master Song Audio Element */}
              <audio
                key={selectedSong.audioUrl}
                ref={audioRef}
                src={selectedSong.audioUrl}
                autoPlay
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
              />

              {/* Top Progress Bar Overlay */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1.5 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-amber-500 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🎶 {selectedSong.title.substring(0, 24)}...</span>
                  <span className="text-pink-400">{currentTime.toFixed(1)}s / {duration.toFixed(0)}s</span>
                </div>
              </div>

              {/* Lyrics Overlay */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-pink-500/40 text-center shadow-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">
                    🎤 {selectedSong.vocalType}
                  </span>
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow">
                    "{selectedSong.lyrics}"
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
                  className="p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={handleReplay}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title="Replay Song"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
                </button>
              </div>

              <span className="text-xs font-mono text-pink-400 font-bold">
                {isMuted ? 'MUTED' : 'REAL MASTER SONG 🎵'}
              </span>
            </div>
          </div>

          {/* Right: Master Songs & Suno AI Generator (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Master Songs Selector */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Music className="w-4 h-4 text-pink-400" />
                <span>1. Select Master AI Song (Real Vocals & Instruments):</span>
              </h3>

              <div className="space-y-3">
                {PROPER_SUNO_SONGS.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className={`w-full p-4 rounded-2xl border text-left transition space-y-2 ${
                      selectedSong.id === song.id
                        ? 'bg-pink-950/60 border-pink-500 shadow-xl ring-1 ring-pink-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{song.title}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[10px] font-bold">
                        {song.genre}
                      </span>
                    </div>

                    <p className="text-xs text-pink-300 font-medium">{song.vocalType}</p>
                    <p className="text-xs text-slate-400">{song.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Suno AI Prompt Generator */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>2. Suno AI v4 Production Prompt:</span>
                </h3>

                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center space-x-1.5 transition"
                >
                  {copiedPrompt ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {selectedSong.sunoPrompt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>To create unlimited custom tracks:</span>
                <a
                  href="https://suno.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold flex items-center space-x-1"
                >
                  <span>Open Suno AI (suno.com)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
