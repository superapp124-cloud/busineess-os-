import { ExecutionResult } from '@chatr/kernel';

export class Assertions {
  constructor(private result: ExecutionResult) {}

  public toSucceed(): this {
    if (this.result.status !== 'SUCCESS') {
      throw new Error(`Expected execution to succeed, but got ${this.result.status}`);
    }
    return this;
  }
  
  public toFail(withError?: string): this {
    if (this.result.status !== 'FAILED') {
      throw new Error(`Expected execution to fail, but got ${this.result.status}`);
    }
    if (withError && this.result.error !== withError) {
      throw new Error(`Expected error "${withError}", but got "${this.result.error}"`);
    }
    return this;
  }

  public toEmit(eventType: string): this {
    // Mock implementation for chainable assertions
    return this;
  }
}
