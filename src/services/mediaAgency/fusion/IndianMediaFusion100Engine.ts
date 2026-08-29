/**
 * CHATR Media Agency — 100 AI Indian Songs × 100 AI Dance Choreographies Fusion Engine
 * 1-Minute Full Length Production Database & Audience Virality Matcher
 */

export interface IndianSong100Item {
  id: string;
  index: number;
  title: string;
  genre: string;
  language: 'Hindi' | 'Punjabi' | 'Gujarati' | 'Urdu' | 'Tamil' | 'Telugu' | 'Marathi' | 'Bengali' | 'Bhojpuri' | 'Haryanvi' | 'Kashmiri' | 'Rajasthani';
  bpm: number;
  durationSec: number;
  audioUrl: string;
  keySignature: string;
  instruments: string[];
  vocalStyle: string;
  mood: 'Spiritual' | 'High Energy' | 'Romantic' | 'Festive' | 'Chill Lo-Fi' | 'Cinematic' | 'Heartbreak' | 'Party';
  lyricsExcerpt: string;
  sunoPrompt: string;
  tags: string[];
}

export interface IndianDance100Item {
  id: string;
  index: number;
  title: string;
  danceStyle: string;
  category: 'Traditional Classical' | 'Festive Folk' | 'Modern Street & Hook' | 'Cinematic Drama' | 'Spiritual Whirling' | 'Lyrical Contemporary' | 'Stage Concert';
  energyLevel: 'Chill' | 'Medium' | 'High' | 'Explosive';
  durationSec: number;
  videoSrc: string;
  outfit: string;
  setting: string;
  cameraDynamics: string;
  viralityScore: number; // 80 - 99
  tags: string[];
}

// REAL AUDIO & PURE AI GENERATED VIDEO ROTATING STEM POOL
const REAL_AUDIO_POOL = [
  '/audio/suno_sufi_song.m4a',
  '/audio/real/bhangra_dhol.m4a',
  '/audio/real/garba_beat.m4a',
  '/audio/real/kathak_tabla.m4a',
  '/audio/real/lofi_chill.m4a',
  '/audio/real/hiphop_808.m4a',
  '/videos/reel_audio.m4a'
];

const REAL_VIDEO_POOL = [
  '/videos/dances/ai_bench_01.mp4',
  '/videos/dances/ai_bench_02.mp4',
  '/videos/dances/ai_bench_04.mp4',
  '/videos/dances/ai_bench_05.mp4',
  '/videos/dances/ai_bench_06.mp4',
  '/videos/dances/ai_bench_07.mp4',
  '/videos/dances/ai_bench_08.mp4',
  '/videos/dances/ai_dance_01.mp4',
  '/videos/dances/ai_dance_02.mp4',
  '/videos/dances/ai_dance_07.mp4',
  '/videos/dances/ai_dance_09.mp4'
];

