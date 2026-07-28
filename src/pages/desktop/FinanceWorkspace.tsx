import React, { useState, useEffect } from 'react';
import { useFinanceOS } from '@/hooks/useFinanceOS';
import { useTenant } from '@/core/tenant/TenantContext';
import { LayoutDashboard, FileText, Receipt, Users, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchParams, useNavigate } from 'react-router-dom';

type FinanceTab = 'overview' | 'invoices' | 'expenses' | 'payroll';

export default function FinanceWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as FinanceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<FinanceTab>(defaultTab);

  const { activeOrganization } = useTenant();
  const { invoices, expenses, loading, updateInvoiceStatus, updateExpenseStatus } = useFinanceOS();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  if (!activeOrganization) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#090A0F] p-6 text-center">
        <LayoutDashboard className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No Organization Selected</h2>
        <p className="mt-2 text-slate-500">Please select an organization from the workspace selector.</p>
        <Button className="mt-6" onClick={() => navigate('/home')}>Go to Workspace Selector</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-[#090A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#090A0F] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#11121A] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">FinanceOS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{activeOrganization.name} Accounting</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding Invoices</h3>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-amber-600 mt-2">{invoices.filter(i => i.status !== 'Paid').length} pending invoices</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</h3>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-[#1A1C23] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No invoices found.</td>
                  </tr>
                ) : invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.client_name}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-2 py-1 text-slate-700 dark:text-slate-300"
                        value={invoice.status}
                        onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'expenses' && (
          <div className="bg-white dark:bg-[#1A1C23] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No expenses found.</td>
                  </tr>
                ) : expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{expense.merchant}</td>
                    <td className="px-6 py-4">
                      {expense.category ? (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {expense.category}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {expense.currency}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-2 py-1 text-slate-700 dark:text-slate-300"
                        value={expense.status}
                        onChange={(e) => updateExpenseStatus(expense.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-white/5">
            <p className="text-slate-500">Payroll management coming soon...</p>
          </div>
        )}
      </div>

      {/* Footer / Tabs */}
      <div className="flex-none bg-white dark:bg-[#11121A] border-t border-slate-200 dark:border-slate-800 p-2">
        <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" />
          <TabButton active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<FileText className="w-5 h-5" />} label="Invoices" />
          <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt className="w-5 h-5" />} label="Expenses" />
          <TabButton active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} icon={<Users className="w-5 h-5" />} label="Payroll" />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-24 h-16 rounded-xl transition-all ${
        active 
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}
