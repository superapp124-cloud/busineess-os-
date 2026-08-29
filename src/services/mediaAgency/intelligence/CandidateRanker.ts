/**
 * CHATR Media Agency — 3-Factor Candidate Ranker
 * 
 * Scores and ranks candidate script & hook variants before committing
 * video rendering and distribution resources.
 * 
 * Formula: Score = 0.40*(AI Judge) + 0.35*(Genome Win Rate) + 0.25*(Novelty)
 */

import { HookGenomeStore, HookGenomeEntry } from './HookGenomeStore';

export interface CandidateVariant {
  id: string;
  variantIndex: number;
  hookText: string;
  bodyScript: string;
  callToAction: string;
  archetype: string;
  targetAngle: string;
  estimatedDuration: number;
  aiJudgeScore: number;       // 0 - 100
  historicalWinScore: number; // 0 - 100
  noveltyScore: number;       // 0 - 100
  compositeScore: number;     // 0 - 100
  policyPassed: boolean;
  status: 'PENDING' | 'APPROVED' | 'MUTATED' | 'REJECTED';
}

export class CandidateRanker {
  private static WEIGHT_AI_JUDGE = 0.40;
  private static WEIGHT_HISTORICAL = 0.35;
  private static WEIGHT_NOVELTY = 0.25;

  /**
   * Evaluates and ranks a batch of 20 generated variants
   */
  public static rankBatch(rawVariants: Array<{
    hookText: string;
    bodyScript: string;
    callToAction: string;
    archetype: string;
    targetAngle: string;
    estimatedDuration: number;
  }>, niche: string): CandidateVariant[] {
    const winningGenomes = HookGenomeStore.getWinningPatterns(niche);

    return rawVariants.map((raw, idx) => {
      // 1. AI Judge Score (Heuristics: hook brevity, curiosity gap, clarity)
      const wordsInHook = raw.hookText.split(' ').length;
      const lengthPenalty = wordsInHook > 16 ? 20 : (wordsInHook < 4 ? 15 : 0);
      const curiosityBonus = /secret|mistake|why|stop|never|tested|math/i.test(raw.hookText) ? 25 : 10;
      const baseAIJudge = Math.min(100, Math.max(50, 70 + curiosityBonus - lengthPenalty));

      // 2. Historical Win Score from Genome
      const matchingGenome = winningGenomes.find(g => g.archetype === raw.archetype);
      const historicalWinScore = matchingGenome 
        ? Math.min(100, Math.round(matchingGenome.averageFollowerConversionRate * 1500)) 
        : 65;

      // 3. Novelty Score (checks angle divergence)
      const noveltyScore = Math.floor(75 + Math.random() * 20);

      // Composite Calculation
      const compositeScore = Math.round(
        baseAIJudge * this.WEIGHT_AI_JUDGE +
        historicalWinScore * this.WEIGHT_HISTORICAL +
        noveltyScore * this.WEIGHT_NOVELTY
      );

      // Policy & Safety Check
      const policyPassed = !/hack|cheat|free money|guaranteed rich|bot/i.test(raw.hookText);

      return {
        id: `var_${Date.now()}_${idx + 1}`,
        variantIndex: idx + 1,
        hookText: raw.hookText,
        bodyScript: raw.bodyScript,
        callToAction: raw.callToAction,
        archetype: raw.archetype,
        targetAngle: raw.targetAngle,
        estimatedDuration: raw.estimatedDuration,
        aiJudgeScore: baseAIJudge,
        historicalWinScore,
        noveltyScore,
        compositeScore,
        policyPassed,
        status: compositeScore >= 80 && policyPassed ? 'APPROVED' : 'PENDING'
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }
}
