export interface MusicStemAsset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  audioUrl: string;
  keySignature: string;
  instruments: string[];
  vocalStyle: string;
  recommendedVoice: 'urdu_female_sufi' | 'hindi_female_reporter' | 'hindi_male_narrator' | 'english_female_journalist';
  defaultLyrics: string;
  tags: string[];
}

export interface DanceChoreographyAsset {
  id: string;
  name: string;
  danceStyle: string;
  videoSrc: string;
  energyLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  outfit: string;
  setting: string;
  cameraMovement: string;
  tags: string[];
}

export const MUSIC_STEMS_LIBRARY: MusicStemAsset[] = [
  {
    id: 'sufi_qawwali',
    name: '1. Sufi Devotional Qawwali (Master)',
    genre: 'Sufi / Qawwali',
    bpm: 85,
    audioUrl: '/audio/suno_sufi_song.m4a',
    keySignature: 'C Minor',
    instruments: ['Acoustic Harmonium', 'Acoustic Tabla Dha', 'Ghungroo'],
    vocalStyle: 'Soulful Vocal Vibrato & Long Tones',
    recommendedVoice: 'urdu_female_sufi',
    defaultLyrics: 'तू ही तू है मेरे रूबरू... या रब्बा मेरे दिल की सदा सुन ले तू। हर साज़ में तेरी ही लगन है।',
    tags: ['sufi', 'devotional', 'qawwali', 'spiritual', 'harmonium', 'tabla', 'peace', 'haveli']
  },
  {
    id: 'punjabi_bhangra',
    name: '2. Punjabi Bhangra Club Beat (Real Dhol)',
    genre: 'Bhangra / Folk Pop',
    bpm: 135,
    audioUrl: '/audio/real/bhangra_dhol.m4a',
    keySignature: 'D Major',
    instruments: ['Heavy Dhol', 'Tumbi Lead', 'Algoza'],
    vocalStyle: 'Powerful High-Pitch Shouts',
    recommendedVoice: 'hindi_male_narrator',
    defaultLyrics: 'ढोल जागीरो दा वजेया, नचले सारे भांगड़ा पा के! बल्ले बल्ले हो गई आज!',
    tags: ['bhangra', 'punjabi', 'dhol', 'party', 'energetic', 'dance', 'festive']
  },
  {
    id: 'garba_dholida',
    name: '3. Gujarati Garba & Dholida (Real Dholak)',
    genre: 'Navratri Folk',
    bpm: 118,
    audioUrl: '/audio/real/garba_beat.m4a',
    keySignature: 'D Minor',
    instruments: ['Fast Dholak', 'Shehnai', 'Manjira Bells'],
    vocalStyle: 'Rhythmic Clapping Call-and-Response',
    recommendedVoice: 'hindi_female_reporter',
    defaultLyrics: 'ढोलीड़ा ढोल रे वगाड, मारे हीच लेवी छे! नवरात नी रात माँ रंग जमी गयो!',
    tags: ['garba', 'gujarati', 'navratri', 'dholida', 'dandiya', 'dance', 'spin']
  },
  {
    id: 'kathak_thumri',
    name: '4. Classical Kathak Thumri (Sarangi & Tabla)',
    genre: 'Indian Classical',
    bpm: 72,
    audioUrl: '/audio/real/kathak_tabla.m4a',
    keySignature: 'E Minor',
    instruments: ['Pakhawaj', 'Sarangi', 'Ghungroo Accents'],
    vocalStyle: 'Classical Raag & Taans',
    recommendedVoice: 'urdu_female_sufi',
    defaultLyrics: 'मोरी पायलिया बाजे छनन छनन... श्याम बिना मोहे कछु न सोहे।',
    tags: ['kathak', 'classical', 'thumri', 'mudra', 'ghungroo', 'sarangi', 'raag']
  },
  {
    id: 'lofi_chai',
    name: '5. Lo-Fi Mumbai Monsoon Chill (Real Beat)',
    genre: 'Lo-Fi Hip-Hop',
    bpm: 82,
    audioUrl: '/audio/real/lofi_chill.m4a',
    keySignature: 'G Major',
    instruments: ['Rhodes Piano', 'Vinyl Crackle', 'Muted Snare'],
    vocalStyle: 'Soft Whispered Vocal Cadence',
    recommendedVoice: 'urdu_female_sufi',
    defaultLyrics: 'गरम चाय की प्याली, खिड़की पे टपकती बूंदें... पुरानी यादों का एक खूबसूरत सफर।',
    tags: ['lofi', 'chill', 'chai', 'mumbai', 'relax', 'night', 'coffee', 'study']
  },
  {
    id: 'desi_hiphop',
    name: '6. Desi Street Rap & 808 (Real Sub-Bass)',
    genre: 'Desi Hip-Hop',
    bpm: 95,
    audioUrl: '/audio/real/hiphop_808.m4a',
    keySignature: 'A Minor',
    instruments: ['808 Sub-Bass', 'Trap Snare', 'Sitar Plucks'],
    vocalStyle: 'Fast Rhythmic Flow & Punchlines',
    recommendedVoice: 'hindi_male_narrator',
    defaultLyrics: 'सड़कों की कहानी, अपनी ही जुबानी। मेहनत का नतीजा, दुनिया ने भी मानी!',
    tags: ['hiphop', 'rap', 'desi', 'street', 'gully', '808', 'flow', 'urban']
  },
  {
    id: 'bollywood_90s',
    name: '7. 90s Bollywood Romance (Real Master)',
    genre: 'Romantic Ballad',
    bpm: 92,
    audioUrl: '/videos/reel_audio.m4a',
    keySignature: 'A Minor',
    instruments: ['Dholak', 'Bansuri Flute', 'Violin Section'],
    vocalStyle: 'Emotional Longing & Melodic Runs',
    recommendedVoice: 'hindi_female_reporter',
    defaultLyrics: 'तुमसे मिलने को दिल करता है... बस एक बार मिल जाओ, इस भीगे मौसम में हाथ थाम लो।',
    tags: ['romance', 'bollywood', '90s', 'love', 'emotional', 'flute', 'dholak']
  },
  {
    id: 'monsoon_pop',
    name: '8. Monsoon Pop Anthem (Studio)',
    genre: 'Modern Hindi Pop',
    bpm: 105,
    audioUrl: '/audio/real/lofi_chill.m4a',
    keySignature: 'C Major',
    instruments: ['Acoustic Guitar', 'Kick Drum', 'Crisp Snare', 'Rain Ambience'],
    vocalStyle: 'Catchy High-Energy Hook',
    recommendedVoice: 'hindi_female_reporter',
    defaultLyrics: 'बारिश आई रे, बारिश आई रे! दिल की गली में धूम मचाई रे! छतों से गिरती बूंदों में भीग जाने दे।',
    tags: ['pop', 'monsoon', 'rain', 'baarish', 'catchy', 'happy', 'umbrella', 'reel']
  },
  {
    id: 'coke_studio_fusion',
    name: '9. Coke Studio Sufi Fusion (Real Song)',
    genre: 'World Fusion',
    bpm: 88,
    audioUrl: '/audio/suno_sufi_song.m4a',
    keySignature: 'G Major',
    instruments: ['Rubab', 'Drum Kit', 'Acoustic Harmonium', 'Bass'],
    vocalStyle: 'Soulful Expressive Dual Harmony',
    recommendedVoice: 'urdu_female_sufi',
    defaultLyrics: 'दिल की ज़ुबानी सुनो, रूह की रवानी सुनो... हर धड़कन में बस तू ही बसा।',
    tags: ['fusion', 'coke studio', 'rubab', 'world', 'master', 'sufi']
  },
  {
    id: 'urdu_ghazal',
    name: '10. Midnight Urdu Ghazal',
    genre: 'Urdu Ghazal',
    bpm: 75,
    audioUrl: '/audio/real/kathak_tabla.m4a',
    keySignature: 'F Major',
    instruments: ['Santoor', 'Acoustic Tabla', 'Acoustic Harmonium'],
    vocalStyle: 'Poetic Shayari Recitation with Melody',
    recommendedVoice: 'urdu_female_sufi',
    defaultLyrics: 'हंगाम-ए-शाम में दिल को सुकून आया, तेरी यादों का फिर एक नया मौसम आया।',
    tags: ['ghazal', 'urdu', 'shayari', 'poetry', 'night', 'santoor', 'peace']
  },
  {
    id: 'rajasthani_folk',
    name: '11. Rajasthani Ghoomar Folk',
    genre: 'Rajasthani Folk',
    bpm: 110,
    audioUrl: '/audio/real/garba_beat.m4a',
    keySignature: 'B Minor',
    instruments: ['Khartal', 'Morchang', 'Dhol'],
    vocalStyle: 'High-Pitch Desert Folk Melody',
    recommendedVoice: 'hindi_female_reporter',
    defaultLyrics: 'घूमर रमे गोरी, केसरिया बालम आवो नी पधारो म्हारे देस।',
    tags: ['ghoomar', 'rajasthani', 'folk', 'desert', 'royalty', 'swirl']
  },
  {
    id: 'trap_edm',
    name: '12. Modern Indian Trap EDM',
    genre: 'Electronic Dance',
    bpm: 128,
    audioUrl: '/audio/real/hiphop_808.m4a',
    keySignature: 'C Minor',
    instruments: ['Synth Lead', 'Drop Bass', 'Vocal Chops'],
    vocalStyle: 'Modern Pop Anthemic Vocals',
    recommendedVoice: 'english_female_journalist',
    defaultLyrics: 'Feel the bass dropping through the monsoon sky, light up the city tonight!',
    tags: ['edm', 'trap', 'club', 'electronic', 'bass', 'drop', 'party']
  }
];

