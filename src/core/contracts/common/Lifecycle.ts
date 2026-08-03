/**
 * Represents the health status of a runtime or component.
 */
export interface RuntimeHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details?: Record<string, any>;
  lastChecked: number;
}

/**
 * Standard lifecycle interface that all CHATR runtimes must implement.
 */
export interface IRuntime {
  /**
   * Called during kernel bootstrap to initialize internal state.
   */
  initialize(): Promise<void>;

  /**
   * Called when the kernel is ready and the runtime should begin its active duties.
   */
  start(): Promise<void>;

  /**
   * Called during graceful shutdown to stop active operations.
   */
  stop(): Promise<void>;

  /**
   * Called during kernel teardown to clean up resources.
   */
  dispose(): Promise<void>;

  /**
   * Returns the current health of the runtime.
   */
  health(): Promise<RuntimeHealth>;

  /**
   * Returns the semantic version of the runtime.
   */
  version(): string;
}
