/**
 * CHATR Media Agency — Permanent Actor Talent Pool
 * 
 * Defines the 10 permanent, photorealistic fictional actors in the CHATR talent library.
 * Actors are visual/vocal talent who can be cast into hundreds of different fictional
 * personas/characters across viral reels (e.g. Actor 02 can play a sarcastic cricket fan,
 * an analytical film reviewer, or a confused college student).
 */

export interface ActorProfile {
  actorId: string;
  stageName: string;
  demographic: string;
  ageAppearance: string;
  genderPresentation: 'Female' | 'Male';
  referencePortraitUrl: string;
  vocalCapabilities: {
    baseVoiceId: string;
    vocalRange: string;
    accents: string[];
    supportedTones: string[];
  };
  physicalTraits: {
    hairStyle: string;
    facialFeatures: string;
    build: string;
  };
  allowedWardrobes: string[];
  allowedTransformations: string[];
  fatigueState: {
    lastUsedAgo: string;
    usesToday: number;
    recentRoles: string[];
  };
  provenance: string;
  rightsClearance: 'CC0_Royalty_Free_Commercial';
  marginalCost: '₹0.00';
  identityConsistencyScore: number;
}

export class ChatrActorRegistry {
  private static ACTORS: Record<string, ActorProfile> = {
    'ACTOR_001': {
      actorId: 'ACTOR_001',
      stageName: 'Talent 01 (Priya Profile)',
      demographic: 'Indian Female • Contemporary Urban',
      ageAppearance: '26–30',
      genderPresentation: 'Female',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_01',
        vocalRange: 'Alto / Clear Urban',
        accents: ['Urban Indian English', 'Hinglish Casual', 'Executive Pan-India'],
        supportedTones: ['Analytical', 'Conversational', 'Engaging', 'Direct']
      },
      physicalTraits: {
        hairStyle: 'Shoulder-length sleek dark hair',
        facialFeatures: 'Expressive eyes, sharp confident smile',
        build: 'Slim Athletic'
      },
      allowedWardrobes: ['Modern Blazer', 'Minimalist Crewneck', 'Casual Denim Over-shirt', 'Smart Linen Collar'],
      allowedTransformations: ['Office Studio', 'Coffee Shop', 'Urban Street', 'Co-working Space'],
      fatigueState: {
        lastUsedAgo: '3 hours ago',
        usesToday: 2,
        recentRoles: ['Productivity Consultant', 'Fintech Reviewer']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 98
    },

    'ACTOR_002': {
      actorId: 'ACTOR_002',
      stageName: 'Talent 02 (Rohan Profile)',
      demographic: 'Indian Male • Candid Charismatic',
      ageAppearance: '30–35',
      genderPresentation: 'Male',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_02',
        vocalRange: 'Baritone / Crisp',
        accents: ['Indian English (Tech Founder)', 'Hinglish Sarcastic', 'Delhi/Mumbai Casual'],
        supportedTones: ['Sarcastic', 'Pragmatic', 'High Debate Energy', 'Thoughtful']
      },
      physicalTraits: {
        hairStyle: 'Textured short black hair with neat beard',
        facialFeatures: 'Candid expressive smirk, strong jawline',
        build: 'Medium Build'
      },
      allowedWardrobes: ['Charcoal Crewneck', 'Denim Jacket', 'Sports Jersey', 'Casual Hoodie'],
      allowedTransformations: ['Sports Lounge', 'Startup Office', 'Podcast Studio', 'Street View'],
      fatigueState: {
        lastUsedAgo: '1 hour ago',
        usesToday: 1,
        recentRoles: ['Cricket Fan / Analyst', 'Startup Founder']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 97
    },

    'ACTOR_003': {
      actorId: 'ACTOR_003',
      stageName: 'Talent 03 (Ananya Profile)',
      demographic: 'Indian Female • Articulate Specialist',
      ageAppearance: '32–38',
      genderPresentation: 'Female',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_03',
        vocalRange: 'Warm Mezzo / Reassuring',
        accents: ['Articulate Indian English', 'Bangalore/Chennai Urban', 'Contemporary Hinglish'],
        supportedTones: ['Empathetic', 'Insightful', 'Witty', 'Relatable']
      },
      physicalTraits: {
        hairStyle: 'Elegant wavy dark hair',
        facialFeatures: 'Warm engaging eye contact, knowing smile',
        build: 'Classic Smart'
      },
      allowedWardrobes: ['Olive Linen Blazer', 'Cotton Kurti Smart', 'Casual Overcoat'],
      allowedTransformations: ['Modern Workplace', 'Daylight Window Studio', 'Library / Study'],
      fatigueState: {
        lastUsedAgo: '6 hours ago',
        usesToday: 0,
        recentRoles: ['HR Manager', 'Career Coach']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 96
    },

    'ACTOR_004': {
      actorId: 'ACTOR_004',
      stageName: 'Talent 04 (Vikram Profile)',
      demographic: 'Indian Male • Hacker / Developer',
      ageAppearance: '25–30',
      genderPresentation: 'Male',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_04',
        vocalRange: 'Tenor / Fast-Paced',
        accents: ['Urban Tech Indian English', 'Rapid-Fire Hinglish', 'Geek Enthusiast'],
        supportedTones: ['Curious', 'Energetic', 'Hacker Speed', 'Unfiltered']
      },
      physicalTraits: {
        hairStyle: 'Fade cut with textured top',
        facialFeatures: 'Sharp focused gaze, animated facial gestures',
        build: 'Lean Builder'
      },
      allowedWardrobes: ['Black Tech Hoodie', 'Developer Graphic Tee', 'Flannel Shirt'],
      allowedTransformations: ['Terminal Desk POV', 'Hostel Room', 'Electronics Workbench'],
      fatigueState: {
        lastUsedAgo: '4 hours ago',
        usesToday: 1,
        recentRoles: ['Open Source Hacker', 'Gamer / Streamer']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 99
    },

    'ACTOR_005': {
      actorId: 'ACTOR_005',
      stageName: 'Talent 05 (Ishita Profile)',
      demographic: 'Indian Female • Entertainment & Broadcast',
      ageAppearance: '26–32',
      genderPresentation: 'Female',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_05',
        vocalRange: 'Bright Soprano / Broadcast',
        accents: ['Broadcast Indian English', 'Vibrant Mumbai Pop', 'National Contemporary'],
        supportedTones: ['High Hook Energy', 'Entertaining', 'Pop Culture Vibrant', 'Punchy']
      },
      physicalTraits: {
        hairStyle: 'Sharp styled bob cut with caramel highlights',
        facialFeatures: 'High broadcast charisma, expressive eye reactions',
        build: 'Contemporary Studio'
      },
      allowedWardrobes: ['Cobalt Blue Blazer', 'Trendy Pop Jacket', 'Casual Studio Knit'],
      allowedTransformations: ['Music Studio', 'Broadcast Desk', 'Concert Venue Ambient'],
      fatigueState: {
        lastUsedAgo: '30 mins ago',
        usesToday: 2,
        recentRoles: ['Music VJ', 'Pop Culture Anchor']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 97
    },

    'ACTOR_006': {
      actorId: 'ACTOR_006',
      stageName: 'Talent 06 (Meera Profile)',
      demographic: 'Indian Female • Comedic & Memes',
      ageAppearance: '27–32',
      genderPresentation: 'Female',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_06',
        vocalRange: 'Expressive Alto / Comedic',
        accents: ['Relatable Hinglish Comedic', 'Urban Delhi/Mumbai', 'Everyday Consumer'],
        supportedTones: ['Hilarious', 'Skeptical', 'Comedic Timing', 'Casual Best Friend']
      },
      physicalTraits: {
        hairStyle: 'High casual bun with face-framing strands',
        facialFeatures: 'Wide animated eyes, unmatched comedic timing expressions',
        build: 'Casual Relatable'
      },
      allowedWardrobes: ['Terracotta Jacket', 'Oversized Pastel Tee', 'Casual Hoodie'],
      allowedTransformations: ['Living Room Couch', 'Car Selfie POV', 'Kitchen Counter'],
      fatigueState: {
        lastUsedAgo: '5 hours ago',
        usesToday: 0,
        recentRoles: ['Confused Shopper', 'Meme Creator']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 96
    },

    'ACTOR_007': {
      actorId: 'ACTOR_007',
      stageName: 'Talent 07 (Arjun Profile)',
      demographic: 'Indian Male • Financial & Investigative',
      ageAppearance: '32–38',
      genderPresentation: 'Male',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_07',
        vocalRange: 'Deep Baritone / Deliberate',
        accents: ['Executive Indian English', 'Calculated Hinglish', 'Investigative Neutral'],
        supportedTones: ['Skeptical of Hype', 'Authoritative', 'Precise', 'Direct']
      },
      physicalTraits: {
        hairStyle: 'Side-parted dark hair with silver temples',
        facialFeatures: 'Sharp analytical gaze, measured expressions',
        build: 'Executive Tailored'
      },
      allowedWardrobes: ['Navy Smart Jacket', 'Crisp White Shirt', 'Technical Vest'],
      allowedTransformations: ['Financial Trading Desk', 'Supermarket Aisle', 'Corporate Boardroom'],
      fatigueState: {
        lastUsedAgo: '2 hours ago',
        usesToday: 1,
        recentRoles: ['Consumer Rights Advocate', 'Forensic Accountant']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 98
    },

    'ACTOR_008': {
      actorId: 'ACTOR_008',
      stageName: 'Talent 08 (Zoya Profile)',
      demographic: 'Indian Female • Film & Creative Critic',
      ageAppearance: '25–30',
      genderPresentation: 'Female',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_08',
        vocalRange: 'Melodic Mezzo / Artistic',
        accents: ['Creative Contemporary Indian English', 'Art-School Hinglish'],
        supportedTones: ['Cinematic', 'Passionate', 'Perceptive', 'Storyteller']
      },
      physicalTraits: {
        hairStyle: 'Soft dark wavy bob with designer frames',
        facialFeatures: 'Perceptive artistic gaze, subtle knowing smirk',
        build: 'Creative Studio'
      },
      allowedWardrobes: ['Sage Green Knit', 'Architectural Black Coat', 'Vintage Denim'],
      allowedTransformations: ['Film Screening Room', 'Design Studio', 'Art Gallery Cafe'],
      fatigueState: {
        lastUsedAgo: '8 hours ago',
        usesToday: 0,
        recentRoles: ['Movie Easter-Egg Detective', 'Art Critic']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 95
    },

    'ACTOR_009': {
      actorId: 'ACTOR_009',
      stageName: 'Talent 09 (Kabir Profile)',
      demographic: 'Indian Male • Tactical Security',
      ageAppearance: '32–40',
      genderPresentation: 'Male',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_09',
        vocalRange: 'Gravelly Baritone / Stern',
        accents: ['Direct Technical Indian English', 'No-Nonsense Hinglish'],
        supportedTones: ['Vigilant', 'Urgent Alert', 'Protective', 'Zero Fluff']
      },
      physicalTraits: {
        hairStyle: 'Close buzz cut with trimmed dark beard',
        facialFeatures: 'Stern protective gaze, focused commanding presence',
        build: 'Tactical Athletic'
      },
      allowedWardrobes: ['Tactical Dark Zip Hoodie', 'Black Technical Tee'],
      allowedTransformations: ['Server Rack Room', 'Night Parking Garage', 'Cyber Command Desk'],
      fatigueState: {
        lastUsedAgo: '12 hours ago',
        usesToday: 0,
        recentRoles: ['Cyber Defence Specialist', 'Whistleblower']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 99
    },

    'ACTOR_010': {
      actorId: 'ACTOR_010',
      stageName: 'Talent 10 (Dev Profile)',
      demographic: 'Indian Male • Gen-Z Viral Creator',
      ageAppearance: '22–26',
      genderPresentation: 'Male',
      referencePortraitUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=720&q=85',
      vocalCapabilities: {
        baseVoiceId: 'voice_talent_10',
        vocalRange: 'High Energy Tenor / Gen-Z',
        accents: ['Gen-Z Urban Hinglish', 'College Street Slang', 'Hyper-Speed Tech'],
        supportedTones: ['Hyped', 'Relatable', 'Fast Cuts', 'Playfully Chaotic']
      },
      physicalTraits: {
        hairStyle: 'Textured crop with subtle fade',
        facialFeatures: 'High enthusiasm grin, expressive animated gestures',
        build: 'Young Creator'
      },
      allowedWardrobes: ['Oversized Vintage Graphic Tee', 'Minimal Bomber', 'Varsity Jacket'],
      allowedTransformations: ['Hostel Balcony', 'Creator Bedroom with RGB', 'Street Food Market'],
      fatigueState: {
        lastUsedAgo: '1 hour ago',
        usesToday: 1,
        recentRoles: ['College Student', 'Secret Phone Hack Tester']
      },
      provenance: 'CHATR Permanent Talent Pool • Commercial CC0 Moving Assets',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      identityConsistencyScore: 96
    }
  };

  public static getActor(actorId: string): ActorProfile {
    return this.ACTORS[actorId] || this.ACTORS['ACTOR_001'];
  }

  public static getAllActors(): ActorProfile[] {
    return Object.values(this.ACTORS);
  }

  public static recordActorUsage(actorId: string, roleName: string): void {
    if (this.ACTORS[actorId]) {
      this.ACTORS[actorId].fatigueState.usesToday += 1;
      this.ACTORS[actorId].fatigueState.lastUsedAgo = 'Just now';
      this.ACTORS[actorId].fatigueState.recentRoles.unshift(roleName);
      if (this.ACTORS[actorId].fatigueState.recentRoles.length > 3) {
        this.ACTORS[actorId].fatigueState.recentRoles.pop();
      }
    }
  }
}
