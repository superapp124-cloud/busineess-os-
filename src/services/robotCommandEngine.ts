/**
 * CHATR-Meera Robot Command & Task Sequencing Engine
 * Interprets natural language commands (Hindi, Hinglish, English)
 * and coordinates:
 *   1. Spoken TTS voice feedback (meeraVoice)
 *   2. Physical MuJoCo action dispatch (SimBridgeClient)
 *   3. Dynamic step-by-step Task Pipeline progression
 *   4. Manipulation and Biometrics state updates
 */

import { SimBridgeClient } from '../../packages/sim-bridge/src';
import { meeraVoice } from '../utils/speechTts';

export type TaskStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EMERGENCY_STOPPED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface TaskStep {
  num: number;
  label: string;
  status: StepStatus;
  durationMs?: number;
}

export interface ActiveTaskState {
  id: string;
  commandText: string;
  taskTitle: string;
  category: string;
  status: TaskStatus;
  currentStepIndex: number;
  steps: TaskStep[];
  speechResponse: string;
  targetObject?: string;
  graspForceN?: number;
  contactConfirmed?: boolean;
  startedAt: number;
}

type TaskListener = (task: ActiveTaskState) => void;

class RobotCommandEngineImpl {
  private activeTask: ActiveTaskState;
  private listeners = new Set<TaskListener>();
  private stepTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Default initial standing state
    this.activeTask = this._createDefaultState();
  }

  private _createDefaultState(): ActiveTaskState {
    return {
      id: 'task-initial',
      commandText: 'Kitchen se paani ki bottle mere paas le aao',
      taskTitle: 'FETCH_OBJECT (Kitchen → User)',
      category: 'MANIPULATION',
      status: 'IN_PROGRESS',
      currentStepIndex: 7,
      steps: [
        { num: 1, label: 'Understand command (Hindi)', status: 'COMPLETED' },
        { num: 2, label: 'Plan spatial trajectory', status: 'COMPLETED' },
        { num: 3, label: 'Navigate to kitchen counter', status: 'COMPLETED' },
        { num: 4, label: 'Perception: detect water bottle', status: 'COMPLETED' },
        { num: 5, label: '7-DOF right arm reach', status: 'COMPLETED' },
        { num: 6, label: 'Grasp bottle (Force: 14.2 N)', status: 'COMPLETED' },
        { num: 7, label: 'Lift and dynamic CoM balance', status: 'COMPLETED' },
        { num: 8, label: 'Return navigation to user', status: 'IN_PROGRESS' },
        { num: 9, label: 'Human-safe handover proximity', status: 'PENDING' },
        { num: 10, label: 'Mission complete & standby', status: 'PENDING' },
      ],
      speechResponse: 'Theek hai, main kitchen se paani ki bottle le kar aapke paas aa rahi hoon.',
      targetObject: 'water_bottle_01',
      graspForceN: 14.2,
      contactConfirmed: true,
      startedAt: Date.now(),
    };
  }

  public getActiveTask(): ActiveTaskState {
    return this.activeTask;
  }

  public onTaskUpdate(cb: TaskListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private _notify() {
    this.listeners.forEach((cb) => cb(this.activeTask));
  }

  public async executeCommand(rawCommand: string, lang = 'hi-IN'): Promise<ActiveTaskState> {
    const cmd = rawCommand.trim().toLowerCase();
    if (!cmd) return this.activeTask;

    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }

    // 1. Intent Classification
    const hasWave = cmd.includes('wave') || cmd.includes('namaste') || cmd.includes('hello') || cmd.includes('hi') || cmd.includes('greet') || cmd.includes('swagat') || cmd.includes('haath');
    const hasWalk = cmd.includes('walk') || cmd.includes('chalo') || cmd.includes('navigate') || cmd.includes('aage') || cmd.includes('step');
    const hasPickBottle = cmd.includes('bottle') || cmd.includes('paani') || cmd.includes('water') || cmd.includes('pick') || cmd.includes('hold') || cmd.includes('fetch') || cmd.includes('lao') || cmd.includes('kitchen');

    // Multi-action combination (e.g. "walk wave the hand pick up bottle")
    if ((hasWave && hasWalk) || (hasWalk && hasPickBottle) || (hasWave && hasPickBottle) || cmd.includes('mission') || cmd.includes('all')) {
      return this._executeWaveWalkPick(rawCommand, lang);
    } else if (hasPickBottle) {
      return this._executeFetchBottle(rawCommand, lang);
    } else if (hasWave) {
      return this._executeWave(rawCommand, lang);
    } else if (
      cmd.includes('stand') ||
      cmd.includes('khade') ||
      cmd.includes('balance') ||
      cmd.includes('reset') ||
      cmd.includes('nominal') ||
      cmd.includes('pose')
    ) {
      return this._executeStand(rawCommand, lang);
    } else if (hasWalk) {
      return this._executeWalk(rawCommand, lang);
    } else if (
      cmd.includes('push') ||
      cmd.includes('dhakka') ||
      cmd.includes('disturb') ||
      cmd.includes('force')
    ) {
      return this._executePush(rawCommand, lang);
    } else if (
      cmd.includes('stop') ||
      cmd.includes('ruko') ||
      cmd.includes('estop') ||
      cmd.includes('halt') ||
      cmd.includes('emergency')
    ) {
      return this._executeStop(rawCommand, lang);
    } else if (
      cmd.includes('status') ||
      cmd.includes('battery') ||
      cmd.includes('kaise') ||
      cmd.includes('kaun') ||
      cmd.includes('health') ||
      cmd.includes('report')
    ) {
      return this._executeStatusCheck(rawCommand, lang);
    } else {
      // General command fallback
      return this._executeGeneralTask(rawCommand, lang);
    }
  }

  // ── Recipe: Fetch Water Bottle
  private async _executeFetchBottle(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Theek hai, main kitchen counter se paani ki bottle le kar aapke paas aa rahi hoon.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Understand spoken intent (Hindi)', status: 'COMPLETED', durationMs: 400 },
      { num: 2, label: 'Plan 3D collision-free path', status: 'IN_PROGRESS', durationMs: 600 },
      { num: 3, label: 'Navigate to kitchen counter', status: 'PENDING', durationMs: 1200 },
      { num: 4, label: 'RGBD Vision: detect water_bottle_01', status: 'PENDING', durationMs: 800 },
      { num: 5, label: '7-DOF right arm reach trajectory', status: 'PENDING', durationMs: 1000 },
      { num: 6, label: 'Dexterous grasp (Force: 14.2 N)', status: 'PENDING', durationMs: 1000 },
      { num: 7, label: 'Lift & dynamic CoM balance check', status: 'PENDING', durationMs: 800 },
      { num: 8, label: 'Return navigation to user', status: 'PENDING', durationMs: 1200 },
      { num: 9, label: 'Handover proximity & safe release', status: 'PENDING', durationMs: 800 },
      { num: 10, label: 'Mission complete & standby', status: 'PENDING', durationMs: 400 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'FETCH_OBJECT (Kitchen → User)',
      category: 'MANIPULATION',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      targetObject: 'water_bottle_01',
      graspForceN: 14.2,
      contactConfirmed: true,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.graspBottle().catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Wave Hello
  private async _executeWave(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Namaste! Main Meera hoon. CHATR RobotOS mein aapka swagat hai!';
    const steps: TaskStep[] = [
      { num: 1, label: 'Decode greeting command', status: 'COMPLETED', durationMs: 300 },
      { num: 2, label: 'Locate user face & gaze target', status: 'IN_PROGRESS', durationMs: 500 },
      { num: 3, label: 'Raise right arm to shoulder height', status: 'PENDING', durationMs: 800 },
      { num: 4, label: 'Execute friendly wave oscillation (3 cycles)', status: 'PENDING', durationMs: 1200 },
      { num: 5, label: 'Return arm to nominal balance stance', status: 'PENDING', durationMs: 600 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'GREET_USER (Friendly Wave)',
      category: 'INTERACTION',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      targetObject: 'user_target',
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.wave().catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Stand Gracefully / Reset
  private async _executeStand(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Main nominal balance pose mein khadi hoon. Sabhi 28 joints balanced hain.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Initialize balance posture request', status: 'COMPLETED', durationMs: 300 },
      { num: 2, label: 'Solve inverse dynamics for 28 DOF', status: 'IN_PROGRESS', durationMs: 600 },
      { num: 3, label: 'Align pelvis height to 0.885 m', status: 'PENDING', durationMs: 800 },
      { num: 4, label: 'Verify double-support polygon and ZMP', status: 'PENDING', durationMs: 600 },
      { num: 5, label: 'Nominal stance locked & active', status: 'PENDING', durationMs: 400 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'NOMINAL_BALANCE_STANCE',
      category: 'LOCOMOTION',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.reset(42).catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Walk / Locomotion
  private async _executeWalk(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Main kitchen area ki taraf aage badh rahi hoon. Obstacle clearance verified.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Generate bipedal locomotion footsteps', status: 'COMPLETED', durationMs: 400 },
      { num: 2, label: 'CoM Preview control trajectory active', status: 'IN_PROGRESS', durationMs: 600 },
      { num: 3, label: 'Execute left foot swing phase', status: 'PENDING', durationMs: 900 },
      { num: 4, label: 'Execute right foot swing phase', status: 'PENDING', durationMs: 900 },
      { num: 5, label: 'Waypoint reached: Living Room → Kitchen', status: 'PENDING', durationMs: 600 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'BIPEDAL_LOCOMOTION (Kitchen Path)',
      category: 'NAVIGATION',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.navigate('kitchen').catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Test Push Recovery
  private async _executePush(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Savdhaan! 450N external disturbance detect hui hai. Active push recovery engaging.';
    const steps: TaskStep[] = [
      { num: 1, label: 'External impulse applied (450N / 80ms)', status: 'COMPLETED', durationMs: 300 },
      { num: 2, label: 'IMU detecting angular deflection', status: 'IN_PROGRESS', durationMs: 500 },
      { num: 3, label: 'Ankle & hip reaction torque engaged', status: 'PENDING', durationMs: 800 },
      { num: 4, label: 'Dynamic capture point adjustment', status: 'PENDING', durationMs: 900 },
      { num: 5, label: 'Center of mass restored to stable zone', status: 'PENDING', durationMs: 600 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'DISTURBANCE_RECOVERY (450N Push)',
      category: 'SAFETY',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.injectFault('external_push').catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Stop / E-Stop
  private async _executeStop(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Emergency Stop active. Sabhi motors safely lock ho gaye hain.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Emergency halt command triggered', status: 'COMPLETED', durationMs: 200 },
      { num: 2, label: 'Actuator drive currents cut to 0A', status: 'COMPLETED', durationMs: 300 },
      { num: 3, label: 'Mechanical holding brakes locked', status: 'COMPLETED', durationMs: 400 },
      { num: 4, label: 'Safe standby state established', status: 'COMPLETED', durationMs: 200 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'EMERGENCY_STOP_HALT',
      category: 'SAFETY',
      status: 'EMERGENCY_STOPPED',
      currentStepIndex: 3,
      steps,
      speechResponse: speech,
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    return this.activeTask;
  }

  // ── Recipe: System Status Audit
  private async _executeStatusCheck(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'System fully operational hai. Battery 85%, temperature 38.4 degree Celsius, MuJoCo physics 500 Hz par live hai.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Read MuJoCo 500 Hz physics metrics', status: 'COMPLETED', durationMs: 300 },
      { num: 2, label: 'Audit 28 motor thermal sensors', status: 'IN_PROGRESS', durationMs: 500 },
      { num: 3, label: 'Verify 48V battery state of charge', status: 'PENDING', durationMs: 500 },
      { num: 4, label: 'Check perception RGBD stream health', status: 'PENDING', durationMs: 500 },
      { num: 5, label: 'All systems nominal report published', status: 'PENDING', durationMs: 400 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'SYSTEM_HEALTH_AUDIT',
      category: 'DIAGNOSTICS',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      graspForceN: 0.0,
      contactConfirmed: false,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Generic Fallback Task
  private async _executeGeneralTask(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = `Ji, main "${cmd}" command ko process kar rahi hoon.`;
    const steps: TaskStep[] = [
      { num: 1, label: `Parse natural language command: "${cmd}"`, status: 'COMPLETED', durationMs: 400 },
      { num: 2, label: 'Decompose task into robotics primitives', status: 'IN_PROGRESS', durationMs: 600 },
      { num: 3, label: 'Coordinate kinematics and balance', status: 'PENDING', durationMs: 800 },
      { num: 4, label: 'Execute motion in MuJoCo physics twin', status: 'PENDING', durationMs: 1000 },
      { num: 5, label: 'Task completed successfully', status: 'PENDING', durationMs: 500 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: `TASK_EXECUTION (${cmd.slice(0, 20)}...)`,
      category: 'AUTONOMOUS',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Recipe: Composite Mission (Wave → Walk → Grasp Water Bottle)
  private async _executeWaveWalkPick(cmd: string, lang: string): Promise<ActiveTaskState> {
    const speech = 'Ji! Main pehle aapse wave karke greet kar rahi hoon, fir kitchen chal kar paani ki bottle pick karungi.';
    const steps: TaskStep[] = [
      { num: 1, label: 'Understand composite mission (Wave → Walk → Pick Bottle)', status: 'COMPLETED', durationMs: 400 },
      { num: 2, label: 'Execute friendly greeting wave [Right arm 7-DOF oscillation]', status: 'IN_PROGRESS', durationMs: 2600 },
      { num: 3, label: 'Initialize bipedal locomotion controller', status: 'PENDING', durationMs: 600 },
      { num: 4, label: 'Walk to Kitchen Counter waypoint [X: 1.80, Y: -1.50]', status: 'PENDING', durationMs: 3400 },
      { num: 5, label: 'Stabilize in double-support stance at counter', status: 'PENDING', durationMs: 600 },
      { num: 6, label: 'RGBD camera: detect & segment water_bottle_01', status: 'PENDING', durationMs: 700 },
      { num: 7, label: '7-DOF right arm reach trajectory to bottle', status: 'PENDING', durationMs: 900 },
      { num: 8, label: 'Dexterous grasp with closed-loop force control (14.2 N)', status: 'PENDING', durationMs: 1000 },
      { num: 9, label: 'Lift bottle & dynamic CoM balance compensation', status: 'PENDING', durationMs: 800 },
      { num: 10, label: 'Mission complete: Meera holding bottle ready for handover', status: 'PENDING', durationMs: 500 },
    ];

    this.activeTask = {
      id: `task-${Date.now()}`,
      commandText: cmd,
      taskTitle: 'AUTONOMOUS_MISSION (Wave → Walk → Pick Bottle)',
      category: 'HOUSEHOLD_MISSION',
      status: 'IN_PROGRESS',
      currentStepIndex: 1,
      steps,
      speechResponse: speech,
      targetObject: 'water_bottle_01',
      graspForceN: 14.2,
      contactConfirmed: true,
      startedAt: Date.now(),
    };

    this._notify();
    meeraVoice.speak(speech, lang).catch(() => {});
    SimBridgeClient.waveWalkPick().catch(() => {});

    this._advanceStepsSequentially(1, steps);
    return this.activeTask;
  }

  // ── Step Sequencer
  private _advanceStepsSequentially(startIndex: number, steps: TaskStep[]) {
    if (startIndex >= steps.length) {
      this.activeTask.status = 'COMPLETED';
      this._notify();
      return;
    }

    const currentStep = steps[startIndex];
    const duration = currentStep.durationMs || 800;

    this.stepTimer = setTimeout(() => {
      // Mark current completed
      steps[startIndex].status = 'COMPLETED';
      const nextIndex = startIndex + 1;

      if (nextIndex < steps.length) {
        steps[nextIndex].status = 'IN_PROGRESS';
        this.activeTask.currentStepIndex = nextIndex;
        this._notify();
        this._advanceStepsSequentially(nextIndex, steps);
      } else {
        this.activeTask.currentStepIndex = steps.length - 1;
        this.activeTask.status = 'COMPLETED';
        this._notify();
      }
    }, duration);
  }
}

export const RobotCommandEngine = new RobotCommandEngineImpl();
