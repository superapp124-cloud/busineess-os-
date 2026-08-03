import { ICapability, CapabilityMetadata, Recommendation } from '../types';
import { ResolutionGraph } from './ContextResolutionEngine';
import { ERPStagingCapability } from '../capabilities/ERPStagingCapability';
import { ContractSignatureCapability } from '../capabilities/ContractSignatureCapability';
import { BackgroundCheckCapability } from '../capabilities/BackgroundCheckCapability';
import { SupplierDispatchCapability } from '../capabilities/SupplierDispatchCapability';
import { 
  PagerDutyCapability, 
  TicketEscalationCapability, 
  DoorLockdownCapability, 
  PrivacyAuditCapability, 
  DealDeskCapability, 
  BrandApprovalCapability, 
  SecurityScanCapability, 
  HazmatComplianceCapability 
} from '../capabilities/MassiveCapabilities';
import { IntegrationRuntime } from './IntegrationRuntime';

/**
 * Capability Marketplace
 * A registry of composable evaluators. These are completely domain-agnostic.
 * They don't know if they are evaluating a contract or a resume, they only evaluate context.
 */
export class CapabilityMarketplace {
  private static instance: CapabilityMarketplace;
  private capabilities: Map<string, ICapability> = new Map();
  private integrationRuntime = IntegrationRuntime.getInstance();

  private constructor() {
    this.registerCoreCapabilities();
  }

  public static getInstance(): CapabilityMarketplace {
    if (!CapabilityMarketplace.instance) {
      CapabilityMarketplace.instance = new CapabilityMarketplace();
    }
    return CapabilityMarketplace.instance;
  }

  public getCapability(id: string): ICapability | undefined {
    return this.capabilities.get(id);
  }

  public getAllCapabilities(): ICapability[] {
    return Array.from(this.capabilities.values());
  }


