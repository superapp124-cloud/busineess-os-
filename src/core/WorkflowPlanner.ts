import { Goal, Decision, Workflow, IWorkflowPlanner } from './types';

export interface WorkflowPlugin {
  supports(goal: Goal): boolean;
  planWorkflow(goal: Goal, decision?: Decision): Promise<Workflow>;
}

export class WorkflowPlanner implements IWorkflowPlanner {
  private plugins: WorkflowPlugin[] = [];

  registerPlugin(plugin: WorkflowPlugin) {
    this.plugins.push(plugin);
  }

  async planWorkflow(goal: Goal, decision?: Decision): Promise<Workflow> {
    const plugin = this.plugins.find(p => p.supports(goal));
    if (plugin) {
      return plugin.planWorkflow(goal, decision);
    }

    return {
      id: `wf_${Date.now()}`,
      title: `Workflow for ${goal.title}`,
      steps: [
        { id: 's1', actor: 'System', action: 'Initialize', status: 'Completed' },
        { id: 's2', actor: 'User', action: 'Review', status: 'Active' },
      ],
      currentStepIndex: 1
    };
  }
}
