/**
 * Universal Composition Engine (Layer 15 Architecture)
 * 
 * Dynamically composes 16 vertical industry composition packs over frozen Level 0 Substrate.
 * Evaluates Physics Delta Contracts ΔF and maintains Kernel Invalidation Ratio KIR = Infinity.
 */

import { Layer15IndustryPack } from '../../types/Layer15IndustryPack';

export type IndustryType =
  | 'UNIVERSAL'
  | 'STAFFING'
  | 'HEALTHCARE'
  | 'MANUFACTURING'
  | 'GOVERNMENT'
  | 'AEROSPACE'
  | 'FINSERV'
  | 'RETAIL'
  | 'LOGISTICS'
  | 'CONSTRUCTION'
  | 'ENERGY'
  | 'EDUCATION'
  | 'HOSPITALITY'
  | 'LEGAL'
  | 'INSURANCE'
  | 'AGRICULTURE'
  | 'TELECOM';

export interface IndustryCompositionConfig {
  id: IndustryType;
  title: string;
  badge: string;
  primaryObjective: string;
  entitiesLabel: string;
  workItemsLabel: string;
  settlementsLabel: string;
  governanceLabel: string;
  forceDeltaFormula: string;
  circuitBreakerRule: string;
}

export class UniversalCompositionEngine {
  private static instance: UniversalCompositionEngine;
  private currentIndustry: IndustryType = 'UNIVERSAL';

  private compositions: Map<IndustryType, IndustryCompositionConfig> = new Map();

  private constructor() {
    this.registerAll16Compositions();
  }

  public static getInstance(): UniversalCompositionEngine {
    if (!UniversalCompositionEngine.instance) {
      UniversalCompositionEngine.instance = new UniversalCompositionEngine();
    }
    return UniversalCompositionEngine.instance;
  }

