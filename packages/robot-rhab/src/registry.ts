/**
 * CHATR Robot Hardware Abstraction Layer (RHAB) — Hardware Registry & Factory
 */

import { IRobotHardware } from './interfaces';
import { SimulatedRobotAdapter, SimAdapterOptions } from './adapters/simAdapter';
import { PhysicalRobotAdapter, PhysicalHardwareConfig } from './adapters/physicalAdapter';

export type RobotMode = 'SIMULATION' | 'PHYSICAL';

export class RHABRegistry {
  private static instance: RHABRegistry | null = null;
  private activeAdapter: IRobotHardware | null = null;
  private currentMode: RobotMode = 'SIMULATION';

  private constructor() {}

  public static getInstance(): RHABRegistry {
    if (!RHABRegistry.instance) {
      RHABRegistry.instance = new RHABRegistry();
    }
    return RHABRegistry.instance;
  }

  /**
   * Initializes the active robot hardware adapter.
   * Seamlessly switches between Simulation and Physical hardware without upper-layer redesign.
   */
  public async initialize(
    mode: RobotMode = 'SIMULATION',
    options?: {
      simOptions?: SimAdapterOptions;
      physicalConfig?: PhysicalHardwareConfig;
    }
  ): Promise<IRobotHardware> {
    if (this.activeAdapter && this.activeAdapter.isConnected()) {
      await this.activeAdapter.disconnect();
    }

    this.currentMode = mode;
    if (mode === 'SIMULATION') {
      this.activeAdapter = new SimulatedRobotAdapter(options?.simOptions);
    } else {
      this.activeAdapter = new PhysicalRobotAdapter(options?.physicalConfig);
    }

    await this.activeAdapter.connect();
    return this.activeAdapter;
  }

  public getActiveHardware(): IRobotHardware {
    if (!this.activeAdapter) {
      // Default to simulation adapter if not explicitly initialized
      this.activeAdapter = new SimulatedRobotAdapter();
    }
    return this.activeAdapter;
  }

  public getMode(): RobotMode {
    return this.currentMode;
  }

  public async shutdown(): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
      this.activeAdapter = null;
    }
  }
}

export const rhab = RHABRegistry.getInstance();
