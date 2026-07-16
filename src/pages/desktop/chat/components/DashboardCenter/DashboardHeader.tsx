import React, { useState, useEffect } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const DashboardHeader: React.FC<{
  onCreateNew?: () => void;
}> = ({ onCreateNew }) => {
  const [userName, setUserName] = useState('there');
  const [currentTime, setCurrentTime] = useState<string>('');

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, primary_handle')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          // Get first name
          setUserName(profile.full_name.split(' ')[0]);
        } else if (profile?.primary_handle) {
          setUserName(profile.primary_handle);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 capitalize">
            {greeting()}, {userName} <span className="text-xl">👋</span>
            {currentTime && (
              <span className="flex items-center gap-1.5 text-sm bg-white/10 px-2.5 py-1 rounded-lg ml-2 border border-white/20 backdrop-blur-md shadow-sm">
                <Clock className="w-4 h-4 text-violet-300" /> 
                <span className="tracking-wide font-medium">{currentTime}</span>
              </span>
            )}
          </h1>
          <p className="text-sm text-white/50 mt-0.5">Here's what's happening in your workspace today.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium border border-white/5 transition-colors"
        >
          Customize
        </button>
        <button 
          onClick={onCreateNew}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-500/20 transition-colors"
        >
          New
        </button>
      </div>
    </div>
  );
};
