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
  Layers,
  Flame,
  Radio,
  Share2,
  Activity,
  Edit3,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { 
  MUSIC_STEMS_LIBRARY, 
  DANCE_CHOREOGRAPHIES_LIBRARY, 
  MusicStemAsset, 
  DanceChoreographyAsset, 
  matchRemixFromPrompt 
} from '@/services/mediaAgency/remix/LocalRemixLibraryEngine';

interface VoiceProfile {
  key: 'urdu_female_sufi' | 'hindi_female_reporter' | 'hindi_male_narrator' | 'english_female_journalist';
  label: string;
  lang: string;
}

const VOICE_PROFILES: VoiceProfile[] = [
  { key: 'urdu_female_sufi', label: 'Uzma / Gul (Sufi & Soulful)', lang: 'Urdu / Hindi' },
  { key: 'hindi_female_reporter', label: 'Priya Sharma (Pop & Modern)', lang: 'Hindi' },
  { key: 'hindi_male_narrator', label: 'Rohan Varma (Baritone)', lang: 'Hindi' },
  { key: 'english_female_journalist', label: 'Neerja (Indian English)', lang: 'English' }
];

export const LocalRemixStudio: React.FC = () => {
  // Customization State
  const [userPrompt, setUserPrompt] = useState<string>('Make a high-energy monsoon pop dance with acoustic guitar and rain umbrella twirls');
  const [selectedStem, setSelectedStem] = useState<MusicStemAsset>(MUSIC_STEMS_LIBRARY[1]); // Monsoon Pop
  const [selectedDance, setSelectedDance] = useState<DanceChoreographyAsset>(DANCE_CHOREOGRAPHIES_LIBRARY[1]); // Monsoon Umbrella Twirl
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile['key']>('hindi_female_reporter');
  const [customLyrics, setCustomLyrics] = useState<string>(MUSIC_STEMS_LIBRARY[1].defaultLyrics);
  const [vocalAudioUrl, setVocalAudioUrl] = useState<string>('/videos/gurugram_report_voice.mp3');

  // Player & Mixing State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [vocalVol, setVocalVol] = useState<number>(0.95);
  const [musicVol, setMusicVol] = useState<number>(0.65);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for customized synthesis');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const vocalRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // 1. Prompt-Driven Auto Customization
  const handlePromptRemix = async () => {
    setIsSynthesizing(true);
    setStatusMessage('Analyzing prompt & matching stems...');
    const { matchedStem, matchedDance, generatedLyrics } = matchRemixFromPrompt(userPrompt);
    
    setSelectedStem(matchedStem);
    setSelectedDance(matchedDance);
    setSelectedVoice(matchedStem.recommendedVoice);
    setCustomLyrics(generatedLyrics);

    await synthesizeAudio(generatedLyrics, matchedStem.recommendedVoice, matchedStem.audioUrl);
  };

  // 2. Direct Custom Lyrics & Settings Synthesis
  const handleCustomSynthesize = async () => {
    setIsSynthesizing(true);
    setStatusMessage('Synthesizing custom vocals on local Python engine...');
    await synthesizeAudio(customLyrics, selectedVoice, selectedStem.audioUrl);
  };

  const synthesizeAudio = async (text: string, voiceKey: string, stemUrl: string) => {
    try {
      const res = await fetch('http://127.0.0.1:5055/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceKey })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          setVocalAudioUrl(data.audioUrl);
          const v = videoRef.current;
          const voc = vocalRef.current;
          const mus = musicRef.current;

          if (voc) { voc.src = data.audioUrl; voc.currentTime = 0; voc.play().catch(() => {}); }
          if (mus) { mus.src = stemUrl; mus.currentTime = 0; mus.play().catch(() => {}); }
          if (v) { v.currentTime = 0; v.play().catch(() => {}); }
          setIsPlaying(true);
          setStatusMessage('✅ Custom Song & Dance Video Synchronized!');
        }
      } else {
        setStatusMessage('Python engine responded with error. Check port 5055.');
      }
    } catch (e: any) {
      setStatusMessage(`Connection failed: ${e.message}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleTogglePlay = () => {
    const v = videoRef.current;
    const voc = vocalRef.current;
    const mus = musicRef.current;

    if (isPlaying) {
      if (v) v.pause();
      if (voc) voc.pause();
      if (mus) mus.pause();
      setIsPlaying(false);
    } else {
      if (v) v.play().catch(() => {});
      if (voc) voc.play().catch(() => {});
      if (mus) mus.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    const v = videoRef.current;
    const voc = vocalRef.current;
    const mus = musicRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    if (voc) { voc.currentTime = 0; voc.play().catch(() => {}); }
    if (mus) { mus.currentTime = 0; mus.play().catch(() => {}); }
    setIsPlaying(true);
  };

  // Sync volume faders
  useEffect(() => {
    if (vocalRef.current) vocalRef.current.volume = isMuted ? 0 : vocalVol;
    if (musicRef.current) musicRef.current.volume = isMuted ? 0 : musicVol;
  }, [vocalVol, musicVol, isMuted]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-purple-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/40 rounded-2xl flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Custom Local Song & AI Dance Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold border border-purple-500/40">
                  FULL LOCAL CUSTOMIZATION 🎛️
                </span>
              </div>
              <p className="text-xs text-slate-400">
                15 Reference Stems + 15 AI Dances • Custom Lyrics • Voice Model & Fader Controls
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={selectedStem.audioUrl}
              download={`${selectedStem.id}_custom_mix.wav`}
              className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Stem (WAV)</span>
            </a>
          </div>
        </div>

        {/* 1. Prompt Remixer Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-yellow-400" />
              <span>Prompt Auto-Remixer:</span>
            </h3>
            <span className="text-xs font-mono text-purple-300">{statusMessage}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Energetic Punjabi bhangra with dhol beats, or Sufi whirling in candlelit haveli..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              onClick={handlePromptRemix}
              disabled={isSynthesizing}
              className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-900/40 flex items-center justify-center space-x-2 transition whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSynthesizing ? 'Remixing...' : '🎛️ Remix from Prompt'}</span>
            </button>
          </div>
        </div>

        {/* 2. Deep Customization Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Vertical Video Player (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col items-center space-y-4">
            
            <div 
              onClick={handleTogglePlay}
              className="w-full max-w-[300px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/40 relative cursor-pointer group flex items-center justify-center"
            >
              <video
                key={selectedDance.videoSrc}
                ref={videoRef}
                src={selectedDance.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Vocal & Music Audio Elements */}
              <audio ref={vocalRef} src={vocalAudioUrl} autoPlay loop muted={isMuted} />
              <audio ref={musicRef} src={selectedStem.audioUrl} autoPlay loop muted={isMuted} />

              {/* Top Banner */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1 pointer-events-none">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/75 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>💃 {selectedDance.name.substring(0, 20)}...</span>
                  <span className="text-purple-400">{selectedStem.bpm} BPM</span>
                </div>
              </div>

              {/* Lyrics Overlay */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-purple-500/40 text-center shadow-2xl space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-purple-400">
                    🎵 {selectedStem.name}
                  </span>
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow">
                    "{customLyrics.substring(0, 60)}..."
                  </h4>
                </div>
              </div>

              {/* Hover Badge */}
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                <div className="w-14 h-14 bg-black/80 rounded-full flex items-center justify-center text-white border border-white/30">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-[300px] bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button onClick={handleTogglePlay} className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button onClick={handleReplay} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="Replay">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                <span>V:{Math.round(vocalVol * 100)}%</span>
                <span>M:{Math.round(musicVol * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Right: Customization Controls & Stems/Dances (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Custom Lyrics & Voice Production Panel */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  <span>1. Customize Lyrics & Vocal Actor:</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">Local Python 5055</span>
              </div>

              {/* Voice Profiles Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICE_PROFILES.map((vp) => (
                  <button
                    key={vp.key}
                    onClick={() => setSelectedVoice(vp.key)}
                    className={`p-2.5 rounded-xl border text-left transition space-y-0.5 ${
                      selectedVoice === vp.key
                        ? 'bg-purple-950/70 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block truncate">{vp.label}</span>
                    <span className="text-[9px] font-mono text-purple-300">{vp.lang}</span>
                  </button>
                ))}
              </div>

              {/* Lyrics Textarea */}
              <div className="space-y-3">
                <textarea
                  value={customLyrics}
                  onChange={(e) => setCustomLyrics(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition leading-relaxed"
                  placeholder="Type any custom lyrics, shayari, song hook or dialogue..."
                />

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Multi-Track Faders */}
                  <div className="flex-1 w-full flex items-center space-x-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Vocal Vol</span>
                        <span className="text-purple-400 font-mono">{Math.round(vocalVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={vocalVol}
                        onChange={(e) => setVocalVol(parseFloat(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Music Vol</span>
                        <span className="text-teal-400 font-mono">{Math.round(musicVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={musicVol}
                        onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                        className="w-full accent-teal-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCustomSynthesize}
                    disabled={isSynthesizing}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/40 flex items-center justify-center space-x-2 transition whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSynthesizing ? 'Synthesizing...' : '🚀 Synthesize Custom Song'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. 15 Reference Music Stems Library */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>2. Pick from 15 Music Reference Stems:</span>
                </h3>
                <span className="text-[10px] font-mono text-purple-400 font-bold">{selectedStem.genre}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                {MUSIC_STEMS_LIBRARY.map((stem) => (
                  <button
                    key={stem.id}
                    onClick={() => {
                      setSelectedStem(stem);
                      const mus = musicRef.current;
                      if (mus) {
                        mus.src = stem.audioUrl;
                        mus.currentTime = 0;
                        mus.play().catch(() => {});
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition space-y-1 ${
                      selectedStem.id === stem.id
                        ? 'bg-purple-950/70 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{stem.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold">
                        {stem.bpm}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300 truncate">{stem.genre}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 15 AI Dance Choreographies Library */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Film className="w-4 h-4 text-emerald-400" />
                  <span>3. Pick from 15 AI Dance Choreographies:</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{selectedDance.danceStyle}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                {DANCE_CHOREOGRAPHIES_LIBRARY.map((dance) => (
                  <button
                    key={dance.id}
                    onClick={() => {
                      setSelectedDance(dance);
                      const v = videoRef.current;
                      if (v) {
                        v.src = dance.videoSrc;
                        v.currentTime = 0;
                        v.play().catch(() => {});
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition space-y-1 ${
                      selectedDance.id === dance.id
                        ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{dance.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                        {dance.energyLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-300 truncate">{dance.danceStyle}</p>
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
