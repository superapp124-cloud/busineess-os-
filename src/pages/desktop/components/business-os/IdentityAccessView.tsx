import React, { useState } from 'react';
import { Users, X, Plus, Shield, Settings, Trash2, FolderOpen, Package, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const IdentityAccessView = () => {
  const [users, setUsers] = useState([
    { id: '1', name: 'Sarah Chen', email: 'sarah.chen@talentxcel.com', role: 'Domain Superintendent', dept: 'All', access: ['Recruitment', 'Core CRM', 'Client Portal'] },
    { id: '2', name: 'Marcus Johnson', email: 'marcus.j@talentxcel.com', role: 'HR Manager', dept: 'HR', access: ['Recruitment', 'Core HR'] },
    { id: '3', name: 'Elena Rodriguez', email: 'elena.r@talentxcel.com', role: 'Sales Lead', dept: 'Sales', access: ['Core CRM'] },
    { id: '4', name: 'AI Engine', email: 'ai-autonomous@system.internal', role: 'System Autonomous', dept: 'System', access: ['All Packages'] }
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Department Manager');
  const [newUserDept, setNewUserDept] = useState('Sales');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please enter full name and email address');
      return;
    }
    const newUser = {
      id: String(Date.now()),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      dept: newUserDept,
      access: ['Core CRM', 'Recruitment']
    };
    setUsers(prev => [...prev, newUser]);
    toast.success(`User ${newUserName} added to workspace!`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (name === 'AI Engine') {
      toast.error('System Autonomous AI Engine cannot be deleted.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success(`User ${name} removed from workspace.`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] flex flex-col w-full h-full relative p-8">
      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add New Teammate</h3>
              </div>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@company.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Department Manager">Department Manager</option>
                    <option value="Sales Lead">Sales Lead</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Operations Lead">Operations Lead</option>
                    <option value="Finance Lead">Finance Lead</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Department</label>
                  <select
                    value={newUserDept}
                    onChange={e => setNewUserDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sales">Sales</option>
                    <option value="HR">HR & Recruitment</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2.5 rounded-xl font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20">
                  Add Teammate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-display font-extrabold text-white tracking-tight">Identity & Access</h1>
            <p className="text-zinc-400 mt-2 text-section">Manage RBAC policies, user accounts, and AI execution permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-button rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={16} /> Add User
            </button>
            <button
              onClick={() => toast.info('Role configuration panel open')}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-button rounded-xl hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <Shield size={16} /> Create Role
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-6 py-4 text-table font-bold text-zinc-500 uppercase tracking-widest">User / Identity</th>
                <th className="px-6 py-4 text-table font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-table font-bold text-zinc-500 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-table font-bold text-zinc-500 uppercase tracking-widest">Package Access</th>
                <th className="px-6 py-4 text-table font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-label font-bold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        {u.email && <div className="text-[10px] text-zinc-500">{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${u.name === 'AI Engine' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-table text-zinc-400">{u.dept}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {u.access.map(pkg => (
                        <span key={pkg} className="text-[10px] bg-zinc-900 border border-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toast.info(`Settings for ${u.name}`)} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="User Settings">
                        <Settings size={15} />
                      </button>
                      {u.name !== 'AI Engine' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Company Import Wizard Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#111113] border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <FolderOpen size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Company & Workspace</h3>
                  <p className="text-xs text-zinc-400">Import existing company backup, configuration pack, or connected tools</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Import Source</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pack', label: 'Config Pack', icon: Package },
                    { id: 'file', label: 'Backup JSON', icon: FileText },
                    { id: 'provider', label: 'Connected Tool', icon: Shield }
                  ].map(src => {
                    const Icon = src.icon;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => setImportSource(src.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          importSource === src.id ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{src.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Organization / Company Name</label>
                <input
                  type="text"
                  required
                  value={importCompanyName}
                  onChange={(e) => setImportCompanyName(e.target.value)}
                  placeholder="e.g. Acme Global Services, Apex Talent Inc."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Target Business Domain Pack</label>
                <select
                  value={importDomain}
                  onChange={(e) => setImportDomain(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Recruitment">Recruitment & Staffing OS</option>
                  <option value="Healthcare">Healthcare & Hospital OS</option>
                  <option value="Professional Services">Professional Services & Consulting OS</option>
                  <option value="Retail & Local">E-Commerce & Retail OS</option>
                  <option value="Finance & Banking">Finance & Accounting OS</option>
                  <option value="SaaS">SaaS & Platform OS</option>
                </select>
              </div>

              {importSource === 'file' && (
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Upload Workspace Backup (.json or .chatr)</label>
                  <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 text-center space-y-2">
                    <FolderOpen size={24} className="mx-auto text-indigo-400" />
                    <p className="text-xs text-zinc-400">
                      {importFile ? importFile.name : 'Click to select or drag backup file here'}
                    </p>
                    <input
                      type="file"
                      accept=".json,.chatr"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="import-file-input"
                    />
                    <label htmlFor="import-file-input" className="inline-block px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white font-bold cursor-pointer hover:bg-zinc-700">
                      Choose File
                    </label>
                  </div>
                </div>
              )}

              {importSource === 'provider' && (
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Select External Integration Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Google Workspace', 'Microsoft 365', 'Salesforce CRM', 'SAP ERP'].map(p => (
                      <div key={p} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Import & Launch Business OS</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Generic Package Dashboard ───────────────────────────────────────────────


// ─── Category-aware workspace sections ────────────────────────────────────────

const WORKSPACE_SECTIONS: Record<string, { label: string; icon: string; emptyTitle: string; emptyDesc: string; actions: string[] }[]> = {
 'Executive & Strategy': [
 { label: 'Objectives', icon: '🎯', emptyTitle: 'No objectives yet', emptyDesc: 'Create your first company-level objective to start tracking strategic progress.', actions: ['+ New Objective'] },
 { label: 'Key Results', icon: '📊', emptyTitle: 'No key results defined', emptyDesc: 'Add key results to your objectives to measure progress quantitatively.', actions: ['+ Add Key Result'] },
 { label: 'Initiatives', icon: '🚀', emptyTitle: 'No initiatives linked', emptyDesc: 'Link strategic initiatives to your key results to drive execution.', actions: ['+ New Initiative'] },
 { label: 'Check-ins', icon: '✅', emptyTitle: 'No check-ins logged', emptyDesc: 'Schedule your first check-in to update progress on key results.', actions: ['+ Schedule Check-in'] },
 ],
 'CRM & Sales': [
 { label: 'Records', icon: '📋', emptyTitle: 'No records yet', emptyDesc: 'Add your first record to start tracking this capability.', actions: ['+ New Record'] },
 { label: 'Activities', icon: '📞', emptyTitle: 'No activities logged', emptyDesc: 'Log calls, emails, and meetings to track engagement history.', actions: ['+ Log Activity'] },
 { label: 'Pipeline', icon: '📈', emptyTitle: 'Pipeline is empty', emptyDesc: 'Add items to your pipeline to track them through stages.', actions: ['+ Add to Pipeline'] },
 { label: 'Reports', icon: '📉', emptyTitle: 'No data to report', emptyDesc: 'Reports will populate as you add and progress records.', actions: [] },
 ],
 'Finance': [
 { label: 'Transactions', icon: '💳', emptyTitle: 'No transactions yet', emptyDesc: 'Create your first transaction to start tracking financial data.', actions: ['+ New Transaction'] },
 { label: 'Pending Approvals', icon: '⏳', emptyTitle: 'Nothing pending approval', emptyDesc: 'Submitted items waiting for approval will appear here.', actions: [] },
 { label: 'Reports', icon: '📊', emptyTitle: 'No financial data yet', emptyDesc: 'Financial reports will generate automatically as data is added.', actions: [] },
 { label: 'Budgets', icon: '💰', emptyTitle: 'No budgets configured', emptyDesc: 'Set up budgets to track and control spending by department.', actions: ['+ Create Budget'] },
 ],
 'Recruitment & HR': [
 { label: 'Active Records', icon: '👤', emptyTitle: 'No records yet', emptyDesc: 'Add your first record to begin tracking this HR capability.', actions: ['+ New Record'] },
 { label: 'Workflows', icon: '🔄', emptyTitle: 'No workflows running', emptyDesc: 'Automated workflows will appear here when triggered.', actions: [] },
 { label: 'Pending Actions', icon: '📌', emptyTitle: 'No pending actions', emptyDesc: 'Actions requiring your attention will surface here.', actions: [] },
 { label: 'Analytics', icon: '📈', emptyTitle: 'No data yet', emptyDesc: 'Analytics will populate as you use this capability.', actions: [] },
 ],
 'Operations': [
 { label: 'Active Items', icon: '⚙️', emptyTitle: 'No items yet', emptyDesc: 'Create your first item to start using this capability.', actions: ['+ Create Item'] },
 { label: 'In Progress', icon: '🔄', emptyTitle: 'Nothing in progress', emptyDesc: 'Items currently being worked on will appear here.', actions: [] },
 { label: 'Completed', icon: '✅', emptyTitle: 'Nothing completed yet', emptyDesc: 'Completed items will appear here for record keeping.', actions: [] },
 { label: 'Analytics', icon: '📊', emptyTitle: 'No analytics data', emptyDesc: 'Usage analytics will populate automatically.', actions: [] },
 ],
 'Marketing': [
 { label: 'Active Campaigns', icon: '📣', emptyTitle: 'No campaigns running', emptyDesc: 'Create your first campaign to start reaching your audience.', actions: ['+ New Campaign'] },
 { label: 'Drafts', icon: '✏️', emptyTitle: 'No drafts saved', emptyDesc: 'Drafts you save will appear here for later publishing.', actions: ['+ Start Draft'] },
 { label: 'Analytics', icon: '📈', emptyTitle: 'No performance data', emptyDesc: 'Campaign performance metrics will appear once campaigns are live.', actions: [] },
 { label: 'Audience', icon: '👥', emptyTitle: 'No audience segments', emptyDesc: 'Create audience segments to target your campaigns more effectively.', actions: ['+ New Segment'] },
 ],
 'Customer Support': [
 { label: 'Open Items', icon: '🔔', emptyTitle: 'No open items', emptyDesc: 'Open support items will appear here as they are created.', actions: ['+ New Item'] },
 { label: 'In Progress', icon: '⏳', emptyTitle: 'Nothing in progress', emptyDesc: 'Items being worked on will show here.', actions: [] },
 { label: 'Resolved', icon: '✅', emptyTitle: 'Nothing resolved yet', emptyDesc: 'Resolved items will be archived here.', actions: [] },
 { label: 'SLA Status', icon: '⏱️', emptyTitle: 'SLA tracking will begin', emptyDesc: 'SLA tracking starts as soon as items are created.', actions: [] },
 ],
 'Communication': [
 { label: 'Recent', icon: '💬', emptyTitle: 'No recent activity', emptyDesc: 'Recent communications will appear here.', actions: ['+ New'] },
 { label: 'Scheduled', icon: '📅', emptyTitle: 'Nothing scheduled', emptyDesc: 'Schedule communications in advance and they will appear here.', actions: ['+ Schedule'] },
 { label: 'Templates', icon: '📝', emptyTitle: 'No templates created', emptyDesc: 'Create reusable templates to save time on recurring communications.', actions: ['+ New Template'] },
 { label: 'Analytics', icon: '📊', emptyTitle: 'No communication data yet', emptyDesc: 'Engagement analytics will populate as you communicate.', actions: [] },
 ],
 'AI & Automation': [
 { label: 'Active', icon: '🤖', emptyTitle: 'No automations active', emptyDesc: 'Deploy your first automation to start saving time.', actions: ['+ New Automation'] },
 { label: 'Runs', icon: '▶️', emptyTitle: 'No runs yet', emptyDesc: 'Automation execution history will appear here.', actions: [] },
 { label: 'Templates', icon: '📋', emptyTitle: 'No templates', emptyDesc: 'Pre-built automation templates will help you get started faster.', actions: ['+ Browse Templates'] },
 { label: 'Analytics', icon: '📈', emptyTitle: 'No performance data', emptyDesc: 'Time saved and runs completed will be tracked here.', actions: [] },
 ],
 'Enterprise Platform': [
 { label: 'Configuration', icon: '⚙️', emptyTitle: 'Not configured yet', emptyDesc: 'Configure this capability to activate it for your organization.', actions: ['Configure Now'] },
 { label: 'Activity Log', icon: '📋', emptyTitle: 'No activity yet', emptyDesc: 'All activity related to this platform service will be logged here.', actions: [] },
 { label: 'Users & Access', icon: '🔐', emptyTitle: 'No users assigned', emptyDesc: 'Assign users and roles to control who can access this capability.', actions: ['+ Assign Users'] },
 { label: 'Analytics', icon: '📊', emptyTitle: 'No data yet', emptyDesc: 'Usage metrics will appear here as the platform is used.', actions: [] },
 ],
};

const DEFAULT_SECTIONS = [
 { label: 'Overview', icon: '📋', emptyTitle: 'No data yet', emptyDesc: 'Data will appear here as you use this capability.', actions: ['+ Get Started'] },
 { label: 'Activity', icon: '🔄', emptyTitle: 'No activity yet', emptyDesc: 'Activity will be logged here automatically.', actions: [] },
 { label: 'Settings', icon: '⚙️', emptyTitle: 'Not configured', emptyDesc: 'Use the Configure button above to set up this capability.', actions: ['Configure'] },
 { label: 'Analytics', icon: '📈', emptyTitle: 'No analytics yet', emptyDesc: 'Analytics will appear as data is added.', actions: [] },
];




const MODULE_TO_PACKAGE_MAP: Record<string, string> = {
 // Executive
 'ceo_dash': 'Executive.CEOOffice',
 'strategy_okrs': 'Executive.StrategicPlanning',
 'exec_reports': 'Executive.RiskManagement',
 'decision_tracker': 'Executive.DecisionTracker',
 
 // Sales
 'leads': 'CRM.LeadManagement',
 'accounts': 'CRM.Accounts',
 'opportunities': 'CRM.OpportunityManagement',
 'pipeline': 'CRM.SalesPipeline',
 'quotes': 'CRM.Quotations',
 'contracts': 'Operations.ProjectManagement',
 'forecasting': 'Platform.Analytics',
 
 // Recruitment
 'requisitions': 'HR.ATS',
 'candidates': 'HR.EmployeeDirectory',
 'ai_matching': 'HR.ATS',
 'interview_sched': 'HR.Onboarding',
 'offers': 'HR.ATS',
 'bench': 'HR.EmployeeDirectory',

 // Delivery
 'resource_alloc': 'Operations.ProjectManagement',
 'project_staffing': 'Operations.ProjectManagement',
 'sla_tracking': 'Operations.ProjectManagement',

 // Operations
 'task_mgmt': 'Operations.ProjectManagement',
 'process_builder': 'AI.WorkflowAutomation',
 'capacity_plan': 'Operations.ProjectManagement',

 // Finance
 'invoices': 'Finance.Invoicing',
 'receivables': 'Finance.Invoicing',
 'payables': 'Finance.Expenses',
 'profit_loss': 'Finance.Budgeting',

 // Communication
 'chat': 'Communication.Announcements',
 'video': 'Communication.MeetingRooms',
 'channels': 'Communication.Announcements',

 // Knowledge
 'wiki': 'Support.KnowledgeBase',
 'sops': 'Support.KnowledgeBase',
 'policies': 'Support.KnowledgeBase',
};

export { IdentityAccessView };
