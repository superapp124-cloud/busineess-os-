/**
 * CHATR Media Agency — Persistent 10-Character Fictional Cast
 * 
 * Fictional, recurring digital creator personalities (NOT static stock photos or corporate avatars).
 * Each character has a stable personal identity, signature conversational tone, and curated
 * moving MP4 footage showing them walking, talking to camera, laughing, and reacting in real environments.
 */

export interface CharacterPersonality {
  characterId: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  handle: string;
  personalityStyle: string;
  signatureCatchphrase: string;
  vocalTone: string;
  defaultSetting: string;
  videoClips: {
    walkingTalkingToCameraUrl: string;
    friendLaughingReactionUrl: string;
    phoneScrollCloseupUrl: string;
    shockedReactionUrl: string;
    twoPersonCollabUrl: string;
    streetAmbientUrl: string;
    outroSignoffUrl: string;
    posterUrl: string;
  };
}

export class ChatrCharacterCast {
  private static CHARACTERS: Record<string, CharacterPersonality> = {
    // 1. Priya — The Relatable Pop-Culture & Trend Explorer
    'priya': {
      characterId: 'priya',
      name: 'Priya',
      age: 26,
      gender: 'Female',
      handle: '@priya.unfiltered',
      personalityStyle: 'Curious, conversational, relatable, sharp humor',
      signatureCatchphrase: 'Bro, tell me I\'m not the only one who saw this...',
      vocalTone: 'Conversational Urban Hinglish • Warm & Expressive',
      defaultSetting: 'Bandra / Indiranagar Outdoor Cafés, Vibrant Streetscapes',
      videoClips: {
        walkingTalkingToCameraUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
        friendLaughingReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
        phoneScrollCloseupUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
        shockedReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        twoPersonCollabUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        streetAmbientUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        outroSignoffUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85'
      }
    },

    // 2. Rohan — The Candid Sports & Street Debater
    'rohan': {
      characterId: 'rohan',
      name: 'Rohan',
      age: 31,
      gender: 'Male',
      handle: '@rohan.speaks',
      personalityStyle: 'High-energy debate, candid, sports fanatic, unscripted feel',
      signatureCatchphrase: 'Wait. Did you actually just see that call?',
      vocalTone: 'Delhi/Mumbai Energetic Hinglish • High Pacing',
      defaultSetting: 'Sports Lounges, Street Food Stalls, Chai Spots',
      videoClips: {
        walkingTalkingToCameraUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-on-a-city-street-43095-large.mp4',
        friendLaughingReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        phoneScrollCloseupUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
        shockedReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        twoPersonCollabUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
        streetAmbientUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        outroSignoffUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-42778-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85'
      }
    },

    // 3. Meera — The Deadpan Meme & Everyday Humour Queen
    'meera': {
      characterId: 'meera',
      name: 'Meera',
      age: 27,
      gender: 'Female',
      handle: '@meera.unhinged',
      personalityStyle: 'Deadpan comedic timing, sarcastic, extremely relatable',
      signatureCatchphrase: 'I genuinely don\'t understand how this became normal.',
      vocalTone: 'Witty Hinglish • Casual Best-Friend Cadence',
      defaultSetting: 'Living Room Couch, Metro Rides, Balconies',
      videoClips: {
        walkingTalkingToCameraUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
        friendLaughingReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
        phoneScrollCloseupUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
        shockedReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        twoPersonCollabUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        streetAmbientUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        outroSignoffUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85'
      }
    },

    // 4. Dev — The Viral Gadgets & Internet Chaos Guy
    'dev': {
      characterId: 'dev',
      name: 'Dev',
      age: 23,
      gender: 'Male',
      handle: '@dev.hacks',
      personalityStyle: 'Hyper-relatable, fast cuts, curious, chaotic good energy',
      signatureCatchphrase: 'No way this actually works. Let\'s test it right now.',
      vocalTone: 'Gen-Z Fast-Paced Hinglish • High Energy',
      defaultSetting: 'College Hostels, Electronics Markets, Creator Desk',
      videoClips: {
        walkingTalkingToCameraUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-on-a-city-street-43095-large.mp4',
        friendLaughingReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
        phoneScrollCloseupUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
        shockedReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
        twoPersonCollabUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
        streetAmbientUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        outroSignoffUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-a-laptop-in-an-office-42777-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=720&q=85'
      }
    },

    // 5. Ishita — The Pop-Music & Entertainment Insider
    'ishita': {
      characterId: 'ishita',
      name: 'Ishita',
      age: 28,
      gender: 'Female',
      handle: '@ishita.vibes',
      personalityStyle: 'Vibrant pop-culture host, passionate about beats & cinema',
      signatureCatchphrase: 'Okay, why is EVERYONE suddenly obsessed with this song?',
      vocalTone: 'Bright Contemporary Hinglish • Broadcast Charisma',
      defaultSetting: 'Concert Backstages, Sound Studios, Rooftop Lounges',
      videoClips: {
        walkingTalkingToCameraUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-down-a-city-street-43094-large.mp4',
        friendLaughingReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-at-a-festival-42862-large.mp4',
        phoneScrollCloseupUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-scrolling-a-smartphone-40349-large.mp4',
        shockedReactionUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-the-camera-in-an-office-42780-large.mp4',
        twoPersonCollabUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-together-at-a-cafe-table-42785-large.mp4',
        streetAmbientUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
        outroSignoffUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-busy-coworking-space-42784-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=720&q=85'
      }
    }
  };

  public static getCharacter(id: string): CharacterPersonality {
    return this.CHARACTERS[id] || this.CHARACTERS['priya'];
  }

  public static selectCharacterForTrend(topic: string, category: string): CharacterPersonality {
    const c = category.toLowerCase();
    const t = topic.toLowerCase();
    if (c.includes('music') || t.includes('song') || t.includes('track')) return this.CHARACTERS['ishita'];
    if (c.includes('humour') || c.includes('meme') || t.includes('obsession')) return this.CHARACTERS['meera'];
    if (c.includes('cricket') || c.includes('sports') || t.includes('umpire')) return this.CHARACTERS['rohan'];
    if (c.includes('hack') || c.includes('gadget') || t.includes('phone')) return this.CHARACTERS['dev'];
    return this.CHARACTERS['priya'];
  }
}
