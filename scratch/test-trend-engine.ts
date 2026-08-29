import { TrendIntelligenceEngine } from '../src/services/mediaAgency/intelligence/TrendIntelligenceEngine';
import { ProductionBufferEngine } from '../src/services/mediaAgency/production/ProductionBufferEngine';

async function main() {
  console.log('Testing ₹0 Multi-Signal Trend Intelligence Engine...');
  const trends = await TrendIntelligenceEngine.scanTrends();
  console.log(`Discovered & Scored ${trends.length} Trending Opportunities:`);
  trends.forEach((t, i) => {
    console.log(`${i + 1}. [Score: ${t.trendScore}/100] ${t.topic} (${t.category})`);
    console.log(`   Formula Breakdown: Velocity=${t.metrics.velocityScore}, Search=${t.metrics.searchInterestScore}, Engagement=${t.metrics.engagementVelocity}, Novelty=${t.metrics.noveltyScore}, Fit=${t.metrics.audienceFitScore}`);
  });

  console.log('\nTesting Production Buffer & Cadence Engine:');
  const buffer = ProductionBufferEngine.evaluateBuffer();
  console.log(`Buffer Health: ${buffer.readyCount} Ready, ${buffer.renderingCount} Rendering, ${buffer.scheduledCount} Scheduled`);
  console.log(`Autonomous Cadence: ${buffer.currentCadenceMinutes} minutes (${buffer.cadenceReason})`);
  console.log(`YouTube 2026 Dedicated Daily Uploads: ${buffer.quotaStatus.youtubeDailyUploadsUsed}/${buffer.quotaStatus.youtubeDailyUploadsMax}`);
}

main().catch(console.error);
