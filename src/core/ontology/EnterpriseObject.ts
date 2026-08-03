// ─────────────────────────────────────────────────────────────────────────────
// CHATR Canonical Ontology
// ADR-000: Every entity in the system MUST inherit from EnterpriseObject.
// ─────────────────────────────────────────────────────────────────────────────

export type ObjectCategory = 
  | 'Actor' 
  | 'Information' 
  | 'Work' 
  | 'Mechanism' 
  | 'RuntimeState';

export type ObjectType = 
  // Actors
  | 'Person' | 'Organization'
  // Information
  | 'Artifact' | 'Knowledge' | 'Memory'
  // Work
  | 'Mission' | 'Task' | 'Decision'
  // Mechanism
  | 'Workflow' | 'Capability' | 'Connector' | 'Automation'
  // Runtime State
  | 'Event' | 'Observation' | 'Conversation';

export interface EnterpriseObject {
  /** Globally unique identifier (UUIDv7 recommended for time-sorting) */
  id: string;
  
  /** Discriminator for the inheritance tree */
  type: ObjectType;
  
  /** The high-level category this object belongs to */
  category: ObjectCategory;
  
  /** ISO 8601 Timestamp of creation */
  createdAt: string;
  
  /** ISO 8601 Timestamp of last modification */
  updatedAt: string;
  
  /** Extensible metadata schema (must not contain critical domain logic) */
  metadata: Record<string, any>;
  
  /** Universal taxonomical tagging for cross-domain search */
  tags: string[];
}