// Helper to generate 100 Indian Songs Catalog
function generate100Songs(): IndianSong100Item[] {
  const genres = [
    { name: 'Sufi Qawwali', lang: 'Urdu', bpm: 85, mood: 'Spiritual', inst: ['Harmonium', 'Tabla', 'Ghungroo'], key: 'C Minor' },
    { name: 'Punjabi Bhangra Club', lang: 'Punjabi', bpm: 135, mood: 'High Energy', inst: ['Dhol', 'Tumbi', 'Algoza'], key: 'D Major' },
    { name: 'Bollywood Monsoon Pop', lang: 'Hindi', bpm: 105, mood: 'Festive', inst: ['Acoustic Guitar', 'Kick', 'Snare', 'Rain'], key: 'C Major' },
    { name: 'Navratri Garba Dholida', lang: 'Gujarati', bpm: 120, mood: 'Festive', inst: ['Dholak', 'Shehnai', 'Manjira'], key: 'D Minor' },
    { name: '90s Romantic Melodrama', lang: 'Hindi', bpm: 92, mood: 'Romantic', inst: ['Bansuri Flute', 'Dholak', 'Violins'], key: 'A Minor' },
    { name: 'Classical Kathak Thumri', lang: 'Hindi', bpm: 72, mood: 'Spiritual', inst: ['Sarangi', 'Pakhawaj', 'Ghungroo'], key: 'E Minor' },
    { name: 'Lo-Fi Mumbai Chai Chill', lang: 'Hindi', bpm: 82, mood: 'Chill Lo-Fi', inst: ['Rhodes Piano', 'Vinyl Crackle', 'Muted Kick'], key: 'G Major' },
    { name: 'Desi Street Rap 808', lang: 'Hindi', bpm: 96, mood: 'Party', inst: ['808 Sub-Bass', 'Trap Snare', 'Sitar Pluck'], key: 'A Minor' },
    { name: 'Rajasthani Ghoomar Folk', lang: 'Rajasthani', bpm: 112, mood: 'Festive', inst: ['Khartal', 'Morchang', 'Dhol'], key: 'B Minor' },
    { name: 'Coke Studio World Fusion', lang: 'Urdu', bpm: 88, mood: 'Spiritual', inst: ['Rubab', 'Drum Kit', 'Acoustic Harmonium'], key: 'G Major' },
    { name: 'South Indian Kuthu Beat', lang: 'Tamil', bpm: 140, mood: 'High Energy', inst: ['Thavil', 'Nadaswaram', 'Urumi'], key: 'F Major' },
    { name: 'Bhojpuri Festive Holi Pop', lang: 'Bhojpuri', bpm: 126, mood: 'Party', inst: ['Dholak', 'Casio Keyboard', 'Claps'], key: 'A Major' },
    { name: 'Marathi Lavani Dholki', lang: 'Marathi', bpm: 132, mood: 'High Energy', inst: ['Dholki', 'Halgi', 'Taal'], key: 'E Major' },
    { name: 'Bengali Baul Ektara', lang: 'Bengali', bpm: 90, mood: 'Spiritual', inst: ['Ektara', 'Dotara', 'Khol'], key: 'D Minor' },
    { name: 'Haryanvi Ragni Rap', lang: 'Haryanvi', bpm: 128, mood: 'High Energy', inst: ['Nagada', 'Heavy 808', 'Tumbi'], key: 'C Minor' },
    { name: 'Kashmiri Rouf Folk', lang: 'Kashmiri', bpm: 98, mood: 'Spiritual', inst: ['Santoor', 'Tumbaknari', 'Harmonium'], key: 'G Minor' },
    { name: 'Modern Indian Trap EDM', lang: 'Hindi', bpm: 130, mood: 'Party', inst: ['Synth Lead', 'Drop Bass', 'Vocal Chops'], key: 'C Minor' },
    { name: 'Heartbreak Ghazal Night', lang: 'Urdu', bpm: 74, mood: 'Heartbreak', inst: ['Santoor', 'Acoustic Tabla', 'Violin'], key: 'F Major' },
    { name: 'Cinematic Epic Score', lang: 'Hindi', bpm: 130, mood: 'Cinematic', inst: ['Heavy Brass', 'War Drums', 'Choir Chants'], key: 'D Minor' },
    { name: 'Acoustic Unplugged Coffee', lang: 'Hindi', bpm: 78, mood: 'Chill Lo-Fi', inst: ['Nylon Guitar', 'Soft Shaker', 'Cello'], key: 'C Major' }
  ];

  const songTitles = [
    'तू ही तू (Tu Hi Tu)', 'बारिश आई रे (Baarish Aayi Re)', 'दिल की ज़ुबानी (Dil Ki Zubani)',
    'ढोल जागीरो दा (Dhol Jagiro Da)', 'केसरिया बालम (Kesariya Balam)', 'मोरी पायलिया (Mori Payaliya)',
    'गरम चाय और बारिश (Garam Chai)', 'सड़क से फलक (Sadak Se Falak)', 'घूमर घूमे (Ghoomar Ghoome)',
    'रूह की रवानी (Rooh Ki Rawani)', 'अप्पा कुत्थु (Appa Kuthu)', 'रंग बरसे (Rang Barse)',
    'अप्सरा आली (Apsara Aali)', 'माझारे माटी (Majhare Maati)', 'देसी ठाठ (Desi Thaath)',
    'गुलाब रंग (Gulaab Rang)', 'बिजली गिरे (Bijli Gire)', 'तन्हा रातें (Tanha Raaten)',
    'फतेह का बिगुल (Fateh Ka Bigul)', 'भीगे अल्फाज़ (Bheege Alfaaz)'
  ];

  const songs: IndianSong100Item[] = [];

  for (let i = 0; i < 100; i++) {
    const baseG = genres[i % genres.length];
    const baseT = songTitles[i % songTitles.length];
    const variation = Math.floor(i / genres.length) + 1;
    const songId = `song_${String(i + 1).padStart(3, '0')}`;
    const audio = REAL_AUDIO_POOL[i % REAL_AUDIO_POOL.length];

    songs.push({
      id: songId,
      index: i + 1,
      title: `${baseT} (Vol. ${variation})`,
      genre: baseG.name,
      language: baseG.lang as any,
      bpm: baseG.bpm + ((i % 5) * 2 - 4),
      durationSec: 60,
      audioUrl: audio,
      keySignature: baseG.key,
      instruments: baseG.inst,
      vocalStyle: `Authentic ${baseG.lang} Melodic Vocals & Vibrato`,
      mood: baseG.mood as any,
      lyricsExcerpt: `“${baseT} — 1-Minute Full Master Track with authentic ${baseG.name} instrumentation.”`,
      sunoPrompt: `${baseG.lang} ${baseG.name}, ${baseG.inst.join(', ')}, ${baseG.mood} emotion, ${baseG.bpm} BPM, professional studio production`,
      tags: [baseG.name.toLowerCase(), baseG.lang.toLowerCase(), baseG.mood.toLowerCase(), '1-minute', 'master']
    });
  }

  return songs;
}

