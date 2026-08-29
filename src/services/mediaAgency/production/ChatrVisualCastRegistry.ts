/**
 * CHATR Media Agency — 10-Person Visual Cast & Recurring Creator Crew
 * 
 * Persistent, 100% distinct fictional creator identities with unique facial references,
 * persistent voices, clothing profiles, camera styles, and domain assignments.
 */

export interface CastMemberProfile {
  characterId: string;
  name: string;
  ageRange: string;
  role: string;
  demographic: string;
  contentDomain: string;
  approvedTopics: string[];
  personality: string;
  vocalProfile: {
    voiceId: string;
    voiceName: string;
    pitch: number;
    speed: number;
    accent: string;
    speakingStyle: string;
  };
  appearanceProfile: {
    hairStyle: string;
    clothing: string[];
    cameraFraming: string;
    lightingStyle: string;
  };
  expressionProfile: {
    defaultMood: string;
    hookExpression: string;
    reactionStyle: string;
    blinkFrequencySeconds: number;
  };
  videoClips: {
    hookClipUrl: string;
    reactionClipUrl: string;
    outroClipUrl: string;
    posterUrl: string;
  };
  provenance: string;
  rightsClearance: 'CC0_Royalty_Free_Commercial';
  marginalCost: '₹0.00';
  consistencyScorePercent: number;
}

