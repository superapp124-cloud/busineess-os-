/**
 * CHATR Intent Parser
 * Classifies natural language requests into intent domain structures.
 */

export interface ParsedIntent {
  intentDomain: 'DocumentAnalysis' | 'WorkflowAutomation' | 'CrossDomainSearch' | 'Communication' | 'HealthOrRecord';
  primaryTarget: string; // e.g. 'contracts', 'invoices', 'microsoft', 'john'
  secondaryActions: string[]; // e.g. ['summarize', 'email', 'redact', 'create-task']
  rawQuery: string;
  confidence: number;
}

export class IntentParser {
  /**
   * Classify natural language input into structured intent metadata
   */
  public static parse(userQuery: string): ParsedIntent {
    const q = userQuery.toLowerCase().trim();

    const secondaryActions: string[] = [];
    if (q.includes('summarize') || q.includes('summary')) secondaryActions.push('summarize');
    if (q.includes('email') || q.includes('send')) secondaryActions.push('email');
    if (q.includes('task') || q.includes('create task')) secondaryActions.push('create-task');
    if (q.includes('redact') || q.includes('pii')) secondaryActions.push('redact');
    if (q.includes('find clause') || q.includes('liability')) secondaryActions.push('find-clause');

    let intentDomain: ParsedIntent['intentDomain'] = 'DocumentAnalysis';
    if (q.includes('email') && (q.includes('summarize') || q.includes('contract'))) {
      intentDomain = 'WorkflowAutomation';
    } else if (q.includes('email') || q.includes('message')) {
      intentDomain = 'Communication';
    } else if (q.includes('search') || q.includes('find')) {
      intentDomain = 'CrossDomainSearch';
    }

    let primaryTarget = 'documents';
    if (q.includes('contract')) primaryTarget = 'contracts';
    if (q.includes('invoice')) primaryTarget = 'invoices';
    if (q.includes('microsoft')) primaryTarget = 'microsoft';

    return {
      intentDomain,
      primaryTarget,
      secondaryActions,
      rawQuery: userQuery,
      confidence: 0.94,
    };
  }
}