// Helper to generate 100 AI Dance Choreographies Catalog
function generate100Dances(): IndianDance100Item[] {
  const danceBases = [
    { title: 'Classical Kathak Tatkar & Mudras', style: 'Kathak Classical Footwork', cat: 'Traditional Classical', energy: 'High', outfit: 'Silk Angrakha & Brass Ghungroo', setting: 'Marble Palace Courtyard', cam: 'Orbital Crane & Macro Eye Tracking' },
    { title: 'Monsoon Rain Umbrella Twirl', style: 'Contemporary Monsoon Pop', cat: 'Modern Street & Hook', energy: 'High', outfit: 'Royal Blue Kurti in Rain', setting: 'Waterlogged City Street', cam: 'Dynamic 240 FPS Puddle Splash Gimbal' },
    { title: 'Sufi Whirling Haveli Trance', style: 'Spiritual 360° Whirling', cat: 'Spiritual Whirling', energy: 'Medium', outfit: 'Deep Burgundy Flared Anarkali', setting: 'Night Haveli with Diya Glow', cam: 'Continuous 360° Orbit Pull-Out' },
    { title: 'High-Energy Punjabi Bhangra Jumps', style: 'Authentic Punjabi Bhangra', cat: 'Festive Folk', energy: 'Explosive', outfit: 'Yellow Kurta Chadra & Turla Pagri', setting: 'Mustard Fields Sunset', cam: 'Handheld Quick Snap Pans' },
    { title: 'Navratri Garba 3-Taali & Spins', style: 'Traditional Gujarati Garba', cat: 'Festive Folk', energy: 'High', outfit: 'Mirror-Work Ghagra Choli', setting: 'Illuminated Festival Ground', cam: 'Circular Tracking with Dancers' },
    { title: 'Urban Desi Hip-Hop Popping', style: 'Street Popping & Isolations', cat: 'Modern Street & Hook', energy: 'High', outfit: 'Streetwear Cargo & Hoodie', setting: 'Neon Underground Metro', cam: 'Dutch Angle Tilts & Fast Zoom' },
    { title: '90s Bollywood Slow-Mo Dupatta Wave', style: 'Classic Romantic Ballad Dance', cat: 'Cinematic Drama', energy: 'Chill', outfit: 'Chiffon Saree in Breeze', setting: 'Misty Pine Forest', cam: '120 FPS Slow Motion Dolly' },
    { title: 'Rajasthani Ghoomar Royal Pirouettes', style: 'Royal Ghoomar Swirls', cat: 'Festive Folk', energy: 'Medium', outfit: 'Red & Gold Zari Poshaak', setting: 'Fort Courtyard Torchlight', cam: 'Top-Down Descending Crane' },
    { title: 'Field Reporter Expressive Street Vlog', style: 'Conversational Dialogue Gestures', cat: 'Modern Street & Hook', energy: 'Medium', outfit: 'Blue Kurti with TV News Mic', setting: 'Rainy Road & Traffic', cam: 'Eye-Level Handheld Portrait' },
    { title: 'Contemporary Floorwork in Rain Water', style: 'Lyrical Contemporary', cat: 'Lyrical Contemporary', energy: 'High', outfit: 'White Soaked Kurti', setting: 'Reflective Pavement Neon Lights', cam: 'Fluid Low-Angle Slider' },
    { title: 'High-Energy Stadium Concert Jump', style: 'Rock Pop Stage Performance', cat: 'Stage Concert', energy: 'Explosive', outfit: 'Glittering Stage Jacket & Mic', setting: 'Stadium Arena with Lasers', cam: 'Sweeping Stadium Jib' },
    { title: 'Haveli Jharokha Classical Sitting', style: 'Seated Devotional Mudra', cat: 'Traditional Classical', energy: 'Chill', outfit: 'Ivory Gold Zari Anarkali', setting: 'Moonlit Jharokha Balcony', cam: 'Soft Bokeh Portrait Tracking' },
    { title: 'Retro Disco Bollywood 80s Groove', style: 'Disco Pop Rhythm Steps', cat: 'Modern Street & Hook', energy: 'High', outfit: 'Metallic Silver Disco Jumpsuit', setting: 'LED Illuminated Dance Floor', cam: 'Rhythmic Zoom-Ins' },
    { title: 'Dargah Qawwali Chorus Clapping', style: 'Spiritual Group Swaying', cat: 'Spiritual Whirling', energy: 'Medium', outfit: 'Silk Kurtas & Green Dupattas', setting: 'Dargah Courtyard Night', cam: 'Gentle Horizontal Tracking' },
    { title: 'South Indian Kuthu Fast Steps', style: 'Dappankuthu Street Dance', cat: 'Festive Folk', energy: 'Explosive', outfit: 'Silk Lungi & Sunglasses', setting: 'Temple Festival Procession', cam: 'Fast Action Low-Angle Camera' },
    { title: 'Marathi Lavani Adakari Expressions', style: 'Lavani Expressive Gestures', cat: 'Festive Folk', energy: 'High', outfit: 'Nauvari Saree & Traditional Nath', setting: 'Heritage Wada Stage', cam: 'Facial Abhinaya Close-Up' },
    { title: 'Kashmiri Rouf Synchronized Sway', style: 'Traditional Rouf Chain Dance', cat: 'Festive Folk', energy: 'Medium', outfit: 'Embroidered Pheran & Kasaba', setting: 'Apple Orchard Valley', cam: 'Symmetric Linear Tracking' },
    { title: 'Intimate Candlelit Face & Vocalist', style: 'Subtle Facial Emotion & Breathing', cat: 'Cinematic Drama', energy: 'Chill', outfit: 'Subtle Traditional Kurti', setting: 'Dark Amber Keylit Studio', cam: 'Macro Eye & Lip Dolly' },
    { title: 'Modern Reel Viral Hook Step', style: 'Trending Social Media Choreography', cat: 'Modern Street & Hook', energy: 'High', outfit: 'Indo-Western Fusion Outfit', setting: 'Rooftop Skyline at Sunset', cam: 'Vertical 9:16 Center Lock Tracking' },
    { title: 'Cinematic War Warrior Dance', style: 'Martial Arts Sword Dance', cat: 'Cinematic Drama', energy: 'Explosive', outfit: 'Antique Armor & Red Shawl', setting: 'Battlefield at Dawn', cam: 'Rapid 360 Action Gimbal' }
  ];

  const dances: IndianDance100Item[] = [];

  for (let i = 0; i < 100; i++) {
    const baseD = danceBases[i % danceBases.length];
    const variation = Math.floor(i / danceBases.length) + 1;
    const danceId = `dance_${String(i + 1).padStart(3, '0')}`;
    const video = REAL_VIDEO_POOL[i % REAL_VIDEO_POOL.length];

    dances.push({
      id: danceId,
      index: i + 1,
      title: `${baseD.title} (Variation ${variation})`,
      danceStyle: baseD.style,
      category: baseD.cat as any,
      energyLevel: baseD.energy as any,
      durationSec: 60,
      videoSrc: video,
      outfit: baseD.outfit,
      setting: baseD.setting,
      cameraDynamics: baseD.cam,
      viralityScore: 88 + ((i * 7) % 11), // 88 to 98
      tags: [baseD.style.toLowerCase(), baseD.cat.toLowerCase(), baseD.energy.toLowerCase(), '1-minute', '9:16']
    });
  }

  return dances;
}

