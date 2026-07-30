/**
 * CHATR Intelligence Runtime (v3.0 - ADR-004 & ADR-009 Compliant)
 * Specialized OS Runtime managed by RuntimeManager. Connects Document Intelligence, Model Lifecycle, and Agent Tools.
 */

import { IOSRuntime } from '../../kernel/RuntimeManager';
import { ExecutionEngine, StandardExecutionResult } from '../../kernel/execution/ExecutionEngine';
import { CapabilityRegistry } from '../../kernel/registry/CapabilityRegistry';
import { ProviderRegistry } from '../../kernel/registry/ProviderRegistry';
import { PDFProviderPlugin } from '../../providers/documents/PDFProviderPlugin';
import { InvoiceProviderPlugin } from '../../providers/documents/InvoiceProviderPlugin';
import { ContractProviderPlugin } from '../../providers/documents/ContractProviderPlugin';
import { DocumentQueue, QueueJob } from '../../pipelines/document/DocumentQueue';
import { DocumentInput, DocumentOutput } from '../../providers/documents/DocumentProviderPlugin';

export class IntelligenceRuntimeService implements IOSRuntime {
  public id = 'runtime-intelligence';
  public name = 'CHATR Intelligence Runtime';
  public isReady = false;

  /**
   * Initialize the Intelligence Runtime
   */
  public async initialize(): Promise<void> {
    console.log(`[IntelligenceRuntime] Initializing ${this.name}...`);

    // Register Document Provider Plugins into ProviderRegistry and CapabilityRegistry
    const pdfPlugin = new PDFProviderPlugin();
    const invoicePlugin = new InvoiceProviderPlugin();
    const contractPlugin = new ContractProviderPlugin();

    CapabilityRegistry.registerManifest(pdfPlugin.manifest);
    CapabilityRegistry.registerManifest(invoicePlugin.manifest);
    CapabilityRegistry.registerManifest(contractPlugin.manifest);

    await ProviderRegistry.registerProvider(pdfPlugin);
    await ProviderRegistry.registerProvider(invoicePlugin);
    await ProviderRegistry.registerProvider(contractPlugin);

    this.isReady = true;
    console.log(`[IntelligenceRuntime] ${this.name} initialized successfully.`);
  }

  /**
   * Dispatch a document processing task through the Kernel Execution Engine (ADR-004)
   */
  public async executeDocumentTask(
    documentId: string,
    filePath: string,
    requiredCapability = 'pdf'
  ): Promise<StandardExecutionResult<DocumentOutput>> {
    return ExecutionEngine.executeTask<DocumentInput, DocumentOutput>({
      taskId: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      query: {
        category: 'document',
        requiredCapabilities: [requiredCapability],
        requiresOffline: true,
      },
      input: {
        documentId,
        filePath,
        mimeType: 'application/pdf',
      },
    });
  }

  /**
   * Queue a document for background processing
   */
  public ingestDocument(filePath: string, mimeType = 'application/pdf'): QueueJob {
    return DocumentQueue.enqueue(filePath, mimeType);
  }

  public getStatus(): Record<string, unknown> {
    return {
      isReady: this.isReady,
      registeredProviders: ProviderRegistry.listProviderIds(),
      activeQueueLength: DocumentQueue.getQueue().length,
    };
  }

  public async shutdown(): Promise<void> {
    this.isReady = false;
    console.log(`[IntelligenceRuntime] ${this.name} shut down.`);
  }
}

export const IntelligenceRuntime = new IntelligenceRuntimeService();
