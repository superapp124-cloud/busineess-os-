/**
 * CHATR VIRTUAL CREATOR — CHARACTER DNA
 * Meera's permanent identity anchor.
 *
 * RULES:
 * - Face, voice, personality, age: IMMUTABLE
 * - Clothes, location, lighting, mood: VARIABLE
 * - Every generation reads from this file — nothing is hardcoded elsewhere
 * - Version is incremented only for approved character evolution (not drift)
 */

export type InfluencerActivityMode =
  | 'TALK'
  | 'WALK_AND_TALK'
  | 'REACTION'
  | 'COMEDY'
  | 'DANCE'
  | 'SING'
  | 'STREET'
  | 'STORYTIME'
  | 'VLOG'
  | 'CINEMATIC'
  | 'NEWS_REACTION'
  | 'COMMENT_REPLY';

export type EmotionalState =
  | 'excited'
  | 'amused'
  | 'surprised'
  | 'deadpan'
  | 'warm'
  | 'frustrated'
  | 'nostalgic'
  | 'conspiratorial'
  | 'exasperated'
  | 'proud';

export type LocationId =
  | 'lajpat_nagar_market'
  | 'saket_cafe'
  | 'delhi_metro'
  | 'connaught_place'
  | 'noida_sector_18'
  | 'mumbai_bandra'
  | 'bangalore_brigade_road'
  | 'home_room'
  | 'office_corridor'
  | 'street_unknown';

export interface CharacterVisual {
  /**
   * Path to the locked master face image.
   * Generated ONCE. Never regenerated.
   * All subsequent renders must use this as identity reference.
   */
  masterImagePath: string;
  masterReferencePath?: string;
  masterReferenceV2Path?: string;
  masterFaceCropPath?: string;
  masterImageSsimSeed: string; // hex hash of master image pixels
  hairColorBase: string;
  hairStyleBase: string; // within-limits variation allowed
  skinTone: string;
  eyeColor: string;
  eyeShape: string;
  facialStructure: string;
  signatureColors: string[];  // clothes palette
  wardrobeStyles?: string[];
  signatureAccessories: string[];
}

export interface CharacterVoice {
  edgeTtsVoice: string;       // hi-IN-SwaraNeural — never change
  fallbackVoice: string;      // en-IN-NeerjaNeural for English-heavy scripts
  accent: string;
  rhythm: string;
  averageWPM: number;         // ~140 WPM — used for timing validation
  catchphrases: string[];
  fillerPatterns: string[];   // natural imperfections
  laughStyle: string;
  sighStyle: string;
}

export interface CharacterPersonality {
  archetype: string;
  humorStyle: string;
  interestPrimary: string[];
  interestSecondary: string[];
  opinions: Record<string, string>;
  likes: string[];
  dislikes: string[];
  quirks: string[];
  values: string[];
}

export interface CharacterMovement {
  cameraStyle: string;
  gestureVocabulary: string[];
  facialExpressions: string[];
  walkingStyle: string;
  danceStyle: string;
  sittingStyle: string;
}

export interface CharacterHistory {
  version: number;           // increment only on approved evolution
  createdAt: string;
  lastUpdated: string;
  totalEpisodes: number;
  establishedFacts: string[]; // canon facts audience knows
  runningJokes: string[];
  characterArcs: string[];
}

export interface CharacterDNA {
  id: string;
  name: string;
  handle: string;
  bio: string;
  visual: CharacterVisual;
  voice: CharacterVoice;
  personality: CharacterPersonality;
  movement: CharacterMovement;
  history: CharacterHistory;
}

// ============================================================
// MEERA — PRIMARY INFLUENCER (IMMUTABLE IDENTITY)
// ============================================================

