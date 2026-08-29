import { DryRun001Engine } from '../src/services/mediaAgency/production/DryRun001Engine';

async function main() {
  console.log('Testing DRY RUN #001 (AI / Work / India)...');
  const summary = await DryRun001Engine.executeDryRun();

  console.log('\n--- DRY RUN #001 ACCEPTANCE MATRIX ---');
  console.log(`Trends Discovered:    ${summary.trendsDiscovered}`);
  console.log(`Concepts Generated:   ${summary.conceptsGenerated}`);
  console.log(`Videos Generated:     ${summary.videosGenerated}`);
  console.log(`Posts Generated:      ${summary.postsGenerated}`);
  console.log(`SEO Packages:         ${summary.seoPackages}`);
  console.log(`Quality Passed:       ${summary.qualityPassed}`);
  console.log(`Selected:             ${summary.selected}`);
  console.log(`Accounts Connected:   ${summary.accountsConnected}`);
  console.log(`Publishing:           ${summary.publishingStatus}`);

  console.log('\n--- TOP 5 SELECTED REELS ---');
  summary.selectedItems.forEach((item, idx) => {
    console.log(`\nReel 0${idx + 1} [${item.category}] Score: ${item.qualityScore.compositeScore}/100`);
    console.log(`Hook:  "${item.hook}"`);
    console.log(`Script: "${item.script}"`);
    console.log(`SEO Title: ${item.seoTitle}`);
    console.log(`Keywords: ${item.keywords.join(', ')}`);
    console.log(`CTA:   "${item.cta}"`);
    console.log(`Signal: ${item.signalAttribution.trendSource} (Velocity: ${item.signalAttribution.trendVelocity}, Search: ${item.signalAttribution.searchOpportunity}, Fit: ${item.signalAttribution.audienceFit}, Content Opp: ${item.signalAttribution.contentOpportunity})`);
    console.log(`Quality Gate: Hook=${item.qualityScore.hookStrength}, Relevance=${item.qualityScore.searchRelevance}, Info=${item.qualityScore.informationValue}, Retention=${item.qualityScore.retentionPotential}, Brand=${item.qualityScore.brandSafety}, SEO=${item.qualityScore.seoCompleteness}`);
  });

  console.log('\n--- STATIC / CAROUSEL POSTS ---');
  summary.items.filter(i => i.carouselData).forEach(item => {
    console.log(`Post: ${item.carouselData?.headline} (${item.carouselData?.type})`);
  });
}

main().catch(console.error);
