import React, { useState } from 'react';
import { X, Settings, Loader2, CheckCircle2 } from 'lucide-react';

const AppConfigModal = ({ pkg, onClose, onSave }: { pkg: any, onClose: () => void, onSave: (config: Record<string, any>) => void }) => {
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    (pkg.configSchema || []).forEach((f: any) => { defaults[f.key] = f.defaultValue ?? ''; });
    return defaults;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const groups = [...new Set((pkg.configSchema || []).map((f: any) => f.group || 'General'))];

  const handleSave = async () => {
    setSaving(true);
    // Simulate config save to OS Kernel
    setTimeout(() => {
      setSaved(true);
      onSave(config);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
      setSaving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-page">{pkg.icon}</div>
            <div>
              <h2 className="text-section font-bold text-white">{pkg.name}</h2>
              <p className="text-label text-zinc-500">{pkg.category} • {pkg.maturity}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Config Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
          {groups.map(group => {
            const fields = (pkg.configSchema || []).filter((f: any) => (f.group || 'General') === group);
            return (
              <div key={group}>
                <h3 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-zinc-700" />{group}
                </h3>
                <div className="space-y-4">
                  {fields.map((field: any) => (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-secondary font-medium text-zinc-300">{field.label}</label>
                        {field.required && <span className="text-[10px] text-amber-400 font-bold">REQUIRED</span>}
                      </div>
                      {field.description && <p className="text-label text-zinc-500 mb-2">{field.description}</p>}

                      {field.type === 'boolean' && (
                        <button
                          onClick={() => setConfig(c => ({ ...c, [field.key]: !c[field.key] }))}
                          className={`relative w-12 h-6 rounded-full transition-all ${config[field.key] ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${config[field.key] ? 'left-7' : 'left-1'}`} />
                        </button>
                      )}
                      {(field.type === 'text' || field.type === 'email' || field.type === 'url') && (
                        <input
                          type={field.type}
                          value={config[field.key]}
                          onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-secondary text-white focus:outline-none focus:border-indigo-500/70 transition-colors"
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={config[field.key]}
                          onChange={e => setConfig(c => ({ ...c, [field.key]: Number(e.target.value) }))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-secondary text-white focus:outline-none focus:border-indigo-500/70 transition-colors"
                        />
                      )}
                      {field.type === 'color' && (
                        <div className="flex items-center gap-3">
                          <input type="color" value={config[field.key]} onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 bg-transparent" />
                          <span className="text-secondary text-zinc-400 font-mono">{config[field.key]}</span>
                        </div>
                      )}
                      {field.type === 'select' && (
                        <select
                          value={config[field.key]}
                          onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-secondary text-white focus:outline-none focus:border-indigo-500/70 transition-colors"
                        >
                          {(field.options || []).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'multiselect' && (
                        <div className="flex flex-wrap gap-2">
                          {(field.options || field.defaultValue || []).map((opt: string) => {
                            const selected = Array.isArray(config[field.key]) ? config[field.key].includes(opt) : (config[field.key] || '').includes(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  const cur = Array.isArray(config[field.key]) ? [...config[field.key]] : [];
                                  setConfig(c => ({ ...c, [field.key]: selected ? cur.filter(v => v !== opt) : [...cur, opt] }));
                                }}
                                className={`px-3 py-1.5 rounded-lg text-label border transition-all ${selected ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                              >{opt}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {(!pkg.configSchema || pkg.configSchema.length === 0) && (
            <div className="text-center py-8 text-zinc-500 text-secondary">
              <Settings size={24} className="mx-auto mb-3 text-zinc-700" />
              This capability uses default settings. No additional configuration required.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-zinc-800 bg-zinc-950/50">
          <button onClick={onClose} className="px-5 py-2 text-button text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-secondary font-bold transition-all flex items-center gap-2 ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Settings size={15} /> Save Configuration</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export { AppConfigModal };
