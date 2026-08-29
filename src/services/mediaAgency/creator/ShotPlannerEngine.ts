/**
 * CHATR VIRTUAL CREATOR — SHOT PLANNER
 *
 * Breaks a 30-second video into individual shots.
 * Every shot must contain actual motion or action.
 *
 * RULES:
 * - Minimum 4 shots per video
 * - No shot repeats the same background
 * - Every shot specifies what Meera is DOING (not just saying)
 * - No "static presenter" shots accepted
 */

import type { InfluencerActivityMode, LocationId, EmotionalState } from './ChatrInfluencerIdentity';
import type { SupportingCharacterId } from './SupportingCharacterRegistry';

export type CameraStyle =
  | 'selfie_handheld'          // natural handheld selfie — most common
  | 'medium_shot_fixed'        // slightly wider, stable
  | 'close_up_reaction'        // tight on face for expressions
  | 'over_shoulder'            // OTS looking at another character
  | 'walking_pov'              // moving camera from Meera's POV
  | 'wide_establishing'        // wide shot, Meera entering frame
  | 'low_angle_dramatic';      // upward angle for emphasis

export type MeeraAction =
  | 'walking_toward_camera'
  | 'talking_to_camera_selfie'
  | 'reacting_to_something'
  | 'talking_to_character'
  | 'laughing'
  | 'looking_surprised'
  | 'looking_skeptical'
  | 'pointing_at_something'
  | 'eating_or_drinking'
  | 'looking_at_phone'
  | 'entering_location'
  | 'turning_around'
  | 'dancing'
  | 'singing'
  | 'sitting_leaning_forward'
  | 'walking_away_then_turns';

export interface ShotSpec {
  shotNumber: number;
  durationSec: number;
  cameraStyle: CameraStyle;
  meeraAction: MeeraAction;
  backgroundVideoQuery: string;   // search query for Pixabay/license-free background
  backgroundType: string;          // human-readable description
  dialogue?: string;               // what Meera says in this shot
  emotionalBeat: EmotionalState;
  charactersPresent: SupportingCharacterId[];
  motionNotes: string;             // what motion must be present in this shot
  transitionOut: 'cut' | 'cross_dissolve' | 'fade' | 'match_cut';
}

export interface ShotPlan {
  videoId: string;
  totalDurationSec: number;
  mode: InfluencerActivityMode;
  location: LocationId;
  shots: ShotSpec[];
  validationErrors: string[];   // populated by validator
}

// ============================================================
// LOCATION → BACKGROUND VIDEO QUERY MAP
// ============================================================

const LOCATION_BG_QUERIES: Record<LocationId, string[]> = {
  lajpat_nagar_market: [
    'india market street crowded',
    'delhi market vendors',
    'indian bazaar walking',
    'colorful india market'
  ],
  saket_cafe: [
    'india cafe interior warm lighting',
    'coffee shop cozy india',
    'cafe people working india'
  ],
  delhi_metro: [
    'metro train india inside',
    'subway station india',
    'train commute india'
  ],
  connaught_place: [
    'connaught place delhi',
    'delhi city center walking',
    'india urban street shopping'
  ],
  noida_sector_18: [
    'india mall exterior',
    'shopping center india modern',
    'urban india commercial street'
  ],
  mumbai_bandra: [
    'mumbai bandra street',
    'india coastal city walking',
    'mumbai urban street'
  ],
  bangalore_brigade_road: [
    'bangalore india street',
    'india tech city urban',
    'south india modern street'
  ],
  home_room: [
    'india bedroom cozy',
    'india interior living room',
    'warm room interior india'
  ],
  office_corridor: [
    'india office interior',
    'corporate office india',
    'office hallway india'
  ],
  street_unknown: [
    'india street people walking',
    'indian city street',
    'india urban life'
  ]
};

export function getBackgroundQuery(location: LocationId, shotIndex: number): string {
  const queries = LOCATION_BG_QUERIES[location];
  return queries[shotIndex % queries.length];
}

// ============================================================
// SHOT PLAN TEMPLATES BY MODE
// ============================================================

