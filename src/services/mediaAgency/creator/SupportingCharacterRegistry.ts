/**
 * CHATR VIRTUAL CREATOR — SUPPORTING CHARACTER REGISTRY
 *
 * Each character has a locked identity.
 * When Priya appears in Episode 7, she must look like Priya from Episode 2.
 */

import type { SupportingCharacterId } from './ChatrInfluencerIdentity';

export interface SupportingCharacter {
  id: SupportingCharacterId;
  name: string;
  relationToMeera: string;
  personality: string;
  humorRole: string;
  voice: {
    edgeTtsVoice: string;
    rhythm: string;
    catchphrases: string[];
  };
  visual: {
    masterImagePath: string;
    description: string;
    signatureItem: string;
  };
  typicalBehaviors: string[];
  episodeFirstAppeared: number | null;
}

export const SUPPORTING_CHARACTERS: Record<SupportingCharacterId, SupportingCharacter> = {

  priya: {
    id: 'priya',
    name: 'Priya',
    relationToMeera: 'Best friend since college, Delhi',
    personality: 'Loud, warm, easily shocked, always the hype person',
    humorRole: 'Amplifier — makes Meera\'s observations funnier by reacting hard',
    voice: {
      edgeTtsVoice: 'hi-IN-AnanyaNeural',
      rhythm: 'fast, punctuated by gasps and laughs',
      catchphrases: [
        'WHAT.',
        'Meera. MEERA.',
        'Nahi yaar, this is too much.',
        'Okay I cannot deal with this right now.',
        'Tell me everything. Leave nothing out.'
      ]
    },
    visual: {
      masterImagePath: '/characters/priya/master_face.jpg',
      description: 'Warm-toned, bright eyes, usually in bright colors, big earrings',
      signatureItem: 'always wearing large statement earrings'
    },
    typicalBehaviors: [
      'grabs Meera\'s arm when shocked',
      'covers mouth when laughing',
      'dramatically falls back',
      'asks rapid follow-up questions'
    ],
    episodeFirstAppeared: null
  },

  arjun: {
    id: 'arjun',
    name: 'Arjun',
    relationToMeera: 'Guy friend from work, overconfident but generally harmless',
    personality: 'Sarcastic, self-assured, usually wrong about things he is confident about',
    humorRole: 'Foil — Meera corrects him, audience enjoys it',
    voice: {
      edgeTtsVoice: 'hi-IN-MadhurNeural',
      rhythm: 'measured, slightly smug, pauses for effect',
      catchphrases: [
        'Actually, if you think about it—',
        'I read somewhere that—',
        'Okay but technically—',
        'No no, I know exactly what happened.',
        'Trust me on this one.'
      ]
    },
    visual: {
      masterImagePath: '/characters/arjun/master_face.jpg',
      description: 'Clean-cut, slightly too put-together for the situation, neutral colors',
      signatureItem: 'always has his phone in hand'
    },
    typicalBehaviors: [
      'gestures with phone while talking',
      'slight confident smirk before being wrong',
      'quickly moves on after being corrected',
      'genuinely helpful despite the attitude'
    ],
    episodeFirstAppeared: null
  },

  dadi: {
    id: 'dadi',
    name: 'Dadi',
    relationToMeera: 'Grandmother — visits occasionally, disapproves of most things, deeply loving',
    personality: 'Wise, unexpectedly savage, references things from 40 years ago as if current',
    humorRole: 'Surprise — her observations hit differently because of her age and delivery',
    voice: {
      edgeTtsVoice: 'hi-IN-SwaraNeural',
      rhythm: 'slower, deliberate, long pauses for maximum effect',
      catchphrases: [
        'Hamare zamane mein...',
        'Yeh kya hua?',
        'Pagal ho gayi hai.',
        'Beta, sunao toh.',
        'Wahi toh bol rahi hoon.'
      ]
    },
    visual: {
      masterImagePath: '/characters/dadi/master_face.jpg',
      description: 'Older woman, silver hair, comfortable salwar, reading glasses on forehead',
      signatureItem: 'reading glasses permanently on forehead, never on eyes'
    },
    typicalBehaviors: [
      'delivers devastating observations without blinking',
      'immediately changes subject to food',
      'compares everything to 1970s',
      'unexpectedly modern opinions on some things'
    ],
    episodeFirstAppeared: null
  },

  raza: {
    id: 'raza',
    name: 'Raza',
    relationToMeera: 'Neighborhood friend, Delhi street wisdom personified',
    personality: 'Street-smart, extremely funny, overshares immediately, no filter',
    humorRole: 'Chaos — brings unplanned energy, stories spiral',
    voice: {
      edgeTtsVoice: 'hi-IN-MadhurNeural',
      rhythm: 'fast, jumps between topics, mid-sentence corrections',
      catchphrases: [
        'Bhai sun—',
        'Seedha baat karta hoon.',
        'Yeh toh galat hai bhai.',
        'Main bata deta hoon kya hua.',
        'Matlab yeh toh hona hi tha.'
      ]
    },
    visual: {
      masterImagePath: '/characters/raza/master_face.jpg',
      description: 'Casual wear, relaxed posture, Delhi street energy',
      signatureItem: 'always has chai in hand or nearby'
    },
    typicalBehaviors: [
      'starts stories from too far back',
      'laughs at his own jokes first',
      'points dramatically',
      'immediately offers unsolicited solutions'
    ],
    episodeFirstAppeared: null
  },

  boss_lady: {
    id: 'boss_lady',
    name: 'Shreya ma\'am',
    relationToMeera: 'Meera\'s work supervisor — formal, efficient, secretly overwhelmed',
    personality: 'Professional exterior, human interior — occasional cracks are very funny',
    humorRole: 'Contrast — her formality against Meera\'s casualness',
    voice: {
      edgeTtsVoice: 'en-IN-NeerjaNeural',
      rhythm: 'clipped, efficient, professional — breaks down momentarily',
      catchphrases: [
        'Moving on.',
        'Noted.',
        'That is... noted.',
        'Can we circle back to this?',
        'I need five minutes. Just. Five.'
      ]
    },
    visual: {
      masterImagePath: '/characters/boss_lady/master_face.jpg',
      description: 'Professional blazer, hair pinned, always looks slightly tired but composed',
      signatureItem: 'coffee cup, perpetually present'
    },
    typicalBehaviors: [
      'checks phone mid-conversation while pretending not to',
      'perfectly composed until one thing breaks it',
      'genuinely gives good advice accidentally',
      'takes three deep breaths before responding'
    ],
    episodeFirstAppeared: null
  }
};

export function getCharacter(id: SupportingCharacterId): SupportingCharacter {
  return SUPPORTING_CHARACTERS[id];
}

export function getAllCharacters(): SupportingCharacter[] {
  return Object.values(SUPPORTING_CHARACTERS);
}