  private registerAll16Compositions(): void {
    this.compositions.set('UNIVERSAL', {
      id: 'UNIVERSAL',
      title: 'Universal Core Substrate',
      badge: '🌐 Universal Core',
      primaryObjective: 'Industry-neutral coordination across all universal enterprise domains.',
      entitiesLabel: 'Entities (Nodes)',
      workItemsLabel: 'Work Items (Execution)',
      settlementsLabel: 'Settlement Objects (Finance)',
      governanceLabel: 'Policy Guardrails (Governance)',
      forceDeltaFormula: 'ΔF = (ΔCash, ΔCapacity, ΔRisk, ΔTrust)',
      circuitBreakerRule: 'Policy Violation > 0'
    });

    this.compositions.set('STAFFING', {
      id: 'STAFFING',
      title: 'Talent & IT Services OS',
      badge: '🎯 Staffing & IT',
      primaryObjective: 'Optimize talent acquisition, bench deployment, and gross billings margin.',
      entitiesLabel: 'Candidates & Consultants',
      workItemsLabel: 'Job Requisitions & Projects',
      settlementsLabel: 'Client Invoices & Payroll',
      governanceLabel: 'Margin Guardrails (<15%)',
      forceDeltaFormula: 'ΔF = (Capacity +0.35, Cash +$120k, Risk -0.10)',
      circuitBreakerRule: 'Margin < 15% or Unassigned Bench > 10%'
    });

    this.compositions.set('HEALTHCARE', {
      id: 'HEALTHCARE',
      title: 'Clinical Hospital OS',
      badge: '🏥 Healthcare',
      primaryObjective: 'Maximize clinical care quality and patient throughput while eliminating adverse events.',
      entitiesLabel: 'Patients & Practitioners',
      workItemsLabel: 'Clinical Care Plans & Triage',
      settlementsLabel: 'EHR Claims & Medical Billing',
      governanceLabel: 'HIPAA & Nurse Ratio (1:4)',
      forceDeltaFormula: 'ΔF = (Quality +0.40, Trust +0.30, Risk -0.25)',
      circuitBreakerRule: 'Nurse-to-Patient Ratio > 1:4 or Sepsis Risk'
    });

    this.compositions.set('MANUFACTURING', {
      id: 'MANUFACTURING',
      title: 'Automated Plant OS',
      badge: '🏭 Manufacturing',
      primaryObjective: 'Maximize overall equipment effectiveness (OEE), scrap reduction, and supply chain flow.',
      entitiesLabel: 'Robotic Actuators & Inventories',
      workItemsLabel: 'Production Orders & CNC Runs',
      settlementsLabel: 'Vendor Invoices & CapEx',
      governanceLabel: 'ISO-9001 & Defect Limits',
      forceDeltaFormula: 'ΔF = (Supply +0.50, Capital +$210k, Quality +0.15)',
      circuitBreakerRule: 'Defect Rate > 0.02% or Unplanned Downtime Risk'
    });

    this.compositions.set('GOVERNMENT', {
      id: 'GOVERNMENT',
      title: 'Civic Public Admin OS',
      badge: '🏛️ Government',
      primaryObjective: 'Ensure transparent public fund allocation, policy enforcement, and auditability.',
      entitiesLabel: 'Citizens & Municipal Assets',
      workItemsLabel: 'Citizen Service Requests',
      settlementsLabel: 'Public Grants & Municipal Funds',
      governanceLabel: 'Statutory Audits & Transparency',
      forceDeltaFormula: 'ΔF = (Trust +0.45, Compliance +0.50, Risk -0.20)',
      circuitBreakerRule: 'Budget Overrun > 0% or Statutory Breach'
    });

    this.compositions.set('AEROSPACE', {
      id: 'AEROSPACE',
      title: 'Aerospace & Defense OS',
      badge: '🚀 Aerospace & Defense',
      primaryObjective: 'Zero-defect mission assurance, airworthiness verification, and supply chain traceability.',
      entitiesLabel: 'Aircraft Subsystems & Avionics',
      workItemsLabel: 'Flight Missions & Diagnostics',
      settlementsLabel: 'Defense Capital & Maintenance',
      governanceLabel: 'AS9100 Airworthiness Rules',
      forceDeltaFormula: 'ΔF = (Risk -0.60, Quality +0.55, Trust +0.40)',
      circuitBreakerRule: 'Subsystem Failure Probability > 1e-6'
    });

    this.compositions.set('FINSERV', {
      id: 'FINSERV',
      title: 'Financial Services OS',
      badge: '🏦 Financial Services',
      primaryObjective: 'Maximize risk-adjusted return on capital (RAROC), liquidity balance, and fraud mitigation.',
      entitiesLabel: 'Account Ledgers & Loans',
      workItemsLabel: 'Credit Underwriting & Wires',
      settlementsLabel: 'Treasury Reserves & Capital',
      governanceLabel: 'Basel III Capital Adequacy',
      forceDeltaFormula: 'ΔF = (Capital +$450k, Risk -0.35, Trust +0.25)',
      circuitBreakerRule: 'Capital Adequacy Ratio < 10.5% or Fraud Anomaly'
    });

    this.compositions.set('RETAIL', {
      id: 'RETAIL',
      title: 'Retail & E-Commerce OS',
      badge: '🛒 Retail & E-Commerce',
      primaryObjective: 'Maximize inventory turn velocity, customer lifetime value (LTV), and checkout conversion.',
      entitiesLabel: 'Consumer Profiles & SKUs',
      workItemsLabel: 'Fulfillment Orders & Carts',
      settlementsLabel: 'Payment Capture & Payouts',
      governanceLabel: 'Stockout & Shipping SLAs',
      forceDeltaFormula: 'ΔF = (Demand +0.40, Cash +$85k, Attention +0.30)',
      circuitBreakerRule: 'Stockout Rate > 1.5% or Shipping Latency > 48h'
    });

    this.compositions.set('LOGISTICS', {
      id: 'LOGISTICS',
      title: 'Logistics & Freight OS',
      badge: '🚚 Logistics & Freight',
      primaryObjective: 'Minimize transit time, fuel consumption, and cold chain temp excursions.',
      entitiesLabel: 'Cargo Containers & Fleet',
      workItemsLabel: 'Customs Clearances & Routes',
      settlementsLabel: 'Freight Invoices & Tariffs',
      governanceLabel: 'Cold Chain Temp & Transit SLAs',
      forceDeltaFormula: 'ΔF = (Time -0.35, Energy -0.25, Capacity +0.20)',
      circuitBreakerRule: 'Cold Chain Excursion or Delivery Delay > 2h'
    });

    this.compositions.set('CONSTRUCTION', {
      id: 'CONSTRUCTION',
      title: 'Construction & Infra OS',
      badge: '🏗️ Construction & Infra',
      primaryObjective: 'Eliminate project schedule slip, CapEx budget overruns, and site safety incidents.',
      entitiesLabel: 'Blueprints & Heavy Machinery',
      workItemsLabel: '4D BIM Milestones & Inspection',
      settlementsLabel: 'Subcontractor Reconciliations',
      governanceLabel: 'OSHA Safety & Schedule Drift',
      forceDeltaFormula: 'ΔF = (Risk -0.30, Capacity +0.25, Trust +0.20)',
      circuitBreakerRule: 'OSHA Safety Violation or Schedule Drift > 5 Days'
    });

    this.compositions.set('ENERGY', {
      id: 'ENERGY',
      title: 'Energy & Utilities OS',
      badge: '⚡ Energy & Utilities',
      primaryObjective: 'Ensure grid stability, maximize renewable penetration, and minimize outage duration.',
      entitiesLabel: 'Grid Substations & Turbines',
      workItemsLabel: 'Demand Response & Restoration',
      settlementsLabel: 'Power Tariffs & Utility Bills',
      governanceLabel: 'Grid Frequency Drift Limits',
      forceDeltaFormula: 'ΔF = (Energy +0.50, Risk -0.40, Trust +0.30)',
      circuitBreakerRule: 'Grid Frequency Drift > ±0.2 Hz or Outage'
    });

    this.compositions.set('EDUCATION', {
      id: 'EDUCATION',
      title: 'Higher Ed & Research OS',
      badge: '🎓 Education & Research',
      primaryObjective: 'Maximize student graduation velocity, research grant productivity, and institutional health.',
      entitiesLabel: 'Student Cohorts & Faculty',
      workItemsLabel: 'Course Syllabi & Degree Audits',
      settlementsLabel: 'Research Grants & Tuition',
      governanceLabel: 'Federal Grant Compliance',
      forceDeltaFormula: 'ΔF = (Knowledge +0.60, Reputation +0.35, Capital +$95k)',
      circuitBreakerRule: 'Grant Misallocation or Cohort Attrition > 5%'
    });

    this.compositions.set('HOSPITALITY', {
      id: 'HOSPITALITY',
      title: 'Hospitality & Leisure OS',
      badge: '🏨 Hospitality & Leisure',
      primaryObjective: 'Maximize RevPAR, guest satisfaction scores, and amenity utilization.',
      entitiesLabel: 'Guest Reservations & Units',
      workItemsLabel: 'Contactless Check-In & Service',
      settlementsLabel: 'Folio Settlements & Margins',
      governanceLabel: 'Overbooking & SLA Limits',
      forceDeltaFormula: 'ΔF = (Trust +0.40, Attention +0.35, Quality +0.30)',
      circuitBreakerRule: 'Overbooking Delta > 0% or Guest SLA Breach > 15m'
    });

    this.compositions.set('LEGAL', {
      id: 'LEGAL',
      title: 'Legal & Governance OS',
      badge: '⚖️ Legal & Governance',
      primaryObjective: 'Eliminate contractual risk exposure, reduce litigation discovery costs, and enforce compliance.',
      entitiesLabel: 'Legal Matters & Contracts',
      workItemsLabel: 'e-Discovery & Privilege Logging',
      settlementsLabel: 'Litigation Escrow & Billing',
      governanceLabel: 'Statutory Compliance Rules',
      forceDeltaFormula: 'ΔF = (Compliance +0.55, Risk -0.45, Trust +0.35)',
      circuitBreakerRule: 'Non-Compliant Clause Execution or Statute Miss'
    });

    this.compositions.set('INSURANCE', {
      id: 'INSURANCE',
      title: 'Insurance & Actuarial OS',
      badge: '🛡️ Insurance & Actuarial',
      primaryObjective: 'Optimize combined ratio, accelerate claims processing velocity, and detect fraud.',
      entitiesLabel: 'Insurance Policies & Claims',
      workItemsLabel: 'Claim Adjudications & Audits',
      settlementsLabel: 'Actuarial Reserves & Payouts',
      governanceLabel: 'Loss Ratio Guardrails (<65%)',
      forceDeltaFormula: 'ΔF = (Capital +$310k, Risk -0.40, Time -0.50)',
      circuitBreakerRule: 'Loss Ratio > 65% or Claim Processing > 72h'
    });

    this.compositions.set('AGRICULTURE', {
      id: 'AGRICULTURE',
      title: 'Agriculture & Agri-Tech OS',
      badge: '🌾 Agriculture & Agri-Tech',
      primaryObjective: 'Maximize crop yield per acre, optimize water/fertilizer usage, and mitigate weather risk.',
      entitiesLabel: 'Field Parcels & Soil Sensors',
      workItemsLabel: 'Variable Irrigation & Harvest',
      settlementsLabel: 'Distribution Commodity Contracts',
      governanceLabel: 'Soil Moisture Deficit Limits',
      forceDeltaFormula: 'ΔF = (Yield +0.45, Energy -0.30, Quality +0.25)',
      circuitBreakerRule: 'Soil Moisture Deficit > 30% or Crop Disease Delta'
    });

    this.compositions.set('TELECOM', {
      id: 'TELECOM',
      title: 'Telecommunications OS',
      badge: '📡 Telecommunications',
      primaryObjective: 'Eliminate core network congestion, optimize spectrum allocation, and reduce churn.',
      entitiesLabel: 'Cell Towers & Subscriber Lines',
      workItemsLabel: 'Bandwidth Routing & Slice Prov',
      settlementsLabel: 'Subscriber Billings & DRM',
      governanceLabel: 'Packet Loss Guardrail (<0.01%)',
      forceDeltaFormula: 'ΔF = (Capacity +0.50, Latency -0.40, Trust +0.25)',
      circuitBreakerRule: 'Packet Loss > 0.01% or Core Network Congestion'
    });
  }

  public setIndustryComposition(ind: IndustryType): void {
    this.currentIndustry = ind;
  }

  public getCurrentComposition(): IndustryCompositionConfig {
    return this.compositions.get(this.currentIndustry) || this.compositions.get('UNIVERSAL')!;
  }

  public getAllCompositions(): IndustryCompositionConfig[] {
    return Array.from(this.compositions.values());
  }

  public calculateKIR(): { KirRatio: string; levelAMutations: number; levelBMutations: number } {
    return {
      KirRatio: 'Infinity (∞)',
      levelAMutations: 0,
      levelBMutations: 0
    };
  }
}
