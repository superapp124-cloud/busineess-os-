export interface WorkerMetadata {
    id: string;
    name: string;
    capability: string;
    priority: number;
    dependsOn: string[];
    timeoutMs: number;
    retries: number;
    estimatedCost: number;
    transports: string[];
    permissions: string[];
}

export interface WorkerContext {
    missionId: string;
    goal: string;
    state: Record<string, any>;
    emit: (event: string, payload: any) => void;
}

export interface WorkerResult {
    success: boolean;
    data?: any;
    error?: string;
}

export type WorkerStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Worker {
    metadata: WorkerMetadata;
    canHandle(context: WorkerContext): boolean;
    execute(context: WorkerContext): Promise<WorkerResult>;
    cancel(): Promise<void>;
    status(): WorkerStatus;
}
