/**
 * CHATR Media Agency — Viral Desi Micro-Drama & Entertainment Studio
 * 
 * Replaces commentary/explainer formats with viral Indian social media micro-dramas:
 * 1. Cute & Funny Everyday Indian Comedy Sketches (Village kids banter, bargaining, innocent tantrums)
 * 2. Emotional / Romantic 90s Bollywood Melodramas ("Bas Ek Baar Mil Jao", nostalgic love & longing)
 * 3. Relatable Desi Street Dramas (Chai stall philosophy, auto bargaining, college crush moments)
 */

export interface ViralMicroDramaScene {
  shotNumber: number;
  timeRange: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  shotType: 'EMOTIONAL_HOOK' | 'CHARACTER_DIALOGUE' | 'DRAMATIC_CLOSEUP' | 'COMEDIC_REACTION' | 'MUSIC_CRESCENDO' | 'HEARTWARMING_PAYOFF';
  videoClipUrl: string;
  posterUrl: string;
  characterAction: string;
  spokenHindiDialogue: string;
  englishSubtitle: string;
  audioTrack: {
    audioName: string;
    emotion: 'ROMANTIC_NOSTALGIC' | 'CUTE_COMEDIC' | 'MELODRAMATIC_90S' | 'DESI_HIGH_ENERGY';
    backgroundMusicUrl: string;
    duckingPercent: number;
  };
}

export interface ViralMicroDramaReel {
  reelId: string;
  genre: 'CUTE_CHILDHOOD_COMEDY' | '90S_ROMANTIC_MELODRAMA' | 'DESI_STREET_SKETCH' | 'EMOTIONAL_FAMILY_DRAMA';
  title: string;
  viralHook: string;
  totalDurationSeconds: number; // 25.0s - 30.0s
  targetAudienceVibe: string;
  characters: {
    protagonistName: string;
    age: number;
    characterLook: string;
    emotionalState: string;
  }[];
  scenes: ViralMicroDramaScene[];
}

