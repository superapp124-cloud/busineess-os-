import React, { memo, useState } from 'react';
import { CheckCircle2, Circle, Clock, Laptop, ShieldCheck, UserCheck, FileText, Sparkles, Send, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

export interface OnboardingHire {
  id: string;
  name: string;
  role: string;
  startDate: string;
  progressPct: number;
  avatarBg: string;
  steps: { id: string; title: string; desc: string; icon: React.ElementType; status: 'completed' | 'in_progress' | 'pending' }[];
}

const DEFAULT_ONBOARDING_HIRES: OnboardingHire[] = [];

export const OnboardingTab = memo(({ initialHires = DEFAULT_ONBOARDING_HIRES }: { initialHires?: OnboardingHire[] }) => {
  const [hires, setHires] = useState<OnboardingHire[]>(initialHires);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAddHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      toast.error('Please enter hire name and role');
      return;
    }
    const created: OnboardingHire = {
      id: `onb-${Date.now()}`,
      name,
      role,
      startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      progressPct: 25,
      avatarBg: 'bg-emerald-600',
      steps: [
        { id: 's1', title: 'Offer Accepted & Signed', desc: 'Offer letter countersigned by candidate', icon: FileText, status: 'completed' },
        { id: 's2', title: 'Background Check & EPFO', desc: 'Identity & employment verification', icon: ShieldCheck, status: 'in_progress' },
        { id: 's3', title: 'IT Assets & Laptop Request', desc: 'Developer Laptop & Credentials Requested', icon: Laptop, status: 'pending' },
        { id: 's4', title: 'HRMS & Payroll Creation', desc: 'Employee ID creation pending', icon: UserCheck, status: 'pending' },
      ],
    };
    setHires(prev => [created, ...prev]);
    setShowModal(false);
    setName('');
    setRole('');
    toast.success(`New Hire Onboarding initialized for ${name}!`);
  };

  const toggleStep = (hireId: string, stepId: string) => {
    setHires(prev => prev.map(h => {
      if (h.id !== hireId) return h;
      const updatedSteps = h.steps.map(s => {
        if (s.id !== stepId) return s;
        const nextStatus = s.status === 'completed' ? 'in_progress' : s.status === 'in_progress' ? 'pending' : 'completed';
        return { ...s, status: nextStatus as any };
      });
      const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
      const pct = Math.round((completedCount / updatedSteps.length) * 100);
      return { ...h, steps: updatedSteps, progressPct: pct };
    }));
    toast.success('Onboarding step updated');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0D12] text-white relative">
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Add New Hire to Onboarding</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddHire} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Target Designation & Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#5c22ff] hover:bg-[#4b1ac4] text-white font-bold rounded-lg">Initialize Onboarding</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            New Hire Onboarding Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated workflow tracking for accepted hires prior to Day 1.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#5c22ff] hover:bg-[#4b1ac4] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#5c22ff]/20">
          <Plus className="w-4 h-4" /> Add New Hire
        </button>
      </div>

      <div className="space-y-4">
        {hires.map(h => (
          <div key={h.id} className="bg-[#141721] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${h.avatarBg} text-white font-black text-sm flex items-center justify-center`}>
                  {h.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{h.name}</h3>
                  <p className="text-xs text-slate-400">{h.role} • Joining {h.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#5c22ff] h-full transition-all duration-500" style={{ width: `${h.progressPct}%` }} />
                </div>
                <span className="text-xs font-black text-indigo-400">{h.progressPct}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              {h.steps.map(s => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStep(h.id, s.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      s.status === 'completed' ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' :
                      s.status === 'in_progress' ? 'bg-indigo-950/40 border-indigo-800/80 text-indigo-300' :
                      'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{s.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

OnboardingTab.displayName = 'OnboardingTab';

export { OnboardingTab as OnboardingTrackerView };
