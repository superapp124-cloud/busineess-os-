/**
 * CHATR Media Agency — AI Virtual Influencer Engine
 * Full-Capability Avatar Lifecycle (Talk, Walk, Podcast, Sing, Dance)
 */

export type InfluencerActivityMode = 'podcast' | 'talk' | 'sing' | 'dance' | 'walk';

export interface VirtualInfluencerProfile {
  id: string;
  name: string;
  handle: string;
  niche: string;
  bio: string;
  followers: string;
  voiceKey: 'hindi_female_reporter' | 'urdu_female_sufi' | 'hindi_male_narrator' | 'english_female_journalist';
  languages: string[];
  avatarImage: string;
  videoMap: {
    talk: string;
    podcast: string;
    sing: string;
    dance: string;
    walk: string;
  };
  audioMap: {
    talk: string;
    podcast: string;
    sing: string;
    dance: string;
    walk: string;
  };
  defaultPrompts: {
    talk: string;
    podcast: string;
    sing: string;
    dance: string;
    walk: string;
  };
}

export const VIRTUAL_INFLUENCERS: VirtualInfluencerProfile[] = [
  {
    id: 'meera_delhi',
    name: 'Meera',
    handle: '@meera_wtf',
    niche: 'Delhi Culture, Relatable Humor, Street Food & Vlogs',
    bio: '23-year-old virtual creator from Saket, Delhi. Chaotic good, brutally honest reviews, street food connoisseur & late-night melodies.',
    followers: '2.8M',
    voiceKey: 'hindi_female_reporter',
    languages: ['Hinglish', 'Hindi', 'English'],
    avatarImage: '/characters/meera/master_face_crop.jpg',
    videoMap: {
      talk: '/chatr/dryrun003/episode_01/video.mp4',
      podcast: '/chatr/dryrun003/episode_03/video.mp4',
      sing: '/chatr/dryrun003/episode_10/video.mp4',
      dance: '/videos/dances/ai_dance_01.mp4',
      walk: '/outputs/meera/milestone-1/meera_delhi_walk_001.mp4'
    },
    audioMap: {
      talk: '/chatr/dryrun003/episode_01/voice.mp3',
      podcast: '/chatr/dryrun003/episode_03/voice.mp3',
      sing: '/chatr/dryrun003/episode_10/voice.mp3',
      dance: '/audio/real/hiphop_808.m4a',
      walk: '/chatr/dryrun003/episode_02/voice.mp3'
    },
    defaultPrompts: {
      talk: 'Okay so listen... main kal raat yeh climax dekhi and I was not ready! Yaar maine kal raat ek cheez dekhi aur main literally so nahi payi.',
      podcast: 'Let us be completely honest for a second. Why does every person in South Delhi have the exact same startup idea?',
      sing: 'Late night acoustic session. Pure melody, no autotune, just vibes directly to camera.',
      dance: 'High-energy hook step choreography on viral Delhi street remix beats.',
      walk: 'Walking through Lajpat Nagar market live report. Momos are spiritually important and this is not even a debate.'
    }
  },
  {
    id: 'aanya_sharma',
    name: 'Aanya Sharma',
    handle: '@aanya.ai',
    niche: 'Fashion, Lifestyle & Monsoon Reels',
    bio: 'Digital creator & AI fashion icon exploring Mumbai monsoons, modern trends & dance aesthetics.',
    followers: '1.4M',
    voiceKey: 'hindi_female_reporter',
    languages: ['Hindi', 'English'],
    avatarImage: '/videos/dances/ai_bench_01.mp4',
    videoMap: {
      talk: '/videos/dances/ai_bench_01.mp4',
      podcast: '/videos/dances/ai_bench_02.mp4',
      sing: '/videos/dances/ai_bench_04.mp4',
      dance: '/videos/dances/ai_dance_02.mp4',
      walk: '/videos/dances/ai_dance_09.mp4'
    },
    audioMap: {
      talk: '/videos/gurugram_report_voice.mp3',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/videos/reel_audio.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'नमस्ते दोस्तों! आज हम बात करेंगे कि कैसे AI हमारे कंटेंट क्रिएशन को 10x आसान और क्रिएटिव बना रहा है।',
      podcast: 'Welcome to episode 42 of The Future Mind Podcast! Today, we are breaking down the rise of autonomous virtual influencers.',
      sing: 'बारिश आई रे, बारिश आई रे! दिल की गली में धूम मचाई रे! छतों से गिरती बूंदों में भीग जाने दे।',
      dance: 'High-energy hook step choreography synced to energetic beat drops.',
      walk: 'Walking through the rainy city streets in full designer fashion with casual vlog commentary.'
    }
  },
  {
    id: 'zara_qureshi',
    name: 'Zara Qureshi',
    handle: '@zara.sufi',
    niche: 'Sufi Music, Poetry & Deep Philosophy',
    bio: 'Soulful virtual vocalist blending centuries-old Urdu poetry with modern Coke Studio acoustics.',
    followers: '890K',
    voiceKey: 'urdu_female_sufi',
    languages: ['Urdu', 'Hindi'],
    avatarImage: '/videos/dances/ai_bench_02.mp4',
    videoMap: {
      talk: '/videos/dances/ai_bench_02.mp4',
      podcast: '/videos/dances/ai_bench_01.mp4',
      sing: '/videos/dances/ai_bench_05.mp4',
      dance: '/videos/dances/ai_dance_07.mp4',
      walk: '/videos/dances/ai_bench_04.mp4'
    },
    audioMap: {
      talk: '/audio/real/kathak_tabla.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/garba_beat.m4a',
      walk: '/audio/suno_sufi_song.m4a'
    },
    defaultPrompts: {
      talk: 'सलाम-ए-शौक! शायरी सिर्फ अल्फ़ाज़ नहीं, बल्कि रूह की आवाज़ होती है। जब हम दिल से बोलते हैं, तो ज़माना सुनता है।',
      podcast: 'In this intimate candlelit session, let us explore the mystical poetry of Amir Khusro and Rumi.',
      sing: 'तू ही तू है मेरे रूबरू... या रब्बा मेरे दिल की सदा सुन ले तू। हर साज़ में तेरी ही लगन है।',
      dance: 'Slow 360° spiritual whirling in traditional burgundy Anarkali with diya reflections.',
      walk: 'Strolling through historic moonlit stone corridors in ivory and gold zari attire.'
    }
  },
  {
    id: 'rohan_malhotra',
    name: 'Rohan Malhotra',
    handle: '@rohan.tech',
    niche: 'Tech Reviews, 808 Hip-Hop & Fitness',
    bio: 'Virtual entrepreneur & hip-hop host covering future robotics, 808 beat production & tech gear.',
    followers: '2.1M',
    voiceKey: 'hindi_male_narrator',
    languages: ['Hindi', 'English'],
    avatarImage: '/videos/dances/ai_dance_02.mp4',
    videoMap: {
      talk: '/videos/dances/ai_dance_02.mp4',
      podcast: '/videos/dances/ai_bench_06.mp4',
      sing: '/videos/dances/ai_bench_07.mp4',
      dance: '/videos/dances/ai_dance_02.mp4',
      walk: '/videos/dances/ai_bench_06.mp4'
    },
    audioMap: {
      talk: '/audio/real/hiphop_808.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/real/hiphop_808.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'What is up guys! Rohan Malhotra here. Today we are testing the latest AI chips and how neural rendering works.',
      podcast: 'Let us dive into the business of autonomous media distribution and how creator workflows are evolving.',
      sing: 'सड़कों की कहानी, अपनी ही जुबानी। मेहनत का नतीजा, दुनिया ने भी मानी!',
      dance: 'Urban popping, isolations and street freestyle on a neon rooftop helipad.',
      walk: 'Fast-paced street walk in oversized streetwear cargo with quick camera snap pans.'
    }
  }
];

export interface DirectedPerformance {
  influencer: VirtualInfluencerProfile;
  mode: InfluencerActivityMode;
  script: string;
  videoSrc: string;
  audioSrc: string;
  durationSec: number;
  viralityScore: number;
}

export function directInfluencerPerformance(
  influencerId: string,
  mode: InfluencerActivityMode,
  customScript?: string
): DirectedPerformance {
  const influencer = VIRTUAL_INFLUENCERS.find(i => i.id === influencerId) || VIRTUAL_INFLUENCERS[0];
  const script = customScript || influencer.defaultPrompts[mode];
  const videoSrc = influencer.videoMap[mode] || influencer.videoMap.talk;
  const audioSrc = influencer.audioMap[mode] || influencer.audioMap.talk;

  const scoreMap: Record<InfluencerActivityMode, number> = {
    dance: 98,
    sing: 97,
    podcast: 94,
    talk: 92,
    walk: 90
  };

  return {
    influencer,
    mode,
    script,
    videoSrc,
    audioSrc,
    durationSec: 60,
    viralityScore: scoreMap[mode]
  };
}
