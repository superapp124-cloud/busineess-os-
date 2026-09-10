/**
 * CHATR-Meera In-House Ollama AI Service
 * Integrates local in-house trained models (chatr:meera-latest, chatr:base-system)
 * for advanced natural language reasoning, task planning, and humanoid dialogue.
 */

export interface MeeraPlanResult {
  action: 'wave_walk_pick' | 'wave' | 'walk' | 'grasp_bottle' | 'stand' | 'test_push' | 'stop' | 'status' | 'chat';
  taskTitle: string;
  category: string;
  speechResponse: string;
  steps: Array<{ num: number; label: string; durationMs: number }>;
  modelUsed: string;
  latencyMs: number;
}

const SYSTEM_PROMPT = `You are MEERA (CHATR-H170), an autonomous humanoid AI assistant operating inside CHATR RobotOS with 28 DOF MuJoCo physics.
Your capabilities:
1. "wave_walk_pick": Multi-step mission where you wave hello, walk to kitchen counter, and pick up the water bottle.
2. "wave": Friendly greeting wave with right arm.
3. "walk": Bipedal locomotion walking towards target location.
4. "grasp_bottle": Grasping and lifting water bottle with 14.2N force.
5. "stand": Stabilizing in nominal balance standing posture.
6. "test_push": Demonstrating 450N external disturbance recovery.
7. "stop": Emergency stop / braking.
8. "status": System diagnostics, battery, motors, and telemetry.
9. "chat": General friendly conversation.

Respond ALWAYS in valid JSON with this exact format:
{
  "action": "wave_walk_pick" | "wave" | "walk" | "grasp_bottle" | "stand" | "test_push" | "stop" | "status" | "chat",
  "taskTitle": "SHORT_MISSION_NAME",
  "category": "MANIPULATION" | "NAVIGATION" | "INTERACTION" | "SAFETY" | "DIAGNOSTICS",
  "speechResponse": "Natural spoken reply in the user's language (Hindi/Hinglish/English)",
  "steps": [
    {"num": 1, "label": "Step description", "durationMs": 600}
  ]
}`;

class MeeraOllamaServiceImpl {
  private isOnline = false;
  private activeModel = 'chatr:meera-latest';
  private checked = false;

  constructor() {
    this.checkStatus();
  }

  public async checkStatus(): Promise<boolean> {
    try {
      const endpoints = ['/ollama-proxy/api/tags', 'http://localhost:11434/api/tags'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { signal: AbortSignal.timeout(2000) });
          if (res.ok) {
            const data = await res.json();
            const models = (data.models ?? []).map((m: any) => m.name as string);
            if (models.some((m) => m.includes('chatr:meera'))) {
              this.activeModel = 'chatr:meera-latest';
            } else if (models.some((m) => m.includes('qwen2.5'))) {
              this.activeModel = models.find((m) => m.includes('qwen2.5')) || 'qwen2.5:7b-instruct';
            } else if (models.length > 0) {
              this.activeModel = models[0];
            }
            this.isOnline = true;
            this.checked = true;
            return true;
          }
        } catch {
          // try next endpoint
        }
      }
      this.isOnline = false;
      this.checked = true;
      return false;
    } catch {
      this.isOnline = false;
      this.checked = true;
      return false;
    }
  }

  public getStatus(): { isOnline: boolean; model: string } {
    return { isOnline: this.isOnline, model: this.activeModel };
  }

  public async planAndRespond(rawCommand: string, lang = 'hi-IN'): Promise<MeeraPlanResult | null> {
    const t0 = performance.now();
    const cmd = rawCommand.trim();
    if (!cmd) return null;

    if (!this.checked) {
      await this.checkStatus();
    }

    if (!this.isOnline) {
      return null; // fallback to fast rule engine
    }

    try {
      const endpoints = ['/ollama-proxy/api/generate', 'http://localhost:11434/api/generate'];
      let res: Response | null = null;

      for (const ep of endpoints) {
        try {
          res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.activeModel,
              system: SYSTEM_PROMPT,
              prompt: `User Command: "${cmd}". Preferred Language: ${lang}. Generate structured JSON response.`,
              stream: false,
              format: 'json',
              options: {
                temperature: 0.3,
                num_predict: 350,
              },
            }),
            signal: AbortSignal.timeout(3500),
          });
          if (res && res.ok) break;
        } catch {
          // continue to next endpoint
        }
      }

      if (!res || !res.ok) {
        return null;
      }

      const data = await res.json();
      const rawText = data.response ?? '';
      const parsed = JSON.parse(rawText);
      const elapsed = Math.round(performance.now() - t0);

      return {
        action: parsed.action || 'chat',
        taskTitle: parsed.taskTitle || `TASK (${cmd.slice(0, 20)})`,
        category: parsed.category || 'AUTONOMOUS',
        speechResponse: parsed.speechResponse || `Ji, main "${cmd}" command ko process kar rahi hoon.`,
        steps: Array.isArray(parsed.steps) && parsed.steps.length > 0
          ? parsed.steps
          : [
              { num: 1, label: `Parse command with ${this.activeModel}`, durationMs: 400 },
              { num: 2, label: 'Coordinate kinematics and balance', durationMs: 600 },
              { num: 3, label: 'Execute motion in MuJoCo physics twin', durationMs: 1000 },
              { num: 4, label: 'Task completed successfully', durationMs: 500 },
            ],
        modelUsed: this.activeModel,
        latencyMs: elapsed,
      };
    } catch (e) {
      console.warn('[MeeraOllamaService] Ollama query fallback:', e);
      return null;
    }
  }
}

export const MeeraOllamaService = new MeeraOllamaServiceImpl();