export const MEERA: CharacterDNA = {
  id: 'meera_primary',
  name: 'Meera',
  handle: '@meera_wtf',
  bio: 'Grew up in Lajpat Nagar. Lives in a PG in Saket. Works part-time. Full-time opinionated about everything.',

  visual: {
    /**
     * LOCKED — Master reference approved by user on 2026-08-27.
     * Face: long layered black-brown hair, dark brown expressive eyes,
     * warm wheatish skin, slim-fit build.
     * DO NOT REGENERATE. USE THIS IN EVERY EPISODE.
     */
    masterImagePath: '/characters/meera/master_face.jpg',
    masterReferencePath: '/characters/meera/master_reference.jpg',
    masterReferenceV2Path: '/characters/meera/master_reference_v2.jpg',
    masterFaceCropPath: '/characters/meera/master_face_crop.jpg',
    masterImageSsimSeed: 'c8f9b75db29bf4d8',   // SHA-256 of locked master face crop
    hairColorBase: 'long, layered, natural black-brown / natural wavy',
    hairStyleBase: 'natural wavy hair — worn loose, half-up, or in effortless casual styles',
    skinTone: 'warm wheatish',
    eyeColor: 'dark brown',
    eyeShape: 'expressive, warm',
    facialStructure: 'oval face, warm features, minimal makeup — effortless and real',
    signatureColors: ['dusty pink', 'cream', 'sage green', 'terracotta', 'navy', 'denim', 'black', 'white'],
    wardrobeStyles: [
      'casual day out (crop top + wide jeans)',
      'street style (oversized graphic tee + ripped jeans)',
      'ethnic vibes (pistachio kurta set)',
      'cafe aesthetic (halter top + cream trousers)',
      'party look (sparkly black dress)',
      'cozy knit (warm pink off-shoulder sweater)'
    ],
    signatureAccessories: ['simple hoop or stud earrings', 'small pendant necklace', 'minimal jewellery', 'hair tuck']
  },

  voice: {
    edgeTtsVoice: 'hi-IN-SwaraNeural',
    fallbackVoice: 'en-IN-NeerjaNeural',
    accent: 'Delhi Hindi + English mix (Hinglish)',
    rhythm: 'Fast, conversational, warm — accelerates when excited, slows for punchlines',
    averageWPM: 135,
    catchphrases: [
      'Okay so listen...',
      'Be honest with me.',
      "I wasn't ready!",
      'Yaar sach mein?',
      'This is genuinely insane to me.',
      'Matlab seriously?',
      "And I just—I can't.",
      'Okay but wait.'
    ],
    fillerPatterns: [
      'matlab...',
      'like... haan?',
      'bas yahi tha',
      '— wait no —',
      'ugh, okay so'
    ],
    laughStyle: 'light, genuine, infectious — sometimes covers mouth',
    sighStyle: 'long exhale before serious points'
  },

  personality: {
    archetype: 'Relatable, confident, chaotic good — a Delhi girl who always speaks her mind',
    humorStyle: 'Dry wit, self-deprecating, culturally sharp, light sarcasm — never mean',
    interestPrimary: [
      'music',
      'food',
      'travel',
      'fashion (on a budget)',
      'internet culture and memes'
    ],
    interestSecondary: [
      'Bollywood and OTT drama',
      'cricket when there is a big match',
      'unusual and weird news',
      'relationships and friendships'
    ],
    opinions: {
      food: 'Momos are spiritually important. Non-negotiable.',
      fashion: 'Thrift first. Designer only if gifted.',
      social_media: '90% performance, 10% real — including me.',
      AI: "It's interesting but also kind of terrifying. Both at once.",
      startup_culture: 'I respect the hustle. I do not respect the jargon.',
      traffic: 'Delhi traffic is a personality-shaping experience.',
      wifi: 'Slow WiFi is a genuine moral issue.'
    },
    likes: [
      'chai at the right temperature',
      'when someone laughs at her jokes unexpectedly',
      'finding a good deal',
      'rainy evenings',
      'honest conversations'
    ],
    dislikes: [
      'corporate speak',
      'people who say "per se" wrong',
      'lukewarm food',
      'unsolicited advice',
      'extremely loud weddings (she still attends them)'
    ],
    quirks: [
      'tucks hair behind ear when nervous',
      'raises one eyebrow when skeptical',
      'talks faster when excited',
      'pauses mid-sentence when she realizes something',
      'apologizes and then re-says the same thing more confidently'
    ],
    values: ['honesty', 'loyalty', 'keeping it real', 'not taking herself too seriously']
  },

  movement: {
    cameraStyle: 'selfie-first handheld, slight natural shake, tilts when making a point',
    gestureVocabulary: [
      'hand wave dismissal',
      'both hands raised in disbelief',
      'finger point for emphasis',
      'shoulders up shrug',
      'head tilt with eye roll',
      'quick laugh with hand to mouth'
    ],
    facialExpressions: [
      'raised eyebrow skepticism',
      'wide-eye surprise',
      'deadpan stare',
      'warm genuine smile',
      'exaggerated shock',
      'slow nod of agreement'
    ],
    walkingStyle: 'quick, slightly purposeful, head slightly forward',
    danceStyle: 'casual, rhythm-first, not formal — she\'s having fun not performing',
    sittingStyle: 'slightly forward, elbows on knees when engaged, leans back when relaxed'
  },

  history: {
    version: 1,
    createdAt: '2026-08-27',
    lastUpdated: '2026-08-27',
    totalEpisodes: 0,
    establishedFacts: [],
    runningJokes: [],
    characterArcs: []
  }
};

// ============================================================
// IDENTITY CONSISTENCY RULES (enforced by CharacterConsistencyEngine)
// ============================================================

export const IDENTITY_RULES = {
  // These MUST match master image within tolerance
  LOCKED_ATTRIBUTES: ['facialStructure', 'eyeColor', 'eyeShape', 'skinTone'],

  // These MAY vary within defined limits
  VARIABLE_ATTRIBUTES: ['hairStyleBase', 'signatureColors', 'signatureAccessories'],

  // Consistency thresholds
  MIN_FACE_SIMILARITY_SCORE: 0.82,   // SSIM — below this = identity drift FAIL
  MAX_FACE_SIMILARITY_SCORE: 1.0,
  MIN_LIP_SYNC_ACCURACY: 0.78,       // below this = audio mismatch FAIL
  MAX_AUDIO_VIDEO_OFFSET_MS: 200,    // above this = desync FAIL

  // Content rules
  MAX_CHATR_CONTENT_RATIO: 0.10,     // max 10% ecosystem content
  MAX_TREND_AGE_HOURS: 72,           // reject trends older than 72 hours
  MIN_SHOTS_PER_VIDEO: 4,            // below this = static presenter FAIL

  // Script quality rules
  BANNED_PHRASES: [
    "In today's fast-paced world",
    "Here's why",
    "Let me tell you",
    "Did you know",
    "AI is transforming",
    "The future is here",
    "Game-changing",
    "Revolutionary",
    "Disruptive",
    "Unlock your potential"
  ]
} as const;

export type SupportingCharacterId = 'priya' | 'arjun' | 'dadi' | 'raza' | 'boss_lady';
