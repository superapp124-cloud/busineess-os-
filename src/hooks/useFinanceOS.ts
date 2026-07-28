import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/core/tenant/TenantContext';

export interface FinanceInvoice {
  id: string;
  org_id: string;
  client_name: string;
  amount: number;
  currency: string;
  status: string; // Draft, Sent, Paid, Overdue
  due_date: string | null;
  created_at: string;
}

export interface FinanceExpense {
  id: string;
  org_id: string;
  submitted_by: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string | null;
  status: string; // Pending, Approved, Rejected
  created_at: string;
}

export function useFinanceOS() {
  const { activeOrganization } = useTenant();
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganization) return;
    
    setLoading(true);
    try {
      const [invRes, expRes] = await Promise.all([
        supabase
          .from('finance_invoices')
          .select('*')
          .eq('org_id', activeOrganization.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('finance_expenses')
          .select('*')
          .eq('org_id', activeOrganization.id)
          .order('created_at', { ascending: false })
      ]);
      
      if (invRes.data) setInvoices(invRes.data);
      if (expRes.data) setExpenses(expRes.data);
    } finally {
      setLoading(false);
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (!activeOrganization) {
      setInvoices([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    fetchData();

    // Set up Realtime subscriptions filtered by org_id
    const invSub = supabase.channel(`finance-invoices-${activeOrganization.id}`)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'finance_invoices', filter: `org_id=eq.${activeOrganization.id}` }, 
        fetchData
      )
      .subscribe();

    const expSub = supabase.channel(`finance-expenses-${activeOrganization.id}`)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'finance_expenses', filter: `org_id=eq.${activeOrganization.id}` }, 
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invSub);
      supabase.removeChannel(expSub);
    };
  }, [activeOrganization, fetchData]);

  const updateInvoiceStatus = async (id: string, status: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    await supabase.from('finance_invoices').update({ status }).eq('id', id);
  };

  const updateExpenseStatus = async (id: string, status: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    await supabase.from('finance_expenses').update({ status }).eq('id', id);
  };

  return { invoices, expenses, loading, updateInvoiceStatus, updateExpenseStatus };
}
