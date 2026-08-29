/**
 * CHATR Media Agency — Comprehensive SEO & Content Package Engine
 * 
 * Generates search-optimized metadata, intent mapping, entity graphs, 
 * Schema.org markup, and multi-format adaptations (9:16 Video + 4:5 Carousels)
 * so every single concept becomes an enduring digital search asset.
 */

export type SearchIntentType = 'INFORMATIONAL' | 'COMMERCIAL_INVESTIGATION' | 'TRANSACTIONAL' | 'NAVIGATIONAL';

export interface CarouselSlide {
  slideNumber: number;
  slideType: 'HOOK_COVER' | 'PROBLEM_STATEMENT' | 'CORE_FRAMEWORK' | 'TACTICAL_STEPS' | 'CTA_OUTRO';
  headline: string;
  subtext: string;
  visualLayout: string;
  bulletPoints?: string[];
}

export interface RichSEOPackage {
  contentId: string;
  primaryTopic: string;
  searchIntent: SearchIntentType;
  primaryKeyword: string;
  secondaryKeywords: string[];
  entityTopic: string;
  hook: string;
  title: string;
  description: string;
  caption: string;
  transcript: string;
  hashtags: string[];
  slug: string;
  schemaMarkup: Record<string, any>; // Schema.org JSON-LD (VideoObject / Article)
  relatedChatrPage: string;
  internalLinkTargets: string[];
  platformVariants: {
    youtubeShorts: { title: string; description: string; tags: string[] };
    instagramReel: { caption: string; hashtags: string[] };
    facebookWatch: { headline: string; description: string };
    webArticleSnippet: { metaTitle: string; metaDescription: string; canonicalSlug: string };
  };
  carouselPost?: {
    totalSlides: number;
    slides: CarouselSlide[];
    carouselCaption: string;
  };
  dryRunValidated: boolean;
  createdAt: string;
}

export class SEOContentEngine {
  /**
   * Generates rich SEO package with parameter compatibility for DryRun engines
   */
  public static generateRichSEOPackage(
    contentId: string,
    topic: string,
    bodyScript: string,
    keywords: string[] = []
  ): RichSEOPackage {
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const primaryKeyword = keywords[0] || topic.split(' ').slice(0, 4).join(' ').toLowerCase();
    const secondaryKeywords = keywords.length > 1 ? keywords.slice(1) : [
      `${primaryKeyword} breakdown`,
      `${primaryKeyword} today`,
      `trending ${primaryKeyword}`
    ];

    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${topic} | CHATR Media`,
      description: bodyScript.substring(0, 160),
      thumbnailUrl: `https://chatrchat.in/thumbnails/${contentId}.jpg`,
      uploadDate: new Date().toISOString(),
      duration: 'PT0M30S',
      contentUrl: `https://chatrchat.in/content/${slug}.mp4`,
      embedUrl: `https://chatrchat.in/embed/${contentId}`
    };

    return {
      contentId,
      primaryTopic: topic,
      searchIntent: 'INFORMATIONAL',
      primaryKeyword,
      secondaryKeywords,
      entityTopic: topic,
      hook: topic,
      title: `${topic} | CHATR Media`,
      description: `${bodyScript.substring(0, 155)}...`,
      caption: `${bodyScript}\n\n#viral #culture #india #chatr`,
      transcript: bodyScript,
      hashtags: ['#viral', '#trending', '#reels', '#india', '#culture'],
      slug,
      schemaMarkup,
      relatedChatrPage: 'https://chatrchat.in/media-distribution',
      internalLinkTargets: [
        'https://chatrchat.in/culture/radar',
        'https://chatrchat.in/media/trending'
      ],
      platformVariants: {
        youtubeShorts: {
          title: topic.substring(0, 70),
          description: `${bodyScript}\n\n#Shorts #Viral #India`,
          tags: [primaryKeyword, 'viral', 'reels', 'shorts']
        },
        instagramReel: {
          caption: `${bodyScript}\n\nShare this with a friend 🚀\n\n#viral #reels #trending`,
          hashtags: ['#viral', '#reels', '#trending']
        },
        facebookWatch: {
          headline: topic,
          description: bodyScript
        },
        webArticleSnippet: {
          metaTitle: `${topic} - Full Story`,
          metaDescription: bodyScript.substring(0, 155),
          canonicalSlug: slug
        }
      },
      dryRunValidated: true,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Constructs a comprehensive SEO package from a validated topic and variant
   */
  public static buildSEOPackage(
    topic: string,
    hook: string,
    bodyScript: string,
    cta: string,
    targetNiche: string = 'consumer_culture'
  ): RichSEOPackage {
    const contentId = `seo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Derive Slug & Keywords
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const primaryKeyword = topic.split(' ').slice(0, 4).join(' ').toLowerCase();
    const secondaryKeywords = [
      `${primaryKeyword} story`,
      `${primaryKeyword} explained`,
      `why is ${primaryKeyword} viral`
    ];

    // Build Schema.org VideoObject JSON-LD
    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${hook} | CHATR Media`,
      description: bodyScript.substring(0, 160),
      thumbnailUrl: `https://chatrchat.in/thumbnails/${contentId}.jpg`,
      uploadDate: new Date().toISOString(),
      duration: 'PT0M30S',
      contentUrl: `https://chatrchat.in/content/${slug}.mp4`,
      embedUrl: `https://chatrchat.in/embed/${contentId}`,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionService: { '@type': 'WebSite', name: 'CHATR Media' },
        interactionType: 'https://schema.org/WatchAction'
      }
    };

