import { globalEventBus } from './EventBus';
import { globalScheduler } from './Scheduler';

export class OSKernel {
  private static instance: OSKernel;
  private isBooted = false;

  private constructor() {}

  public static getInstance(): OSKernel {
    if (!OSKernel.instance) {
      OSKernel.instance = new OSKernel();
    }
    return OSKernel.instance;
  }

  public boot() {
    if (this.isBooted) return;
    
    console.log('[CHATR Kernel] Booting OS...');
    
    // Subscribe kernel to universal events for logging/telemetry
    globalEventBus.subscribe('*', (event) => {
      // Internal telemetry can go here
    });

    this.isBooted = true;
    console.log('[CHATR Kernel] Boot Complete. OS is ready.');
  }

  public getEventBus() {
    return globalEventBus;
  }

  public getScheduler() {
    return globalScheduler;
  }
}

export const kernel = OSKernel.getInstance();
