/**
 * CHATR Media Agency — DRY RUN #003: Mass-Audience Consumer Editorial Radar
 * 
 * Replaces corporate SaaS topics with mass-attention cultural topics:
 * Music, Movies/OTT, Humour, Internet Memes, Sports/Cricket, Gadgets, Scams, and India Culture.
 */

export interface ConsumerTrendPackage {
  id: string;
  category: '🎵 Viral Music' | '😂 Internet Humour' | '🏏 Cricket / Sports' | '🎬 Movies / OTT' | '📱 Phone Hacks' | '💰 Scam Buster' | '🇮🇳 India Culture' | '🤯 Weird / Viral';
  topic: string;
  hook: string;
  humanScript: string;
  cta: string;
  trendVelocityScore: number;
  lifecycleState: 'EMERGING' | 'ACCELERATING' | 'PEAK' | 'SATURATED' | 'DECLINING';
  saturationPenaltyPercent: number;
  opportunityScore: number; // 0 - 100
  assignedHostId: string;
  seoTarget: {
    searchIntent: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    seoTitle: string;
  };
  humanWritingAudit: {
    bannedAiClichesFound: number;
    conversationalScore: number; // >= 90
    antiCorporateScore: number;
  };
}

export class DryRun003RadarEngine {
  private static PACKAGES: ConsumerTrendPackage[] = [
    {
      id: 'trend_music_01',
      category: '🎵 Viral Music',
      topic: 'Why is everyone suddenly obsessed with this new track?',
      hook: "Okay, I wasn't expecting this song to blow up this fast.",
      humanScript: "It started as a 15-second background audio on Reels three days ago. Now every creator in Mumbai and Bangalore is using the exact same drop. But here is the crazy part: the artist didn't spend a single rupee on promotion. The acoustic bridge was engineered specifically to loop seamlessly on vertical video.",
      cta: "Drop your favorite line in the comments if this is stuck in your head.",
      trendVelocityScore: 98,
      lifecycleState: 'ACCELERATING',
      saturationPenaltyPercent: 4,
      opportunityScore: 97,
      assignedHostId: 'ishita_rao',
      seoTarget: {
        searchIntent: 'Entertainment & Cultural Discovery',
        primaryKeyword: 'viral instagram reel songs 2026',
        secondaryKeywords: ['trending reel audio today', 'new viral song lyrics', 'why this song is trending'],
        seoTitle: 'Why This 15-Second Audio Track Is Dominating Indian Reels'
      },
      humanWritingAudit: {
        bannedAiClichesFound: 0,
        conversationalScore: 96,
        antiCorporateScore: 98
      }
    },
    {
      id: 'trend_humour_02',
      category: '😂 Internet Humour',
      topic: 'India\'s internet has found its new favorite obsession.',
      hook: "I genuinely can't decide if this new trend is genius or completely unhinged.",
      humanScript: "If you have opened your feed today, you have seen this exact clip at least four times. Someone took an innocent family wedding video and remixed it with aggressive trap music. The pacing is so absurd that people are watching it on loop just to see the uncle in the background.",
      cta: "Tag the friend who definitely dances like this at weddings.",
      trendVelocityScore: 95,
      lifecycleState: 'EMERGING',
      saturationPenaltyPercent: 2,
      opportunityScore: 95,
      assignedHostId: 'meera_kapoor',
      seoTarget: {
        searchIntent: 'Viral Comedy & Memes',
        primaryKeyword: 'viral indian wedding meme trend',
        secondaryKeywords: ['funniest reels india today', 'trending meme templates', 'wedding dance meme'],
        seoTitle: 'The Absurd Wedding Video Taking Over Indian Feeds This Week'
      },
      humanWritingAudit: {
        bannedAiClichesFound: 0,
        conversationalScore: 98,
        antiCorporateScore: 100
      }
    },
    {
      id: 'trend_cricket_03',
      category: '🏏 Cricket / Sports',
      topic: 'What just happened in the final over controversy?',
      hook: "Wait. Did the third umpire actually just make this call?",
      humanScript: "The entire stadium went completely silent during that review. From the front angle, it looked like a clear edge. But when the UltraEdge graph showed zero spike, the decision turned the match upside down. Former captains are already arguing about it on live TV.",
      cta: "Was that out or not out? Tell me in the comments below.",
      trendVelocityScore: 96,
      lifecycleState: 'PEAK',
      saturationPenaltyPercent: 8,
      opportunityScore: 94,
      assignedHostId: 'rohan_varma',
      seoTarget: {
        searchIntent: 'Sports News & Debate',
        primaryKeyword: 'cricket match final over controversy',
        secondaryKeywords: ['third umpire decision explained', 'drs ultraedge review debate', 'cricket news today'],
        seoTitle: 'The Controversial Final Over DRS Decision Everyone Is Arguing About'
      },
      humanWritingAudit: {
        bannedAiClichesFound: 0,
        conversationalScore: 95,
        antiCorporateScore: 97
      }
    },
    {
      id: 'trend_movies_04',
      category: '🎬 Movies / OTT',
      topic: 'The hidden detail nobody noticed in this new trailer.',
      hook: "Almost everyone missed this split-second easter egg in the teaser.",
      humanScript: "At exactly the 42-second mark, when the camera cuts to the dark corridor, look at the shadow behind the door. That is not the villain everyone is talking about. If you look at the ring on the left hand, that is a direct callback to the 2018 prequel.",
      cta: "Save this Reel and go re-watch the trailer to verify for yourself.",
      trendVelocityScore: 92,
      lifecycleState: 'ACCELERATING',
      saturationPenaltyPercent: 3,
      opportunityScore: 92,
      assignedHostId: 'zoya_khan',
      seoTarget: {
        searchIntent: 'Cinema & OTT Film Analysis',
        primaryKeyword: 'new blockbuster movie teaser breakdown',
        secondaryKeywords: ['hidden easter eggs in trailer', 'ott release date confirmed', 'fan theory explained'],
        seoTitle: 'The Split-Second Hidden Detail in the New Blockbuster Teaser'
      },
      humanWritingAudit: {
        bannedAiClichesFound: 0,
        conversationalScore: 94,
        antiCorporateScore: 96
      }
    },
    {
      id: 'trend_scam_05',
      category: '💰 Scam Buster',
      topic: 'The sneaky pricing trick food delivery apps don\'t want you to calculate.',
      hook: "You think you got a 60% discount. You actually paid more.",
      humanScript: "Here is how the math actually works. A dish that costs 200 rupees at the restaurant is listed at 380 online. Then they give you a 150 rupee coupon, add packaging charges, surge fees, and platform handling fees. Your final bill? 260 rupees for a 200 rupee meal.",
      cta: "Check your last food order receipt and calculate the real difference.",
      trendVelocityScore: 94,
      lifecycleState: 'ACCELERATING',
      saturationPenaltyPercent: 2,
      opportunityScore: 93,
      assignedHostId: 'arjun_mehta',
      seoTarget: {
        searchIntent: 'Consumer Finance & Savings',
        primaryKeyword: 'food delivery pricing tricks explained',
        secondaryKeywords: ['how discount coupons actually work', 'hidden platform fees', 'save money online food'],
        seoTitle: 'How Online Food Delivery Discount Math Actually Tricks You'
      },
      humanWritingAudit: {
        bannedAiClichesFound: 0,
        conversationalScore: 97,
        antiCorporateScore: 99
      }
    }
  ];

  public static getAllPackages(): ConsumerTrendPackage[] {
    return this.PACKAGES;
  }

  public static getPackageById(id: string): ConsumerTrendPackage {
    return this.PACKAGES.find(p => p.id === id) || this.PACKAGES[0];
  }
}
