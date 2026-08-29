/**
 * CHATR Media Agency — Cinematic Movie Story Engine
 * 
 * Replaces corporate talking-head formats with cinematic multi-scene movie storytelling.
 * Every Reel is structured like a documentary or short film scene with environmental depth,
 * character actions, lighting, camera dolly motion, and verified moving MP4 video clips.
 */

export interface MovieSceneShot {
  shotNumber: number;
  timeRange: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  cinematicType: 'ESTABLISHING_MOOD' | 'ACTION_CLOSEUP' | 'ENVIRONMENT_REACTION' | 'CINEMATIC_REVEAL' | 'EMOTIONAL_PAYOFF' | 'EPIC_OUTRO';
  videoClipUrl: string;
  posterUrl: string;
  cameraMovement: 'CINEMATIC_DOLLY_PUSH' | 'DYNAMIC_PAN_RIGHT' | 'SLOW_MOTION_TRACK' | 'DUTCH_ANGLE_CUT' | 'AERIAL_SWEEP';
  colorGrade: 'TEAL_AND_ORANGE' | 'WARM_GOLDEN_HOUR' | 'NEON_CYBER_MOOD' | 'DOCUMENTARY_NATURAL';
  characterAction: string;
  movieScriptLine: string;
  cinematicSubtitle: string;
  sfxCue: string;
}

export interface CinematicMovieReel {
  reelId: string;
  movieTitle: string;
  genre: 'VIRAL_CULTURE_DOC' | 'SPORTS_THRILLER' | 'COMEDY_SKETCH' | 'CINEMA_DEEPDIVE' | 'CONSUMER_INVESTIGATION';
  totalDurationSeconds: number; // 30.0s
  characterProtagonist: {
    name: string;
    role: string;
    actorStageName: string;
    costume: string;
    setting: string;
  };
  shots: MovieSceneShot[];
  soundtrack: {
    trackName: string;
    mood: string;
    duckingDb: number;
  };
}