export class DesiMicroDramaEngine {
  private static VIRAL_DRAMAS: Record<string, ViralMicroDramaReel> = {
    // 1. YouTube Short Reference Genre: "Bas Ek Baar Mil Jao... 🥺💖" (90s Romantic Melodrama)
    'romantic_90s_melodrama': {
      reelId: 'reel_romantic_90s_01',
      genre: '90S_ROMANTIC_MELODRAMA',
      title: 'Bas Ek Baar Mil Jao... 🥺💖 (90s Nostalgic Love)',
      viralHook: 'Kash wo purane din aur wo baatein wapas aa jayein...',
      totalDurationSeconds: 30.0,
      targetAudienceVibe: 'Romantic Nostalgia, 90s Melody Lovers, Heartbreak & Longing (Viral Audio Share)',
      characters: [
        {
          protagonistName: 'Simran & Kabir',
          age: 24,
          characterLook: 'Traditional Kurti / Denim Jacket in misty rain and old train station glow',
          emotionalState: 'Longing, tearful smile, deep heartfelt emotion'
        }
      ],
      scenes: [
        {
          shotNumber: 1,
          timeRange: '0.0s - 4.5s',
          startTimeSeconds: 0.0,
          endTimeSeconds: 4.5,
          shotType: 'EMOTIONAL_HOOK',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Girl walking slowly in evening mist, looking at an old handwritten letter with tears in eyes.',
          spokenHindiDialogue: "Tumse milne ko dil karta hai... rehte ho tum kahan?",
          englishSubtitle: "My heart longs to meet you just once... where have you gone?",
          audioTrack: {
            audioName: 'Tumse Milne Ko Dil Karta Hai (Nostalgic 90s Flute & Strings)',
            emotion: 'ROMANTIC_NOSTALGIC',
            backgroundMusicUrl: 'lofi_romantic_90s',
            duckingPercent: 50
          }
        },
        {
          shotNumber: 2,
          timeRange: '4.5s - 9.5s',
          startTimeSeconds: 4.5,
          endTimeSeconds: 9.5,
          shotType: 'DRAMATIC_CLOSEUP',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Slow motion close-up of face turning toward camera with wistful, emotional gaze as violin swells.',
          spokenHindiDialogue: "Bas ek baar mil jao... itna hi kehna hai.",
          englishSubtitle: "Just meet me once... that is all I have to say.",
          audioTrack: {
            audioName: 'Acoustic Sitar & Jhankar Beat',
            emotion: 'MELODRAMATIC_90S',
            backgroundMusicUrl: 'jhankar_sitar_swell',
            duckingPercent: 40
          }
        },
        {
          shotNumber: 3,
          timeRange: '9.5s - 15.0s',
          startTimeSeconds: 9.5,
          endTimeSeconds: 15.0,
          shotType: 'CHARACTER_DIALOGUE',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Flashback memory of shared laughter on tea terrace as golden sun sets behind mountains.',
          spokenHindiDialogue: "Wo beparwah shaamein aur wo bematlab ki baatein...",
          englishSubtitle: "Those carefree evenings and those endless meaningless conversations...",
          audioTrack: {
            audioName: 'Heartfelt Vocal Hum & Strings',
            emotion: 'ROMANTIC_NOSTALGIC',
            backgroundMusicUrl: 'vocal_hum_warm',
            duckingPercent: 45
          }
        },
        {
          shotNumber: 4,
          timeRange: '15.0s - 22.0s',
          startTimeSeconds: 15.0,
          endTimeSeconds: 22.0,
          shotType: 'MUSIC_CRESCENDO',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Close-up of fingers gently opening a saved audio voice note from 2019.',
          spokenHindiDialogue: "Har yaad mein tumhara chehra aaj bhi waisa hi hai.",
          englishSubtitle: "In every memory, your face remains exactly the same.",
          audioTrack: {
            audioName: '90s Melodic Drop (Peak Emotion)',
            emotion: 'MELODRAMATIC_90S',
            backgroundMusicUrl: 'melodic_peak_drop',
            duckingPercent: 30
          }
        },
        {
          shotNumber: 5,
          timeRange: '22.0s - 30.0s',
          startTimeSeconds: 22.0,
          endTimeSeconds: 30.0,
          shotType: 'HEARTWARMING_PAYOFF',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Night rain falling over quiet street lamps as final piano chords fade gently.',
          spokenHindiDialogue: "Agar yeh reel tum tak pahunche... toh bas muskura dena. 💖",
          englishSubtitle: "If this Reel reaches you... just smile for me once. 💖",
          audioTrack: {
            audioName: 'Gentle Piano & Raindrop Ambience',
            emotion: 'ROMANTIC_NOSTALGIC',
            backgroundMusicUrl: 'piano_rain_outro',
            duckingPercent: 50
          }
        }
      ]
    },

    // 2. Facebook Reference Genre: "Ai Video — Chhote Bachhon Ki Cute Ladai" (Cute Indian Village Comedy)
    'cute_childhood_comedy': {
      reelId: 'reel_cute_kids_02',
      genre: 'CUTE_CHILDHOOD_COMEDY',
      title: 'Bartan Dhone Ki Ladai 😂❤️ (Innocent Village Comedy)',
      viralHook: 'Jab chhota bhai bartan dhone se saaf inkaar kar de!',
      totalDurationSeconds: 28.0,
      targetAudienceVibe: 'Family Wholesome Humor, Relatable Sibling Banter, Indian Desi Cuteness',
      characters: [
        {
          protagonistName: 'Guddu & Chhutki',
          age: 4,
          characterLook: 'Desi traditional printed dress, steel thali & blue tub in village courtyard',
          emotionalState: 'Cute anger, funny tantrums, stubborn pout'
        }
      ],
      scenes: [
        {
          shotNumber: 1,
          timeRange: '0.0s - 5.0s',
          startTimeSeconds: 0.0,
          endTimeSeconds: 5.0,
          shotType: 'COMEDIC_REACTION',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Toddler sitting next to wash tub holding steel plate with a stubborn pout.',
          spokenHindiDialogue: "Hum bartan nahi dhoyenge! Humko dadi ke paas jana hai!",
          englishSubtitle: "I won't wash the utensils! I want to go to Dadi's house!",
          audioTrack: {
            audioName: 'Playful Desi Flute & Dholak Bounce',
            emotion: 'CUTE_COMEDIC',
            backgroundMusicUrl: 'desi_comedy_dholak',
            duckingPercent: 40
          }
        },
        {
          shotNumber: 2,
          timeRange: '5.0s - 11.0s',
          startTimeSeconds: 5.0,
          endTimeSeconds: 11.0,
          shotType: 'CHARACTER_DIALOGUE',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Elder sister holding spoon pointing authoritatively like a little mother.',
          spokenHindiDialogue: "Pehle kheer kisne khayi thi? Toh thali bhi tum hi saaf karoge!",
          englishSubtitle: "Who ate the sweet kheer first? Then you must clean the plate!",
          audioTrack: {
            audioName: 'Comedic Sitar Staccato Plucks',
            emotion: 'CUTE_COMEDIC',
            backgroundMusicUrl: 'sitar_staccato',
            duckingPercent: 45
          }
        },
        {
          shotNumber: 3,
          timeRange: '11.0s - 18.0s',
          startTimeSeconds: 11.0,
          endTimeSeconds: 18.0,
          shotType: 'DRAMATIC_CLOSEUP',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Little brother splashing water in tub and making dramatic crying face.',
          spokenHindiDialogue: "Mumma dekho didi humko daant rahi hai... 😭😂",
          englishSubtitle: "Mom, look! Didi is scolding me... 😭😂",
          audioTrack: {
            audioName: 'Cute Toddler Tantrum FX + Harmonium',
            emotion: 'CUTE_COMEDIC',
            backgroundMusicUrl: 'toddler_harmonium_fx',
            duckingPercent: 35
          }
        },
        {
          shotNumber: 4,
          timeRange: '18.0s - 28.0s',
          startTimeSeconds: 18.0,
          endTimeSeconds: 28.0,
          shotType: 'HEARTWARMING_PAYOFF',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85',
          characterAction: 'Both kids burst into giggles, splashing soapy bubbles in the air.',
          spokenHindiDialogue: "Aapke ghar mein bhi aise hi ladte hain kya? Comment mein batao! ❤️👇",
          englishSubtitle: "Do kids in your house fight like this too? Tell us in the comments! ❤️👇",
          audioTrack: {
            audioName: 'Cheerful Desi Celebration Beat',
            emotion: 'CUTE_COMEDIC',
            backgroundMusicUrl: 'desi_celebration_outro',
            duckingPercent: 40
          }
        }
      ]
    }
  };

  public static getDramaForTopic(topic: string, category: string): ViralMicroDramaReel {
    const t = topic.toLowerCase();
    const c = category.toLowerCase();

    if (c.includes('music') || t.includes('mil jao') || t.includes('love') || t.includes('song') || t.includes('romantic')) {
      return this.VIRAL_DRAMAS['romantic_90s_melodrama'];
    }
    return this.VIRAL_DRAMAS['cute_childhood_comedy'];
  }
}
