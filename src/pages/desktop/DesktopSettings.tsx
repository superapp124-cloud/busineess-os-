import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Shield, 
  Smartphone, 
  Sparkles, 
  Palette, 
  Bell, 
  HardDrive,
  User,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';

export const DesktopSettings: React.FC = () => {
  const navigate = useNavigate();

  const settingCards = [
    {
      title: 'Account & Privacy',
      description: 'Manage your personal info and security.',
      icon: <User className="w-6 h-6 text-blue-500" />,
      items: [
        { label: 'Profile', path: '/profile' },
        { label: 'Privacy settings', path: '/privacy' },
        { label: 'Two-step verification', path: '/account' }
      ]
    },
    {
      title: 'Connected Devices',
      description: 'Manage phones, tablets, and sessions.',
      icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
      items: [
        { label: 'Pixel 9 (Active)', path: '/device-management' },
        { label: 'iPad Pro', path: '/device-management' },
        { label: 'Link new device', path: '/desktop/connect' }
      ]
    },
    {
      title: 'AI Intelligence',
      description: 'Configure how AI assists your workspace.',
      icon: <Sparkles className="w-6 h-6 text-[#5c22ff]" />,
      items: [
        { label: 'Smart summaries', path: '/desktop/intelligence' },
        { label: 'Auto-replies', path: '/desktop/intelligence' },
        { label: 'Contextual search', path: '/desktop/intelligence' }
      ]
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel.',
      icon: <Palette className="w-6 h-6 text-rose-500" />,
      items: [
        { label: 'Theme (Dark)', path: '/settings/appearance' },
        { label: 'Chat wallpaper', path: '/settings/wallpaper' },
        { label: 'Compact mode', path: '/settings/appearance' }
      ]
    },
    {
      title: 'Notifications',
      description: 'Control when and how you are alerted.',
      icon: <Bell className="w-6 h-6 text-amber-500" />,
      items: [
        { label: 'Sounds', path: '/settings/notifications' },
        { label: 'Desktop badges', path: '/settings/notifications' },
        { label: 'Muted chats', path: '/settings/notifications' }
      ]
    },
    {
      title: 'Storage & Data',
      description: 'Manage files and media downloads.',
      icon: <HardDrive className="w-6 h-6 text-indigo-500" />,
      items: [
        { label: 'Auto-download', path: '/settings' },
        { label: 'Clear cache', path: '/settings' },
        { label: 'Network usage', path: '/settings' }
      ]
    }
  ];

  return (
    <div className="flex-1 bg-slate-50/50 p-8 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your Communication Workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingCards.map((card, idx) => (
            <Card key={idx} className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group bg-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{card.title}</h2>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{card.description}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {card.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate(item.path)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
