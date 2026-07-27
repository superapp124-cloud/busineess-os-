import { globalEventBus } from '../../kernel/EventBus';

export type MissionState = 
  | 'Created'
  | 'Planning'
  | 'Investigating'
  | 'Waiting'
  | 'Optimising'
  | 'Approval'
  | 'Executing'
  | 'Monitoring'
  | 'Completed'
  | 'Archived'
  | 'Failed'
  | 'Cancelled';

export class MissionStateMachine {
  private state: MissionState = 'Created';
  private missionId: string;

  constructor(missionId: string) {
    this.missionId = missionId;
  }

  public getState(): MissionState {
    return this.state;
  }

  public transition(newState: MissionState, context?: any): void {
    console.log(`[StateMachine] Mission ${this.missionId} transitioning: ${this.state} -> ${newState}`);
    this.state = newState;
    
    globalEventBus.publish({
      type: 'MISSION_STATE_CHANGED',
      payload: {
        missionId: this.missionId,
        state: this.state
      }
    });
  }
}