export const DANCE_CHOREOGRAPHIES_LIBRARY: DanceChoreographyAsset[] = [
  {
    id: 'ai_bench_01_dance',
    name: '1. AI Model Viral Dance Reel (Benchmark 1)',
    danceStyle: 'Viral AI Choreography & Expressive Motion',
    videoSrc: '/videos/dances/ai_bench_01.mp4',
    energyLevel: 'High',
    outfit: 'Trendy Indo-Western Outfit with Hair Physics',
    setting: 'Aesthetic Modern Studio with Warm Amber Lighting',
    cameraMovement: 'Vertical 9:16 portrait tracking with soft bokeh depth',
    tags: ['ai', 'benchmark', 'viral', 'reel', 'model', 'dance']
  },
  {
    id: 'ai_bench_02_dance',
    name: '2. AI Viral Rhythm Dancer (Benchmark 2)',
    danceStyle: 'Fast AI Beat Sync & Hand Gestures',
    videoSrc: '/videos/dances/ai_bench_02.mp4',
    energyLevel: 'Very High',
    outfit: 'Modern Designer Saree / Top with Shimmer',
    setting: 'Illuminated Sunset Stage with Particle Effects',
    cameraMovement: 'Dynamic center-locked zoom and rhythmic panning',
    tags: ['ai', 'benchmark', 'motion', 'trending', 'beatsync']
  },
  {
    id: 'ai_bench_04_dance',
    name: '3. AI Viral Reel Model Dancer (HD)',
    danceStyle: 'Smooth Neural Hip & Shoulder Swirls',
    videoSrc: '/videos/dances/ai_bench_04.mp4',
    energyLevel: 'High',
    outfit: 'Designer Saree & Traditional Kundan Jewellery',
    setting: 'Grand Marble Courtyard with Ambient Glow',
    cameraMovement: 'Cinematic 360° rotational camera orbit',
    tags: ['ai', 'model', 'palace', 'saree', 'classical']
  },
  {
    id: 'ai_bench_05_dance',
    name: '4. AI Indian Classical Saree Dancer',
    danceStyle: 'Authentic AI Saree Footwork & Mudras',
    videoSrc: '/videos/dances/ai_bench_05.mp4',
    energyLevel: 'High',
    outfit: 'Silk Royal Saree with Golden Zari Border',
    setting: 'Palace Heritage Darbar with Diya Glow',
    cameraMovement: 'Fluid low-angle tracking with depth-of-field',
    tags: ['ai', 'indian', 'saree', 'classical', 'palace']
  },
  {
    id: 'ai_bench_06_dance',
    name: '5. AI Influencer Viral Stage Dance',
    danceStyle: 'Modern Trending TikTok Hook Steps',
    videoSrc: '/videos/dances/ai_bench_06.mp4',
    energyLevel: 'Very High',
    outfit: 'Indo-Western Fusion Stage Jacket & Skirt',
    setting: 'Neon Rooftop Stage overlooking City Lights',
    cameraMovement: 'Center-lock portrait tracking with beat pulse',
    tags: ['ai', 'influencer', 'viral', 'stage', 'neon']
  },
  {
    id: 'ai_bench_07_dance',
    name: '6. Kling AI Realistic Motion Dancer',
    danceStyle: 'High-Precision Kling AI Motion & Twirls',
    videoSrc: '/videos/dances/ai_bench_07.mp4',
    energyLevel: 'High',
    outfit: 'Flowing Festive Anarkali with Velvet Dupatta',
    setting: 'Sunset Pavilion with Volumetric Sunlight',
    cameraMovement: 'Slow macro dolly-in and fast whip pan',
    tags: ['ai', 'kling', 'motion', 'realistic', 'anarkali']
  },
  {
    id: 'ai_bench_08_dance',
    name: '7. Luma Dream Machine AI Dancer',
    danceStyle: 'Dreamy Lyrical Contemporary Floorwork',
    videoSrc: '/videos/dances/ai_bench_08.mp4',
    energyLevel: 'High',
    outfit: 'Ethereal White Silk Robes',
    setting: 'Floating Lotus Garden with Ambient Mist',
    cameraMovement: 'Hypnotic orbital slider with slow motion',
    tags: ['ai', 'luma', 'dream', 'lyrical', 'ethereal']
  },
  {
    id: 'ai_dance_02_kling',
    name: '8. Kling AI High-Energy Jump Dancer',
    danceStyle: 'Explosive AI Jumps & Rhythm Kicks',
    videoSrc: '/videos/dances/ai_dance_02.mp4',
    energyLevel: 'Explosive',
    outfit: 'Futuristic Indo-Western Neon Robes',
    setting: 'Cyberpunk Stage with Laser Volumetric Lighting',
    cameraMovement: 'Rapid pan transitions and explosive jump zooms',
    tags: ['ai', 'kling', 'bhangra', 'fusion', 'cyberpunk', 'jumps']
  },
  {
    id: 'ai_dance_07_anime',
    name: '9. AI Classical 3D Anime Dancer',
    danceStyle: 'AI Animated Classical Mudra Spins',
    videoSrc: '/videos/dances/ai_dance_07.mp4',
    energyLevel: 'Medium',
    outfit: 'Embroidered Festive Anarkali & Ghungroo',
    setting: 'AI Dreamscape Garden with Floating Petals',
    cameraMovement: 'Hypnotic low-angle orbital slider tracking',
    tags: ['ai', 'classical', 'dream', 'garba', 'anarkali', 'fluid']
  },
  {
    id: 'ai_dance_09_neon',
    name: '10. AI Neon Pop Star Stage Dancer',
    danceStyle: 'AI Pop Star High-Tempo Choreography',
    videoSrc: '/videos/dances/ai_dance_09.mp4',
    energyLevel: 'Explosive',
    outfit: 'Glowing Cyber Stage Jacket',
    setting: 'Futuristic Stadium with Laser Fog Cannons',
    cameraMovement: 'Dynamic sweeps and rapid pulse zooms',
    tags: ['ai', 'neon', 'stage', 'pop', 'edm', 'laser']
  }
];

