/**
 * CHATR Operational AI Explainer (Gate 7)
 * Generates transparent, natural language explanations of the robot's intended actions
 * and failure causes in the user's native language.
 */

import { IndianLanguage, StructuredRobotTask, TaskValidationStatus } from '../types';

export class OperationalAiExplainer {
  /**
   * Generates a natural language explanation of the plan in the requested language.
   */
  public static explainTaskPlan(
    task: StructuredRobotTask,
    validationStatus: TaskValidationStatus,
    targetObjectId?: string
  ): string {
    const lang = task.detectedLanguage;

    if (validationStatus !== 'VALID_AND_EXECUTABLE') {
      return this.explainRejection(task, validationStatus, lang);
    }

    switch (lang) {
      case 'hi':
        return `मैं ${this.translateLocation(task.sourceLocation, 'hi')} से आपके लिए ${this.translateCategory(task.targetCategory, 'hi')} लाने जा रहा हूँ।`;
      case 'ur':
        return `میں ${this.translateLocation(task.sourceLocation, 'ur')} سے آپ کے لیے ${this.translateCategory(task.targetCategory, 'ur')} لانے جا رہا ہوں۔`;
      case 'pa':
        return `ਮੈਂ ${this.translateLocation(task.sourceLocation, 'pa')} ਤੋਂ ਤੁਹਾਡੇ ਲਈ ${this.translateCategory(task.targetCategory, 'pa')} ਲੈ ਕੇ ਆ ਰਿਹਾ ਹਾਂ।`;
      case 'bn':
        return `আমি ${this.translateLocation(task.sourceLocation, 'bn')} থেকে আপনার জন্য ${this.translateCategory(task.targetCategory, 'bn')} নিয়ে আসছি।`;
      case 'ta':
        return `நான் ${this.translateLocation(task.sourceLocation, 'ta')} இருந்து உங்களுக்காக ${this.translateCategory(task.targetCategory, 'ta')} எடுத்து வருகிறேன்.`;
      case 'te':
        return `నేను ${this.translateLocation(task.sourceLocation, 'te')} నుండి మీ కోసం ${this.translateCategory(task.targetCategory, 'te')} తీసుకువస్తున్నాను.`;
      case 'en':
      default:
        return `I am fetching the ${task.targetCategory} from the ${task.sourceLocation} for you.`;
    }
  }

  private static explainRejection(task: StructuredRobotTask, status: TaskValidationStatus, lang: IndianLanguage): string {
    switch (lang) {
      case 'hi':
        if (status === 'BLOCKED_BATTERY_LOW') return 'बैटरी कम है (15% से कम)। कृपया रोबोट को चार्ज करें।';
        if (status === 'BLOCKED_OBJECT_NOT_FOUND') return 'वस्तु कमरे में नहीं मिल सकी।';
        return 'कार्य निष्पादित नहीं किया जा सका।';
      case 'ur':
        if (status === 'BLOCKED_BATTERY_LOW') return 'بیٹری کم ہے (15% سے کم)۔ براہ کرم روبوٹ کو چارج کریں۔';
        return 'کام مکمل نہیں کیا جا سکا۔';
      case 'pa':
        if (status === 'BLOCKED_BATTERY_LOW') return 'ਬੈਟਰੀ ਘੱਟ ਹੈ (15% ਤੋਂ ਘੱਟ)। ਕਿਰਪਾ ਕਰਕੇ ਰੋਬੋਟ ਨੂੰ ਚਾਰਜ ਕਰੋ।';
        return 'ਕੰਮ ਪੂਰਾ ਨਹੀਂ ਹੋ ਸਕਿਆ।';
      case 'bn':
        if (status === 'BLOCKED_BATTERY_LOW') return 'ব্যাটারি কম (15% এর কম)। অনুগ্রহ করে রোবট চার্জ করুন।';
        return 'কাজ সম্পন্ন করা যায়নি।';
      case 'ta':
        if (status === 'BLOCKED_BATTERY_LOW') return 'பேட்டரி குறைவாக உள்ளது (15% க்கும் குறைவு).';
        return 'பணியை முடிக்க முடியவில்லை.';
      case 'te':
        if (status === 'BLOCKED_BATTERY_LOW') return 'బ్యాటరీ తక్కువగా ఉంది (15% కంటే తక్కువ).';
        return 'పని పూర్తి కాలేదు.';
      case 'en':
      default:
        if (status === 'BLOCKED_BATTERY_LOW') return 'Battery level is low (<15%). Please dock robot to recharge.';
        if (status === 'BLOCKED_OBJECT_NOT_FOUND') return 'Target object could not be found in active world model.';
        return 'Task could not be approved for execution.';
    }
  }

  private static translateCategory(cat: string, lang: IndianLanguage): string {
    const dict: Record<string, Record<IndianLanguage, string>> = {
      bottle: { hi: 'पानी की बोतल', ur: 'پانی کی بوتل', pa: 'ਪਾਣੀ ਦੀ ਬੋਤਲ', bn: 'জলের বোতল', ta: 'தண்ணீர் பாட்டில்', te: 'నీళ్ల బాటిల్', en: 'water bottle' },
      cup: { hi: 'कप', ur: 'کپ', pa: 'ਕੱਪ', bn: 'কাপ', ta: 'கப்', te: 'కప్పు', en: 'cup' },
      medicine: { hi: 'दवा', ur: 'دوائی', pa: 'ਦਵਾਈ', bn: 'ওষুধ', ta: 'மருந்து', te: 'మందులు', en: 'medicine' },
      plate: { hi: 'थाली', ur: 'پلیٹ', pa: 'ਥਾਲੀ', bn: 'থালা', ta: 'தட்டு', te: 'ప్లేట్', en: 'plate' },
      phone: { hi: 'फ़ोन', ur: 'فون', pa: 'ਫੋਨ', bn: 'ফোন', ta: 'போன்', te: 'ఫోన్', en: 'phone' },
    };
    return dict[cat]?.[lang] ?? cat;
  }

  private static translateLocation(loc: string, lang: IndianLanguage): string {
    const dict: Record<string, Record<IndianLanguage, string>> = {
      kitchen: { hi: 'रसोई', ur: 'باورچی خانہ', pa: 'ਰਸੋਈ', bn: 'রান্নাঘর', ta: 'சமையலறை', te: 'వంటగది', en: 'kitchen' },
      living_room: { hi: 'लिविंग रूम', ur: 'بیٹھک', pa: 'ਲਿਵਿੰਗ ਰੂਮ', bn: 'লিভিং রুম', ta: 'வரவேற்பறை', te: 'లివింగ్ రూమ్', en: 'living room' },
      bedroom: { hi: 'कमरे', ur: 'کمرے', pa: 'ਕਮਰੇ', bn: 'শোবার ঘর', ta: 'படுக்கையறை', te: 'పడకగది', en: 'bedroom' },
    };
    return dict[loc]?.[lang] ?? loc;
  }
}
