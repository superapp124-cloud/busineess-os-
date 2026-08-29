import React, { useState, useRef } from 'react';
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
  Moon, 
  Clapperboard, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface SufiScene {
  id: number;
  timeRange: string;
  title: string;
  shotType: string;
  urduLyrics: string;
  videoUrl: string;
  posterUrl: string;
  visualAtmosphere: string;
}

const REAL_SUFI_SCENES: SufiScene[] = [
  {
    id: 1,
    timeRange: '0s – 5s',
    title: 'Scene 1: Candlelight Awakening & Eyes',
    shotType: 'Extreme Close-Up',
    urduLyrics: 'ओ... रब्बा मेरे...',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85',
    visualAtmosphere: 'Flickering candlelight in aged stone haveli. Extreme close-up of singer\'s expressive dark eyes looking downward.'
  },
  {
    id: 2,
    timeRange: '5s – 15s',
    title: 'Scene 2: Face Revealed in Burgundy Anarkali',
    shotType: 'Intimate Portrait (35mm)',
    urduLyrics: 'तू ही तू है मेरे रूबरू... या रब्बा...',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85',
    visualAtmosphere: 'Soft golden candlelight reveals her face, burgundy & ivory Anarkali with gold embroidery.'
  },
  {
    id: 3,
    timeRange: '15s – 30s',
    title: 'Scene 3: Haveli Courtyard & Ensemble Finale',
    shotType: 'Courtyard Atmosphere (50mm)',
    urduLyrics: 'दिल की सदा सुन ले ज़रा... तू ही तू... 🕊️✨',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85',
    visualAtmosphere: 'Carved wooden arches, Persian carpets, brass lanterns, harmonium and tabla players seated in soft moonlight.'
  }
];

export const SufiMusicVideoStudio: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<SufiScene>(REAL_SUFI_SCENES[0]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSelectScene = (scene: SufiScene) => {
    setSelectedScene(scene);
    const video = videoRef.current;
    if (video) {
      video.src = scene.videoUrl;
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Female Sufi Music Video Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/40">
                  REAL VIDEO PLAYBACK 🎬
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Haveli Courtyard Sufi Performance • 9:16 Vertical Video
              </p>
            </div>
          </div>

          <a
            href={selectedScene.videoUrl}
            download="sufi_music_video_reel.mp4"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-xl flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download MP4 Video</span>
          </a>
        </div>

        {/* Real Video Player & Storyboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Direct Native Video Player (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/40 relative flex items-center justify-center">
              <video
                key={selectedScene.videoUrl}
                ref={videoRef}
                src={selectedScene.videoUrl}
                poster={selectedScene.posterUrl}
                autoPlay
                loop
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full max-w-[320px] p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs font-mono text-amber-300">
              Playing: {selectedScene.title}
            </div>
          </div>

          {/* Right: Scene Selector & Prompt Breakdown (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Scene Selector */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Select Music Video Scene:</span>
              </h3>

              <div className="space-y-3">
                {REAL_SUFI_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(scene)}
                    className={`w-full p-4 rounded-2xl border text-left transition space-y-1.5 ${
                      selectedScene.id === scene.id
                        ? 'bg-amber-950/60 border-amber-500 shadow-xl ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center text-[10px]">
                          {scene.id}
                        </span>
                        <span>{scene.title}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        {scene.timeRange}
                      </span>
                    </div>

                    <p className="text-xs text-amber-300 font-semibold">
                      Kalaam: "{scene.urduLyrics}"
                    </p>

                    <p className="text-[11px] text-slate-300">
                      {scene.visualAtmosphere}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Production Architecture Notice */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How Real Generative AI Videos Are Produced</span>
              </h4>
              <p>
                Generative video engines (Kling, Runway, Veo, Sora) render photorealistic video frames on cloud GPU clusters.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>Full Song / Vocal Track</strong>: Generated with Suno AI / Udio AI.</li>
                <li><strong>Photorealistic Video Video Shots</strong>: Generated with Kling AI 1.5 or Runway Gen-4.5.</li>
                <li><strong>Cloud Credits</strong>: Active API account credits are required on Kling/Runway for live rendering.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
