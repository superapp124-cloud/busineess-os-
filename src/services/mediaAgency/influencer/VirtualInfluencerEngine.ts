/**
 * CHATR Media Agency — AI Virtual Influencer Engine
 * Full-Capability Avatar Lifecycle (Talk, Walk, Podcast, Sing, Dance)
 * 10 Recurring CHATR Characters Registry
 */

export type InfluencerActivityMode = 'podcast' | 'talk' | 'sing' | 'dance' | 'walk';
export type CharacterAssetStatus = 'ASSETS_READY' | 'PENDING_REFERENCE_IMAGE';

export interface VirtualInfluencerProfile {
  id: string;
  name: string;
  handle: string;
  niche: string;
  bio: string;
  followers: string;
  voiceKey: 'hindi_female_reporter' | 'urdu_female_sufi' | 'hindi_male_narrator' | 'english_female_journalist' | 'tamil_female_creative';
  languages: string[];
  avatarImage: string;
  assetStatus: CharacterAssetStatus;
  useImageAvatar?: boolean;
  imageMap?: {
    talk: string;
    podcast: string;
    sing: string;
    dance: string;
    walk: string;
  };
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
    name: 'Meera Kapoor',
    handle: '@meera_wtf',
    niche: 'Delhi Culture, Relatable Humor, Street Food & Vlogs',
    bio: '23-year-old virtual creator from Saket, Delhi. Chaotic good, brutally honest reviews, street food connoisseur & late-night melodies.',
    followers: '2.8M',
    voiceKey: 'hindi_female_reporter',
    languages: ['Hinglish', 'Hindi', 'English'],
    avatarImage: '/characters/meera/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    useImageAvatar: false,
    imageMap: {
      walk: '/characters/meera/crops/full_body_street.jpg',
      talk: '/characters/meera/crops/creator_vlog_camera.jpg',
      podcast: '/characters/meera/crops/lifestyle_cafe.jpg',
      dance: '/characters/meera/crops/vibe_dancing_fun.jpg',
      sing: '/characters/meera/crops/look_ethnic_vibes.jpg'
    },
    videoMap: {
      walk: '/videos/meera/meera_walk_4k.mp4',
      talk: '/videos/meera/meera_talk_4k.mp4',
      podcast: '/videos/meera/meera_podcast_4k.mp4',
      dance: '/videos/meera/meera_dance_4k.mp4',
      sing: '/videos/meera/meera_sing_4k.mp4'
    },
    audioMap: {
      talk: '/videos/gurugram_report_voice.mp3',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
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
    id: 'priya_sharma',
    name: 'Priya Sharma',
    handle: '@priya.ai_strat',
    niche: 'Enterprise AI & Global Tech Strategy',
    bio: 'Enterprise AI strategist breaking down foundational models, autonomous agents, and cross-border tech disruption.',
    followers: '1.2M',
    voiceKey: 'english_female_journalist',
    languages: ['English', 'Hindi'],
    avatarImage: '/characters/priya/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/priya/priya_talk_4k.mp4',
      podcast: '/videos/priya/priya_podcast_4k.mp4',
      sing: '/videos/priya/priya_sing_4k.mp4',
      dance: '/videos/priya/priya_dance_4k.mp4',
      walk: '/videos/priya/priya_walk_4k.mp4'
    },
    audioMap: {
      talk: '/videos/gurugram_report_voice.mp3',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/videos/reel_audio.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Autonomous agent architectures are shifting how enterprise software operates. Here is the operational reality.',
      podcast: 'Deep dive into inference economics and why smaller, specialized fine-tunes outperform monolithic models.',
      sing: 'Acoustic session reflections on builders in the tech ecosystem.',
      dance: 'High-energy studio showcase on modern tech trends.',
      walk: 'Walking through Cyber Hub discussing the latest AI infrastructure developments.'
    }
  },
  {
    id: 'rohan_varma',
    name: 'Rohan Varma',
    handle: '@rohan.systems',
    niche: 'Systems Engineering & Hard Tech',
    bio: 'Systems engineer & hard-tech builder. Skeptical of marketing hype, obsessed with kernel runtimes and real latency.',
    followers: '950K',
    voiceKey: 'hindi_male_narrator',
    languages: ['English', 'Hindi'],
    avatarImage: '/characters/rohan/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/rohan/rohan_talk_4k.mp4',
      podcast: '/videos/rohan/rohan_podcast_4k.mp4',
      sing: '/videos/rohan/rohan_sing_4k.mp4',
      dance: '/videos/rohan/rohan_dance_4k.mp4',
      walk: '/videos/rohan/rohan_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/hiphop_808.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/real/hiphop_808.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Do not benchmark synthetic flops. Benchmark real cache hit rates and actual memory bandwidth.',
      podcast: 'Systems architecture teardown: What breaks when you scale distributed workers past 10,000 nodes.',
      sing: 'Raw indie acoustic beat.',
      dance: 'Urban rhythm freestyle in server room environment.',
      walk: 'Walk through Bangalore tech corridor discussing open-source compilers.'
    }
  },
  {
    id: 'ananya_iyer',
    name: 'Ananya Iyer',
    handle: '@ananya.creative',
    niche: 'Creative AI & Digital Arts',
    bio: 'Digital artist & creative director exploring the intersection of generative visual art and Indian classical aesthetics.',
    followers: '820K',
    voiceKey: 'tamil_female_creative',
    languages: ['Tamil', 'English', 'Hindi'],
    avatarImage: '/characters/ananya/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/ananya/ananya_talk_4k.mp4',
      podcast: '/videos/ananya/ananya_podcast_4k.mp4',
      sing: '/videos/ananya/ananya_sing_4k.mp4',
      dance: '/videos/ananya/ananya_dance_4k.mp4',
      walk: '/videos/ananya/ananya_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/kathak_tabla.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/garba_beat.m4a',
      walk: '/audio/suno_sufi_song.m4a'
    },
    defaultPrompts: {
      talk: 'Visual aesthetics in generative media need emotional depth, not just glossy plastic textures.',
      podcast: 'Exploring Carnatic rhythm patterns in algorithmic music synthesis.',
      sing: 'Melodic fusion of classical thillana with ambient lo-fi soundscapes.',
      dance: 'Contemporary classical choreography with digital projection mapping.',
      walk: 'Morning walk through historic art districts discussing color theory.'
    }
  },
  {
    id: 'vikram_joshi',
    name: 'Vikram Joshi',
    handle: '@vikram.oss',
    niche: 'Open Source & AI Infrastructure',
    bio: 'Linux kernel hacker & open-source evangelist. Believes in local AI weights, self-hosting, and digital sovereignty.',
    followers: '1.1M',
    voiceKey: 'hindi_male_narrator',
    languages: ['Hindi', 'English'],
    avatarImage: '/characters/vikram/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/vikram/vikram_talk_4k.mp4',
      podcast: '/videos/vikram/vikram_podcast_4k.mp4',
      sing: '/videos/vikram/vikram_sing_4k.mp4',
      dance: '/videos/vikram/vikram_dance_4k.mp4',
      walk: '/videos/vikram/vikram_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/hiphop_808.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/real/hiphop_808.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'If you cannot run your models locally on commodity silicon, you do not control your intelligence stack.',
      podcast: 'The open weights revolution: Why open models will inevitably commoditize proprietary APIs.',
      sing: 'Acoustic unplugged session.',
      dance: 'High energy beat drops.',
      walk: 'Walking through Pune tech park discussing Linux kernel scheduler patches.'
    }
  },
  {
    id: 'ishita_rao',
    name: 'Ishita Rao',
    handle: '@ishita.news',
    niche: 'Daily News & Trend Analysis',
    bio: 'Objective broadcast presenter delivering rapid, verified analysis of trending national and global events.',
    followers: '1.7M',
    voiceKey: 'hindi_female_reporter',
    languages: ['Hindi', 'English'],
    avatarImage: '/characters/ishita/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/ishita/ishita_talk_4k.mp4',
      podcast: '/videos/ishita/ishita_podcast_4k.mp4',
      sing: '/videos/ishita/ishita_sing_4k.mp4',
      dance: '/videos/ishita/ishita_dance_4k.mp4',
      walk: '/videos/ishita/ishita_walk_4k.mp4'
    },
    audioMap: {
      talk: '/videos/gurugram_report_voice.mp3',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Breaking developments today as new policy shifts reshape consumer tech and digital manufacturing.',
      podcast: 'In-depth analysis: Dissecting the macroeconomic signals and what they mean for urban consumers.',
      sing: 'Reflective evening melody.',
      dance: 'Studio pace movement.',
      walk: 'Field report walking outside parliament corridors.'
    }
  },
  {
    id: 'arjun_mehta',
    name: 'Arjun Mehta',
    handle: '@arjun.markets',
    niche: 'Fintech & Quantitative Markets',
    bio: 'Quantitative analyst & fintech creator. Translates complex algorithmic trading concepts and macro finance into human language.',
    followers: '1.5M',
    voiceKey: 'hindi_male_narrator',
    languages: ['English', 'Hindi'],
    avatarImage: '/characters/arjun/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/arjun/arjun_talk_4k.mp4',
      podcast: '/videos/arjun/arjun_podcast_4k.mp4',
      sing: '/videos/arjun/arjun_sing_4k.mp4',
      dance: '/videos/arjun/arjun_dance_4k.mp4',
      walk: '/videos/arjun/arjun_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/hiphop_808.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/real/hiphop_808.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Look at the yield curve inversions and equity risk premiums. The market is pricing in structural shifts.',
      podcast: 'How algorithmic liquidity providers operate during high-volatility macro announcements.',
      sing: 'Late night lofi session.',
      dance: 'Fast paced tempo moves.',
      walk: 'Walking through BKC Mumbai financial district.'
    }
  },
  {
    id: 'zoya_khan',
    name: 'Zoya Khan',
    handle: '@zoya.ux',
    niche: 'Product Design & Spatial UX',
    bio: 'Product designer & spatial UX researcher exploring next-gen interfaces, zero-UI interactions, and human-computer symbiosis.',
    followers: '890K',
    voiceKey: 'hindi_female_reporter',
    languages: ['Hindi', 'English', 'Urdu'],
    avatarImage: '/characters/zoya/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/zoya/zoya_talk_4k.mp4',
      podcast: '/videos/zoya/zoya_podcast_4k.mp4',
      sing: '/videos/zoya/zoya_sing_4k.mp4',
      dance: '/videos/zoya/zoya_dance_4k.mp4',
      walk: '/videos/zoya/zoya_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/kathak_tabla.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/garba_beat.m4a',
      walk: '/audio/suno_sufi_song.m4a'
    },
    defaultPrompts: {
      talk: 'Good product design is invisible. If a user needs a tutorial for your interface, your mental model is broken.',
      podcast: 'Spatial design principles: Moving beyond 2D glass rectangles into ambient contextual computing.',
      sing: 'Acoustic poetry and soulful vocal phrasing.',
      dance: 'Fluid contemporary movement in an architectural design studio.',
      walk: 'Walking through Hazratganj discussing vernacular design systems.'
    }
  },
  {
    id: 'kabir_malhotra',
    name: 'Kabir Malhotra',
    handle: '@kabir.sec',
    niche: 'Cybersecurity & Adversarial ML',
    bio: 'Cybersecurity researcher specializing in adversarial machine learning, red teaming, and privacy-preserving protocols.',
    followers: '1.3M',
    voiceKey: 'hindi_male_narrator',
    languages: ['English', 'Hindi'],
    avatarImage: '/characters/kabir/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/kabir/kabir_talk_4k.mp4',
      podcast: '/videos/kabir/kabir_podcast_4k.mp4',
      sing: '/videos/kabir/kabir_sing_4k.mp4',
      dance: '/videos/kabir/kabir_dance_4k.mp4',
      walk: '/videos/kabir/kabir_walk_4k.mp4'
    },
    audioMap: {
      talk: '/audio/real/hiphop_808.m4a',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/real/hiphop_808.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Prompt injection is not a bug; it is a fundamental consequence of mixing control instructions with untrusted data.',
      podcast: 'Adversarial evasion attacks: How imperceptible perturbations fool state-of-the-art vision models.',
      sing: 'Raw acoustic melody.',
      dance: 'High-energy electronic beat.',
      walk: 'Night walk in Gurgaon discussing hardware security modules.'
    }
  },
  {
    id: 'dev_bhatia',
    name: 'Dev Bhatia',
    handle: '@dev.explains',
    niche: 'Tech Explainer & High-Energy Reels',
    bio: '22-year-old creator demystifying cutting-edge engineering, computing history, and viral science in high-velocity 30s reels.',
    followers: '2.4M',
    voiceKey: 'english_female_journalist',
    languages: ['Hinglish', 'English', 'Hindi'],
    avatarImage: '/characters/dev/master_face_crop.jpg',
    assetStatus: 'ASSETS_READY',
    videoMap: {
      talk: '/videos/dev/dev_talk_4k.mp4',
      podcast: '/videos/dev/dev_podcast_4k.mp4',
      sing: '/videos/dev/dev_sing_4k.mp4',
      dance: '/videos/dev/dev_dance_4k.mp4',
      walk: '/videos/dev/dev_walk_4k.mp4'
    },
    audioMap: {
      talk: '/videos/gurugram_report_voice.mp3',
      podcast: '/audio/real/lofi_chill.m4a',
      sing: '/audio/suno_sufi_song.m4a',
      dance: '/audio/real/bhangra_dhol.m4a',
      walk: '/audio/real/hiphop_808.m4a'
    },
    defaultPrompts: {
      talk: 'Okay wait, did you know that quantum key distribution literally uses photons to guarantee nobody can eavesdrop on your data?',
      podcast: 'How modern GPUs parallelize matrix multiplication at tensor core level.',
      sing: 'Upbeat college campus melody.',
      dance: 'High energy viral beat dance.',
      walk: 'Walking across university campus with fast-paced explanations.'
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

