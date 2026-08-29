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
  Heart, 
  Share2, 
  CheckCircle2, 
  Video,
  Clapperboard
} from 'lucide-react';

interface RealVideoAsset {
  id: string;
  title: string;
  category: string;
  videoSrc: string;
  audioSrc?: string;
  description: string;
  hindiDialogue: string;
}

const LOCAL_REAL_VIDEOS: RealVideoAsset[] = [
  {
    id: 'desi_romance_reel',
    title: 'Bas Ek Baar Mil Jao... 🥺💖 (90s Romance)',
    category: 'Hindi Melodrama Short',
    videoSrc: '/videos/reel_video.mp4',
    audioSrc: '/videos/reel_audio.m4a',
    description: 'Real 9:16 vertical video reel with original Hindi vocals and authentic cinematography.',
    hindiDialogue: '“तुमसे मिलने को दिल करता है... बस एक बार मिल जाओ 🥺💖”'
  }
];

export const RealProductionVideoStudio: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<RealVideoAsset>(LOCAL_REAL_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Sync video and audio playback
  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v) return;

    if (isPlaying) {
      v.play().catch(() => {});
      if (a) {
        a.currentTime = v.currentTime;
        a.play().catch(() => {});
      }
    } else {
      v.pause();
      if (a) a.pause();
    }
  }, [isPlaying, selectedVideo]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Live Real Video Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                  REAL 9:16 MP4 + ORIGINAL AUDIO 🎬
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Real Video Footage • High-Fidelity Audio • Zero Artificial Synthesizers
              </p>
            </div>
          </div>

          <a
            href={selectedVideo.videoSrc}
            download="real_production_reel_916.mp4"
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>🎬 Download Real MP4 Video</span>
          </a>
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
                key={selectedVideo.videoSrc}
                ref={videoRef}
                src={selectedVideo.videoSrc}
                autoPlay
                loop
                muted={isMuted || !!selectedVideo.audioSrc}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Dedicated Real Audio Element for perfect sync */}
              {selectedVideo.audioSrc && (
                <audio
                  ref={audioRef}
                  src={selectedVideo.audioSrc}
                  autoPlay
                  loop
                  muted={isMuted}
                />
              )}

              {/* Top Progress Bar Overlay */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1.5 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🎬 {selectedVideo.title}</span>
                  <span className="text-emerald-400">{currentTime.toFixed(1)}s / {duration.toFixed(0)}s</span>
                </div>
              </div>

              {/* Subtitles Overlay */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-2xl">
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow">
                    {selectedVideo.hindiDialogue}
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
                  title="Replay Video"
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
                {isMuted ? 'AUDIO MUTED' : 'ORIGINAL SOUND 🎵'}
              </span>
            </div>
          </div>

          {/* Right: Video Info & Details (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Selected Video Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                  {selectedVideo.category}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">720×1280 Vertical</span>
              </div>

              <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
              <p className="text-sm text-slate-300">{selectedVideo.description}</p>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audio Dialogue & Lyrics:</h4>
                <p className="text-sm font-medium text-emerald-300">{selectedVideo.hindiDialogue}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-400">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">VIDEO CODEC:</span>
                  <span className="text-white font-bold">H.264 / AVC1 (24 FPS)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">AUDIO TRACK:</span>
                  <span className="text-emerald-400 font-bold">AAC Stereo (130 kbps)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
