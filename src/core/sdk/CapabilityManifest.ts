export interface Permission {
  name: string;
  description: string;
}

export interface RouteDefinition {
  path: string;
  component: React.ComponentType<any> | string; // Path or component
}

export interface SidebarItem {
  label: string;
  icon: string;
  path: string;
}

export interface SidebarConfig {
  items: SidebarItem[];
}

export interface SearchConfig {
  // To be implemented by UniversalSearch
  entities: string[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
}

export interface NotificationConfig {
  types: string[];
}

export interface EventDefinition {
  name: string;
  description: string;
}

export interface EventHandler {
  event: string;
  handler: string; // function name or path
}

export interface DeployStep {
  label: string;
  detail: string;
}

export interface CapabilityManifest {
  id: string;             // e.g., 'recruitment-os'
  name: string;           // e.g., 'RecruitmentOS'
  version: string;        // e.g., '1.0.0'
  description: string;
  icon: string;           // lucide icon name
  color: string;          // tailwind color token
  category: string;       // e.g., 'hr', 'sales', 'finance'

  // What this module needs
  permissions: Permission[];
  routes: RouteDefinition[];

  // What this module provides
  sidebar: SidebarConfig | false;
  search: SearchConfig | false;
  workflows: WorkflowDefinition[];
  notifications: NotificationConfig[];
  events: EventDefinition[];   // events this module emits
  handlers: EventHandler[];    // events this module listens for

  // Lifecycle
  deploySteps: DeployStep[];
  onInstall?: string;         // TypeScript module path to call on install
  onUninstall?: string;       // cleanup logic

  // Database
  tables: string[];            // which DB tables belong to this module
  seedFunction?: string;       // function to call for demo data
}
