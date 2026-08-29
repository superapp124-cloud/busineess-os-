import { RealContentEngine } from '../src/services/mediaAgency/production/RealContentEngine';

async function main() {
  console.log('Testing Real Content Engine...');
  const result = await RealContentEngine.generate20Variants(
    'How AI Agent Networks automate business ops in 2026',
    'Tech Founders & Operations Leaders',
    'business_ai_scaling'
  );

  console.log(`Generated ${result.variants.length} variants via ${result.sourceProvider} in ${result.executionTimeMs}ms`);
  console.log('Top Variant:');
  console.log('Hook:', result.variants[0]?.hook);
  console.log('Archetype:', result.variants[0]?.archetype);
  console.log('Score:', result.variants[0]?.aiJudgeScore);
  console.log('YouTube Title:', result.variants[0]?.platformAdaptation.youtubeShortsTitle);
}

main().catch(console.error);
