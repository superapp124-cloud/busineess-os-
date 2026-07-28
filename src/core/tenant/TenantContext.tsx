import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  owner_id: string;
}

export interface TenantContextType {
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization | null) => void;
  organizations: Organization[];
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshOrganizations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In RLS, we only see orgs we own or are members of
      const { data, error } = await supabase.from('sys_organizations').select('*');
      if (error) {
        console.error('Error fetching organizations:', error);
        return;
      }

      setOrganizations(data || []);
      
      // Auto-select first org if none is selected
      if (data && data.length > 0 && !activeOrganization) {
        setActiveOrganization(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrganizations();
  }, []);

  return (
    <TenantContext.Provider value={{ activeOrganization, setActiveOrganization, organizations, loading, refreshOrganizations }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
