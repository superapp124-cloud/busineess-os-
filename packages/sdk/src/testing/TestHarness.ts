import { ExecutionResult, Capability, Connector } from '@chatr/kernel';
import { Assertions } from './Assertions';

export class TestHarness {
  public capabilities: Capability[] = [];
  public connectors: Connector[] = [];
  
  public registerCapability(cap: Capability): this {
    this.capabilities.push(cap);
    return this;
  }
  
  public registerConnector(conn: Connector): this {
    this.connectors.push(conn);
    return this;
  }
  
  public expectExecution(result: ExecutionResult): Assertions {
    return new Assertions(result);
  }
}
