/**
 * CHATR Multi-Lingual Natural Language Understanding Engine (Gate 7)
 * Parses household intents, entities, sources, destinations, and deictic references
 * across English, Hindi, Urdu, Punjabi, Bengali, Tamil, and Telugu.
 */

import { HighLevelIntent, IndianLanguage, StructuredRobotTask } from '../types';
import { HouseholdCategory } from '../../../robot-perception/src/types';
import { LanguageIdentifier } from './languageIdentifier';

export class MultilingualNlu {
  /**
   * Deterministically parses a multi-lingual user prompt into a structured robot task.
   */
  public static parsePrompt(promptText: string): StructuredRobotTask {
    const langInfo = LanguageIdentifier.identifyLanguage(promptText);
    const lower = promptText.toLowerCase().trim();

    const intent = this.extractIntent(lower);
    const category = this.extractCategory(lower);
    const source = this.extractSource(lower);
    const destination = this.extractDestination(lower);
    const isAmbiguous = this.checkAmbiguity(lower);

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      taskId,
      intent,
      targetCategory: category,
      sourceLocation: source,
      destinationLocation: destination,
      parameters: { rawText: promptText },
      rawUserPrompt: promptText,
      detectedLanguage: langInfo.language,
      isAmbiguousReference: isAmbiguous,
    };
  }

  private static extractIntent(text: string): HighLevelIntent {
    if (/\b(stop|ruk|ruko|rok|thaher|aagu|niru|tham|emergency)\b/i.test(text) || text.includes('रुको') || text.includes('روکو') || text.includes('ਰੁਕੋ') || text.includes('থামো') || text.includes('நில்') || text.includes('ఆగండి')) {
      return 'EMERGENCY_STOP';
    }

    if (
      /\b(bring|fetch|get|le aao|laao|lao|lai ke aao|niye esho|eduthu vaa|theesukurandi|thanni|paani|bottle)\b/i.test(text) ||
      text.includes('ले आओ') || text.includes('لے آؤ') || text.includes('ਲੈ ਕੇ ਆਓ') || text.includes('নিয়ে এসো') || text.includes('எடுத்து வாருங்கள்') || text.includes('తీసుకురండి') ||
      /eduthu/i.test(text) || /theesuku/i.test(text) || /niye/i.test(text)
    ) {
      return 'FETCH_OBJECT';
    }

    if (/\b(clean|wipe|saf|saaf|safai|thudai|shuddho)\b/i.test(text) || text.includes('साफ') || text.includes('صاف') || text.includes('ਸਾਫ਼')) {
      return 'CLEAN_SURFACE';
    }

    if (/\b(patrol|check|dekho|dekh|chakkar|round)\b/i.test(text) || text.includes('देखो') || text.includes('دیکھو')) {
      return 'PATROL_ROOM';
    }

    if (/\b(status|battery|kahan ho|where|batao|state)\b/i.test(text) || text.includes('स्थिति') || text.includes('حال')) {
      return 'STATUS_QUERY';
    }

    return 'UNKNOWN';
  }

  private static extractCategory(text: string): HouseholdCategory | 'unknown' {
    if (
      /\b(bottle|botal|paani|pani|water|joler|thanneer|neella)\b/i.test(text) ||
      text.includes('बोतल') || text.includes('पानी') || text.includes('بوتل') || text.includes('پانی') ||
      text.includes('ਬੋਤਲ') || text.includes('ਪਾਣੀ') || text.includes('বোতল') || text.includes('জল') ||
      text.includes('பாட்டில்') || text.includes('தண்ணீர்') || text.includes('బాటిల్') || text.includes('నీళ్లు') ||
      /thanneer/i.test(text) || /neella/i.test(text) || /joler/i.test(text)
    ) {
      return 'bottle';
    }

    if (/\b(cup|chai|tea|mug|kappu)\b/i.test(text) || text.includes('कप') || text.includes('چائے')) {
      return 'cup';
    }

    if (/\b(plate|thali|tattu)\b/i.test(text) || text.includes('थाली') || text.includes('प्लेट')) {
      return 'plate';
    }

    if (/\b(medicine|dawa|davai|marunthu|mandulu)\b/i.test(text) || text.includes('दवा') || text.includes('دوائی')) {
      return 'medicine';
    }

    if (/\b(phone|mobile)\b/i.test(text) || text.includes('फ़ोन')) {
      return 'phone';
    }

    return 'unknown';
  }

  private static extractSource(text: string): string {
    if (
      /\b(kitchen|rasoi|bawarchikhana|rannaghor|vantagadi)\b/i.test(text) ||
      text.includes('किचन') || text.includes('रसोई') || text.includes('باورچی خانہ') ||
      text.includes('ਰਸੋਈ') || text.includes('রান্নাঘর') || text.includes('சமையலறை') || text.includes('వంటగది') ||
      /samaiyalari/i.test(text) || /vantagadi/i.test(text) || /rannaghor/i.test(text)
    ) {
      return 'kitchen';
    }

    if (/\b(living room|hall|baithak)\b/i.test(text) || text.includes('हॉल') || text.includes('بیٹھک')) {
      return 'living_room';
    }

    if (/\b(bedroom|kamra|kamre)\b/i.test(text) || text.includes('कमरा') || text.includes('کمرہ')) {
      return 'bedroom';
    }

    return 'current_room';
  }

  private static extractDestination(text: string): string {
    if (/\b(me|mere paas|user|mujhe|enaku|naaku|amake)\b/i.test(text) || text.includes('मुझे') || text.includes('مجھے') || text.includes('ਮੈਨੂੰ') || text.includes('আমাকে') || text.includes('எனக்கு') || text.includes('నాకు')) {
      return 'user';
    }

    if (/\b(table|desk|counter)\b/i.test(text) || text.includes('मेज़') || text.includes('میز')) {
      return 'dining_table';
    }

    return 'user';
  }

  private static checkAmbiguity(text: string): boolean {
    if (
      /\b(woh|yeh|wali|wala|that|this|that one|this one|yahan|wahan|adhu|andha|adhi|aa)\b/i.test(text) ||
      text.includes('वो वाली') || text.includes('यह वाली') || text.includes('وہ والی') ||
      text.includes('ਉਹ ਵਾਲੀ') || text.includes('ওটা') || text.includes('அது') || text.includes('అది')
    ) {
      return true;
    }
    return false;
  }
}
