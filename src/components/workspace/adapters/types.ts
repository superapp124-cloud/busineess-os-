import React from 'react';

export interface WorkspaceMetadata {
  title: string;
  type: string;
  format: string;
  updatedAt: string;
  fields: Record<string, string>;
  status: 'Uploading...' | 'Reading...' | 'Preparing insights...' | 'Ready' | 'Needs Attention';
}

export interface WorkspaceCapabilities {
  searchable: boolean;
  annotatable: boolean;
  comparable: boolean;
  printable: boolean;
  editable: boolean;
  aiSupported: boolean;
}

export interface WorkspaceItem {
  id: string;
  sourceUri: string;
  rawFile?: File;
  typeHint?: string; // 'pdf', 'resume', 'email', 'spreadsheet'
}

export interface SearchResult {
  id: string;
  text: string;
  location: any;
  confidence?: number;
}

export interface Citation {
  id: string;
  text: string;
  location: any; // e.g. BoundingBox for PDF, line number for code
}

export interface WorkspaceAdapter {
  id: string;
  
  // Can this adapter render this item?
  canOpen(item: WorkspaceItem): boolean;

  // The main rendering surface
  render(item: WorkspaceItem): React.ReactNode;

  // Capabilities
  search(query: string): Promise<SearchResult[]>;
  highlight(reference: Citation): Promise<void>;
  export(): Promise<void>;
  print(): Promise<void>;

  // Metadata & Capabilities
  getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata>;
  getCapabilities(): WorkspaceCapabilities;
}
