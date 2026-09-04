/**
 * CHATR-Meera Local Ollama NLU & Intent Dispatcher
 * Directly communicates with Local Ollama AI (http://localhost:11434) with zero cloud dependencies.
 * Fallback to high-speed deterministic local multilingual parser if Ollama daemon is offline.
 */

export interface ParsedRobotIntent {
  intent: 'FETCH_OBJECT' | 'WAVE' | 'STAND' | 'WALK' | 'DANCE' | 'PUSH_TEST' | 'STATUS_CHECK' | 'GREETING' | 'UNKNOWN';
  targetObject?: string;
  sourceLocation?: string;
  targetLocation?: string;
  confidence: number;
  speechReply: {
    hi: string;
    en: string;
    ur: string;
    pa: string;
    bn: string;
    ta: string;
    te: string;
  };
}

class OllamaNluEngine {
  private ollamaUrl = 'http://localhost:11434/api/generate';
  private modelName = 'llama3';

  /**
   * Parses natural language command in Hindi, Hinglish, English, Urdu, Punjabi, etc.
   */
  public async parseCommand(text: string, lang = 'hi-IN'): Promise<ParsedRobotIntent> {
    const raw = text.trim();
    if (!raw) {
      return this.fallbackParse(raw);
    }

    try {
      const prompt = `You are Meera, an AI humanoid robot assistant running on CHATR RobotOS.
Classify the user command into one intent: FETCH_OBJECT, WAVE, STAND, WALK, DANCE, PUSH_TEST, STATUS_CHECK, GREETING, UNKNOWN.
Command: "${raw}"
Respond ONLY in JSON format:
{
  "intent": "FETCH_OBJECT" | "WAVE" | "STAND" | "WALK" | "DANCE" | "PUSH_TEST" | "STATUS_CHECK" | "GREETING" | "UNKNOWN",
  "targetObject": "water_bottle_01" or null,
  "sourceLocation": "kitchen" or null,
  "speechReplyHi": "Short reply in Hindi/Hinglish",
  "speechReplyEn": "Short reply in English"
}`;

      const res = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          stream: false,
          format: 'json',
        }),
        signal: AbortSignal.timeout(1800), // 1.8s timeout for local responsiveness
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.response);
        return {
          intent: parsed.intent || 'UNKNOWN',
          targetObject: parsed.targetObject || 'water_bottle_01',
          sourceLocation: parsed.sourceLocation || 'kitchen',
          confidence: 0.95,
          speechReply: {
            hi: parsed.speechReplyHi || 'Theek hai, main is task ko execute kar rahi hoon.',
            en: parsed.speechReplyEn || 'Executing your command now.',
            ur: 'Theek hai, main is par amal kar rahi hoon.',
            pa: 'Theek hai, main kamm shuru kar rahi haan.',
            bn: 'Thik ache, ami kajti shuru korchi.',
            ta: 'Sari, naan ippodhu seigiren.',
            te: 'Sare, nenu chestunnanu.',
          },
        };
      }
    } catch {
      // Ollama daemon not running or timed out -> use instant deterministic local parser
    }

    return this.fallbackParse(raw);
  }

  /**
   * Deterministic local multilingual NLU parser (100% offline, zero cloud).
   */
  private fallbackParse(text: string): ParsedRobotIntent {
    const lower = text.toLowerCase();

    // 1. Fetch Object / Water Bottle
    if (
      lower.includes('paani') ||
      lower.includes('pani') ||
      lower.includes('bottle') ||
      lower.includes('water') ||
      lower.includes('kitchen') ||
      lower.includes('lao') ||
      lower.includes('le aao') ||
      lower.includes('fetch') ||
      lower.includes('bring') ||
      lower.includes('botal')
    ) {
      return {
        intent: 'FETCH_OBJECT',
        targetObject: 'water_bottle_01',
        sourceLocation: 'kitchen',
        targetLocation: 'user',
        confidence: 0.98,
        speechReply: {
          hi: 'Theek hai, main kitchen se paani ki bottle lekar aapke paas aa rahi hoon.',
          en: 'Understood. Fetching the water bottle from the kitchen counter now.',
          ur: 'Theek hai, main kitchen se paani ki bottle le kar aapke paas aa rahi hoon.',
          pa: 'Theek hai ji, main kitchen ton paani di botal lai ke aundi haan.',
          bn: 'Thik ache, ami kitchen theke joler bottle niye aschi.',
          ta: 'Sari, naan samayal araiyilirundhu thanneer bottle kondu varugiren.',
          te: 'Sare, nenu kitchen nundi neeti bottle teesukostanu.',
        },
      };
    }

    // 2. Wave Hello / Namaste
    if (
      lower.includes('wave') ||
      lower.includes('hello') ||
      lower.includes('namaste') ||
      lower.includes('hi') ||
      lower.includes('greet') ||
      lower.includes('haath') ||
      lower.includes('karo')
    ) {
      return {
        intent: 'WAVE',
        confidence: 0.99,
        speechReply: {
          hi: 'Namaste! Main Meera hoon, CHATR humanoid assistant.',
          en: 'Hello! I am Meera, your CHATR humanoid assistant.',
          ur: 'Namaste! Main Meera hoon, aapki madadgar.',
          pa: 'Sat Sri Akal! Main Meera haan.',
          bn: 'Nomoshkar! Ami Meera.',
          ta: 'Vanakkam! Naan Meera.',
          te: 'Namaskaram! Nenu Meera.',
        },
      };
    }

    // 3. Stand / Balance
    if (
      lower.includes('stand') ||
      lower.includes('khadi') ||
      lower.includes('balance') ||
      lower.includes('reset') ||
      lower.includes('sidhi') ||
      lower.includes('uth')
    ) {
      return {
        intent: 'STAND',
        confidence: 0.96,
        speechReply: {
          hi: 'Main nominal balance pose mein khadi ho gayi hoon.',
          en: 'Standing stably in nominal balance configuration.',
          ur: 'Main nominal balance pose mein khadi ho gayi hoon.',
          pa: 'Main theek tarah naal khadi ho gayi haan.',
          bn: 'Ami balance niye daralam.',
          ta: 'Naan nilaiyaaga nirkiren.',
          te: 'Nenu sthiramga nilabaddanu.',
        },
      };
    }

    // 4. Walk / Locomotion
    if (
      lower.includes('walk') ||
      lower.includes('chalo') ||
      lower.includes('aage') ||
      lower.includes('move') ||
      lower.includes('badho')
    ) {
      return {
        intent: 'WALK',
        confidence: 0.95,
        speechReply: {
          hi: 'Main aage badh rahi hoon.',
          en: 'Starting locomotion now.',
          ur: 'Main aage barh rahi hoon.',
          pa: 'Main agge vadh rahi haan.',
          bn: 'Ami samne eguchi.',
          ta: 'Naan munnokki selgiren.',
          te: 'Nenu munduku veltunnanu.',
        },
      };
    }

    // 5. Dance / Emote
    if (
      lower.includes('dance') ||
      lower.includes('nacho') ||
      lower.includes('gaana') ||
      lower.includes('celebrate')
    ) {
      return {
        intent: 'DANCE',
        confidence: 0.95,
        speechReply: {
          hi: 'Chal yaar, dance karte hain! 🎶',
          en: 'Starting celebratory dance routine!',
          ur: 'Chalein dance karte hain!',
          pa: 'Chalo bhangra paaunde haan!',
          bn: 'Cholo dance kori!',
          ta: 'Vaanga naadagam aaduvoam!',
          te: 'Randu dance cheddam!',
        },
      };
    }

    // 6. Test Push
    if (lower.includes('push') || lower.includes('dhakka') || lower.includes('test')) {
      return {
        intent: 'PUSH_TEST',
        confidence: 0.94,
        speechReply: {
          hi: 'Savdhaan! External disturbance inject hui hai.',
          en: 'External push disturbance injected in physics simulator.',
          ur: 'Khabardaar! External disturbance detect hui.',
          pa: 'Dhyan naal! External push laggi hai.',
          bn: 'Sabdhan! Disturbance detect hoyeche.',
          ta: 'Echarikkai! Disturbance erpatullathu.',
          te: 'Jagratha! Disturbance vachindi.',
        },
      };
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.5,
      speechReply: {
        hi: 'Ji, main is task ko execute kar rahi hoon.',
        en: 'Understood. Processing your command in RobotOS.',
        ur: 'Ji, main is par kaam kar rahi hoon.',
        pa: 'Ji, main kamm kar rahi haan.',
        bn: 'Ami bujhte perechi, kajti korchi.',
        ta: 'Purindhadhu, velai seigiren.',
        te: 'Arthamayindi, panichestunnanu.',
      },
    };
  }
}

export const ollamaNlu = new OllamaNluEngine();
