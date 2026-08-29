/**
 * CHATR Media Agency — Character Casting Engine
 * 
 * Generates a dynamic, story-specific Character Brief for every Reel (e.g. 28yo sarcastic cricket fan,
 * 24yo Mumbai music enthusiast, 34yo investigative film journalist) and intelligently casts
 * the best suited actor from the permanent 10-Actor Talent Pool while applying actor fatigue controls.
 */

import { ChatrActorRegistry, ActorProfile } from './ChatrActorRegistry';

export interface ReelCharacterBrief {
  characterId: string;
  reelId: string;
  characterName: string;
  age: number;
  occupation: string;
  personality: string;
  locationSetting: string;
  wardrobeChoice: string;
  languageAndTone: string;
  emotionalArc: string;
  castActor: ActorProfile;
  castingRationale: string;
}

export class CharacterCastingEngine {
  /**
   * Generates a Reel-specific Character Brief and casts the optimal Actor from the pool
   */
  public static generateAndCastCharacter(
    reelId: string,
    topic: string,
    category: string,
    hook: string
  ): ReelCharacterBrief {
    const t = topic.toLowerCase();
    const c = category.toLowerCase();

    let characterName = 'Riya';
    let age = 26;
    let occupation = 'Content Creator';
    let personality = 'Energetic, direct, relatable';
    let locationSetting = 'Mumbai Urban Coffee Shop';
    let wardrobeChoice = 'Casual Smart Jacket with Minimal Tee';
    let languageAndTone = 'Urban Hinglish • Conversational & Hook-Driven';
    let emotionalArc = 'Disbelief → Deep Dive → Relatable Resolution';
    let targetActorId = 'ACTOR_005';
    let castingRationale = 'Actor 05 selected for high broadcast pop energy and vocal range matching viral entertainment.';

    // Story-Driven Dynamic Character Generation
    if (c.includes('music') || t.includes('song') || t.includes('track')) {
      characterName = 'Simran';
      age = 24;
      occupation = 'Indie Music Enthusiast & Playlist Curator';
      personality = 'Passionate, expressive, sharp ear for hooks';
      locationSetting = 'Acoustic Music Studio with Warm Lamps';
      wardrobeChoice = 'Cobalt Blue Studio Jacket with Headphones around neck';
      languageAndTone = 'Vibrant Mumbai Hinglish • Fast Rhythm';
      emotionalArc = 'Shocked by viral velocity → Breakdown of bridge chord → Fan reaction';
      targetActorId = 'ACTOR_005';
      castingRationale = 'Actor 05 provides bright soprano vocal energy and expressive eye reactions essential for music hooks.';
    } else if (c.includes('humour') || t.includes('meme') || t.includes('obsession')) {
      characterName = 'Meera';
      age = 27;
      occupation = 'Internet Culture Commentator';
      personality = 'Sarcastic, humorous, expressive comedic timing';
      locationSetting = 'Living Room Couch with Ambient Window Spill';
      wardrobeChoice = 'Oversized Terracotta Shirt';
      languageAndTone = 'Relatable Hinglish • Comedic Pauses & Deadpan Delivery';
      emotionalArc = 'Deadpan disbelief → Highlight absurd background uncle → Laughing payoff';
      targetActorId = 'ACTOR_006';
      castingRationale = 'Actor 06 possesses superior comedic micro-expressions and everyday conversational relatability.';
    } else if (c.includes('cricket') || c.includes('sports') || t.includes('umpire')) {
      characterName = 'Rahul';
      age = 29;
      occupation = 'Die-hard Cricket Fan & Match Analyst';
      personality = 'Passionate, high-energy debate, analytical';
      locationSetting = 'Mumbai Sports Lounge with Match Feed Backdrop';
      wardrobeChoice = 'Denim Jacket over Team India Supporter Tee';
      languageAndTone = 'High-Energy Delhi/Mumbai Hinglish • Debate Cadence';
      emotionalArc = 'Agitated shock at DRS decision → Technical breakdown → Challenge to viewer';
      targetActorId = 'ACTOR_002';
      castingRationale = 'Actor 02 delivers candid baritone debate authority with expressive sports-fan body language.';
    } else if (c.includes('movie') || c.includes('trailer') || t.includes('easter egg')) {
      characterName = 'Zoya';
      age = 28;
      occupation = 'Cinema & OTT Easter-Egg Detective';
      personality = 'Perceptive, artistic, observant of micro-details';
      locationSetting = 'Dim Film Screening Room with Ambient Cinema Glow';
      wardrobeChoice = 'Sage Green Knit with Designer Glasses';
      languageAndTone = 'Cinematic Contemporary English • Rhythmic Build-Up';
      emotionalArc = 'Whispered intrigue → Frame freeze-frame reveal → Mind-blown conclusion';
      targetActorId = 'ACTOR_008';
      castingRationale = 'Actor 08 brings artistic gravitas, designer frames, and focused gaze perfect for trailer breakdowns.';
    } else if (c.includes('scam') || c.includes('money') || t.includes('pricing')) {
      characterName = 'Arjun';
      age = 34;
      occupation = 'Consumer Rights Advocate & Pricing Analyst';
      personality = 'Skeptical of marketing hype, numbers-driven, protective';
      locationSetting = 'Supermarket Aisle / Kitchen Counter with Order Receipt';
      wardrobeChoice = 'Navy Jacket with Crisp White Shirt';
      languageAndTone = 'Direct Executive Hinglish • Measured Deliberate Cadence';
      emotionalArc = 'Exposing fake 60% discount → Step-by-step invoice math → Empowering saving tip';
      targetActorId = 'ACTOR_007';
      castingRationale = 'Actor 07 provides deep baritone credibility, forensic demeanor, and anti-hype authority.';
    } else if (c.includes('hack') || c.includes('phone') || t.includes('gadget')) {
      characterName = 'Dev';
      age = 23;
      occupation = 'College Student & Viral Gadget Tester';
      personality = 'Hyper-speed energy, hands-on, excited';
      locationSetting = 'Hostel Room with Neon Backlight and Multi-Monitors';
      wardrobeChoice = 'Oversized Vintage Graphic Tee';
      languageAndTone = 'Gen-Z Fast Hinglish • High Enthusiasm';
      emotionalArc = 'Insane secret discovery → Fast live demo on phone → "You need to turn this off now"';
      targetActorId = 'ACTOR_010';
      castingRationale = 'Actor 10 has youthful Gen-Z charisma, high pacing speed, and playful tech curiosity.';
    }

    // Retrieve Actor from Registry
    const castActor = ChatrActorRegistry.getActor(targetActorId);

    // Record Usage in Registry for Fatigue Control
    ChatrActorRegistry.recordActorUsage(targetActorId, `${characterName} (${occupation})`);

    return {
      characterId: `char_${reelId}_${Date.now()}`,
      reelId,
      characterName,
      age,
      occupation,
      personality,
      locationSetting,
      wardrobeChoice,
      languageAndTone,
      emotionalArc,
      castActor,
      castingRationale
    };
  }
}
