/**
 * CHATR VIRTUAL CREATOR — COMMON PERFORMANCE CONTRACT
 *
 * All 12 modes share this exact unified schema.
 * They are not separate engines; they are different director configurations.
 */

import type { InfluencerActivityMode, EmotionalState } from './ChatrInfluencerIdentity';

export interface CameraConfiguration {
  style:
    | 'handheld_selfie_operator_walking_backward'
    | 'handheld_selfie_front_facing'
    | 'medium_shot_tracking'
    | 'close_up_reaction'
    | 'cinematic_wide'
    | 'two_shot_conversation';
  framing: 'full_body' | 'medium_waist_up' | 'close_up';
  movementSpeed: 'static' | 'slow_backward' | 'dynamic_walking' | 'subtle_drift';
  shakeIntensity: 'none' | 'subtle_organic' | 'handheld_smartphone';
}

export interface CharacterActionConfiguration {
  type:
    | 'walking_toward_camera'
    | 'talking_to_camera'
    | 'reacting_to_stimulus'
    | 'dancing_choreography'
    | 'singing_performance'
    | 'laughing_with_character'
    | 'storytelling_seated'
    | 'interacting_with_crowd';
  motionDescription: string;
  isAlreadyMovingAtStart: boolean; // frame 1 must show active momentum
  hairBreezeResponse: boolean;
  clothingMotionResponse: boolean;
  lookAtCameraBeatSec: number;     // when she glances at lens
  lookAwayBeatSec: number;         // when she looks toward environment
}

export interface AudioContract {
  hasVoice: boolean;
  hasLipSync: boolean;
  voiceAudioPath?: string;
  speechText?: string;
  musicTrackPath?: string;
  ambientSoundscape?: string;
}

export interface ContinuityConfiguration {
  episodeIndex: number;
  recentLocationsCooldown: string[];
  outfitId: string;
  activeSupportingCharacters: string[];
  runningJokeContext?: string;
}

export interface UnifiedPerformanceContract {
  id: string;
  mode: InfluencerActivityMode;
  milestone: 'M1_WALK' | 'M2_TALK' | 'M3_VOICE' | 'M4_LIPSYNC' | 'M5_FULL_CREATOR' | 'M6_DANCE' | 'M7_CONTINUITY' | 'M8_FULL_REEL';
  character: {
    id: string;
    name: string;
    referenceAsset: 'master_face.jpg' | 'master_fullbody.jpg' | 'master_creator.jpg';
    referencePath: string;
    lockedIdentitySeed: string;
  };
  location: {
    id: string;
    label: string;
    environmentPrompt: string;
    timeOfDay: 'morning' | 'late_afternoon' | 'evening' | 'night';
    pedestrianDensity: 'empty' | 'sparse' | 'busy_indian_street';
  };
  action: CharacterActionConfiguration;
  emotion: {
    primary: EmotionalState;
    shiftTo?: EmotionalState;
    shiftTimestampSec?: number;
  };
  camera: CameraConfiguration;
  audio: AudioContract;
  continuity: ContinuityConfiguration;
  targetDurationSec: number;
  resolution: {
    width: number;
    height: number;
    aspectRatio: '9:16';
  };
}

/**
 * Factory that creates the unified contract for Milestone 1:
 * 8-Second Meera Delhi Walking Test (RAW VIDEO ONLY — NO VO / NO LIP SYNC)
 */
export function createMilestone1Contract(): UnifiedPerformanceContract {
  return {
    id: 'meera_m1_delhi_walk_001',
    mode: 'WALK_AND_TALK',
    milestone: 'M1_WALK',
    character: {
      id: 'meera',
      name: 'Meera',
      referenceAsset: 'master_fullbody.jpg',
      referencePath: '/characters/meera/master_fullbody.jpg',
      lockedIdentitySeed: 'c8f9b75db29bf4d8'
    },
    location: {
      id: 'delhi_lajpat_street',
      label: 'Delhi Street — Lajpat Nagar',
      environmentPrompt: 'busy Delhi street in late afternoon, golden hour lighting, authentic shops and moving pedestrians in background',
      timeOfDay: 'late_afternoon',
      pedestrianDensity: 'busy_indian_street'
    },
    action: {
      type: 'walking_toward_camera',
      motionDescription: 'Meera walks toward a handheld smartphone camera on a busy Delhi street. Already moving when shot begins. Hair moves naturally in breeze. Clothing moves with walking motion. Background pedestrians move naturally. She briefly looks into camera, smiles, then looks toward something on the street.',
      isAlreadyMovingAtStart: true,
      hairBreezeResponse: true,
      clothingMotionResponse: true,
      lookAtCameraBeatSec: 3.5,
      lookAwayBeatSec: 5.8
    },
    emotion: {
      primary: 'warm',
      shiftTo: 'amused',
      shiftTimestampSec: 4.0
    },
    camera: {
      style: 'handheld_selfie_operator_walking_backward',
      framing: 'full_body',
      movementSpeed: 'dynamic_walking',
      shakeIntensity: 'subtle_organic'
    },
    audio: {
      hasVoice: false,
      hasLipSync: false
    },
    continuity: {
      episodeIndex: 1,
      recentLocationsCooldown: [],
      outfitId: 'street_style_denim',
      activeSupportingCharacters: []
    },
    targetDurationSec: 8,
    resolution: {
      width: 480,
      height: 854,
      aspectRatio: '9:16'
    }
  };
}

/**
 * Builds the performance prompt sent to the video diffusion model (Wan 2.1)
 */
export function buildWanPerformancePrompt(contract: UnifiedPerformanceContract): {
  prompt: string;
  negativePrompt: string;
  referencePath: string;
  durationSec: number;
} {
  const c = contract;
  const prompt = [
    `Photorealistic smartphone creator video of Meera, the young Indian woman from reference,`,
    `${c.action.type.replace(/_/g, ' ')}.`,
    `Location: ${c.location.environmentPrompt}.`,
    `She is already walking when the video begins with natural human gait and momentum.`,
    `Her hair reacts dynamically to the wind and movement. Her clothing moves naturally with her steps.`,
    `The camera operator walks backward naturally creating subtle organic handheld movement.`,
    `Background pedestrians and ambient environment move independently.`,
    `Authentic mobile lens perspective, natural skin texture, shallow depth of field, documentary realism.`
  ].join(' ');

  const negativePrompt = [
    'static image, 2D animation, cutout, slideshow, morphing, blurry face, distorted hands,',
    'deformed limbs, robotic motion, CGI render, cartoon, oversaturated, watermark, text, captions'
  ].join(' ');

  return {
    prompt,
    negativePrompt,
    referencePath: contract.character.referencePath,
    durationSec: contract.targetDurationSec
  };
}
