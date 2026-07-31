import React, { useState, useEffect } from 'react';
import { 
  Inbox, Mail, MessageSquare, Phone, Bell, Users, Search, Filter, 
  Star, Archive, Trash2, Reply, Forward, MoreHorizontal, ChevronDown, 
  Plus, Sparkles, CheckCircle, Clock, AlertTriangle, X, RefreshCw, 
  Settings, Linkedin, Github, Slack, Globe, Send, Paperclip, Smile, Bot, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type MessageSource = 'Gmail' | 'Outlook' | 'Yahoo' | 'iCloud' | 'WhatsApp' | 'Instagram' | 'LinkedIn' | 'Slack' | 'Teams' | 'Discord' | 'GitHub' | 'Twitter/X' | 'Telegram' | 'Signal' | 'Facebook';
type Priority = 'URGENT' | 'ACTION' | 'FYI';
type Category = 'All Messages' | 'Personal Mail' | 'Professional Mail' | 'Social Messages' | 'Professional Networks' | 'SMS & Calls' | 'Notifications' | 'Support Tickets';

interface Message {
  id: string;
  source: MessageSource;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  priority: Priority;
  category: Category;
  read: boolean;
  starred: boolean;
}

// Source Configurations
const sourceConfig: Record<MessageSource, { color: string; code: string }> = {
  'Gmail': { color: '#EA4335', code: 'Gm' },
  'Outlook': { color: '#0078D4', code: 'Ol' },
  'Yahoo': { color: '#6001D2', code: 'Ya' },
  'iCloud': { color: '#555555', code: 'iC' },
  'WhatsApp': { color: '#25D366', code: 'Wa' },
  'Instagram': { color: '#E1306C', code: 'In' },
  'LinkedIn': { color: '#0A66C2', code: 'Li' },
  'Slack': { color: '#4A154B', code: 'Sl' },
  'Teams': { color: '#6264A7', code: 'Te' },
  'Discord': { color: '#5865F2', code: 'Di' },
  'GitHub': { color: '#24292e', code: 'Gh' },
  'Twitter/X': { color: '#000000', code: 'X' },
  'Telegram': { color: '#0088CC', code: 'Tg' },
  'Signal': { color: '#3A76F0', code: 'Si' },
  'Facebook': { color: '#1877F2', code: 'Fb' },
};

const mockMessages: Message[] = [
  { id: '1', source: 'Gmail', sender: 'Amazon', subject: 'Invoice from Amazon - ₹4,599 due', preview: 'Please find attached your invoice for order #114-1234. Payment is due by...', time: '2m ago', priority: 'URGENT', category: 'Personal Mail', read: false, starred: false },
  { id: '2', source: 'Outlook', sender: 'Satya Nadella', subject: 'Meeting with Microsoft Partnership Team', preview: 'Looking forward to our discussion about the integration roadmap tomorrow.', time: '15m ago', priority: 'ACTION', category: 'Professional Mail', read: false, starred: true },
  { id: '3', source: 'LinkedIn', sender: 'Sarah Recruiter', subject: 'Recruiter: Senior role at Google', preview: 'Hi Arshid, I saw your profile and thought you might be a great fit for...', time: '32m ago', priority: 'ACTION', category: 'Professional Networks', read: false, starred: false },
  { id: '4', source: 'WhatsApp', sender: 'Family Group', subject: 'Mama\'s birthday tomorrow!', preview: 'Don\'t forget we are meeting at 7PM for dinner at the usual place.', time: '1h ago', priority: 'FYI', category: 'Social Messages', read: true, starred: false },
  { id: '5', source: 'Slack', sender: '#engineering', subject: 'Deploy failed on prod', preview: 'The latest build failed during the e2e test phase. Logs are attached.', time: '1h ago', priority: 'URGENT', category: 'Professional Networks', read: false, starred: false },
  { id: '6', source: 'Teams', sender: 'HR Dept', subject: 'Policy update requires acknowledgment', preview: 'Please review and acknowledge the updated WFH policy by EOW.', time: '2h ago', priority: 'ACTION', category: 'Professional Networks', read: true, starred: false },
  { id: '7', source: 'GitHub', sender: 'Gaurav Kumar', subject: 'PR #847: Review requested', preview: 'Added the new unified inbox components. Needs your review on the API integration.', time: '2h ago', priority: 'ACTION', category: 'Professional Networks', read: false, starred: true },
  { id: '8', source: 'Twitter/X', sender: '@chatr_app', subject: 'Mentioned you in a thread', preview: 'Check out how @arshid is building the future of communication OS!', time: '3h ago', priority: 'FYI', category: 'Social Messages', read: true, starred: false },
  { id: '9', source: 'Instagram', sender: '@arshid_design', subject: 'New DM received', preview: 'Love the new dark mode UI you posted! How did you handle the...', time: '3h ago', priority: 'FYI', category: 'Social Messages', read: true, starred: false },
  { id: '10', source: 'Telegram', sender: 'Support Bot', subject: 'Customer Query: Order not received', preview: 'User ID 4432 reporting order #994 not delivered yet.', time: '4h ago', priority: 'URGENT', category: 'Support Tickets', read: false, starred: false },
  { id: '11', source: 'Gmail', sender: 'IndiGo', subject: 'Flight booking confirmation: DEL → BOM', preview: 'Your flight is confirmed. PNR: XYZ123. Departure at 08:30 AM.', time: '4h ago', priority: 'FYI', category: 'Personal Mail', read: true, starred: false },
  { id: '12', source: 'Discord', sender: 'CI Bot', subject: 'Build notification: CI passed ✓', preview: 'All tests passed on main branch. Ready for deployment.', time: '5h ago', priority: 'FYI', category: 'Professional Networks', read: true, starred: false },
  { id: '13', source: 'Yahoo', sender: 'HDFC Bank', subject: 'Bank statement for June 2026', preview: 'Your monthly statement is attached as a password protected PDF.', time: '6h ago', priority: 'FYI', category: 'Personal Mail', read: true, starred: false },
  { id: '14', source: 'LinkedIn', sender: 'John Doe', subject: 'John commented on your post', preview: 'Great insights! I totally agree that unified comms is the future.', time: '7h ago', priority: 'FYI', category: 'Professional Networks', read: true, starred: false },
  { id: '15', source: 'Gmail', sender: 'Acme Corp', subject: 'Q3 Proposal from Acme Corp', preview: 'Attached is the revised proposal for Q3 deliverables.', time: 'Yesterday', priority: 'ACTION', category: 'Personal Mail', read: true, starred: true },
  { id: '16', source: 'Outlook', sender: 'TalentXcel', subject: 'Offer letter: TalentXcel SERVICES', preview: 'Congratulations! We are pleased to offer you the position of...', time: 'Yesterday', priority: 'ACTION', category: 'Professional Mail', read: true, starred: true },
  { id: '17', source: 'Slack', sender: '#sales', subject: 'New enterprise lead from Mumbai', preview: 'Reliance just reached out for a demo of the enterprise plan.', time: 'Yesterday', priority: 'FYI', category: 'Professional Networks', read: true, starred: false },
  { id: '18', source: 'WhatsApp', sender: 'Swiggy Instamart', subject: 'Vendor: Delivery confirmed', preview: 'Your order has been delivered successfully. Enjoy!', time: 'Yesterday', priority: 'FYI', category: 'Social Messages', read: true, starred: false },
  { id: '19', source: 'Teams', sender: 'Design Team', subject: 'Design review meeting at 3PM', preview: 'Let\'s review the final mocks for the mobile app navigation.', time: 'Yesterday', priority: 'ACTION', category: 'Professional Networks', read: true, starred: false },
  { id: '20', source: 'GitHub', sender: 'System', subject: 'Issue #234 assigned to you', preview: 'Bug: Sidebar doesn\'t collapse properly on tablet view.', time: '2d ago', priority: 'ACTION', category: 'Professional Networks', read: true, starred: false },
];

export const UniversalInbox: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Messages');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(mockMessages[0].id);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = mockMessages.filter(msg => {
    const matchesCategory = selectedCategory === 'All Messages' || msg.category === selectedCategory;
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedMessage = mockMessages.find(msg => msg.id === selectedMessageId);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-white overflow-hidden font-sans">
      
      {/* Left Sidebar */}
      <div className="w-64 bg-zinc-900/50 border-r border-white/5 flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Inbox size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Universal</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search all channels..." 
              className="w-full bg-black/40 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <CategoryItem 
            active={selectedCategory === 'All Messages'} 
            onClick={() => setSelectedCategory('All Messages')}
            icon={<Inbox size={16} />}
            label="All Messages"
            count={286}
          />
          
          <div className="mt-4 mb-1 px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mail</div>
          <CategoryItem 
            active={selectedCategory === 'Personal Mail'} 
            onClick={() => setSelectedCategory('Personal Mail')}
            icon={<Mail size={16} />}
            label="Personal Mail"
            count={94}
          />
          <CategoryItem 
            active={selectedCategory === 'Professional Mail'} 
            onClick={() => setSelectedCategory('Professional Mail')}
            icon={<Globe size={16} />}
            label="Professional Mail"
            count={31}
          />

          <div className="mt-4 mb-1 px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Social & Network</div>
          <CategoryItem 
            active={selectedCategory === 'Social Messages'} 
            onClick={() => setSelectedCategory('Social Messages')}
            icon={<MessageSquare size={16} />}
            label="Social Messages"
            count={67}
          />
          <CategoryItem 
            active={selectedCategory === 'Professional Networks'} 
            onClick={() => setSelectedCategory('Professional Networks')}
            icon={<Users size={16} />}
            label="Professional Networks"
            count={44}
          />

          <div className="mt-4 mb-1 px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Other</div>
          <CategoryItem 
            active={selectedCategory === 'SMS & Calls'} 
            onClick={() => setSelectedCategory('SMS & Calls')}
            icon={<Phone size={16} />}
            label="SMS & Calls"
            count={12}
          />
          <CategoryItem 
            active={selectedCategory === 'Notifications'} 
            onClick={() => setSelectedCategory('Notifications')}
            icon={<Bell size={16} />}
            label="Notifications"
            count={28}
          />
          <CategoryItem 
            active={selectedCategory === 'Support Tickets'} 
            onClick={() => setSelectedCategory('Support Tickets')}
            icon={<AlertTriangle size={16} />}
            label="Support Tickets"
            count={10}
          />
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsAddAccountOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-sm font-medium py-2.5 rounded-lg transition-colors border border-white/5"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Message List (Center) */}
      <div className="flex-1 flex flex-col h-full bg-black/20 relative">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 bg-zinc-900/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-lg">{selectedCategory}</h2>
            <span className="text-zinc-500 text-sm">({filteredMessages.length})</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Filter size={16} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><RefreshCw size={16} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Inbox size={48} className="mb-4 opacity-20" />
              <p>No messages found in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredMessages.map(msg => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-all flex flex-col gap-1.5 relative group",
                    selectedMessageId === msg.id 
                      ? "bg-white/5 border-l-2 border-violet-500 pl-[14px]" 
                      : "hover:bg-white/[0.02] border-l-2 border-transparent pl-[14px]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: sourceConfig[msg.source].color }}
                        title={msg.source}
                      >
                        {sourceConfig[msg.source].code}
                      </div>
                      <span className={cn("text-sm truncate max-w-[200px]", !msg.read ? "font-bold text-white" : "font-medium text-zinc-300")}>
                        {msg.sender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs", msg.read ? "text-zinc-500" : "text-violet-400 font-medium")}>{msg.time}</span>
                      <PriorityBadge priority={msg.priority} />
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm truncate mb-0.5", !msg.read ? "font-semibold text-zinc-100" : "text-zinc-300")}>
                        {msg.subject}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {msg.preview}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:text-yellow-400 text-zinc-500 transition-colors">
                        <Star size={14} className={msg.starred ? "fill-yellow-400 text-yellow-400" : ""} />
                      </button>
                      <button className="p-1 hover:text-zinc-300 text-zinc-500 transition-colors">
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel (Selected Message & AI) */}
      <div className="w-[340px] bg-zinc-900/40 border-l border-white/5 flex flex-col h-full flex-shrink-0 backdrop-blur-xl">
        {selectedMessage ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
              <span className="text-sm font-medium text-zinc-400">Thread Details</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400"><Reply size={16} /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400"><Forward size={16} /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                    style={{ backgroundColor: sourceConfig[selectedMessage.source].color }}
                  >
                    {sourceConfig[selectedMessage.source].code}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedMessage.sender}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      via {selectedMessage.source} • {selectedMessage.time}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-4 leading-tight">{selectedMessage.subject}</h3>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-50"><Bot size={40} className="text-violet-500/20" /></div>
                  <div className="flex items-center gap-2 text-violet-400 mb-2 font-medium text-sm">
                    <Sparkles size={14} /> AI Summary
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed relative z-10">
                    This message is regarding <strong className="text-zinc-100">{selectedMessage.subject.toLowerCase()}</strong>. 
                    The sender is providing an update and requesting your attention. 
                    {selectedMessage.priority === 'URGENT' && " This is marked as urgent and requires immediate attention."}
                    {selectedMessage.priority === 'ACTION' && " An action is required from your side."}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400"/> Smart Replies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-medium text-zinc-300 transition-colors border border-white/5">
                      Got it, thanks!
                    </button>
                    <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-medium text-zinc-300 transition-colors border border-white/5">
                      I'll look into this today.
                    </button>
                    <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-medium text-zinc-300 transition-colors border border-white/5">
                      Can we discuss this further?
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Context & Related</div>
                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-sm space-y-2">
                    <div className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer">
                      <Mail size={14} className="text-blue-400"/> Previous email from {selectedMessage.sender}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer">
                      <FileIcon /> 2 files shared in the past
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/80">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Quick reply..." 
                  className="w-full bg-black/50 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-violet-500/50"
                />
                <button className="absolute right-2 top-2 p-1 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-colors">
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a message to view details, AI summary, and quick actions.</p>
          </div>
        )}
      </div>

      {/* Add Account Modal Overlay */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold">Add Communication Channel</h2>
                <p className="text-sm text-zinc-400 mt-1">Connect your accounts to bring all messages into one unified inbox.</p>
              </div>
              <button 
                onClick={() => setIsAddAccountOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input 
                    type="email" 
                    placeholder="Enter email to auto-detect provider..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white"
                  />
                  <button className="absolute right-2 top-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg text-sm transition-colors border border-white/5">
                    Detect
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Email Providers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                <ProviderCard name="Gmail" icon={<Mail />} color="#EA4335" />
                <ProviderCard name="Outlook" icon={<Mail />} color="#0078D4" />
                <ProviderCard name="Yahoo" icon={<Mail />} color="#6001D2" />
                <ProviderCard name="iCloud" icon={<Mail />} color="#555555" />
                <ProviderCard name="ProtonMail" icon={<Mail />} color="#6D4AFF" />
                <ProviderCard name="IMAP / POP3" icon={<Settings />} color="#888888" />
              </div>

              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Work & Social Networks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ProviderCard name="Slack" icon={<Slack />} color="#4A154B" />
                <ProviderCard name="Microsoft Teams" icon={<Users />} color="#6264A7" />
                <ProviderCard name="LinkedIn" icon={<Linkedin />} color="#0A66C2" />
                <ProviderCard name="WhatsApp" icon={<Phone />} color="#25D366" />
                <ProviderCard name="Discord" icon={<MessageSquare />} color="#5865F2" />
                <ProviderCard name="GitHub" icon={<Github />} color="#24292e" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponents

function CategoryItem({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
        active 
          ? "bg-violet-500/10 text-violet-400 font-medium" 
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn(
        "text-xs px-1.5 py-0.5 rounded-md", 
        active ? "bg-violet-500/20 text-violet-300" : "bg-zinc-800 text-zinc-500"
      )}>
        {count}
      </span>
    </button>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'URGENT') return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">URGENT</span>;
  if (priority === 'ACTION') return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">ACTION</span>;
  return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">FYI</span>;
}

function ProviderCard({ name, icon, color }: { name: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer group">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white shadow-lg transform group-hover:scale-105 transition-transform"
        style={{ backgroundColor: color }}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className="text-sm font-medium text-zinc-200">{name}</span>
      <button className="mt-3 text-xs bg-zinc-800 group-hover:bg-violet-600 group-hover:text-white px-3 py-1 rounded-full transition-colors w-full border border-white/5 group-hover:border-transparent">
        Connect
      </button>
    </div>
  );
}

function FileIcon() {
  return <Paperclip size={14} className="text-zinc-500" />;
}
