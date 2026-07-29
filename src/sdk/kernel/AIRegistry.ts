import { IToolDeclaration } from '../types';
import { CapabilityRegistry } from './CapabilityRegistry';

export class AIRegistry {
  /**
   * Discovers all available semantic AI tools across all installed capabilities
   */
  static getAvailableTools(): IToolDeclaration[] {
    const tools: IToolDeclaration[] = [];
    const manifests = CapabilityRegistry.getAllManifests();
    
    for (const manifest of manifests) {
      if (manifest.tools && manifest.tools.length > 0) {
        tools.push(...manifest.tools);
      }
    }
    
    return tools;
  }

  static getToolById(toolId: string): IToolDeclaration | undefined {
    return this.getAvailableTools().find(t => t.id === toolId);
  }

  /**
   * Resolves capabilities needed for an intent against available tools
   */
  static findToolsByCapability(requiredCapabilities: string[]): IToolDeclaration[] {
    const allTools = this.getAvailableTools();
    
    return allTools.filter(tool => {
      if (!tool.capabilities) return false;
      return requiredCapabilities.every(req => tool.capabilities!.includes(req));
    });
  }
}
