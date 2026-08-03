import { Connector } from '../types';

export interface IConnectorAction {
  system: Connector['system'];
  actionName: string;
  payload: any;
}

export interface IConnector {
  system: Connector['system'];
  execute(actionName: string, payload: any): Promise<void>;
}

class SlackConnector implements IConnector {
  system: Connector['system'] = 'Slack';
  
  async execute(actionName: string, payload: any): Promise<void> {
    console.log(`[Connector: Slack] Executing ${actionName}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Connector: Slack] Message sent to ${payload.channel || payload.user}: "${payload.message}"`);
  }
}

class DocuSignConnector implements IConnector {
  system: Connector['system'] = 'ERP'; // Using ERP as a placeholder for enterprise systems in the current types
  
  async execute(actionName: string, payload: any): Promise<void> {
    console.log(`[Connector: DocuSign] Executing ${actionName}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[Connector: DocuSign] Document ${payload.documentId} routed to ${payload.signers.join(', ')} for signature.`);
  }
}

class EmailConnector implements IConnector {
  system: Connector['system'] = 'Email';
  
  async execute(actionName: string, payload: any): Promise<void> {
    console.log(`[Connector: Email] Executing ${actionName}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Connector: Email] Email sent to ${payload.to} with subject "${payload.subject}"`);
  }
}

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, IConnector> = new Map();

  private constructor() {
    this.connectors.set('Slack', new SlackConnector());
    this.connectors.set('DocuSign', new DocuSignConnector());
    this.connectors.set('Email', new EmailConnector());
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public getConnector(system: string): IConnector | undefined {
    return this.connectors.get(system);
  }

  public async executeAction(action: IConnectorAction): Promise<void> {
    const connector = this.getConnector(action.system === 'ERP' ? 'DocuSign' : action.system);
    if (!connector) {
      throw new Error(`Connector for system ${action.system} not found.`);
    }
    await connector.execute(action.actionName, action.payload);
  }
}
