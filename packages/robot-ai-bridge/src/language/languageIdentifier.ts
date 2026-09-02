/**
 * CHATR 7-Language Identifier & Script Analyzer (Gate 7)
 * Detects English, Hindi, Urdu, Punjabi, Bengali, Tamil, and Telugu in both native scripts and Romanized transliterations.
 */

import { IndianLanguage, LanguageDetectionResult } from '../types';

export class LanguageIdentifier {
  public static identifyLanguage(rawText: string): LanguageDetectionResult {
    const text = rawText.trim();
    if (!text) {
      return { language: 'en', confidence: 1.0, isTransliteratedRoman: false, normalizedText: '' };
    }

    // 1. Check Native Script Unicode Blocks (Distinct alphabets first)
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return { language: 'pa', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }
    if (/[\u0600-\u06FF]/.test(text)) {
      return { language: 'ur', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }
    if (/[\u0980-\u09FF]/.test(text)) {
      return { language: 'bn', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return { language: 'ta', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return { language: 'te', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }
    // Hindi / Devanagari alphabets (excluding shared danda \u0964)
    if (/[\u0901-\u0963\u0966-\u097F]/.test(text)) {
      return { language: 'hi', confidence: 0.98, isTransliteratedRoman: false, normalizedText: text };
    }

    // 2. Romanized / Transliterated Vocabulary Matching
    const lower = text.toLowerCase();

    const hindiMatches = (lower.match(/\b(paani|pani|ki|se|lao|le aao|laao|rakh|rakho|karo|batao|chalo|yahan|wahan|woh|yeh|wali|wala|kamra|rasoi|mere|paas|mujhe)\b/g) || []).length;
    const urduMatches = (lower.match(/\b(shukriya|madad|kariye|tashreef|kamray|janab|mehrbani|bawarchikhana|bawarchi|baraye|botal)\b/g) || []).length;
    const punjabiMatches = (lower.match(/\b(di|lai ke aao|chakk|kithe|ethe|othe|kamre ch|tussi|kardo|saada)\b/g) || []).length;
    const bengaliMatches = (lower.match(/\b(joler|jol|rannaghor|niye|esho|dekhao|kothay|akhon|amake)\b/g) || []).length;
    const tamilMatches = (lower.match(/\b(thanneer|eduthu|vaarungal|samaiyalari|samaiyalariyilirundhu|enge|vaanga|enaku)\b/g) || []).length;
    const teluguMatches = (lower.match(/\b(neella|theesukurandi|vantagadi|ekkada|randi|naaku|nundi)\b/g) || []).length;

    const scores: Record<IndianLanguage, number> = {
      en: 1,
      hi: hindiMatches * 2.0,
      ur: urduMatches * 4.0,
      pa: punjabiMatches * 3.5,
      bn: bengaliMatches * 3.5,
      ta: tamilMatches * 3.5,
      te: teluguMatches * 3.5,
    };

    let maxLang: IndianLanguage = 'en';
    let maxScore = scores.en;

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxLang = lang as IndianLanguage;
      }
    }

    const isRoman = maxLang !== 'en';

    return {
      language: maxLang,
      confidence: maxScore > 1 ? 0.95 : 0.85,
      isTransliteratedRoman: isRoman,
      normalizedText: text,
    };
  }
}
