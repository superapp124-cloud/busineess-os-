import { eventBus } from '@/core/runtime/EventBus';
import {
  emitWorkflowUIEvent,
  buildWorkflowId,
  buildWidgetId,
  WorkflowCapabilityContract,
  WorkflowContext,
  WorkflowManifest,
  SelectionWidgetPayload,
  ResultWidgetPayload,
  WidgetAction,
} from '@/core/workflow-ui';
import type { ExecutionConsoleWidgetPayload, ExecutionPhase } from '@/core/workflow-ui/types';

// ─── Manifest ─────────────────────────────────────────────────────────────────

const FLIGHT_DEPARTURE_MANIFEST: WorkflowManifest = {
  id: 'FLIGHT_DEPARTURE',
  version: '1.0',
  name: 'Flight Departure Orchestration',
  description: 'Compound workflow handling email scanning, weather, eta calculation, and cab pre-booking.',
  widgets: ['selection', 'result', 'execution_console', 'timeline'],
  permissions: ['EMAIL', 'LOCATION', 'CALENDAR', 'PAYMENTS'],
  resumable: true,
  timeout: 300_000,
  cancellable: true,
  supportsNestedWorkflows: true,
  estimatedSteps: 5,
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_FLIGHT_DATA = {
  airline: 'IndiGo',
  flightNumber: '6E-214',
  terminal: 'T2',
  departureTime: '08:00 AM',
  boardingTime: '07:15 AM',
  airport: 'Kempegowda International Airport (BLR)',
};

const MOCK_ENVIRONMENT = {
  weather: 'Heavy Rain 🌧️',
  traffic: 'Heavy Traffic on Bellary Road 🚗',
  travelTime: '60 mins',
};

// ─── FlightDepartureWorkflow ──────────────────────────────────────────────────

export class FlightDepartureWorkflow implements WorkflowCapabilityContract {
  readonly manifest = FLIGHT_DEPARTURE_MANIFEST;

  private workflowId = '';
  private executionConsoleWidgetId = '';
  private timelineWidgetId = '';
  private selectionWidgetId = '';
  private resultWidgetId = '';
  private widgetIndex = 0;
  private unsubscribeFn?: () => void;
  private phaseStartTimes: Record<string, number> = {};
  
  async initialize(context: WorkflowContext): Promise<void> {
    this.workflowId = buildWorkflowId(context.conversationId, 'flight-departure');

    emitWorkflowUIEvent({
      event: 'WORKFLOW_STARTED',
      workflowId: this.workflowId,
      widgetId: this.workflowId,
      widgetType: 'execution_console',
      widgetVersion: '1.0',
      lifecycle: 'CREATED',
      payload: { manifest: this.manifest },
    });

    // ── Execution Console ──
    this.executionConsoleWidgetId = buildWidgetId(this.workflowId, 'execution_console', this.widgetIndex++);
    const initialConsolePayload: ExecutionConsoleWidgetPayload = {
      aiMode: 'local',
      expanded: true, // Auto-expand to show off the compound phases
      phases: this.executionPhases,
    };
    
    emitWorkflowUIEvent({
      event: 'WIDGET_CREATED',
      workflowId: this.workflowId,
      widgetId: this.executionConsoleWidgetId,
      widgetType: 'execution_console',
      widgetVersion: '1.0',
      lifecycle: 'ACTIVE',
      payload: initialConsolePayload,
    });

    // ── Timeline Widget ──
    this.timelineWidgetId = buildWidgetId(this.workflowId, 'timeline', this.widgetIndex++);
    emitWorkflowUIEvent({
      event: 'WIDGET_CREATED',
      workflowId: this.workflowId,
      widgetId: this.timelineWidgetId,
      widgetType: 'timeline',
      widgetVersion: '1.0',
      lifecycle: 'ACTIVE',
      payload: { title: 'Departure Preparation Timeline', entries: [] },
    });

    this.unsubscribeFn = eventBus.on<WidgetAction>(
      'FLIGHT_DEPARTURE.WIDGET_ACTION',
      (kernelEvent) => this.handleWidgetAction(kernelEvent.payload)
    );
  }

  async execute(context: WorkflowContext): Promise<void> {
    // 1. Intent
    await this.updateExecutionPhase('intent', 'running');
    await this.delay(800);
    await this.updateExecutionPhase('intent', 'completed', `Recognized compound intent: "flight_departure"`);
    
    // 2. Context Retrieval (Email Scan)
    await this.updateExecutionPhase('context', 'running');
    await this.delay(1200);
    await this.updateExecutionPhase('context', 'completed', `Found flight ${MOCK_FLIGHT_DATA.airline} ${MOCK_FLIGHT_DATA.flightNumber} via Gmail integration`);

    // 3. Environmental Sync
    await this.updateExecutionPhase('environmental', 'running');
    await this.delay(1000);
    await this.updateExecutionPhase('environmental', 'completed', `Traffic: ${MOCK_ENVIRONMENT.traffic} | Weather: ${MOCK_ENVIRONMENT.weather}`);

    // 4. Planning (ETA Calculation)
    await this.updateExecutionPhase('planning', 'running');
    await this.delay(1500);
    await this.updateExecutionPhase('planning', 'completed', `Calculated optimal departure: 06:15 AM (Includes 60m travel + 15m weather buffer)`);

    // 5. Orchestration (Selection)
    await this.updateExecutionPhase('orchestration', 'running');
    await this.showOrchestrationSelectionWidget();
  }

  private async handleWidgetAction(action: WidgetAction): Promise<void> {
    if (action.workflowId !== this.workflowId) return;

    if (action.action === 'CONFIRM_SELECTION' && action.widgetId === this.selectionWidgetId) {
      emitWorkflowUIEvent({
        event: 'WIDGET_UPDATED',
        workflowId: this.workflowId,
        widgetId: this.selectionWidgetId,
        widgetType: 'selection',
        widgetVersion: '1.0',
        lifecycle: 'COMPLETED',
        payload: { selectedId: 'opt-615' },
      });

      await this.updateExecutionPhase('orchestration', 'completed', 'Capabilities orchestrated successfully');
      await this.showResultWidget();
      this.complete();
    }

    if (action.action === 'CANCEL') {
      await this.cancel();
    }
  }

  private async showOrchestrationSelectionWidget(): Promise<void> {
    this.selectionWidgetId = buildWidgetId(this.workflowId, 'selection', this.widgetIndex++);
    
    const payload: SelectionWidgetPayload = {
      title: 'Departure Plan Ready',
      subtitle: `${MOCK_FLIGHT_DATA.airline} ${MOCK_FLIGHT_DATA.flightNumber} • ${MOCK_FLIGHT_DATA.departureTime} • ${MOCK_FLIGHT_DATA.terminal}`,
      columns: [
        { key: 'action', label: 'Action', type: 'text', primary: true },
        { key: 'time', label: 'Time', type: 'text' },
        { key: 'detail', label: 'Detail', type: 'text' },
        { key: 'status', label: '', type: 'badge' }
      ],
      options: [
        {
          id: 'opt-615',
          icon: '🚗',
          values: { 
            action: 'Schedule Uber', 
            time: '06:15 AM', 
            detail: `~${MOCK_ENVIRONMENT.travelTime} travel time`, 
            status: 'Recommended' 
          },
          recommended: true,
          badge: 'Safe Buffer',
          badgeVariant: 'success'
        },
        {
          id: 'opt-630',
          icon: '🚗',
          values: { 
            action: 'Schedule Uber', 
            time: '06:30 AM', 
            detail: 'Might be tight due to rain', 
            status: '' 
          },
          recommended: false,
          badge: 'Risky',
          badgeVariant: 'warning'
        },
      ],
    };

    emitWorkflowUIEvent({
      event: 'WIDGET_CREATED',
      workflowId: this.workflowId,
      widgetId: this.selectionWidgetId,
      widgetType: 'selection',
      widgetVersion: '1.0',
      lifecycle: 'WAITING_USER',
      payload,
    });
  }

  private async showResultWidget(): Promise<void> {
    this.resultWidgetId = buildWidgetId(this.workflowId, 'result', this.widgetIndex++);
    
    const payload: ResultWidgetPayload = {
      title: 'You are all set for tomorrow',
      subtitle: 'I have orchestrated everything you need to catch your flight.',
      status: 'success',
      details: [
        { label: 'Alarm Set', value: '05:30 AM' },
        { label: 'Uber Scheduled', value: '06:15 AM Pickup' },
        { label: 'Boarding Pass', value: 'Saved to Wallet' },
        { label: 'Family Notified', value: 'SMS sent to Emergency Contact' },
      ],
      actionLabel: 'View Itinerary',
    };

    emitWorkflowUIEvent({
      event: 'WIDGET_CREATED',
      workflowId: this.workflowId,
      widgetId: this.resultWidgetId,
      widgetType: 'result',
      widgetVersion: '1.0',
      lifecycle: 'ACTIVE',
      payload,
    });
  }

  // ─── Phase Tracking ───

  private executionPhases: ExecutionPhase[] = [
    { id: 'intent',         label: 'Intent Understood',       status: 'pending' },
    { id: 'context',        label: 'Context Retrieval (Email)',status: 'pending' },
    { id: 'environmental',  label: 'Weather & Traffic Check', status: 'pending' },
    { id: 'planning',       label: 'ETA Calculation',         status: 'pending' },
    { id: 'orchestration',  label: 'Provider Orchestration',  status: 'pending' },
  ];

  private async updateExecutionPhase(
    phaseId: string,
    status: 'running' | 'completed' | 'failed' | 'pending',
    detail?: string
  ): Promise<void> {
    if (status === 'running') {
      this.phaseStartTimes[phaseId] = Date.now();
    }
    
    let latencyMs: number | undefined;
    if (status === 'completed' || status === 'failed') {
      const start = this.phaseStartTimes[phaseId];
      if (start) {
        latencyMs = Date.now() - start;
      }
    }

    this.executionPhases = this.executionPhases.map(p => 
      p.id === phaseId ? { ...p, status, latencyMs, detail } : p
    );

    emitWorkflowUIEvent({
      event: 'WIDGET_UPDATED',
      workflowId: this.workflowId,
      widgetId: this.executionConsoleWidgetId,
      widgetType: 'execution_console',
      widgetVersion: '1.0',
      lifecycle: 'ACTIVE',
      payload: { phases: this.executionPhases },
    });
  }

  async pause(): Promise<void> {}
  async resume(): Promise<void> {}

  async cancel(): Promise<void> {
    this.cleanup();
    emitWorkflowUIEvent({
      event: 'WORKFLOW_CANCELLED',
      workflowId: this.workflowId,
      widgetId: this.workflowId,
      widgetType: 'execution_console',
      widgetVersion: '1.0',
      lifecycle: 'CANCELLED',
      payload: {},
    });
  }

  async rollback(): Promise<void> {}

  async complete(): Promise<void> {
    this.cleanup();
    emitWorkflowUIEvent({
      event: 'WORKFLOW_COMPLETED',
      workflowId: this.workflowId,
      widgetId: this.workflowId,
      widgetType: 'execution_console',
      widgetVersion: '1.0',
      lifecycle: 'COMPLETED',
      payload: {},
    });
  }

  private cleanup(): void {
    if (this.unsubscribeFn) this.unsubscribeFn();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export async function triggerFlightDeparture(conversationId: string, entities: Record<string, unknown> = {}): Promise<string> {
  const workflow = new FlightDepartureWorkflow();
  const context: WorkflowContext = { conversationId, workflowId: '', intent: 'compound.flight_departure', entities };
  
  await workflow.initialize(context);
  workflow.execute(context).catch(console.error);
  
  return (workflow as any).workflowId;
}
