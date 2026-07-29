import { ExecutionContext, IntentId } from '@chatr/kernel';

export class MockExecutionContext implements ExecutionContext {
  public id: string = 'mock-exec-ctx-123';
  public userId: string = 'test-user-1';
  public intentId: IntentId = 'test-intent-1';
  public environment: string = 'test';
  public metadata: Record<string, unknown> = {};
  
  private variables = new Map<string, unknown>();

  public getVariable(key: string): unknown {
    return this.variables.get(key);
  }

  public setVariable(key: string, value: unknown): void {
    this.variables.set(key, value);
  }
}