export const INDIAN_SONGS_100_LIBRARY: IndianSong100Item[] = generate100Songs();
export const INDIAN_DANCES_100_LIBRARY: IndianDance100Item[] = generate100Dances();

export interface FusionResult {
  song: IndianSong100Item;
  dance: IndianDance100Item;
  fusionTitle: string;
  fusionDescription: string;
  audienceHookScore: number;
  viralityIndex: number;
  tempoSyncBpm: number;
  energySynergy: string;
}

export function synthesizeViralFusion(
  songId?: string,
  danceId?: string,
  searchQuery?: string
): FusionResult {
  let song = INDIAN_SONGS_100_LIBRARY[0];
  let dance = INDIAN_DANCES_100_LIBRARY[0];

  if (songId) {
    const foundSong = INDIAN_SONGS_100_LIBRARY.find(s => s.id === songId);
    if (foundSong) song = foundSong;
  }

  if (danceId) {
    const foundDance = INDIAN_DANCES_100_LIBRARY.find(d => d.id === danceId);
    if (foundDance) dance = foundDance;
  }

  if (searchQuery && !songId && !danceId) {
    const q = searchQuery.toLowerCase();
    const matchS = INDIAN_SONGS_100_LIBRARY.find(s => 
      s.title.toLowerCase().includes(q) || 
      s.genre.toLowerCase().includes(q) || 
      s.language.toLowerCase().includes(q) ||
      s.tags.some(t => t.includes(q))
    );
    if (matchS) song = matchS;

    const matchD = INDIAN_DANCES_100_LIBRARY.find(d => 
      d.title.toLowerCase().includes(q) || 
      d.danceStyle.toLowerCase().includes(q) || 
      d.tags.some(t => t.includes(q))
    );
    if (matchD) dance = matchD;
  }

  // Calculate Synergy & Audience Hook
  const audienceHookScore = Math.min(99, Math.round((dance.viralityScore + 94) / 2));
  const viralityIndex = Math.min(99, Math.round((song.bpm > 100 ? 96 : 91) + ((dance.energyLevel === 'Explosive' || dance.energyLevel === 'High') ? 3 : 0)));

  return {
    song,
    dance,
    fusionTitle: `${song.title} × ${dance.danceStyle}`,
    fusionDescription: `1-Minute Viral Fusion: ${song.genre} (${song.bpm} BPM) synced with ${dance.category} (${dance.outfit} in ${dance.setting}).`,
    audienceHookScore,
    viralityIndex,
    tempoSyncBpm: song.bpm,
    energySynergy: `${song.mood} Music + ${dance.energyLevel} Dance Motion`
  };
}
