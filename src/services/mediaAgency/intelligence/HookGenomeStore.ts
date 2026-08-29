/**
 * CHATR Media Agency — Hook Genome Store
 * 
 * Persistent on-device memory of hook archetypes, psychological triggers,
 * and empirical retention win rates.
 */

export interface HookGenomeEntry {
  id: string;
  archetype: 'CONTRAST_SHOCK' | 'CURIOSITY_GAP' | 'COUNTER_INTUITIVE' | 'STORY_OPEN' | 'PATTERN_INTERRUPT' | 'DIRECT_CHALLENGE';
  templateFormula: string;
  niche: string;
  historicalSampleCount: number;
  averageRetention3s: number;
  averageFollowerConversionRate: number;
  averageRPM: number;
  lastUsedAt: string;
}

const GENOME_STORAGE_KEY = 'chatr_media_hook_genome';

const DEFAULT_GENOME: HookGenomeEntry[] = [
  {
    id: 'genome_01',
    archetype: 'COUNTER_INTUITIVE',
    templateFormula: 'Why 99% of people are wrong about [TOPIC] (and the 1% secret)',
    niche: 'business_tech',
    historicalSampleCount: 42,
    averageRetention3s: 0.88,
    averageFollowerConversionRate: 0.048,
    averageRPM: 2.80,
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: 'genome_02',
    archetype: 'CONTRAST_SHOCK',
    templateFormula: 'Stop doing [COMMON_HABIT] immediately. Here is the math why.',
    niche: 'productivity_ai',
    historicalSampleCount: 65,
    averageRetention3s: 0.91,
    averageFollowerConversionRate: 0.056,
    averageRPM: 3.10,
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: 'genome_03',
    archetype: 'CURIOSITY_GAP',
    templateFormula: 'I tested [TECH_TOOL] for 30 days so you do not have to...',
    niche: 'software_ai',
    historicalSampleCount: 38,
    averageRetention3s: 0.84,
    averageFollowerConversionRate: 0.042,
    averageRPM: 2.45,
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: 'genome_04',
    archetype: 'PATTERN_INTERRUPT',
    templateFormula: 'Do NOT scroll if you are trying to scale your [GOAL] in 2026.',
    niche: 'career_growth',
    historicalSampleCount: 51,
    averageRetention3s: 0.86,
    averageFollowerConversionRate: 0.039,
    averageRPM: 2.10,
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: 'genome_05',
    archetype: 'DIRECT_CHALLENGE',
    templateFormula: 'How much are you making from [SKILL]? If it is not $[TARGET], watch this.',
    niche: 'monetization',
    historicalSampleCount: 29,
    averageRetention3s: 0.93,
    averageFollowerConversionRate: 0.062,
    averageRPM: 3.50,
    lastUsedAt: new Date().toISOString(),
  }
];

class HookGenomeStoreService {
  private genome: Map<string, HookGenomeEntry> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(GENOME_STORAGE_KEY);
      if (stored) {
        const parsed: HookGenomeEntry[] = JSON.parse(stored);
        parsed.forEach(g => this.genome.set(g.id, g));
      } else {
        DEFAULT_GENOME.forEach(g => this.genome.set(g.id, g));
        this.persist();
      }
    } catch (e) {
      console.error('Failed to load Hook Genome Store', e);
      DEFAULT_GENOME.forEach(g => this.genome.set(g.id, g));
    }
  }

  private persist() {
    try {
      const list = Array.from(this.genome.values());
      localStorage.setItem(GENOME_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist Hook Genome Store', e);
    }
  }

  public getWinningPatterns(niche?: string): HookGenomeEntry[] {
    const list = Array.from(this.genome.values());
    const filtered = niche ? list.filter(g => g.niche === niche || g.niche === 'all') : list;
    return filtered.sort((a, b) => b.averageFollowerConversionRate - a.averageFollowerConversionRate);
  }

  public updatePatternTelemetry(
    genomeId: string, 
    retention3s: number, 
    followerConversion: number, 
    rpm: number
  ): void {
    const entry = this.genome.get(genomeId);
    if (!entry) return;

    const n = entry.historicalSampleCount;
    entry.averageRetention3s = (entry.averageRetention3s * n + retention3s) / (n + 1);
    entry.averageFollowerConversionRate = (entry.averageFollowerConversionRate * n + followerConversion) / (n + 1);
    entry.averageRPM = (entry.averageRPM * n + rpm) / (n + 1);
    entry.historicalSampleCount += 1;
    entry.lastUsedAt = new Date().toISOString();

    this.persist();
  }

  public registerNewGenome(entry: Omit<HookGenomeEntry, 'id' | 'historicalSampleCount' | 'lastUsedAt'>): HookGenomeEntry {
    const newEntry: HookGenomeEntry = {
      ...entry,
      id: `genome_${Date.now()}`,
      historicalSampleCount: 1,
      lastUsedAt: new Date().toISOString()
    };
    this.genome.set(newEntry.id, newEntry);
    this.persist();
    return newEntry;
  }
}

export const HookGenomeStore = new HookGenomeStoreService();