export class ChatrVisualCastRegistry {
  private static CAST: Record<string, CastMemberProfile> = {
    // 1. Priya Sharma — Enterprise AI & Tech Strategist
    'priya_sharma': {
      characterId: 'priya_sharma',
      name: 'Priya Sharma',
      ageRange: '26–30',
      role: 'Enterprise AI & Tech Strategist',
      demographic: 'Indian Woman • Tech & Systems',
      contentDomain: 'AI agents, Enterprise workflows, Productivity',
      approvedTopics: ['AI Agents', 'Enterprise Workflows', 'Productivity', 'Tech Architecture'],
      personality: 'Analytical, authoritative, fast-paced, high clarity',
      vocalProfile: {
        voiceId: 'priya_v1_en_in',
        voiceName: 'Priya (Urban Indian English)',
        pitch: 1.0,
        speed: 1.05,
        accent: 'Indian English (Urban Contemporary)',
        speakingStyle: 'Direct, crisp pauses, strategic emphasis'
      },
      appearanceProfile: {
        hairStyle: 'Dark brown shoulder-length sleek hair',
        clothing: ['Modern Charcoal Blazer', 'Minimal Studio Tee'],
        cameraFraming: 'Medium Close-up • Eye-Level',
        lightingStyle: 'Warm 45° Key Light with soft ambient fill'
      },
      expressionProfile: {
        defaultMood: 'Focused & Confident',
        hookExpression: 'Direct engaging eye contact, inquisitive eyebrow raise',
        reactionStyle: 'Subtle nod with precise hand gestures',
        blinkFrequencySeconds: 3.5
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 98
    },

    // 2. Rohan Varma — Founder & Sports / Culture Host
    'rohan_varma': {
      characterId: 'rohan_varma',
      name: 'Rohan Varma',
      ageRange: '30–35',
      role: 'Founder & Sports / Culture Host',
      demographic: 'Indian Man • Candid Commentary',
      contentDomain: 'Sports debates, Founder realities, Indian cultural shifts',
      approvedTopics: ['Cricket Controversy', 'Sports Commentary', 'Founder Realities', 'Indian Shifts'],
      personality: 'Candid, energetic, relatable, high debate energy',
      vocalProfile: {
        voiceId: 'rohan_v1_en_in',
        voiceName: 'Rohan (Crisp Founder Cadence)',
        pitch: 0.94,
        speed: 1.03,
        accent: 'Indian English (Crisp Tech Founder)',
        speakingStyle: 'Conversational, unscripted feel'
      },
      appearanceProfile: {
        hairStyle: 'Short textured black hair with neat beard',
        clothing: ['Charcoal Crewneck', 'Dark Denim Jacket'],
        cameraFraming: 'Slight High-Angle • 35mm Lens',
        lightingStyle: 'Moody Ambient with Soft Edge Glow'
      },
      expressionProfile: {
        defaultMood: 'Pragmatic & Expressive',
        hookExpression: 'Candid smirk leaning into camera',
        reactionStyle: 'Head tilt before delivering key takeaway',
        blinkFrequencySeconds: 4.0
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-42778-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 97
    },

    // 3. Ananya Iyer — Talent & Future of Work Lead
    'ananya_iyer': {
      characterId: 'ananya_iyer',
      name: 'Ananya Iyer',
      ageRange: '32–38',
      role: 'Talent & Workplace Culture Lead',
      demographic: 'Indian Woman • Workplace & Society',
      contentDomain: 'Workplace humor, India hiring, Modern career dilemmas',
      approvedTopics: ['Workplace Humour', 'Hiring Truths', 'Career Shifts', 'Office Politics'],
      personality: 'Empathetic, sharp, witty, data-backed',
      vocalProfile: {
        voiceId: 'ananya_v1_en_in',
        voiceName: 'Ananya (Warm Specialist)',
        pitch: 1.02,
        speed: 1.0,
        accent: 'Indian English (Articulate Professional)',
        speakingStyle: 'Warm, reassuring, punchy humor'
      },
      appearanceProfile: {
        hairStyle: 'Elegant wavy dark hair with subtle parting',
        clothing: ['Olive Smart Linen Blazer', 'Modern Collar'],
        cameraFraming: 'Eye-Level Medium Portrait',
        lightingStyle: 'Natural daylight spill with soft ring fill'
      },
      expressionProfile: {
        defaultMood: 'Empathetic & Insightful',
        hookExpression: 'Knowing smile addressing the viewer',
        reactionStyle: 'Warm nod with relatable expression',
        blinkFrequencySeconds: 3.2
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 96
    },

    // 4. Vikram Joshi — AI/OSS & Tech Hacker
    'vikram_joshi': {
      characterId: 'vikram_joshi',
      name: 'Vikram Joshi',
      ageRange: '25–30',
      role: 'Tech Hacker & Open Source Builder',
      demographic: 'Indian Man • Hacker Culture',
      contentDomain: 'Weird tech experiments, Local AI, Hardware hacks',
      approvedTopics: ['Weird Tech', 'Open Source', 'Ollama Experiments', 'Hardware Hacks'],
      personality: 'Energetic, fast-talking, curiosity-driven',
      vocalProfile: {
        voiceId: 'vikram_v1_en_in',
        voiceName: 'Vikram (Fast Tech Builder)',
        pitch: 0.98,
        speed: 1.08,
        accent: 'Indian English (Urban Tech)',
        speakingStyle: 'Rapid developer explanations, high energy'
      },
      appearanceProfile: {
        hairStyle: 'Modern fade with textured dark top',
        clothing: ['Black Tech Hoodie', 'Developer Graphic Tee'],
        cameraFraming: 'Desk POV • Dual-Monitor Ambient Glow',
        lightingStyle: 'Cyber Blue & Amber Terminal Lighting'
      },
      expressionProfile: {
        defaultMood: 'Excited & Curious',
        hookExpression: 'Holding prototype close to camera',
        reactionStyle: 'Quick screen point with energetic hands',
        blinkFrequencySeconds: 4.2
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-40348-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 99
    },

    // 5. Ishita Rao — Viral Music & Breaking News Host
    'ishita_rao': {
      characterId: 'ishita_rao',
      name: 'Ishita Rao',
      ageRange: '26–32',
      role: 'Viral Music & Culture Presenter',
      demographic: 'Indian Woman • Entertainment News',
      contentDomain: 'Viral songs, Movie releases, Artist moments, Pop culture',
      approvedTopics: ['Viral Music', 'Movie Trailers', 'Pop Culture Moments', 'Entertainment News'],
      personality: 'Charismatic, broadcast-level delivery, trendy, expressive',
      vocalProfile: {
        voiceId: 'ishita_v1_en_in',
        voiceName: 'Ishita (Broadcast Entertainment)',
        pitch: 1.04,
        speed: 1.07,
        accent: 'Indian English (Broadcast Contemporary)',
        speakingStyle: 'Punchy hook delivery, vibrant rhythm'
      },
      appearanceProfile: {
        hairStyle: 'Sharp stylish layered bob with highlights',
        clothing: ['Cobalt Blue Tailored Blazer', 'Modern Minimal Tee'],
        cameraFraming: 'Dynamic Studio Close-up • Shallow Depth',
        lightingStyle: 'Studio Key with Warm Backlight'
      },
      expressionProfile: {
        defaultMood: 'Vibrant & Engaging',
        hookExpression: 'Expressive opening reaction holding headphones',
        reactionStyle: 'Energetic gestures reacting to song drops',
        blinkFrequencySeconds: 3.0
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 97
    },

    // 6. Meera Kapoor — Humour & Internet Memes Lead
    'meera_kapoor': {
      characterId: 'meera_kapoor',
      name: 'Meera Kapoor',
      ageRange: '27–32',
      role: 'Internet Culture & Humour Lead',
      demographic: 'Indian Woman • Viral Comedy',
      contentDomain: 'Relatable Indian humour, Memes, Trending creator formats',
      approvedTopics: ['Internet Memes', 'Relatable Humour', 'Creator Trends', 'Viral Audio'],
      personality: 'Hilarious, highly relatable, expressive, rapid comedic timing',
      vocalProfile: {
        voiceId: 'meera_v1_en_in',
        voiceName: 'Meera (Comedic Timing)',
        pitch: 1.03,
        speed: 1.06,
        accent: 'Indian English (Urban Dynamic)',
        speakingStyle: 'Conversational, comedic pauses, punchy delivery'
      },
      appearanceProfile: {
        hairStyle: 'High effortless bun with face-framing strands',
        clothing: ['Terracotta Casual Blazer', 'Oversized Pastel Tee'],
        cameraFraming: 'Dynamic handheld selfie feel',
        lightingStyle: 'Natural window daylight with soft bounce'
      },
      expressionProfile: {
        defaultMood: 'Playful & Witty',
        hookExpression: 'Wide-eyed comedic disbelief looking at phone',
        reactionStyle: 'Laughing reaction cut to meme payoff',
        blinkFrequencySeconds: 3.4
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 96
    },

    // 7. Arjun Mehta — Money, Scam Busting & Business Analyst
    'arjun_mehta': {
      characterId: 'arjun_mehta',
      name: 'Arjun Mehta',
      ageRange: '32–38',
      role: 'Consumer Finance & Scam Buster',
      demographic: 'Indian Man • Financial Intelligence',
      contentDomain: 'Online scams, Money traps, Market psychology, Economics',
      approvedTopics: ['Scam Busting', 'Money Traps', 'Consumer Psychology', 'Startup Economics'],
      personality: 'Precise, calm, skeptical of hype, high credibility',
      vocalProfile: {
        voiceId: 'arjun_v1_en_in',
        voiceName: 'Arjun (Analytical Executive)',
        pitch: 0.92,
        speed: 1.0,
        accent: 'Indian English (Executive Financial)',
        speakingStyle: 'Deliberate, pausing before facts, authoritative'
      },
      appearanceProfile: {
        hairStyle: 'Neat side parted dark hair with silver temples',
        clothing: ['Navy Smart Jacket', 'Crisp White Shirt'],
        cameraFraming: 'Structured Mid-Chest • Architectural Background',
        lightingStyle: 'Cool corporate key light with subtle rim'
      },
      expressionProfile: {
        defaultMood: 'Analytical & Calm',
        hookExpression: 'Holding up phone exposing deceptive pricing trick',
        reactionStyle: 'Slow firm nod highlighting the financial trap',
        blinkFrequencySeconds: 4.5
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-42778-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 98
    },

    // 8. Zoya Khan — Movies, OTT & Visual Design Critic
    'zoya_khan': {
      characterId: 'zoya_khan',
      name: 'Zoya Khan',
      ageRange: '25–30',
      role: 'Cinema, OTT & Visual Story Critic',
      demographic: 'Indian Woman • Film & Design',
      contentDomain: 'Movie trailers, Hidden cinematography details, OTT reviews',
      approvedTopics: ['Movie Breakdown', 'Hidden Cinema Details', 'OTT Releases', 'Visual Design'],
      personality: 'Artistic, perceptive, passionate, eye for detail',
      vocalProfile: {
        voiceId: 'zoya_v1_en_in',
        voiceName: 'Zoya (Creative Film Critic)',
        pitch: 1.01,
        speed: 1.04,
        accent: 'Indian English (Creative Contemporary)',
        speakingStyle: 'Cinematic descriptions, rhythmic build-up'
      },
      appearanceProfile: {
        hairStyle: 'Soft wavy dark bob with modern designer frames',
        clothing: ['Sage Green Knit', 'Minimalist Black Overcoat'],
        cameraFraming: 'Wide Studio Portrait • Ambient Cinema Poster Glow',
        lightingStyle: 'Warm diffused cinematic key light'
      },
      expressionProfile: {
        defaultMood: 'Perceptive & Creative',
        hookExpression: 'Intense gaze pointing out unnoticed trailer frame',
        reactionStyle: 'Subtle smile upon revealing plot easter egg',
        blinkFrequencySeconds: 3.6
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 95
    },

    // 9. Kabir Malhotra — Cybersecurity & Online Privacy
    'kabir_malhotra': {
      characterId: 'kabir_malhotra',
      name: 'Kabir Malhotra',
      ageRange: '32–40',
      role: 'Cybersecurity & Data Privacy Specialist',
      demographic: 'Indian Man • Cyber Defence',
      contentDomain: 'Phone hacking alerts, App privacy leaks, Safe digital habits',
      approvedTopics: ['Phone Privacy', 'App Permissions', 'Data Leaks', 'Cyber Safety'],
      personality: 'Vigilant, direct, zero-fluff, protective',
      vocalProfile: {
        voiceId: 'kabir_v1_en_in',
        voiceName: 'Kabir (Security Specialist)',
        pitch: 0.91,
        speed: 1.02,
        accent: 'Indian English (Direct Technical)',
        speakingStyle: 'Firm, urgent warning rhythm, zero corporate fluff'
      },
      appearanceProfile: {
        hairStyle: 'Short buzz cut with sharp line-up and dark beard',
        clothing: ['Tactical Dark Zip Hoodie', 'Black Technical Tee'],
        cameraFraming: 'Direct Center Frame • Server Ambient Glow',
        lightingStyle: 'Low-key High Contrast Rim Lighting'
      },
      expressionProfile: {
        defaultMood: 'Vigilant & Direct',
        hookExpression: 'Stern eye contact pointing at phone setting warning',
        reactionStyle: 'Firm nod demonstrating setting deactivation',
        blinkFrequencySeconds: 4.8
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-40348-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 99
    },

    // 10. Dev Bhatia — Viral Tech & Consumer AI Trends
    'dev_bhatia': {
      characterId: 'dev_bhatia',
      name: 'Dev Bhatia',
      ageRange: '22–26',
      role: 'Viral Tech & Gadgets Creator',
      demographic: 'Indian Man • Gen-Z Tech Culture',
      contentDomain: 'Crazy gadgets, Free viral tools, Secret smartphone tricks',
      approvedTopics: ['Secret Phone Tricks', 'Viral Free Tools', 'Crazy Gadgets', 'Student Hacks'],
      personality: 'Hyper-relatable, engaging, fast cuts, high visual enthusiasm',
      vocalProfile: {
        voiceId: 'dev_v1_en_in',
        voiceName: 'Dev (High Energy Explainer)',
        pitch: 1.05,
        speed: 1.10,
        accent: 'Indian English (Gen-Z Urban)',
        speakingStyle: 'Upbeat, high hook energy, punchy transitions'
      },
      appearanceProfile: {
        hairStyle: 'Textured modern crop with subtle fade',
        clothing: ['Oversized Vintage Graphic Tee', 'Minimal Bomber'],
        cameraFraming: 'Dynamic Selfie-Stick / Action Cam Perspective',
        lightingStyle: 'RGB Neon Backlight with Clean Key'
      },
      expressionProfile: {
        defaultMood: 'Excited & Curious',
        hookExpression: 'High energy grin leaning into lens with gadget',
        reactionStyle: 'Expressive hand gestures reacting to insane tool demo',
        blinkFrequencySeconds: 2.8
      },
      videoClips: {
        hookClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        reactionClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        outroClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-42778-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=720&q=85'
      },
      provenance: 'CHATR Fictional Cast • CC0 Commercial Licensed Moving Footage',
      rightsClearance: 'CC0_Royalty_Free_Commercial',
      marginalCost: '₹0.00',
      consistencyScorePercent: 96
    }
  };

  public static getCharacter(characterId: string): CastMemberProfile {
    return this.CAST[characterId] || this.CAST['ishita_rao'];
  }

  public static getAllCharacters(): CastMemberProfile[] {
    return Object.values(this.CAST);
  }

  public static selectCrewForStory(topic: string): { primary: CastMemberProfile; secondary: CastMemberProfile } {
    const t = topic.toLowerCase();
    if (t.includes('music') || t.includes('song') || t.includes('audio') || t.includes('artist')) {
      return { primary: this.CAST['ishita_rao'], secondary: this.CAST['dev_bhatia'] };
    }
    if (t.includes('humour') || t.includes('meme') || t.includes('internet') || t.includes('funny')) {
      return { primary: this.CAST['meera_kapoor'], secondary: this.CAST['dev_bhatia'] };
    }
    if (t.includes('cricket') || t.includes('sport') || t.includes('match')) {
      return { primary: this.CAST['rohan_varma'], secondary: this.CAST['arjun_mehta'] };
    }
    if (t.includes('movie') || t.includes('trailer') || t.includes('ott') || t.includes('cinema')) {
      return { primary: this.CAST['zoya_khan'], secondary: this.CAST['ishita_rao'] };
    }
    if (t.includes('scam') || t.includes('money') || t.includes('price') || t.includes('finance')) {
      return { primary: this.CAST['arjun_mehta'], secondary: this.CAST['rohan_varma'] };
    }
    if (t.includes('privacy') || t.includes('hack') || t.includes('phone') || t.includes('safety')) {
      return { primary: this.CAST['kabir_malhotra'], secondary: this.CAST['vikram_joshi'] };
    }
    if (t.includes('gadget') || t.includes('trick') || t.includes('viral')) {
      return { primary: this.CAST['dev_bhatia'], secondary: this.CAST['meera_kapoor'] };
    }
    if (t.includes('work') || t.includes('career') || t.includes('office')) {
      return { primary: this.CAST['ananya_iyer'], secondary: this.CAST['priya_sharma'] };
    }
    return { primary: this.CAST['ishita_rao'], secondary: this.CAST['dev_bhatia'] };
  }
}
