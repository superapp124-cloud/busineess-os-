import { SEOContentEngine } from '../src/services/mediaAgency/intelligence/SEOContentEngine';
import { AudienceAcquisitionAgent } from '../src/services/mediaAgency/intelligence/AudienceAcquisitionAgent';
import { RealContentEngine } from '../src/services/mediaAgency/production/RealContentEngine';

async function main() {
  console.log('Testing Dry-Run SEO & Carousel Engine...');
  const topic = 'Why autonomous agent networks are replacing rigid SaaS workflows in 2026';
  const hook = 'Still managing ops with 10 different SaaS tools in 2026?';
  const body = 'Here is the operational breakdown of autonomous agent networks. By removing manual interface handoffs, throughput scales 10x while maintaining zero-token local costs.';
  const cta = 'Save this post and share with your engineering team.';

  const seoPackage = SEOContentEngine.buildSEOPackage(topic, hook, body, cta, 'business_ai_scaling');
  
  console.log('\n--- Rich SEO Package ---');
  console.log('Content ID:', seoPackage.contentId);
  console.log('Search Intent:', seoPackage.searchIntent);
  console.log('Primary Keyword:', seoPackage.primaryKeyword);
  console.log('Secondary Keywords:', seoPackage.secondaryKeywords);
  console.log('URL Slug:', seoPackage.slug);
  console.log('Schema Type:', seoPackage.schemaMarkup['@type']);

  console.log('\n--- 5-Slide Carousel Breakdown ---');
  seoPackage.carouselPost?.slides.forEach(slide => {
    console.log(`Slide ${slide.slideNumber} [${slide.slideType}]: ${slide.headline}`);
    console.log(`   ${slide.subtext}`);
    if (slide.bulletPoints) console.log(`   Bullets:`, slide.bulletPoints);
  });

  console.log('\n--- Audience Acquisition Agent ---');
  const initialMetrics = AudienceAcquisitionAgent.getAcquisitionReport();
  console.log('Initial Acquisition Baseline:', initialMetrics);

  console.log('\nTesting Simulated Organic Attribution (0 Bots / 100% Genuine):');
  const updatedMetrics = AudienceAcquisitionAgent.recordPostAcquisition(
    'youtube',
    topic,
    hook,
    cta,
    { views: 4200, profileVisits: 310, followersGained: 145, subscribersGained: 92 }
  );
  console.log('Updated Acquisition Yield:');
  console.log(`Views: ${updatedMetrics.views}`);
  console.log(`Profile Visits: ${updatedMetrics.profileVisits}`);
  console.log(`Followers Gained: +${updatedMetrics.followersGained}`);
  console.log(`Subscribers Gained: +${updatedMetrics.subscribersGained}`);
  console.log(`Follow Conversion Rate: ${updatedMetrics.followConversionRate}%`);
  console.log(`Qualified Yield / 1k Views: ${updatedMetrics.qualifiedYieldPer1kViews}`);
}

main().catch(console.error);
