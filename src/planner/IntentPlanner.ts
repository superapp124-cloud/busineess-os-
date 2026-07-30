/**
 * CHATR Intent Planner (Milestone 2)
 * Converts natural language requests into Directed Acyclic Graph (DAG) execution plans
 * and dispatches execution via TaskScheduler and ExecutionEngine.
 */

import { IntentParser, ParsedIntent } from './IntentParser';
import { ExecutionPlan, PlanStep, ExecutionGraphCompiler } from './ExecutionGraph';
import { PlanValidator } from './PlanValidator';
import { IntentKernel } from '../kernel/IntentKernel';
import { DocumentAgentTools } from '../runtimes/intelligence/DocumentAgentTools';

export interface PlanExecutionSummary {
  planId: string;
  goal: string;
  stepsCompleted: number;
  totalSteps: number;
  status: 'completed' | 'failed';
  results: Record<string, unknown>;
  durationMs: number;
}

class IntentPlannerService {
  /**
   * Convert natural language user request into a validated ExecutionPlan (DAG)
   */
  public generatePlan(userQuery: string): ExecutionPlan {
    const parsed: ParsedIntent = IntentParser.parse(userQuery);
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const steps: PlanStep[] = [];

    // Step 1: Search Workspace Documents
    const step1Id = 'step_1_search';
    steps.push({
      id: step1Id,
      name: `Search Workspace for ${parsed.primaryTarget}`,
      capability: 'document-search',
      inputs: { target: parsed.primaryTarget, query: parsed.rawQuery },
      dependencies: [],
      status: 'pending',
    });

    // Step 2: Parse & Extract (depends on Step 1)
    const step2Id = 'step_2_parse';
    steps.push({
      id: step2Id,
      name: `Parse & Extract ${parsed.primaryTarget}`,
      capability: 'ocr-parse',
      inputs: { documentId: 'doc_sample_contract' },
      dependencies: [step1Id],
      status: 'pending',
    });

    // Step 3: Action Execution (Summarize / Clause / Redact - depends on Step 2)
    let step3Id = 'step_3_action';
    if (parsed.secondaryActions.includes('summarize')) {
      steps.push({
        id: step3Id,
        name: 'Generate AI Summary',
        capability: 'summarize',
        inputs: { maxLengthTokens: 200 },
        dependencies: [step2Id],
        status: 'pending',
      });
    } else if (parsed.secondaryActions.includes('find-clause')) {
      steps.push({
        id: step3Id,
        name: 'Extract Legal Liability Clauses',
        capability: 'find-clause',
        inputs: { term: 'liability' },
        dependencies: [step2Id],
        status: 'pending',
      });
    } else {
      steps.push({
        id: step3Id,
        name: 'Analyze Document Content',
        capability: 'analyze',
        inputs: {},
        dependencies: [step2Id],
        status: 'pending',
      });
    }

    // Step 4: Downstream Workflow (Email Draft / Task Creation - depends on Step 3)
    if (parsed.secondaryActions.includes('email')) {
      const step4Id = 'step_4_email';
      steps.push({
        id: step4Id,
        name: 'Create Email Draft to Legal Team',
        capability: 'email-draft',
        inputs: { recipient: 'legal@chatr.chat', subject: `Summary: ${parsed.primaryTarget}` },
        dependencies: [step3Id],
        status: 'pending',
      });
    }

    // Compile & Topological Sort DAG
    const sortedSteps = ExecutionGraphCompiler.compileDAG(steps);

    const plan: ExecutionPlan = {
      id: planId,
      goal: userQuery,
      steps: sortedSteps,
      estimatedCost: 0, // 100% local execution
      estimatedDurationMs: sortedSteps.length * 150,
      confidence: parsed.confidence,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    return plan;
  }

  /**
   * Execute an ExecutionPlan step-by-step through TaskScheduler and ExecutionEngine
   */
  public async executePlan(plan: ExecutionPlan): Promise<PlanExecutionSummary> {
    const startTime = performance.now();
    console.log(`[IntentPlanner] Executing plan ${plan.id}: "${plan.goal}"`);

    // Validate Plan Safety
    const validation = PlanValidator.validate(plan);
    if (!validation.isValid) {
      throw new Error(`[IntentPlanner] Plan validation failed: ${validation.errors.join(', ')}`);
    }

    plan.status = 'executing';
    const results: Record<string, unknown> = {};
    let stepsCompleted = 0;

    for (const step of plan.steps) {
      step.status = 'running';
      console.log(`[IntentPlanner] Running step [${step.id}]: ${step.name}`);

      try {
        let stepResult: unknown = { ok: true };

        // Dispatch Step via ExecutionEngine or Agent Tools
        if (step.capability === 'summarize') {
          stepResult = await DocumentAgentTools.summarize('doc_sample_contract');
        } else if (step.capability === 'find-clause') {
          stepResult = await DocumentAgentTools.findClause('liability');
        } else if (step.capability === 'ocr-parse') {
          const execRes = await IntentKernel.executionEngine.executeTask({
            taskId: step.id,
            query: { category: 'document', requiredCapabilities: ['pdf'], requiresOffline: true },
            input: { documentId: 'doc_sample_contract', filePath: 'sample_contract.pdf', mimeType: 'application/pdf' },
          });
          stepResult = execRes.output;
        }

        step.status = 'completed';
        step.result = stepResult;
        results[step.id] = stepResult;
        stepsCompleted++;

        // Publish progress event onto Platform EventBus
        await IntentKernel.eventBus.publish('agent:task:dispatched', 'IntentPlanner', {
          planId: plan.id,
          stepId: step.id,
          stepName: step.name,
          completed: stepsCompleted,
          total: plan.steps.length,
        });

      } catch (err: any) {
        step.status = 'failed';
        plan.status = 'failed';
        console.error(`[IntentPlanner] Step [${step.id}] failed:`, err.message);
        throw err;
      }
    }

    plan.status = 'completed';
    const totalDurationMs = Math.round(performance.now() - startTime);

    return {
      planId: plan.id,
      goal: plan.goal,
      stepsCompleted,
      totalSteps: plan.steps.length,
      status: 'completed',
      results,
      durationMs: totalDurationMs,
    };
  }
}

export const IntentPlanner = new IntentPlannerService();