    // Build 5-Slide Carousel Breakdown
    const carouselSlides: CarouselSlide[] = [
      {
        slideNumber: 1,
        slideType: 'HOOK_COVER',
        headline: hook,
        subtext: 'Swipe for the full cultural breakdown →',
        visualLayout: 'Bold dark-mode gradient with high-contrast kinetic headline'
      },
      {
        slideNumber: 2,
        slideType: 'PROBLEM_STATEMENT',
        headline: 'Why Everyone Is Talking About It',
        subtext: 'The sudden surge in attention explained.',
        visualLayout: 'Split diagnostic box highlighting core moment'
      },
      {
        slideNumber: 3,
        slideType: 'CORE_FRAMEWORK',
        headline: 'The Viral Breakdown',
        subtext: 'How this story took over feeds in under 48 hours.',
        visualLayout: 'Clean 3-node flowchart diagram',
        bulletPoints: [
          'Signal 1: Organic creator audio remakes',
          'Signal 2: Cross-platform reposting to X and Reddit',
          'Signal 3: Mainstream algorithmic discovery spike'
        ]
      },
      {
        slideNumber: 4,
        slideType: 'TACTICAL_STEPS',
        headline: 'Key Takeaways',
        subtext: 'What this reveals about Indian internet culture.',
        visualLayout: 'Checklist layout with green and blue contrast accents',
        bulletPoints: [
          'High retention loop engineering',
          'Relatable everyday humor beats production budget',
          'Share-velocity drives algorithmic distribution'
        ]
      },
      {
        slideNumber: 5,
        slideType: 'CTA_OUTRO',
        headline: 'Follow & Share',
        subtext: cta || 'Drop a comment if you saw this on your feed today.',
        visualLayout: 'Save & Share icon emphasis with CHATR Media badge'
      }
    ];

    return {
      contentId,
      primaryTopic: topic,
      searchIntent: 'INFORMATIONAL',
      primaryKeyword,
      secondaryKeywords,
      entityTopic: targetNiche,
      hook,
      title: `${hook} | CHATR Media`,
      description: `${bodyScript} Learn the cultural breakdown.`,
      caption: `${hook}\n\n${bodyScript}\n\n👉 ${cta}\n\n#${primaryKeyword.replace(/\s+/g, '')} #viral #india #chatr`,
      transcript: `${hook}. ${bodyScript}. ${cta}.`,
      hashtags: ['#viral', '#trending', '#reels', '#india', '#culture'],
      slug,
      schemaMarkup,
      relatedChatrPage: 'https://chatrchat.in/media-distribution',
      internalLinkTargets: [
        'https://chatrchat.in/culture/radar',
        'https://chatrchat.in/media/trending'
      ],
      platformVariants: {
        youtubeShorts: {
          title: hook.substring(0, 70),
          description: `${bodyScript}\n\n#Shorts #Viral #India`,
          tags: [primaryKeyword, 'viral', 'reels', 'shorts']
        },
        instagramReel: {
          caption: `${hook}\n\n${bodyScript}\n\nShare this with a friend 📌\n\n#viral #reels #trending`,
          hashtags: ['#viral', '#reels', '#trending']
        },
        facebookWatch: {
          headline: hook,
          description: `${bodyScript}\n\nFollow CHATR Media for daily cultural radar stories.`
        },
        webArticleSnippet: {
          metaTitle: `${topic}: Full Cultural Breakdown`,
          metaDescription: bodyScript.substring(0, 155),
          canonicalSlug: slug
        }
      },
      carouselPost: {
        totalSlides: carouselSlides.length,
        slides: carouselSlides,
        carouselCaption: `SWIPE ➡️ ${hook}\n\nFull cultural breakdown above.\n\n#viral #trending #india`
      },
      dryRunValidated: true,
      createdAt: new Date().toISOString()
    };
  }
}
