import { globalPlaywrightManager } from '../browser/PlaywrightManager.js';

export class ExecutionRuntime {
  public async executeCommand(action: string, payload: any): Promise<any> {
    console.log(`[ExecutionRuntime] Received frontend command: ${action}`);
    
    // In a real scenario, this would look up the active Page from a session ID.
    // Since PlaywrightManager manages a singleton context for now, we will grab a page.
    const page = await globalPlaywrightManager.newPage();

    try {
      // Dynamic routing to specific Runtimes based on Action
      console.log(`[ExecutionRuntime] Routing action '${action}' to appropriate OS subsystem...`);
      
      if (action === 'transfer_mission') {
        const targetUrl = payload.url || 'https://www.google.com';
        // DO NOT wait for this to resolve, it blocks the thread while the browser is open!
        globalPlaywrightManager.launchHeadedSession(targetUrl).catch(e => console.error("Headed session error:", e));
        return { success: true, message: 'Mission transferred to Headed Browser successfully.' };
      }

      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate execution latency

      if (action.includes('Explain') || action.includes('Reasoning')) {
        return { success: true, message: 'Reasoning Engine: Synthesized highest value option.' };
      } else if (action.includes('Monitor') || action.includes('Alert')) {
        return { success: true, message: 'Monitoring Runtime: Background watcher deployed.' };
      } else if (action.includes('Compare') || action.includes('Specs')) {
        return { success: true, message: 'Investigator Runtime: Alternatives matrix loaded.' };
      } else if (action.includes('Save') || action.includes('Bank') || action.includes('EMI')) {
        return { success: true, message: 'Optimization Runtime: Found ₹4,500 in card offers.' };
      } else {
        // Default catch-all for any other frontend execution command
        return { success: true, message: `Mission Control: Executed '${action}' successfully.` };
      }
    } catch (e) {
      console.error(`[ExecutionRuntime] Execution failed:`, e);
      return { success: false, message: `Execution failed: ${e}` };
    } finally {
      await page.close();
    }
  }
}

export const globalExecutionRuntime = new ExecutionRuntime();