  private registerCoreCapabilities() {
    this.capabilities.set('cap_erp_staging', new ERPStagingCapability());
    this.capabilities.set('cap_docu_sign', new ContractSignatureCapability());
    this.capabilities.set('cap_bg_check', new BackgroundCheckCapability());
    this.capabilities.set('cap_po_dispatch', new SupplierDispatchCapability());
    this.capabilities.set('cap_pager_duty', new PagerDutyCapability());
    this.capabilities.set('cap_ticket_escalation', new TicketEscalationCapability());
    this.capabilities.set('cap_door_lockdown', new DoorLockdownCapability());
    this.capabilities.set('cap_privacy_audit', new PrivacyAuditCapability());
    this.capabilities.set('cap_deal_desk', new DealDeskCapability());
    this.capabilities.set('cap_brand_approval', new BrandApprovalCapability());
    this.capabilities.set('cap_security_scan', new SecurityScanCapability());
    this.capabilities.set('cap_hazmat_compliance', new HazmatComplianceCapability());
    // 1. Risk Evaluator
    this.capabilities.set('cap_risk_evaluation', {
      metadata: {
        id: 'cap_risk_evaluation',
        name: 'Risk Evaluator',
        category: 'Analysis',
        requiredContext: ['KnowledgeFabric.Policies'],
        produces: ['RiskScore', 'ComplianceGaps'],
        cost: 0.5,
        latency: 1200,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: Risk Evaluator] Evaluating ${context.policies.length} policies against context...`);
        // Mock output for demo purposes based on active policies
        if (context.policies.some(p => p.id === 'procurement-4.2')) {
          return [{
            action: 'Reject Liability Clause',
            estimatedValue: '₹12,00,000 exposure avoided',
            implementationTime: '15 mins',
            departmentsAffected: ['Legal', 'Finance'],
            riskReduction: 'High',
            evidenceQuality: 'Excellent',
            basedOn: ['Procurement Policy v4.2'],
            missingEvidence: [],
            reason: 'Vendor limits liability below $5M threshold.'
          }];
        }
        return [];
      }
    });

    // 2. Decision Support
    this.capabilities.set('cap_decision_support', {
      metadata: {
        id: 'cap_decision_support',
        name: 'Decision Support',
        category: 'Planning',
        requiredContext: ['RiskScore'],
        produces: ['FinalRecommendation'],
        cost: 0.2,
        latency: 800,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: Decision Support] Synthesizing final decision...`);
        return [{
          action: 'Escalate to CFO',
          estimatedValue: 'Mitigate Legal Risk',
          implementationTime: 'Immediate',
          departmentsAffected: ['Executive', 'Legal'],
          riskReduction: 'High',
          evidenceQuality: 'Strong',
          basedOn: ['Enterprise Risk Guidelines'],
          missingEvidence: [],
          reason: 'Automated decision support flags this agreement for executive review.'
        }];
      }
    });

    // 2.5 Medical / Health Evaluation (Health OS)
    this.capabilities.set('cap_medical_evaluation', {
      metadata: {
        id: 'cap_medical_evaluation',
        name: 'Clinical Expense & Claim Evaluator',
        category: 'Analysis',
        requiredContext: ['KnowledgeFabric.Policies'],
        produces: ['Health_Claim_Log'],
        cost: 0.6,
        latency: 1500,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: Medical Evaluation] Evaluating health claim...`);
        if (context.policies.some(p => p.id === 'health')) {
          return [{
            action: 'Approve Medical Claim',
            estimatedValue: '₹40,430 processed',
            implementationTime: 'Immediate',
            departmentsAffected: ['Human Resources', 'Insurance Provider'],
            riskReduction: 'Low',
            evidenceQuality: 'Excellent',
            basedOn: ['Corporate Healthcare Coverage v1.5'],
            missingEvidence: [],
            reason: 'Validated ₹40,430 OP Cash Bill from Indraprastha Apollo Hospitals for Dr. Sapna Manocha. Covered under corporate health insurance policy.'
          }];
        }
        return [];
      }
    });

    // 3. Requirement Matching Evaluator (HR/Talent OS)
    this.capabilities.set('cap_requirement_matching', {
      metadata: {
        id: 'cap_requirement_matching',
        name: 'Requirement Matching Evaluator',
        category: 'Analysis',
        requiredContext: ['KnowledgeFabric.Policies'],
        produces: ['FitScore', 'ExperienceGaps'],
        cost: 0.4,
        latency: 1000,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: Requirement Matching] Evaluating context against requirements...`);
        // Mock output for demo purposes based on HR policies
        if (context.policies.some(p => p.id === 'hr-hiring-1.1')) {
          return [{
            action: 'Reject Candidate',
            estimatedValue: '3 interviews saved',
            implementationTime: 'Immediate',
            departmentsAffected: ['Engineering', 'HR'],
            riskReduction: 'Medium',
            evidenceQuality: 'Strong',
            basedOn: ['Senior Engineering Requirements v1.1'],
            missingEvidence: ['Hyperscale infrastructure experience (Azure/AWS) missing from resume'],
            reason: 'Candidate does not meet the minimum requirement of demonstrated hyperscale experience.'
          }];
        }
        return [];
      }
    });

    // 4. CRM Sync (Sales OS)
    this.capabilities.set('cap_crm_sync', {
      metadata: {
        id: 'cap_crm_sync',
        name: 'CRM Touchpoint Sync',
        category: 'Action',
        requiredContext: ['KnowledgeFabric.People'],
        produces: ['CRM_Log'],
        cost: 0.1,
        latency: 400,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: CRM Sync] Syncing touchpoint...`);
        if (context.people.some(p => p.id === 'client-arjun')) {
          return [{
            action: 'Log Touchpoint to Salesforce',
            estimatedValue: 'CRM Hygiene',
            implementationTime: 'Immediate',
            departmentsAffected: ['Sales'],
            riskReduction: 'Low',
            evidenceQuality: 'Strong',
            basedOn: ['Enterprise Sales Policy'],
            missingEvidence: [],
            reason: 'Logged 24-minute VoIP call with Enterprise Sales Lead Arjun Verma.'
          }];
        }
        return [];
      }
    });

    // 5. Expense Processing (Finance OS)
    this.capabilities.set('cap_expense_processing', {
      metadata: {
        id: 'cap_expense_processing',
        name: 'Expense Extractor & Validator',
        category: 'Analysis',
        requiredContext: ['KnowledgeFabric.Policies'],
        produces: ['Expense_Log'],
        cost: 0.3,
        latency: 900,
        executionMode: 'synchronous',
        version: '1.0'
      },
      execute: async (context: ResolutionGraph): Promise<Recommendation[]> => {
        console.log(`[Capability: Expense Processing] Processing receipt...`);
        if (context.policies.some(p => p.id === 'finance')) {
          return [{
            action: 'Approve HRA Exemption',
            estimatedValue: '₹45,000 processed',
            implementationTime: 'Immediate',
            departmentsAffected: ['Finance', 'Payroll'],
            riskReduction: 'Low',
            evidenceQuality: 'Strong',
            basedOn: ['Employee Tax Policy v2.1'],
            missingEvidence: [],
            reason: 'Validated ₹45,000 rent receipt for Arshid Hussain Wani. Eligible for HRA tax exemption under Section 10(13A).'
          }];
        }
        return [];
      }
    });
  }
}
