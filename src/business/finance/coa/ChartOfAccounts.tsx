import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Search, Plus, Sparkles, Folder, FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { FinAccount, AccountType, NormalBalance, AccountingStandard } from '../types';
import { accountTypeColor } from '../types';

interface ChartOfAccountsProps {
  finOrganizationId: string;
  accountingStandard: AccountingStandard;
}

export function ChartOfAccounts({ finOrganizationId, accountingStandard }: ChartOfAccountsProps) {
  const [accounts, setAccounts] = useState<FinAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New account form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('EXPENSE');
  const [newNormal, setNewNormal] = useState<NormalBalance>('DEBIT');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newAllowDirect, setNewAllowDirect] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fin_accounts')
      .select('*')
      .eq('fin_organization_id', finOrganizationId)
      .order('code');

    if (error) {
      console.error('Failed to load chart of accounts:', error);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  }, [finOrganizationId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function handleSeedCOA() {
    setSeeding(true);
    try {
      const { data, error } = await supabase.rpc('seed_default_chart_of_accounts', {
        p_fin_org_id: finOrganizationId
      });
      if (error) throw error;
      await loadAccounts();
    } catch (err: any) {
      console.error('Error seeding COA:', err.message);
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode || !newName) return;
    setCreating(true);
    try {
      const parentAcc = accounts.find(a => a.id === newParentId);
      const depth = parentAcc ? parentAcc.depth + 1 : 0;

      const { error } = await supabase
        .from('fin_accounts')
        .insert({
          fin_organization_id: finOrganizationId,
          code: newCode.trim(),
          name: newName.trim(),
          account_type: newType,
          normal_balance: newNormal,
          parent_account_id: newParentId || null,
          depth,
          allow_direct_posting: newAllowDirect,
          accounting_standard: accountingStandard,
          is_active: true,
          is_system_account: false
        });

      if (error) throw error;
      setIsCreateOpen(false);
      setNewCode('');
      setNewName('');
      setNewParentId('');
      await loadAccounts();
    } catch (err: any) {
      alert(`Failed to create account: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  const filtered = accounts.filter(a => {
    const matchesSearch = !search ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || a.account_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-56"
              placeholder="Search code or account name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Account Types</SelectItem>
              <SelectItem value="ASSET">Assets</SelectItem>
              <SelectItem value="LIABILITY">Liabilities</SelectItem>
              <SelectItem value="EQUITY">Equity</SelectItem>
              <SelectItem value="REVENUE">Revenue</SelectItem>
              <SelectItem value="EXPENSE">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
              onClick={handleSeedCOA}
              disabled={seeding}
            >
              <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Seeding Defaults...' : 'Seed Default COA'}
            </Button>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm">Create New GL Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Account Code *</Label>
                    <Input
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. 5245"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Account Type *</Label>
                    <Select
                      value={newType}
                      onValueChange={(val: AccountType) => {
                        setNewType(val);
                        setNewNormal(['ASSET', 'EXPENSE', 'CONTRA_LIABILITY', 'CONTRA_REVENUE'].includes(val) ? 'DEBIT' : 'CREDIT');
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASSET">Asset</SelectItem>
                        <SelectItem value="LIABILITY">Liability</SelectItem>
                        <SelectItem value="EQUITY">Equity</SelectItem>
                        <SelectItem value="REVENUE">Revenue</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="CONTRA_ASSET">Contra Asset</SelectItem>
                        <SelectItem value="CONTRA_LIABILITY">Contra Liability</SelectItem>
                        <SelectItem value="CONTRA_REVENUE">Contra Revenue</SelectItem>
                        <SelectItem value="CONTRA_EXPENSE">Contra Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Account Name *</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. Cloud Hosting Subscriptions"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Normal Balance</Label>
                    <Select value={newNormal} onValueChange={(v: NormalBalance) => setNewNormal(v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEBIT">Debit (Dr)</SelectItem>
                        <SelectItem value="CREDIT">Credit (Cr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Parent Account</Label>
                    <Select value={newParentId} onValueChange={setNewParentId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="None (Root Level)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Root Level)</SelectItem>
                        {accounts.filter(a => !a.allow_direct_posting || a.depth < 3).map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            <span className="font-mono">{a.code}</span> - {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Allow Direct Posting</Label>
                    <p className="text-[10px] text-muted-foreground">Disable for header/summary categories</p>
                  </div>
                  <Switch checked={newAllowDirect} onCheckedChange={setNewAllowDirect} />
                </div>

                <DialogFooter className="pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? 'Saving...' : 'Create Account'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" onClick={loadAccounts}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Account Tree Grid */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {accounts.length} GL accounts</span>
            <span>Standard: <strong className="text-foreground">{accountingStandard}</strong></span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium w-28">Code</th>
                  <th className="text-left py-2 px-3 font-medium">Account Name</th>
                  <th className="text-left py-2 px-3 font-medium w-28">Type</th>
                  <th className="text-center py-2 px-3 font-medium w-20">Balance</th>
                  <th className="text-center py-2 px-3 font-medium w-24">Direct Post</th>
                  <th className="text-center py-2 px-3 font-medium w-20">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(acc => {
                  const indentPx = acc.depth * 20;
                  return (
                    <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-foreground">
                        {acc.code}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${indentPx}px` }}>
                          {!acc.allow_direct_posting ? (
                            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={acc.allow_direct_posting ? '' : 'font-semibold text-foreground'}>
                            {acc.name}
                          </span>
                          {acc.is_system_account && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground ml-1">
                              System
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 font-normal bg-${accountTypeColor(acc.account_type)}-50 text-${accountTypeColor(acc.account_type)}-700 border-${accountTypeColor(acc.account_type)}-200`}
                        >
                          {acc.account_type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] text-muted-foreground">
                        {acc.normal_balance === 'DEBIT' ? 'Dr' : 'Cr'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {acc.allow_direct_posting ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground inline" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={acc.is_active ? 'outline' : 'secondary'} className="text-[9px] px-1 py-0">
                          {acc.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      {accounts.length === 0 ? (
                        <div className="space-y-2">
                          <p>No Chart of Accounts found for this organization.</p>
                          <Button size="sm" variant="outline" onClick={handleSeedCOA} disabled={seeding}>
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Seed Standard COA (IFRS/US GAAP)
                          </Button>
                        </div>
                      ) : (
                        <p>No accounts match your search filter.</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
