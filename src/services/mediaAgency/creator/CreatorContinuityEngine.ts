/**
 * CHATR VIRTUAL CREATOR — CONTINUITY ENGINE
 *
 * Meera remembers. The audience follows her over time.
 * This engine maintains episode history, running jokes,
 * viewer comment loops, and location continuity.
 */

import type { InfluencerActivityMode, LocationId, SupportingCharacterId } from './ChatrInfluencerIdentity';

export interface AudienceComment {
  id: string;
  commenterHandle: string;
  text: string;
  platform: 'instagram' | 'youtube' | 'facebook' | 'simulated';
  receivedEpisode: number;
  responded: boolean;
  responseEpisode?: number;
  responseVideoId?: string;
}

export interface StoryEvent {
  episodeNumber: number;
  timestamp: string;
  type: 'location_visited' | 'topic_discussed' | 'character_appeared' | 'joke_established' | 'comment_received' | 'comment_responded';
  description: string;
  metadata?: Record<string, string>;
}

export interface RunningJoke {
  id: string;
  description: string;
  establishedEpisode: number;
  lastReferencedEpisode: number;
  referenceCount: number;
  audienceKnows: boolean; // true after 2+ references
}

export interface EpisodeRecord {
  episodeNumber: number;
  videoId: string;
  generatedAt: string;
  mode: InfluencerActivityMode;
  location: LocationId;
  outfit: string;
  emotionalState: string;
  trendTopic: string;
  charactersAppeared: SupportingCharacterId[];
  audienceCommentsSeedFor: AudienceComment[]; // comments this episode generates
  qualityGatePassed: boolean;
  humanApproved: boolean;
}

export interface ContinuityState {
  totalEpisodes: number;
  recentLocations: LocationId[];          // last 10
  recentTopics: string[];                 // last 10
  recentOutfits: string[];                // last 5 — avoid repeats
  audienceComments: AudienceComment[];
  runningJokes: RunningJoke[];
  characterHistory: StoryEvent[];
  episodeLog: EpisodeRecord[];
  relationshipState: Record<SupportingCharacterId, {
    lastAppeared: number;
    totalAppearances: number;
    currentArcStatus: string;
  }>;
  establishedFacts: string[];             // canon facts the audience knows
}

const CONTINUITY_FILE = 'public/chatr/continuity_state.json';

// ============================================================
// CONTINUITY RULES — Enforced on every episode
// ============================================================

const RULES = {
  // Don't repeat same location within this many episodes
  LOCATION_COOLDOWN_EPISODES: 3,

  // Don't repeat same outfit within this many episodes
  OUTFIT_COOLDOWN_EPISODES: 5,

  // A viewer comment must generate a response within this many episodes
  MAX_UNANSWERED_COMMENT_EPISODES: 2,

  // Running jokes must be referenced at least once every N episodes
  JOKE_REFERENCE_FREQUENCY: 5,

  // A supporting character shouldn't appear more than this ratio of episodes
  MAX_CHARACTER_APPEARANCE_RATIO: 0.6,

  // Minimum episodes before the same character appears again
  CHARACTER_COOLDOWN_EPISODES: 2
} as const;

// ============================================================
// ENGINE
// ============================================================

