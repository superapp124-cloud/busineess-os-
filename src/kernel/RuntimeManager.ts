/**
 * CHATR Runtime Manager
 * Manages specialized OS runtimes (Intelligence, Business, Communication, Automation, Search).
 */

export interface IOSRuntime {
  id: string;
  name: string;
  isReady: boolean;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): Record<string, unknown>;
}

class RuntimeManagerService {
  private runtimes: Map<string, IOSRuntime> = new Map();

  /**
   * Register a specialized OS runtime
   */
  public registerRuntime(runtime: IOSRuntime): void {
    this.runtimes.set(runtime.id, runtime);
    console.log(`[RuntimeManager] Registered OS runtime: ${runtime.name} (${runtime.id})`);
  }

  /**
   * Initialize all registered runtimes
   */
  public async initializeAll(): Promise<void> {
    console.log('[RuntimeManager] Initializing registered OS runtimes...');
    for (const runtime of this.runtimes.values()) {
      try {
        await runtime.initialize();
        console.log(`[RuntimeManager] Runtime initialized: ${runtime.name}`);
      } catch (err: any) {
        console.error(`[RuntimeManager] Failed to initialize runtime ${runtime.id}:`, err.message);
      }
    }
  }

  /**
   * Retrieve a runtime by ID
   */
  public getRuntime<T extends IOSRuntime = IOSRuntime>(id: string): T | undefined {
    return this.runtimes.get(id) as T;
  }

  /**
   * Shutdown all runtimes
   */
  public async shutdownAll(): Promise<void> {
    for (const runtime of this.runtimes.values()) {
      try {
        await runtime.shutdown();
      } catch (err: any) {
        console.error(`[RuntimeManager] Error shutting down runtime ${runtime.id}:`, err.message);
      }
    }
    this.runtimes.clear();
  }
}

export const RuntimeManager = new RuntimeManagerService();