export function matchRemixFromPrompt(promptText: string): {
  matchedStem: MusicStemAsset;
  matchedDance: DanceChoreographyAsset;
  generatedLyrics: string;
} {
  const lower = promptText.toLowerCase();

  let bestStem = MUSIC_STEMS_LIBRARY[0];
  let maxStemScore = -1;

  for (const stem of MUSIC_STEMS_LIBRARY) {
    let score = 0;
    for (const tag of stem.tags) {
      if (lower.includes(tag)) score += 3;
    }
    if (lower.includes(stem.genre.toLowerCase())) score += 5;
    if (score > maxStemScore) {
      maxStemScore = score;
      bestStem = stem;
    }
  }

  let bestDance = DANCE_CHOREOGRAPHIES_LIBRARY[0];
  let maxDanceScore = -1;

  for (const dance of DANCE_CHOREOGRAPHIES_LIBRARY) {
    let score = 0;
    for (const tag of dance.tags) {
      if (lower.includes(tag)) score += 3;
    }
    if (lower.includes(dance.danceStyle.toLowerCase())) score += 5;
    if (score > maxDanceScore) {
      maxDanceScore = score;
      bestDance = dance;
    }
  }

  return {
    matchedStem: bestStem,
    matchedDance: bestDance,
    generatedLyrics: bestStem.defaultLyrics
  };
}
