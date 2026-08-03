import { BusinessEvent, Recommendation } from '../types';
import { EnterpriseEventBus } from './EnterpriseEventBus';
import { ConnectorRegistry } from '../connectors/ConnectorRegistry';

export class ExecutionOrchestrator {
  private static instance: ExecutionOrchestrator;
  private connectorRegistry = ConnectorRegistry.getInstance();

  private constructor() {
    // Subscribe to Recommendation Approved events
    EnterpriseEventBus.getInstance().subscribe('RecommendationApproved', this.handleRecommendationApproved.bind(this));
  }

  public static getInstance(): ExecutionOrchestrator {
    if (!ExecutionOrchestrator.instance) {
      ExecutionOrchestrator.instance = new ExecutionOrchestrator();
    }
    return ExecutionOrchestrator.instance;
  }

  /**
   * Translates an approved recommendation into a series of connector actions.
   */
  private async handleRecommendationApproved(event: BusinessEvent): Promise<void> {
    const recommendation = event.payload as Recommendation;
    console.log(`[ExecutionOrchestrator] Orchestrating execution for: ${recommendation.action}`);

    // In a production system, this mapping would be handled by a Capability's "execution plan".
    // For Phase 6 demo, we route based on the recommendation text.
    const actionText = (recommendation.action || '').toLowerCase();

    try {
      if (actionText.includes('reject liability clause') || actionText.includes('escalate to cfo')) {
        // Legal Flow
        await this.connectorRegistry.executeAction({
          system: 'Slack',
          actionName: 'sendMessage',
          payload: { user: '@Sarah Connor (CFO)', message: `Approval required for Liability Cap exception: ${recommendation.reason}` }
        });
        await this.connectorRegistry.executeAction({
          system: 'ERP', // Triggers DocuSign mock
          actionName: 'routeForSignature',
          payload: { documentId: 'contract-1024', signers: ['CFO', 'Vendor'] }
        });
      } else if (actionText.includes('reject candidate')) {
        // HR Flow
        await this.connectorRegistry.executeAction({
          system: 'Slack',
          actionName: 'sendMessage',
          payload: { user: '@John Smith (Dir Eng)', message: `Candidate rejected: ${recommendation.reason}` }
        });
        await this.connectorRegistry.executeAction({
          system: 'Email',
          actionName: 'sendRejection',
          payload: { to: 'candidate@example.com', subject: 'Update on your application' }
        });
      } else {
        // Generic fallback
        await this.connectorRegistry.executeAction({
          system: 'Slack',
          actionName: 'notifySystem',
          payload: { channel: '#operations', message: `Completed action: ${recommendation.action}` }
        });
      }

      console.log(`[ExecutionOrchestrator] Successfully completed orchestration for: ${recommendation.action}`);
    } catch (error) {
      console.error(`[ExecutionOrchestrator] Failed to execute actions:`, error);
    }
  }
}