export class CreatorContinuityEngine {
  private state: ContinuityState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): ContinuityState {
    try {
      const fs = require('fs');
      if (fs.existsSync(CONTINUITY_FILE)) {
        return JSON.parse(fs.readFileSync(CONTINUITY_FILE, 'utf-8'));
      }
    } catch (_) { /* browser context — use defaults */ }

    return {
      totalEpisodes: 0,
      recentLocations: [],
      recentTopics: [],
      recentOutfits: [],
      audienceComments: [],
      runningJokes: [],
      characterHistory: [],
      episodeLog: [],
      relationshipState: {
        priya: { lastAppeared: -99, totalAppearances: 0, currentArcStatus: 'active' },
        arjun: { lastAppeared: -99, totalAppearances: 0, currentArcStatus: 'active' },
        dadi: { lastAppeared: -99, totalAppearances: 0, currentArcStatus: 'active' },
        raza: { lastAppeared: -99, totalAppearances: 0, currentArcStatus: 'active' },
        boss_lady: { lastAppeared: -99, totalAppearances: 0, currentArcStatus: 'active' }
      },
      establishedFacts: []
    };
  }

  saveState(): void {
    try {
      const fs = require('fs');
      require('fs').mkdirSync('public/chatr', { recursive: true });
      fs.writeFileSync(CONTINUITY_FILE, JSON.stringify(this.state, null, 2));
    } catch (_) { /* browser context */ }
  }

  getState(): ContinuityState {
    return this.state;
  }

  // ============================================================
  // LOCATION MANAGEMENT
  // ============================================================

  isLocationAvailable(location: LocationId): boolean {
    const recent = this.state.recentLocations.slice(-RULES.LOCATION_COOLDOWN_EPISODES);
    return !recent.includes(location);
  }

  getAvailableLocations(allLocations: LocationId[]): LocationId[] {
    return allLocations.filter(l => this.isLocationAvailable(l));
  }

  // ============================================================
  // CHARACTER MANAGEMENT
  // ============================================================

  isCharacterAvailable(charId: SupportingCharacterId): boolean {
    const rel = this.state.relationshipState[charId];
    const episodesSinceLast = this.state.totalEpisodes - rel.lastAppeared;
    return episodesSinceLast >= RULES.CHARACTER_COOLDOWN_EPISODES;
  }

  getAvailableCharacters(): SupportingCharacterId[] {
    const all: SupportingCharacterId[] = ['priya', 'arjun', 'dadi', 'raza', 'boss_lady'];
    return all.filter(c => this.isCharacterAvailable(c));
  }

  // ============================================================
  // COMMENT LOOP MANAGEMENT
  // ============================================================

  addAudienceComment(comment: Omit<AudienceComment, 'id' | 'receivedEpisode' | 'responded'>): string {
    const id = `comment_ep${this.state.totalEpisodes}_${Date.now()}`;
    this.state.audienceComments.push({
      ...comment,
      id,
      receivedEpisode: this.state.totalEpisodes,
      responded: false
    });
    this.saveState();
    return id;
  }

  getPendingComments(): AudienceComment[] {
    const currentEp = this.state.totalEpisodes;
    return this.state.audienceComments.filter(c =>
      !c.responded &&
      (currentEp - c.receivedEpisode) >= 1 // at least 1 episode gap before responding
    );
  }

  getOverdueComments(): AudienceComment[] {
    const currentEp = this.state.totalEpisodes;
    return this.state.audienceComments.filter(c =>
      !c.responded &&
      (currentEp - c.receivedEpisode) >= RULES.MAX_UNANSWERED_COMMENT_EPISODES
    );
  }

  markCommentResponded(commentId: string, responseEpisode: number, videoId: string): void {
    const comment = this.state.audienceComments.find(c => c.id === commentId);
    if (comment) {
      comment.responded = true;
      comment.responseEpisode = responseEpisode;
      comment.responseVideoId = videoId;
      this.saveState();
    }
  }

  // ============================================================
  // RUNNING JOKE MANAGEMENT
  // ============================================================

  addRunningJoke(description: string): string {
    const id = `joke_${Date.now()}`;
    this.state.runningJokes.push({
      id,
      description,
      establishedEpisode: this.state.totalEpisodes,
      lastReferencedEpisode: this.state.totalEpisodes,
      referenceCount: 1,
      audienceKnows: false
    });
    this.saveState();
    return id;
  }

  getJokesNeedingReference(): RunningJoke[] {
    const currentEp = this.state.totalEpisodes;
    return this.state.runningJokes.filter(j =>
      (currentEp - j.lastReferencedEpisode) >= RULES.JOKE_REFERENCE_FREQUENCY
    );
  }

  // ============================================================
  // EPISODE RECORDING
  // ============================================================

  recordEpisode(record: Omit<EpisodeRecord, 'episodeNumber'>): number {
    const episodeNumber = this.state.totalEpisodes + 1;
    const fullRecord: EpisodeRecord = { ...record, episodeNumber };

    this.state.totalEpisodes = episodeNumber;
    this.state.episodeLog.push(fullRecord);

    // Update location history
    this.state.recentLocations.push(record.location);
    if (this.state.recentLocations.length > 10) this.state.recentLocations.shift();

    // Update topic history
    this.state.recentTopics.push(record.trendTopic);
    if (this.state.recentTopics.length > 10) this.state.recentTopics.shift();

    // Update outfit history
    this.state.recentOutfits.push(record.outfit);
    if (this.state.recentOutfits.length > 5) this.state.recentOutfits.shift();

    // Update character appearances
    for (const charId of record.charactersAppeared) {
      const rel = this.state.relationshipState[charId];
      rel.lastAppeared = episodeNumber;
      rel.totalAppearances++;
    }

    this.saveState();
    return episodeNumber;
  }

  // ============================================================
  // CONTEXT GENERATION — passed to script engine
  // ============================================================

  buildScriptContext(): string {
    const s = this.state;
    const lines: string[] = [];

    if (s.totalEpisodes > 0) {
      lines.push(`This is Episode ${s.totalEpisodes + 1}.`);
    }

    if (s.recentLocations.length > 0) {
      lines.push(`Meera was recently at: ${s.recentLocations.slice(-3).join(', ')}.`);
    }

    if (s.recentTopics.length > 0) {
      lines.push(`Recent topics discussed: ${s.recentTopics.slice(-3).join(', ')}.`);
    }

    const overdueComments = this.getOverdueComments();
    if (overdueComments.length > 0) {
      const c = overdueComments[0];
      lines.push(`MUST RESPOND to viewer comment: "${c.text}" from ${c.commenterHandle}.`);
    }

    const stalJokes = this.getJokesNeedingReference();
    if (stalJokes.length > 0) {
      lines.push(`Consider referencing running joke: "${stalJokes[0].description}"`);
    }

    return lines.join('\n');
  }
}
