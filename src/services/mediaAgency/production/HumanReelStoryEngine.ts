/**
 * CHATR Media Agency — Human Reel Story Engine
 * 
 * Generates human social short-form video stories where characters actually walk,
 * talk to camera, react with friends at outdoor cafes, scroll phones, and deliver payoffs.
 * Zero static image slides, zero presentation cards.
 */

import { ChatrCharacterCast, CharacterPersonality } from './ChatrCharacterCast';

export interface HumanReelShot {
  shotNumber: number;
  timeRange: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  shotTitle: string;
  videoClipUrl: string;
  posterUrl: string;
  characterAction: string;
  dialogueLine: string;
  captionText: string;
  audioLayer: {
    voiceText: string;
    ambientSound: string;
    musicTrack: string;
  };
}

export interface HumanSocialReel {
  reelId: string;
  title: string;
  category: string;
  totalDurationSeconds: number; // 30.0s
  character: CharacterPersonality;
  shots: HumanReelShot[];
}

export class HumanReelStoryEngine {
  public static generateHumanStory(
    reelId: string,
    topic: string,
    category: string,
    hook: string
  ): HumanSocialReel {
    const character = ChatrCharacterCast.selectCharacterForTrend(topic, category);

    // 7-Shot Authentic Human Social Video Sequence
    const shots: HumanReelShot[] = [
      // Shot 1: Character Walking Outside Talking to Camera (0.0s – 3.5s)
      {
        shotNumber: 1,
        timeRange: '0.0s - 3.5s',
        startTimeSeconds: 0.0,
        endTimeSeconds: 3.5,
        shotTitle: 'CHARACTER_WALKING_HOOK',
        videoClipUrl: character.videoClips.walkingTalkingToCameraUrl,
        posterUrl: character.videoClips.posterUrl,
        characterAction: `${character.name} walking outdoors down sunny city street, smiling and looking directly into camera.`,
        dialogueLine: hook || `${character.signatureCatchphrase}`,
        captionText: hook || `${character.signatureCatchphrase}`,
        audioLayer: {
          voiceText: hook || `${character.signatureCatchphrase}`,
          ambientSound: 'city_street_ambience_quiet',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 2: Friend Laughing & Reacting at Cafe Table (3.5s – 7.5s)
      {
        shotNumber: 2,
        timeRange: '3.5s - 7.5s',
        startTimeSeconds: 3.5,
        endTimeSeconds: 7.5,
        shotTitle: 'FRIEND_LAUGHING_REACTION',
        videoClipUrl: character.videoClips.friendLaughingReactionUrl,
        posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=720&q=85',
        characterAction: 'Cut to friend sitting at cafe table laughing and gesturing animatedly with hands.',
        dialogueLine: "My friend literally called me at 2 AM just to show me this.",
        captionText: "My friend literally called me at 2 AM just to show me this.",
        audioLayer: {
          voiceText: "My friend literally called me at 2 AM just to show me this.",
          ambientSound: 'cafe_chatter_soft',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 3: Close-up Scrolling on Smartphone (7.5s – 12.0s)
      {
        shotNumber: 3,
        timeRange: '7.5s - 12.0s',
        startTimeSeconds: 7.5,
        endTimeSeconds: 12.0,
        shotTitle: 'PHONE_SCROLL_CLOSEUP',
        videoClipUrl: character.videoClips.phoneScrollCloseupUrl,
        posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=720&q=85',
        characterAction: 'Macro shot of hands rapidly scrolling through viral comments on phone screen.',
        dialogueLine: "Look at the comments on this post. Everyone is having the exact same reaction.",
        captionText: "Look at the comments. Everyone is losing their mind.",
        audioLayer: {
          voiceText: "Look at the comments on this post. Everyone is having the exact same reaction.",
          ambientSound: 'ui_phone_scroll_clicks',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 4: Dramatic Expressive Reaction (12.0s – 17.0s)
      {
        shotNumber: 4,
        timeRange: '12.0s - 17.0s',
        startTimeSeconds: 12.0,
        endTimeSeconds: 17.0,
        shotTitle: 'DRAMATIC_REACTION',
        videoClipUrl: character.videoClips.shockedReactionUrl,
        posterUrl: character.videoClips.posterUrl,
        characterAction: `${character.name} reacting with wide-eyed disbelief: 'No. Absolutely not.'`,
        dialogueLine: "No. Absolutely not. Who authorized this?",
        captionText: "NO. ABSOLUTELY NOT. Who authorized this?",
        audioLayer: {
          voiceText: "No. Absolutely not. Who authorized this?",
          ambientSound: 'subtle_comic_drum_hit',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 5: Two People Actively Conversing (17.0s – 23.0s)
      {
        shotNumber: 5,
        timeRange: '17.0s - 23.0s',
        startTimeSeconds: 17.0,
        endTimeSeconds: 23.0,
        shotTitle: 'TWO_PERSON_INTERACTION',
        videoClipUrl: character.videoClips.twoPersonCollabUrl,
        posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=720&q=85',
        characterAction: 'Two people leaning over table discussing the moment with expressive hand motions.',
        dialogueLine: "And the funniest part is nobody knows if this was scripted or completely accidental.",
        captionText: "Nobody knows if this was scripted or completely accidental.",
        audioLayer: {
          voiceText: "And the funniest part is nobody knows if this was scripted or completely accidental.",
          ambientSound: 'cafe_ambient_room',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 6: Moving Street Scene (23.0s – 27.0s)
      {
        shotNumber: 6,
        timeRange: '23.0s - 27.0s',
        startTimeSeconds: 23.0,
        endTimeSeconds: 27.0,
        shotTitle: 'STREET_ENVIRONMENT_CUT',
        videoClipUrl: character.videoClips.streetAmbientUrl,
        posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85',
        characterAction: 'Moving cinematic shot of lively city traffic and neon street lights.',
        dialogueLine: "Either way, it has taken over every single group chat in the country today.",
        captionText: "It has taken over every single group chat today.",
        audioLayer: {
          voiceText: "Either way, it has taken over every single group chat in the country today.",
          ambientSound: 'city_night_traffic_drone',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      },

      // Shot 7: Character Sign-off & Punchline (27.0s – 30.0s)
      {
        shotNumber: 7,
        timeRange: '27.0s - 30.0s',
        startTimeSeconds: 27.0,
        endTimeSeconds: 30.0,
        shotTitle: 'CHARACTER_SIGNOFF_CTA',
        videoClipUrl: character.videoClips.outroSignoffUrl,
        posterUrl: character.videoClips.posterUrl,
        characterAction: `${character.name} back to camera with warm smile and playful finger point.`,
        dialogueLine: "And that's how it happened. Tag the one friend who definitely did this.",
        captionText: "Tag that one friend in the comments 👇",
        audioLayer: {
          voiceText: "And that's how it happened. Tag the one friend who definitely did this.",
          ambientSound: 'subtle_chime_bell',
          musicTrack: 'Upbeat Urban Lo-Fi Beat'
        }
      }
    ];

    return {
      reelId,
      title: topic,
      category,
      totalDurationSeconds: 30.0,
      character,
      shots
    };
  }
}
