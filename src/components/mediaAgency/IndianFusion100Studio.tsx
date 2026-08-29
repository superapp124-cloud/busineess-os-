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
  Flame,
  Radio,
  Share2,
  Activity,
  Layers,
  Search,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Shuffle
} from 'lucide-react';
import { 
  INDIAN_SONGS_100_LIBRARY, 
  INDIAN_DANCES_100_LIBRARY, 
  IndianSong100Item, 
  IndianDance100Item, 
  FusionResult, 
  synthesizeViralFusion 
} from '@/services/mediaAgency/fusion/IndianMediaFusion100Engine';

export const IndianFusion100Studio: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<IndianSong100Item>(INDIAN_SONGS_100_LIBRARY[0]);
  const [selectedDance, setSelectedDance] = useState<IndianDance100Item>(INDIAN_DANCES_100_LIBRARY[0]);
  const [activeTab, setActiveTab] = useState<'fusion_presets' | 'songs_100' | 'dances_100'>('fusion_presets');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('All');
  const [selectedEnergyFilter, setSelectedEnergyFilter] = useState<string>('All');

  // Player & Mixing
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [songVol, setSongVol] = useState<number>(0.9);
  const [statusMessage, setStatusMessage] = useState<string>('1-Minute Viral Fusion Live');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fusion = synthesizeViralFusion(selectedSong.id, selectedDance.id);

  // Filtered Songs (100)
  const filteredSongs = INDIAN_SONGS_100_LIBRARY.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLang = selectedLangFilter === 'All' || s.language === selectedLangFilter;
    return matchSearch && matchLang;
  });

  // Filtered Dances (100)
  const filteredDances = INDIAN_DANCES_100_LIBRARY.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        d.danceStyle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        d.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchEnergy = selectedEnergyFilter === 'All' || d.energyLevel === selectedEnergyFilter;
    return matchSearch && matchEnergy;
  });

  // 1-Click Surprise Viral Fusion
  const handleRandomSurpriseFusion = () => {
    const randomSongIdx = Math.floor(Math.random() * INDIAN_SONGS_100_LIBRARY.length);
    const randomDanceIdx = Math.floor(Math.random() * INDIAN_DANCES_100_LIBRARY.length);
    
    const newSong = INDIAN_SONGS_100_LIBRARY[randomSongIdx];
    const newDance = INDIAN_DANCES_100_LIBRARY[randomDanceIdx];

    setSelectedSong(newSong);
    setSelectedDance(newDance);
    setStatusMessage(`🎲 Generated Viral Mashup: ${newSong.genre} × ${newDance.danceStyle}!`);

    const a = audioRef.current;
    const v = videoRef.current;
    if (a) { a.src = newSong.audioUrl; a.currentTime = 0; a.play().catch(() => {}); }
    if (v) { v.src = newDance.videoSrc; v.currentTime = 0; v.play().catch(() => {}); }
    setIsPlaying(true);
  };

  const handleSelectSong = (song: IndianSong100Item) => {
    setSelectedSong(song);
    const a = audioRef.current;
    if (a) {
      a.src = song.audioUrl;
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  };

  const handleSelectDance = (dance: IndianDance100Item) => {
    setSelectedDance(dance);
    const v = videoRef.current;
    if (v) {
      v.src = dance.videoSrc;
      v.currentTime = 0;
      v.play().catch(() => {});
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

  const handleTimeUpdate = () => {
    const a = audioRef.current;
    if (a) {
      setCurrentTime(a.currentTime);
      if (a.duration && !isNaN(a.duration)) setDuration(a.duration);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : songVol;
    }
  }, [songVol, isMuted]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full space-y-6">
        
        {/* Top Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-rose-500/40 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-rose-600/20 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">100 AI Indian Songs × 100 AI Dances Fusion Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/40">
                  10,000 VIRAL COMBINATIONS (1-MIN FULL LENGTH) 🔥
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100 Manufactured Indian Songs • 100 AI Dance Choreographies • Automated Audience Virality Fusions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRandomSurpriseFusion}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-xl shadow-rose-950 flex items-center space-x-2 transition"
            >
              <Shuffle className="w-4 h-4" />
              <span>🎲 Surprise Viral Fusion</span>
            </button>
            <a
              href={selectedSong.audioUrl}
              download={`${selectedSong.id}_1min_master.m4a`}
              className="px-4 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Master</span>
            </a>
          </div>
        </div>

        {/* Main Studio Grid (5 cols video + 7 cols 100x100 catalog) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 1-Minute Vertical Video Reel Player (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            
            <div 
              onClick={handleTogglePlay}
              className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-rose-500/40 relative cursor-pointer group flex items-center justify-center"
            >
              {/* Real 1-Minute Video Element */}
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

              {/* Real 1-Minute Master Song Audio Element */}
              <audio
                key={selectedSong.audioUrl}
                ref={audioRef}
                src={selectedSong.audioUrl}
                autoPlay
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
              />

              {/* Top Fusion Bar */}
              <div className="absolute top-3 left-3 right-3 z-30 space-y-1 pointer-events-none">
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-black/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span>🔥 {selectedSong.title.substring(0, 18)}...</span>
                  <span className="text-rose-400">{currentTime.toFixed(1)}s / {duration.toFixed(0)}s</span>
                </div>
              </div>

              {/* Audience Hook & Fusion Badge */}
              <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-rose-500/40 shadow-2xl space-y-1 text-center">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                    <span className="text-amber-400">💃 {selectedDance.danceStyle}</span>
                    <span className="text-rose-400">⚡ {selectedSong.bpm} BPM</span>
                  </div>
                  <h4 className="text-xs font-bold text-yellow-300 drop-shadow">
                    "{selectedSong.lyricsExcerpt}"
                  </h4>
                </div>
              </div>

              {/* Play / Pause Hover Badge */}
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                <div className="w-16 h-16 bg-black/80 rounded-full flex items-center justify-center text-white border border-white/30">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                </div>
              </div>
            </div>

            {/* Playback Controls & Fader */}
            <div className="w-full max-w-[320px] bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <button onClick={handleTogglePlay} className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button onClick={handleReplay} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="Replay">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={songVol}
                  onChange={(e) => setSongVol(parseFloat(e.target.value))}
                  className="w-20 accent-rose-500"
                />
              </div>
            </div>

            {/* Virality & Audience Hook Analytics Card */}
            <div className="w-full max-w-[320px] bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-white flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Audience Virality Prediction:</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {fusion.viralityIndex}/100 SCORE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">HOOK POWER:</span>
                  <span className="text-amber-400 font-bold">{fusion.audienceHookScore}% Retention</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">ENERGY SYNERGY:</span>
                  <span className="text-rose-400 font-bold">{selectedDance.energyLevel} Energy</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                {fusion.fusionDescription}
              </p>
            </div>
          </div>

          {/* Right: 100 Songs + 100 Dances Catalog Browser (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Catalog Mode Selector Tabs */}
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('fusion_presets')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                  activeTab === 'fusion_presets'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Top Viral Fusions</span>
              </button>
              <button
                onClick={() => setActiveTab('songs_100')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                  activeTab === 'songs_100'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>100 AI Songs</span>
              </button>
              <button
                onClick={() => setActiveTab('dances_100')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                  activeTab === 'dances_100'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>100 AI Dances</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100 songs or 100 dances by genre, language, mood..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              {/* Language Filters for Songs */}
              {activeTab === 'songs_100' && (
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {['All', 'Hindi', 'Punjabi', 'Gujarati', 'Urdu', 'Tamil', 'Marathi', 'Bhojpuri', 'Haryanvi', 'Bengali', 'Rajasthani'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLangFilter(lang)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition whitespace-nowrap ${
                        selectedLangFilter === lang
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}

              {/* Energy Filters for Dances */}
              {activeTab === 'dances_100' && (
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {['All', 'Chill', 'Medium', 'High', 'Explosive'].map((energy) => (
                    <button
                      key={energy}
                      onClick={() => setSelectedEnergyFilter(energy)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition whitespace-nowrap ${
                        selectedEnergyFilter === energy
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {energy}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: 100 AI SONGS CATALOG */}
            {activeTab === 'songs_100' && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Music className="w-4 h-4 text-rose-400" />
                    <span>100 AI Indian Songs Library (1-Minute Full Tracks):</span>
                  </h3>
                  <span className="text-xs font-mono text-rose-400 font-bold">{filteredSongs.length} Songs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className={`p-3.5 rounded-2xl border text-left transition space-y-1.5 ${
                        selectedSong.id === song.id
                          ? 'bg-rose-950/70 border-rose-500 shadow-xl ring-1 ring-rose-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          #{song.index} {song.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                          {song.language}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-amber-300">{song.genre}</span>
                        <span className="font-mono">{song.bpm} BPM • 1:00</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        Instruments: {song.instruments.join(', ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: 100 AI DANCE CHOREOGRAPHIES CATALOG */}
            {activeTab === 'dances_100' && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>100 AI Dance Choreographies (1-Minute Full Motion):</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{filteredDances.length} Dances</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredDances.map((dance) => (
                    <button
                      key={dance.id}
                      onClick={() => handleSelectDance(dance)}
                      className={`p-3.5 rounded-2xl border text-left transition space-y-1.5 ${
                        selectedDance.id === dance.id
                          ? 'bg-emerald-950/70 border-emerald-500 shadow-xl ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          #{dance.index} {dance.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                          {dance.energyLevel}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-300 truncate">{dance.danceStyle}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate">{dance.setting}</span>
                        <span className="text-amber-400 font-bold">{dance.viralityScore} Score</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: VIRAL FUSION PRESETS */}
            {activeTab === 'fusion_presets' && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Trending Viral Audience Fusions (High Retention):</span>
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-bold">Top 6 Presets</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { songIdx: 1, danceIdx: 3, label: 'Punjabi Bhangra × High Energy Jumps', tag: '99% Virality', desc: 'Heavy Dhol beat paired with mustard field jump choreography.' },
                    { songIdx: 0, danceIdx: 2, label: 'Sufi Qawwali × Haveli Whirling', tag: '97% Spiritual', desc: 'Harmonium and tabla master paired with 360° Burgundy Anarkali spin.' },
                    { songIdx: 2, danceIdx: 1, label: 'Monsoon Pop × Rain Umbrella Dance', tag: '98% Trending', desc: '105 BPM guitar pop paired with puddle splash footwork.' },
                    { songIdx: 3, danceIdx: 4, label: 'Navratri Garba × Circular 3-Taali', tag: '96% Festive', desc: 'Dholak beats paired with mirror-work spin choreography.' },
                    { songIdx: 5, danceIdx: 0, label: 'Classical Kathak × Palace Tatkar', tag: '95% Classical', desc: 'Sarangi and Pakhawaj paired with marble courtyard spins.' },
                    { songIdx: 7, danceIdx: 5, label: 'Desi 808 Hip-Hop × Metro Popping', tag: '97% Urban', desc: 'Heavy 808 sub-bass paired with street popping isolations.' }
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const s = INDIAN_SONGS_100_LIBRARY[preset.songIdx];
                        const d = INDIAN_DANCES_100_LIBRARY[preset.danceIdx];
                        setSelectedSong(s);
                        setSelectedDance(d);
                        const a = audioRef.current;
                        const v = videoRef.current;
                        if (a) { a.src = s.audioUrl; a.currentTime = 0; a.play().catch(() => {}); }
                        if (v) { v.src = d.videoSrc; v.currentTime = 0; v.play().catch(() => {}); }
                        setIsPlaying(true);
                      }}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left transition space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          {preset.label}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {preset.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
