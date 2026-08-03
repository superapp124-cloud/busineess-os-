import fs from 'fs';
import path from 'path';

export class ArchitectureValidator {
  private static SRC_DIR = path.resolve(__dirname, '../../');

  public static runBoundaryValidation(): boolean {
    console.log('[ArchitectureValidator] Validating Architectural Boundaries...');
    let passed = true;

    const files = this.getAllFiles(this.SRC_DIR);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // Rule 1: UI cannot import from `kernel` directly (unless via defined runtime API)
      if (file.includes('components\\') || file.includes('components/')) {
        if (content.includes('import ') && content.includes('/kernel/')) {
          console.error(`[ArchitectureValidator] VIOLATION: UI component ${file} directly imports from Kernel.`);
          passed = false;
        }
      }

      // Rule 2: MissionIntelligence cannot import Integration/Execution directly
      if (file.includes('MissionIntelligence')) {
        if (content.includes('ExecutionIntelligence') || content.includes('GoldenPathOrchestrator')) {
          console.error(`[ArchitectureValidator] VIOLATION: MissionIntelligence is tightly coupled to Execution.`);
          passed = false;
        }
      }

      // Rule 3: ExecutionIntelligence cannot mutate Graph directly (should only publish events)
      if (file.includes('ExecutionIntelligence')) {
        if (content.includes('EnterpriseGraph.getInstance().addNode') || content.includes('EnterpriseGraph.getInstance().updateNode')) {
          console.error(`[ArchitectureValidator] VIOLATION: ExecutionIntelligence directly mutates the Graph.`);
          passed = false;
        }
      }
    }

    if (!passed) {
      throw new Error("Architecture boundary validation failed. See violations above.");
    }

    console.log('[ArchitectureValidator] PASSED: All architectural boundaries respected.');
    return passed;
  }

  private static getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }
}
