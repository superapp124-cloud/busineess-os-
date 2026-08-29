/**
 * CHATR Media Agency — "बारिश आई रे" (Baarish Aayi Re)
 * Official Monsoon Anthem & Viral Music Video Engine
 * 
 * Tempo: 105 BPM
 * Genre: Modern Hindi Pop / Romantic Monsoon Anthem
 */

export interface SongSection {
  id: string;
  type: 'intro' | 'verse1' | 'pre_chorus' | 'chorus' | 'verse2' | 'bridge' | 'final_chorus' | 'outro';
  title: string;
  durationSec: number;
  lyricsHindi: string[];
  lyricsHinglish: string;
  visualScene: string;
  cameraMovement: string;
  energyLevel: 'low' | 'medium' | 'high' | 'peak';
  chordRootFreq: number; // Hz for Web Audio synthesis
}

export const BAARISH_AAYI_RE_SONG: SongSection[] = [
  {
    id: 'intro',
    type: 'intro',
    title: '🎤 Intro — Thunder & Rain Buildup',
    durationSec: 8,
    lyricsHindi: [
      'ओ रे बादल, धीरे आना,',
      'दिल को मेरा फिर न सताना,',
      'शहर की गलियों में आज,',
      'कुछ तो है होने वाला...'
    ],
    lyricsHinglish: 'O re baadal, dheere aana... dil ko mera phir na sataana...',
    visualScene: 'Dark monsoon clouds rolling over city skyline, raindrops hitting street lamps',
    cameraMovement: 'Cinematic tilt-down from clouds to wet reflective asphalt road',
    energyLevel: 'low',
    chordRootFreq: 220.0 // A3
  },
  {
    id: 'verse1',
    type: 'verse1',
    title: '🎶 Verse 1 — City in Rain & Chai Aroma',
    durationSec: 14,
    lyricsHindi: [
      'काली घटा ने घेरा है,',
      'सड़कों पे पानी ठहरा है,',
      'भीगी-भीगी इन राहों में,',
      'शहर भी आज सुनहरा है।',
      'छतों से बूंदें गिरती हैं,',
      'खिड़की पे यादें मिलती हैं,',
      'भागती दुनिया रुक-सी गई,',
      'धड़कन कुछ-कुछ कहती है।'
    ],
    lyricsHinglish: 'Kaali ghata ne ghera hai, sadkon pe paani thehra hai...',
    visualScene: 'Steaming glass of cutting chai at roadside tea stall, couple looking out wet glass window',
    cameraMovement: 'Smooth tracking shot along rain-soaked cafe window',
    energyLevel: 'medium',
    chordRootFreq: 261.63 // C4
  },
  {
    id: 'pre_chorus',
    type: 'pre_chorus',
    title: '🔥 Pre-Chorus — Rhythm Buildup (105 BPM)',
    durationSec: 10,
    lyricsHindi: [
      'चल ज़रा, रुक जा ज़रा,',
      'इस मौसम को जी ले ज़रा,',
      'कल की किसने देखी है,',
      'आज दिल की सुन ले ज़रा।'
    ],
    lyricsHinglish: 'Chal zara, ruk ja zara, is mausam ko jee le zara...',
    visualScene: 'Young girl twirling with yellow umbrella in pouring rain, splashing water playfully',
    cameraMovement: 'Dynamic low-angle rotating orbit camera with water splash droplets',
    energyLevel: 'high',
    chordRootFreq: 293.66 // D4
  },
  {
    id: 'chorus',
    type: 'chorus',
    title: '🚀 CHORUS — Catchy Viral Hook (Peak Energy)',
    durationSec: 18,
    lyricsHindi: [
      'बारिश आई रे, बारिश आई रे,',
      'दिल की गली में धूम मचाई रे!',
      'भीगते रास्ते, भीगे सपने,',
      'तेरी मेरी यादें लाई रे!',
      'ओ हो हो... बारिश आई रे!',
      'ओ हो हो... दिल मुस्काई रे!',
      'जो बात थी दिल में छुपाई,',
      'आज हवा ने वो बात बताई रे!'
    ],
    lyricsHinglish: 'BAARISH AAYI RE, BAARISH AAYI RE! Dil ki gali mein dhoom machayi re!',
    visualScene: 'High-energy monsoon street celebration, neon reflections dancing in puddle waves, smiling faces',
    cameraMovement: 'Fast push-in zoom with rhythmic beat drops and kinetic neon particles',
    energyLevel: 'peak',
    chordRootFreq: 329.63 // E4
  },
  {
    id: 'bridge',
    type: 'bridge',
    title: '🎵 Bridge — Emotional Romantic Melodrama',
    durationSec: 14,
    lyricsHindi: [
      'कल तक जो था दूर कहीं,',
      'आज वही एहसास है,',
      'बूंदों में कोई नाम तेरा,',
      'हवा में तेरी सांस है।',
      'रास्ते चाहे रुक जाएँ,',
      'दिल कहाँ रुकता है,',
      'इश्क़ अगर सच्चा हो तो,',
      'मौसम भी झुकता है।'
    ],
    lyricsHinglish: 'Kal tak jo tha door kahin, aaj wahi ehsaas hai...',
    visualScene: 'Slow-motion raindrops falling between two lovers gazing at each other under yellow street lamp',
    cameraMovement: 'Cinematic 120 FPS slow motion close-up on emotional eyes with rain reflections',
    energyLevel: 'medium',
    chordRootFreq: 220.0 // A3
  },
  {
    id: 'final_chorus',
    type: 'final_chorus',
    title: '💥 Final Chorus — Grand Climax & Finale',
    durationSec: 16,
    lyricsHindi: [
      'बारिश आई रे, बारिश आई रे,',
      'दिल की गली में धूम मचाई रे!',
      'भीगते रास्ते, भीगे सपने,',
      'तेरी मेरी यादें लाई रे!',
      'बारिश आई रे... दिल मुस्काई रे...',
      'सारी दुनिया छोड़ के आज,',
      'बस तू मेरी तरफ आई रे!'
    ],
    lyricsHinglish: 'Saari duniya chhod ke aaj, bas tu meri taraf aayi re!',
    visualScene: 'Golden hour monsoon sunset breakthrough, vibrant rainbow arching over city in rain',
    cameraMovement: 'Wide crane sweep rising above city rooftops with golden sun rays and rain glow',
    energyLevel: 'peak',
    chordRootFreq: 329.63 // E4
  },
  {
    id: 'outro',
    type: 'outro',
    title: '🎤 Outro — Gentle Rain Fadeout',
    durationSec: 10,
    lyricsHindi: [
      'ओ रे बादल, धीरे जाना...',
      'ये पल फिर ना आना...',
      'बारिश थम भी जाए अगर,',
      'दिल में मौसम रह जाना...',
      'बारिश आई रे... बारिश आई रे... 🌧️🎶'
    ],
    lyricsHinglish: 'O re baadal, dheere jaana... ye pal phir na aana...',
    visualScene: 'Calm water ripples settling, steam rising from asphalt, lone umbrella walking into distance',
    cameraMovement: 'Slow pull-back fade to black with lingering rain droplets',
    energyLevel: 'low',
    chordRootFreq: 196.0 // G3
  }
];
