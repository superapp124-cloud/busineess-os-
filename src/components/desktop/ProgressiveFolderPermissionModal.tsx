import React from 'react';

export interface FolderPermissionProps {
  folderName: string; // e.g. "Documents", "Downloads", "Projects"
  useCases: string[]; // e.g. ["Search your local files", "Resume & contract parsing", "Local RAG context"]
  onAllow: () => void;
  onDeny: () => void;
}

export const ProgressiveFolderPermissionModal: React.FC<FolderPermissionProps> = ({
  folderName,
  useCases,
  onAllow,
  onDeny
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
        
        {/* Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xl">
            📁
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Access {folderName} Folder?</h3>
            <p className="text-xs text-slate-400">Contextual Local Memory Permission</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          Allowing CHATR Desktop to read your <span className="font-semibold text-white">{folderName}</span> folder enables local AI indexing over your private files.
        </p>

        {/* Benefits */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 mb-6 space-y-2">
          {useCases.map((uc, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-cyan-400 font-bold">✓</span>
              <span>{uc}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
          <span>🔒 Files are indexed 100% locally and never uploaded to cloud servers.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDeny}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all border border-slate-700/60"
          >
            Not Now
          </button>
          <button
            onClick={onAllow}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            Allow Access
          </button>
        </div>

      </div>
    </div>
  );
};