export function buildShotPlan(
  videoId: string,
  mode: InfluencerActivityMode,
  location: LocationId,
  script: string,
  characters: SupportingCharacterId[]
): ShotPlan {
  const sentences = script
    .split(/[।.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  const shots: ShotSpec[] = [];

  if (mode === 'TALK' || mode === 'COMMENT_REPLY') {
    // Hook shot — immediate action
    shots.push({
      shotNumber: 1,
      durationSec: 3,
      cameraStyle: 'selfie_handheld',
      meeraAction: 'talking_to_camera_selfie',
      backgroundVideoQuery: getBackgroundQuery(location, 0),
      backgroundType: `${location} — ambient motion background`,
      dialogue: sentences[0] || '',
      emotionalBeat: 'excited',
      charactersPresent: [],
      motionNotes: 'Camera has slight natural movement. Background has people or environment moving.',
      transitionOut: 'cut'
    });
    // Build-up shot — reaction or gesture
    shots.push({
      shotNumber: 2,
      durationSec: 5,
      cameraStyle: 'close_up_reaction',
      meeraAction: 'reacting_to_something',
      backgroundVideoQuery: getBackgroundQuery(location, 1),
      backgroundType: `${location} — tighter frame`,
      dialogue: sentences[1] || '',
      emotionalBeat: 'amused',
      charactersPresent: [],
      motionNotes: 'Meera changes expression mid-shot. Eyes move, brows raise.',
      transitionOut: 'cut'
    });
    // Middle — walks or shifts
    shots.push({
      shotNumber: 3,
      durationSec: 6,
      cameraStyle: 'selfie_handheld',
      meeraAction: 'walking_toward_camera',
      backgroundVideoQuery: getBackgroundQuery(location, 2),
      backgroundType: `${location} — walking`,
      dialogue: sentences[2] || '',
      emotionalBeat: 'conspiratorial',
      charactersPresent: [],
      motionNotes: 'Meera walking toward camera while talking. Background scrolls. Natural shake.',
      transitionOut: 'cut'
    });
    // Payoff shot
    shots.push({
      shotNumber: 4,
      durationSec: 5,
      cameraStyle: 'medium_shot_fixed',
      meeraAction: 'looking_skeptical',
      backgroundVideoQuery: getBackgroundQuery(location, 3),
      backgroundType: `${location} — wider frame`,
      dialogue: sentences[3] || sentences[sentences.length - 1] || '',
      emotionalBeat: 'deadpan',
      charactersPresent: [],
      motionNotes: 'Meera holds eye contact with camera. One eyebrow up. Slight head tilt.',
      transitionOut: 'fade'
    });
  }

  else if (mode === 'REACTION' || mode === 'NEWS_REACTION') {
    shots.push({
      shotNumber: 1, durationSec: 2,
      cameraStyle: 'wide_establishing',
      meeraAction: 'entering_location',
      backgroundVideoQuery: getBackgroundQuery(location, 0),
      backgroundType: `${location} — establishing`,
      dialogue: '', emotionalBeat: 'surprised',
      charactersPresent: [],
      motionNotes: 'Meera walks INTO frame. Background clearly visible. Not a static shot.',
      transitionOut: 'cut'
    });
    shots.push({
      shotNumber: 2, durationSec: 4,
      cameraStyle: 'selfie_handheld',
      meeraAction: 'talking_to_camera_selfie',
      backgroundVideoQuery: getBackgroundQuery(location, 1),
      backgroundType: `${location} — setup`,
      dialogue: sentences[0] || '',
      emotionalBeat: 'amused', charactersPresent: [],
      motionNotes: 'Natural handheld. Meera shifts weight mid-shot.',
      transitionOut: 'cut'
    });
    shots.push({
      shotNumber: 3, durationSec: 4,
      cameraStyle: 'close_up_reaction',
      meeraAction: 'looking_surprised',
      backgroundVideoQuery: getBackgroundQuery(location, 2),
      backgroundType: `${location} — reaction`,
      dialogue: sentences[1] || '',
      emotionalBeat: 'surprised', charactersPresent: [],
      motionNotes: 'Big expression change. Eyes wide, hand to mouth or wave.',
      transitionOut: 'cut'
    });
    shots.push({
      shotNumber: 4, durationSec: 5,
      cameraStyle: 'selfie_handheld',
      meeraAction: 'talking_to_camera_selfie',
      backgroundVideoQuery: getBackgroundQuery(location, 3),
      backgroundType: `${location} — take`,
      dialogue: sentences[2] || '',
      emotionalBeat: 'deadpan', charactersPresent: [],
      motionNotes: 'Meera delivers opinion. Calm after the storm.',
      transitionOut: 'cut'
    });
    shots.push({
      shotNumber: 5, durationSec: 4,
      cameraStyle: 'close_up_reaction',
      meeraAction: 'laughing',
      backgroundVideoQuery: getBackgroundQuery(location, 4),
      backgroundType: `${location} — payoff`,
      dialogue: sentences[sentences.length - 1] || '',
      emotionalBeat: 'amused', charactersPresent: [],
      motionNotes: 'Meera laughs or shakes head. End beat.',
      transitionOut: 'fade'
    });
  }

  else if (mode === 'COMEDY' && characters.length > 0) {
    const char = characters[0];
    shots.push({ shotNumber: 1, durationSec: 3, cameraStyle: 'wide_establishing', meeraAction: 'entering_location', backgroundVideoQuery: getBackgroundQuery(location, 0), backgroundType: `${location}`, dialogue: '', emotionalBeat: 'warm', charactersPresent: [], motionNotes: 'Scene set. Both characters visible.', transitionOut: 'cut' });
    shots.push({ shotNumber: 2, durationSec: 5, cameraStyle: 'medium_shot_fixed', meeraAction: 'talking_to_character', backgroundVideoQuery: getBackgroundQuery(location, 1), backgroundType: `${location}`, dialogue: sentences[0] || '', emotionalBeat: 'amused', charactersPresent: [char], motionNotes: 'Meera talks to character. Natural hand movements.', transitionOut: 'cut' });
    shots.push({ shotNumber: 3, durationSec: 4, cameraStyle: 'close_up_reaction', meeraAction: 'reacting_to_something', backgroundVideoQuery: getBackgroundQuery(location, 2), backgroundType: `${location}`, dialogue: sentences[1] || '', emotionalBeat: 'surprised', charactersPresent: [char], motionNotes: 'Character says something. Meera reacts.', transitionOut: 'cut' });
    shots.push({ shotNumber: 4, durationSec: 5, cameraStyle: 'selfie_handheld', meeraAction: 'talking_to_camera_selfie', backgroundVideoQuery: getBackgroundQuery(location, 3), backgroundType: `${location}`, dialogue: sentences[2] || '', emotionalBeat: 'deadpan', charactersPresent: [], motionNotes: 'Meera turns to camera directly. Delivers punchline.', transitionOut: 'cut' });
    shots.push({ shotNumber: 5, durationSec: 4, cameraStyle: 'close_up_reaction', meeraAction: 'laughing', backgroundVideoQuery: getBackgroundQuery(location, 4), backgroundType: `${location}`, dialogue: '', emotionalBeat: 'amused', charactersPresent: [char], motionNotes: 'Both laugh or react. End naturally.', transitionOut: 'fade' });
  }

  else if (mode === 'SING') {
    // Singing — lip-synced performance
    shots.push({ shotNumber: 1, durationSec: 4, cameraStyle: 'medium_shot_fixed', meeraAction: 'singing', backgroundVideoQuery: getBackgroundQuery(location, 0), backgroundType: `${location} — performance`, dialogue: sentences[0] || '', emotionalBeat: 'warm', charactersPresent: [], motionNotes: 'Meera sings. Slight body sway. Not frozen.', transitionOut: 'cut' });
    shots.push({ shotNumber: 2, durationSec: 5, cameraStyle: 'close_up_reaction', meeraAction: 'singing', backgroundVideoQuery: getBackgroundQuery(location, 1), backgroundType: `${location} — close`, dialogue: sentences[1] || '', emotionalBeat: 'nostalgic', charactersPresent: [], motionNotes: 'Close on face during emotional line.', transitionOut: 'cross_dissolve' });
    shots.push({ shotNumber: 3, durationSec: 6, cameraStyle: 'selfie_handheld', meeraAction: 'singing', backgroundVideoQuery: getBackgroundQuery(location, 2), backgroundType: `${location} — wide`, dialogue: sentences[2] || '', emotionalBeat: 'excited', charactersPresent: [], motionNotes: 'Wider frame, she moves with the song.', transitionOut: 'cut' });
    shots.push({ shotNumber: 4, durationSec: 4, cameraStyle: 'close_up_reaction', meeraAction: 'laughing', backgroundVideoQuery: getBackgroundQuery(location, 3), backgroundType: `${location} — end`, dialogue: '', emotionalBeat: 'warm', charactersPresent: [], motionNotes: 'Last note. Meera smiles.', transitionOut: 'fade' });
  }

  else {
    // Default — STORYTIME / VLOG
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      shots.push({
        shotNumber: i + 1,
        durationSec: 5,
        cameraStyle: i === 0 ? 'selfie_handheld' : i % 2 === 0 ? 'close_up_reaction' : 'medium_shot_fixed',
        meeraAction: i === 0 ? 'walking_toward_camera' : i % 3 === 0 ? 'reacting_to_something' : 'talking_to_camera_selfie',
        backgroundVideoQuery: getBackgroundQuery(location, i),
        backgroundType: `${location} — shot ${i + 1}`,
        dialogue: sentences[i] || '',
        emotionalBeat: 'excited',
        charactersPresent: [],
        motionNotes: 'Character must be in motion or changing expression.',
        transitionOut: i === Math.min(4, sentences.length - 1) ? 'fade' : 'cut'
      });
    }
  }

  // Validate
  const errors: string[] = [];
  if (shots.length < 4) errors.push('FAIL: fewer than 4 shots — static presenter risk');

  const bgSet = new Set(shots.map(s => s.backgroundVideoQuery));
  if (bgSet.size < shots.length) errors.push('WARNING: background queries not fully unique');

  const staticShots = shots.filter(s =>
    s.meeraAction === 'talking_to_camera_selfie' &&
    shots.filter(x => x.meeraAction === 'talking_to_camera_selfie').length === shots.length
  );
  if (staticShots.length > 0 && shots.every(s => s.meeraAction === 'talking_to_camera_selfie')) {
    errors.push('FAIL: all shots are identical selfie — no variation');
  }

  return {
    videoId,
    totalDurationSec: shots.reduce((a, s) => a + s.durationSec, 0),
    mode,
    location,
    shots,
    validationErrors: errors
  };
}
