import React from 'react';
import { Sparkles, Paperclip, Smile, Mic, ArrowUp } from 'lucide-react';

export const UniversalCommandBar: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-4">
      <div className="bg-[#0f0f16] border border-white/10 rounded-full p-2 pl-4 flex items-center gap-3 shadow-2xl shadow-black/50">
        <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        
        <input 
          type="text" 
          placeholder="Ask anything. Type @ to mention or / for commands..." 
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
        />

        <div className="flex items-center gap-1 pr-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 ml-2 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors">
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
