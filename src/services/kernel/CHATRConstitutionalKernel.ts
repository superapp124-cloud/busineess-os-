/**
 * CHATR Constitutional Kernel
 * 
 * CONSTITUTIONAL LAYER (TIMELESS):
 * Axioms • System Laws • Primitives • Identity Model • Execution Model • Evidence Model • Governance Model
 * 
 * PRIMITIVES (LEVEL 0):
 * Node • Edge • Event • State • Capability • Commitment • Constraint • Policy • Memory • Agent • Receipt
 * 
 * IMMUTABLE EVIDENCE CHAIN:
 * Execution ➔ Evidence ➔ Receipt ➔ Learning
 */

export interface ConstitutionalConstraint {
  id: string;
  name: string;
  category: 'Budget' | 'Time' | 'Compute' | 'Safety' | 'Capacity';
  limitValue: number;
  currentValue: number;
}

export interface ImmutableEvidence {
  evidenceId: string;
  timestamp: string;
  rawObservation: string;
  nodeIds: string[];
}

export interface ImmutableReceipt {
  receiptId: string;
  evidenceId: string;
  capabilityName: string;
  verdict: 'APPROVED' | 'CONSTRAINT_OVERRIDE';
  signedHash: string;
}

export class CHATRConstitutionalKernel {
  private static instance: CHATRConstitutionalKernel;
  private constraints: Map<string, ConstitutionalConstraint> = new Map();
  private evidenceLog: ImmutableEvidence[] = [];
  private receipts: ImmutableReceipt[] = [];

  private constructor() {
    this.seedConstitutionalRules();
  }

  public static getInstance(): CHATRConstitutionalKernel {
    if (!CHATRConstitutionalKernel.instance) {
      CHATRConstitutionalKernel.instance = new CHATRConstitutionalKernel();
    }
    return CHATRConstitutionalKernel.instance;
  }

  private seedConstitutionalRules(): void {
    // Seed Constitutional Constraints
    this.constraints.set('const-budget-01', {
      id: 'const-budget-01',
      name: 'Capital Reserve Floor',
      category: 'Budget',
      limitValue: 50000,
      currentValue: 248000
    });

    this.constraints.set('const-safety-01', {
      id: 'const-safety-01',
      name: 'Operational Safety Limit',
      category: 'Safety',
      limitValue: 1.0,
      currentValue: 0.14
    });
  }

  // Immutable Execution Chain: Execution ➔ Evidence ➔ Receipt ➔ Learning
  public executeChain(capabilityName: string, rawObservation: string): { evidence: ImmutableEvidence; receipt: ImmutableReceipt } {
    const timestamp = new Date().toISOString();
    const evidenceId = `evid_${Date.now()}`;
    
    const evidence: ImmutableEvidence = {
      evidenceId,
      timestamp,
      rawObservation,
      nodeIds: ['node-sub-01']
    };
    this.evidenceLog.push(evidence);

    const receiptId = `rcpt_${Date.now()}`;
    const receipt: ImmutableReceipt = {
      receiptId,
      evidenceId,
      capabilityName,
      verdict: 'APPROVED',
      signedHash: `sha256_${Date.now()}_signed`
    };
    this.receipts.push(receipt);

    return { evidence, receipt };
  }

  public getConstraints(): ConstitutionalConstraint[] {
    return Array.from(this.constraints.values());
  }

  public getEvidenceLog(): ImmutableEvidence[] {
    return this.evidenceLog;
  }
}
