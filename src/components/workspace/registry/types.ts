import React from 'react';
import { WorkspaceItem } from '../adapters/types';

export interface MatchResult {
  workspaceId: string;
  confidence: number;
  reasoning: string[];
}

export interface IntelligenceAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface IntelligenceModule {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.FC<{ item: WorkspaceItem }>;
  actions?: IntelligenceAction[];
}

export interface BusinessWorkspace {
  id: string;
  displayName: string;       // e.g., 'Charles Hopkins' or 'Master Service Agreement'
  businessIntent: string;    // e.g., 'Candidate Review' or 'Legal Review'
  matcher: (item: WorkspaceItem) => MatchResult;
  modules: IntelligenceModule[];
}
