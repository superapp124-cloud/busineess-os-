import { MissionStateMachine } from './StateMachine';
import { globalEventBus } from '../../kernel/EventBus';
import { globalScheduler } from '../../kernel/Scheduler';

export class MissionRuntime {
  private id: string;
  private stateMachine: MissionStateMachine;
  
  constructor(public intent: any) {
    this.id = `mission_${Date.now()}`;
    this.stateMachine = new MissionStateMachine(this.id);
  }

  public async start(): Promise<void> {
    globalEventBus.publish({
      type: 'MISSION_CREATED',
      payload: { missionId: this.id, intent: this.intent }
    });

    this.stateMachine.transition('Planning');
    // For now, fast forward to Investigating
    this.stateMachine.transition('Investigating');
    
    // In a full implementation, it talks to the CapabilityScheduler.
    // For now, we mock the dispatch:
    globalScheduler.scheduleTask(this.id, this.intent.goal || 'shopping', {
      items: this.intent.items || []
    });
  }

  public getStatus() {
    return this.stateMachine.getState();
  }
}
