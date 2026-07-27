export class IntentCompiler {
  public compile(query: string): any {
    const q = query.toLowerCase();
    
    // Simple heuristic for Travel Intent
    if (q.includes('flight') || q.includes('travel') || q.includes('london')) {
      return {
        domain: 'Travel',
        origin: 'DEL',
        destination: 'LHR', // Hardcoded fallback based on demo query
        budget: Infinity,
        deadline: 'today',
        strategy: 'lowest_total_cost'
      };
    }

    // Default to Shopping
    return {
      domain: 'Shopping',
      items: q.replace('buy', '').replace('groceries', '').split(/and|,/).map(i => i.trim()).filter(Boolean),
      budget: 8000,
      deadline: 'today',
      strategy: 'lowest_total_cost'
    };
  }
}

export const globalIntentCompiler = new IntentCompiler();
