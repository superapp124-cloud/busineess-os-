/**
 * CHATR Unified Platform State Store
 * Manages reactive system state across connected providers, active runtimes, open documents, GPU availability, and download status.
 */

export interface SystemState {
  currentWorkspaceId: string;
  activeRuntimes: string[];
  connectedProviders: string[];
  openDocuments: string[];
  gpuAvailable: boolean;
  gpuDeviceName: string;
  modelDownloadStatus: Record<string, { progressPercentage: number; isDownloading: boolean }>;
  runtimeHealth: 'healthy' | 'degraded' | 'error';
}

type StateListener = (state: SystemState) => void;

class StateStoreService {
  private state: SystemState = {
    currentWorkspaceId: 'workspace_default',
    activeRuntimes: [],
    connectedProviders: [],
    openDocuments: [],
    gpuAvailable: true,
    gpuDeviceName: 'NVIDIA GeForce RTX (CUDA 12.x)',
    modelDownloadStatus: {},
    runtimeHealth: 'healthy',
  };

  private listeners: Set<StateListener> = new Set();

  public getState(): SystemState {
    return { ...this.state };
  }

  public updateState(partialState: Partial<SystemState>): void {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(cb => cb(currentState));
  }
}

export const StateStore = new StateStoreService();