export class CinematicStoryEngine {
  /**
   * Generates a movie-like cinematic short film timeline for any cultural trend
   */
  public static generateCinematicMovie(
    reelId: string,
    topic: string,
    category: string
  ): CinematicMovieReel {
    // 1. Viral Music Storyline: "The 15-Second Loop" (Cinematic Music Doc)
    if (category.includes('Music') || topic.includes('song') || topic.includes('track')) {
      return {
        reelId,
        movieTitle: 'The 15-Second Sonic Obsession',
        genre: 'VIRAL_CULTURE_DOC',
        totalDurationSeconds: 30.0,
        characterProtagonist: {
          name: 'Simran',
          role: 'Indie Sound Designer & Playlist Curator',
          actorStageName: 'Talent 05 (Ishita Profile)',
          costume: 'Oversized Studio Denim with Glow Headphones',
          setting: 'Moody Neon Studio & Mumbai Nightscape'
        },
        soundtrack: {
          trackName: 'Midnight Lo-Fi Trap Bridge (CC0 Cleared)',
          mood: 'Atmospheric, Rhythmic, Building Tension',
          duckingDb: -14
        },
        shots: [
          {
            shotNumber: 1,
            timeRange: '0.0s - 4.0s',
            startTimeSeconds: 0.0,
            endTimeSeconds: 4.0,
            cinematicType: 'ESTABLISHING_MOOD',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-at-a-festival-42862-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'CINEMATIC_DOLLY_PUSH',
            colorGrade: 'NEON_CYBER_MOOD',
            characterAction: 'Sound designer adjusting mixing console dials as bass frequencies pulse in dark studio.',
            movieScriptLine: "Okay, I wasn't expecting this song to blow up this fast.",
            cinematicSubtitle: "OCTOBER 2026 • THE 15-SECOND DROP THAT BROKE THE ALGORITHM",
            sfxCue: 'ambient_vinyl_crackle + sub_bass_drop'
          },
          {
            shotNumber: 2,
            timeRange: '4.0s - 8.5s',
            startTimeSeconds: 4.0,
            endTimeSeconds: 8.5,
            cinematicType: 'ACTION_CLOSEUP',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-headphones-lying-on-a-sound-mixing-board-in-a-studio-43187-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'DYNAMIC_PAN_RIGHT',
            colorGrade: 'TEAL_AND_ORANGE',
            characterAction: 'Close-up macro shot of fingers sliding master volume faders, green LED meters peaking.',
            movieScriptLine: "It started as a 15-second background loop three days ago.",
            cinematicSubtitle: "3 DAYS AGO • 0 AD SPEND • 150,000 CREATOR REMAKES",
            sfxCue: 'fader_slide + drum_snare_hit'
          },
          {
            shotNumber: 3,
            timeRange: '8.5s - 13.5s',
            startTimeSeconds: 8.5,
            endTimeSeconds: 13.5,
            cinematicType: 'ENVIRONMENT_REACTION',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'SLOW_MOTION_TRACK',
            colorGrade: 'WARM_GOLDEN_HOUR',
            characterAction: 'Group of young creators huddled around phone on cafe balcony, head nodding in sync.',
            movieScriptLine: "Now every creator in Mumbai and Bangalore is using the exact same drop.",
            cinematicSubtitle: "VIRAL SPREAD: MUMBAI • BANGALORE • DELHI",
            sfxCue: 'crowd_reaction_gasp'
          },
          {
            shotNumber: 4,
            timeRange: '13.5s - 18.5s',
            startTimeSeconds: 13.5,
            endTimeSeconds: 18.5,
            cinematicType: 'CINEMATIC_REVEAL',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-40348-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'DUTCH_ANGLE_CUT',
            colorGrade: 'TEAL_AND_ORANGE',
            characterAction: 'Audio waveform breakdown displaying mathematically perfect seamless loop boundary.',
            movieScriptLine: "The acoustic bridge was engineered specifically to loop seamlessly on vertical video.",
            cinematicSubtitle: "THE SECRET: SEAMLESS 0.0s LOOP BOUNDARY",
            sfxCue: 'reverse_cymbal_swell'
          },
          {
            shotNumber: 5,
            timeRange: '18.5s - 24.0s',
            startTimeSeconds: 18.5,
            endTimeSeconds: 24.0,
            cinematicType: 'ACTION_CLOSEUP',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'SLOW_MOTION_TRACK',
            colorGrade: 'NEON_CYBER_MOOD',
            characterAction: 'Producer smiling as analytics graph shoots vertically upward.',
            movieScriptLine: "When an audio loops this smoothly, the retention algorithm pushes it automatically.",
            cinematicSubtitle: "ALGORITHMIC MULTIPLIER: 99.4% RETENTION",
            sfxCue: 'riser_whoosh'
          },
          {
            shotNumber: 6,
            timeRange: '24.0s - 30.0s',
            startTimeSeconds: 24.0,
            endTimeSeconds: 30.0,
            cinematicType: 'EPIC_OUTRO',
            videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
            posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85',
            cameraMovement: 'AERIAL_SWEEP',
            colorGrade: 'NEON_CYBER_MOOD',
            characterAction: 'Cinematic aerial night sweep over glowing city traffic pulsing to the rhythm of the track.',
            movieScriptLine: "Next time a song is stuck in your head, check the loop timing. Drop your favorite line below.",
            cinematicSubtitle: "DROP YOUR FAVORITE LINE IN THE COMMENTS 👇",
            sfxCue: 'epic_cinematic_hit + fade_out'
          }
        ]
      };
    }

    // Default Cinematic Sketch: "The DRS Final Over Drama"
    return {
      reelId,
      movieTitle: 'The Final Over DRS Drama',
      genre: 'SPORTS_THRILLER',
      totalDurationSeconds: 30.0,
      characterProtagonist: {
        name: 'Rahul',
        role: 'Cricket Analyst & Match Fanatic',
        actorStageName: 'Talent 02 (Rohan Profile)',
        costume: 'Denim Jacket over Supporter Tee',
        setting: 'Electric Sports Lounge with Match Feed'
      },
      soundtrack: {
        trackName: 'Stadium Heartbeat Pulse (CC0 Cleared)',
        mood: 'Suspenseful, High Energy, Drum March',
        duckingDb: -12
      },
      shots: [
        {
          shotNumber: 1,
          timeRange: '0.0s - 4.5s',
          startTimeSeconds: 0.0,
          endTimeSeconds: 4.5,
          cinematicType: 'ESTABLISHING_MOOD',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-at-a-festival-42862-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=720&q=85',
          cameraMovement: 'CINEMATIC_DOLLY_PUSH',
          colorGrade: 'TEAL_AND_ORANGE',
          characterAction: 'Stadium floodlights piercing through haze as 50,000 fans go dead silent for review.',
          movieScriptLine: "Wait. Did the third umpire actually just make this call?",
          cinematicSubtitle: "FINAL OVER • 4 RUNS NEEDED • CONTROVERSIAL DRS REVIEW",
          sfxCue: 'heartbeat_thump + crowd_hush'
        },
        {
          shotNumber: 2,
          timeRange: '4.5s - 9.5s',
          startTimeSeconds: 4.5,
          endTimeSeconds: 9.5,
          cinematicType: 'ACTION_CLOSEUP',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-40348-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=720&q=85',
          cameraMovement: 'SLOW_MOTION_TRACK',
          colorGrade: 'DOCUMENTARY_NATURAL',
          characterAction: 'UltraEdge sound sensor graph on broadcast monitor scanning millisecond sound spike.',
          movieScriptLine: "From the front angle, it looked like a clear edge. But UltraEdge showed zero spike.",
          cinematicSubtitle: "ULTRAEDGE 1000 FPS AUDIO SENSOR: ZERO SPIKE DETECTED",
          sfxCue: 'tech_beep + scan_pulse'
        },
        {
          shotNumber: 3,
          timeRange: '9.5s - 16.0s',
          startTimeSeconds: 9.5,
          endTimeSeconds: 16.0,
          cinematicType: 'ENVIRONMENT_REACTION',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colleagues-discussing-work-over-a-laptop-42781-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=720&q=85',
          cameraMovement: 'DYNAMIC_PAN_RIGHT',
          colorGrade: 'WARM_GOLDEN_HOUR',
          characterAction: 'Fans in lounge reacting violently in debate, pointing at replay screen.',
          movieScriptLine: "The decision turned the match completely upside down.",
          cinematicSubtitle: "DEBATE ERUPTS: CAPTAINS & EXPERTS DIVIDED",
          sfxCue: 'crowd_roar + referee_whistle'
        },
        {
          shotNumber: 4,
          timeRange: '16.0s - 23.0s',
          startTimeSeconds: 16.0,
          endTimeSeconds: 23.0,
          cinematicType: 'CINEMATIC_REVEAL',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34380-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=85',
          cameraMovement: 'DUTCH_ANGLE_CUT',
          colorGrade: 'NEON_CYBER_MOOD',
          characterAction: 'Slow motion freeze-frame of the exact frame ball passes outside edge.',
          movieScriptLine: "When the margin is 2 millimeters, technology becomes the referee.",
          cinematicSubtitle: "2 MILLIMETER MARGIN • THE CALL STANDS NOT OUT",
          sfxCue: 'dramatic_boom'
        },
        {
          shotNumber: 5,
          timeRange: '23.0s - 30.0s',
          startTimeSeconds: 23.0,
          endTimeSeconds: 30.0,
          cinematicType: 'EPIC_OUTRO',
          videoClipUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42861-large.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&q=85',
          cameraMovement: 'AERIAL_SWEEP',
          colorGrade: 'TEAL_AND_ORANGE',
          characterAction: 'Night stadium skyline as floodlights shine into night sky.',
          movieScriptLine: "Was that out or not out? Tell me your verdict in the comments below.",
          cinematicSubtitle: "WAS THAT OUT OR NOT OUT? DROP YOUR VERDICT 👇",
          sfxCue: 'stadium_swell + fade_out'
        }
      ]
    };
  }
}
