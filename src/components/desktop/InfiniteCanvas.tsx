import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { KnowledgeBrainPanel } from '@/components/canvas/KnowledgeBrainPanel';
import {
  MessageSquare, FileText, Calendar, Sparkles, ZoomIn, ZoomOut,
  Search, Users, LayoutGrid, List, GitBranch, Clock, Activity,
  ChevronRight, ChevronDown, Brain, Zap, AlertTriangle, CheckCircle,
  ArrowRight, Star, BarChart2, Play, MoreHorizontal, Share2, Download,
  Eye, Edit2, Send, PlusCircle, Filter, BarChart, MapPin, Layers,
  Briefcase, Hash, Bell, Settings, RefreshCw, Cpu, Globe, X,
  MessageCircle, Phone, Video, UserPlus, FilePlus, FolderOpen, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useKnowledgeGraph, KnowledgeNode, KnowledgeEdge, NodeType, EdgeLabel, JourneyStep, WorkLogItem, TeamMember } from '@/hooks/useKnowledgeGraph';
import { DocumentLockBadge } from '@/platform/Domain/Collaboration/DocumentLockBadge';
// ─── Helpers ─────────────────────────────────────────────────────────────────

const nodeColors: Record<NodeType, { bg: string; border: string; icon: string; badge: string }> = {
  meeting:  { bg: '#1e1b4b', border: '#6366f1', icon: '#818cf8', badge: '#6366f1' },
  document: { bg: '#0c1a2e', border: '#0ea5e9', icon: '#38bdf8', badge: '#0ea5e9' },
  person:   { bg: '#0d1f17', border: '#10b981', icon: '#34d399', badge: '#10b981' },
  ai:       { bg: '#1a0f2e', border: '#a855f7', icon: '#c084fc', badge: '#a855f7' },
  task:     { bg: '#1c150a', border: '#f59e0b', icon: '#fbbf24', badge: '#f59e0b' },
  chat:     { bg: '#0f1c1a', border: '#14b8a6', icon: '#2dd4bf', badge: '#14b8a6' },
};

const nodeHoverActions: Record<NodeType, { label: string; icon: React.ReactNode }[]> = {
  meeting:  [
    { label: 'Join', icon: <Video className="w-3.5 h-3.5" /> },
    { label: 'Prepare', icon: <FileText className="w-3.5 h-3.5" /> },
    { label: 'Invite', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { label: 'Gen Agenda', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ],
  document: [
    { label: 'Open', icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { label: 'Summarize', icon: <Brain className="w-3.5 h-3.5" /> },
    { label: 'Ask AI', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'Share', icon: <Share2 className="w-3.5 h-3.5" /> },
  ],
  person:   [
    { label: 'Message', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { label: 'Call', icon: <Phone className="w-3.5 h-3.5" /> },
    { label: 'Schedule', icon: <Calendar className="w-3.5 h-3.5" /> },
    { label: 'Profile', icon: <Eye className="w-3.5 h-3.5" /> },
  ],
  ai:       [
    { label: 'View', icon: <Eye className="w-3.5 h-3.5" /> },
    { label: 'Merge', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { label: 'Search', icon: <Search className="w-3.5 h-3.5" /> },
    { label: 'Delete', icon: <X className="w-3.5 h-3.5" /> },
  ],
  task:     [
    { label: 'Open', icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { label: 'Assign', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { label: 'Complete', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { label: 'Comment', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  ],
  chat:     [
    { label: 'Open', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { label: 'Reply', icon: <Send className="w-3.5 h-3.5" /> },
    { label: 'Pin', icon: <Star className="w-3.5 h-3.5" /> },
    { label: 'Share', icon: <Share2 className="w-3.5 h-3.5" /> },
  ],
};

const getNodeIcon = (type: NodeType, size = 'w-5 h-5') => {
  const colors = nodeColors[type];
  switch (type) {
    case 'meeting':  return <Calendar className={size} style={{ color: colors.icon }} />;
    case 'document': return <FileText className={size} style={{ color: colors.icon }} />;
    case 'person':   return <Users className={size} style={{ color: colors.icon }} />;
    case 'ai':       return <Brain className={size} style={{ color: colors.icon }} />;
    case 'task':     return <CheckCircle className={size} style={{ color: colors.icon }} />;
    case 'chat':     return <MessageSquare className={size} style={{ color: colors.icon }} />;
  }
};

const statusBadge = (status?: string) => {
  if (!status || status === 'idle') return null;
  const cfg: Record<string, { label: string; color: string; pulse: boolean }> = {
    live:        { label: 'Live', color: '#22c55e', pulse: true },
    recent:      { label: 'Updated', color: '#0ea5e9', pulse: false },
    typing:      { label: 'Typing…', color: '#6366f1', pulse: true },
    summarizing: { label: 'AI Working…', color: '#a855f7', pulse: true },
  };
  const c = cfg[status];
  if (!c) return null;
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.color + '22', color: c.color }}>
      {c.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: c.color }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.color }} />
        </span>
      )}
      {c.label}
    </span>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProjectHealth: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 18;
  const dashoffset = circumference * (1 - score / 100);
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r="18" fill="none" stroke="#ffffff10" strokeWidth="4" />
        <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{score}%</span>
    </div>
  );
};

interface NodeCardProps {
  node: KnowledgeNode;
  isSelected: boolean;
  onClick: () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const colors = nodeColors[node.type];
  const actions = nodeHoverActions[node.type];

  return (
    <div
      className="canvas-node absolute select-none"
      style={{ left: node.x, top: node.y, width: 220, zIndex: hovered || isSelected ? 10 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Main Card */}
      <div
        className="rounded-2xl p-3.5 cursor-pointer transition-all duration-200"
        style={{
          background: colors.bg,
          border: `1.5px solid ${isSelected ? colors.border : hovered ? colors.border + '88' : colors.border + '33'}`,
          boxShadow: isSelected
            ? `0 0 0 3px ${colors.border}33, 0 8px 32px ${colors.border}22`
            : hovered ? `0 6px 24px ${colors.border}22` : '0 2px 8px #00000030',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl" style={{ background: colors.border + '22' }}>
              {getNodeIcon(node.type)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white leading-tight truncate max-w-[120px]">
                {node.title}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {statusBadge(node.status)}
            {node.health !== undefined && (
              <span className="text-[10px] text-slate-400">{node.health}% health</span>
            )}
          </div>
        </div>
        {node.subtitle && (
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2">{node.subtitle}</p>
        )}
        {node.people && node.people.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {node.people.slice(0, 3).map((p, i) => (
              <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: colors.border + '22', color: colors.icon }}>
                {p}
              </span>
            ))}
            {node.people.length > 3 && (
              <span className="text-[9px] text-slate-500">+{node.people.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover Action Bar */}
      {hovered && (
        <div
          className="flex items-center gap-1 mt-1.5 px-2 py-1.5 rounded-xl"
          style={{ background: '#1a1d2e', border: '1px solid #ffffff10' }}
        >
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`Action "${a.label}" triggered for ${node.title}`);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-150"
              style={{ color: colors.icon }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.border + '22')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {a.icon}
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// SVG Edges between nodes
const CanvasEdges: React.FC<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> = ({ nodes, edges }) => {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: 3000, height: 3000, zIndex: 0 }}>
      <defs>
        {edges.map((e, i) => (
          <marker key={i} id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={e.color + '88'} />
          </marker>
        ))}
      </defs>
      {edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const x1 = from.x + 110;
        const y1 = from.y + 44;
        const x2 = to.x + 110;
        const y2 = to.y + 44;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const cpx = mx - (dy / len) * 40;
        const cpy = my + (dx / len) * 40;
        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`}
              fill="none"
              stroke={edge.color + '44'}
              strokeWidth="1.5"
              strokeDasharray="5 4"
              markerEnd={`url(#arrow-${i})`}
            />
            <text
              x={cpx} y={cpy - 6}
              textAnchor="middle"
              fontSize="9"
              fill={edge.color + 'aa'}
              style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {edge.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── View Panels ──────────────────────────────────────────────────────────────

const TimelineView: React.FC<{ journeySteps: JourneyStep[] }> = ({ journeySteps }) => (
  <div className="p-6 overflow-y-auto h-full">
    <h3 className="text-white font-bold text-lg mb-6">Project Timeline</h3>
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />
      {journeySteps.map((step, i) => (
        <div key={i} className="flex gap-4 mb-8 relative group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            {step.iconType === 'meeting' ? <Calendar className="w-4 h-4" /> : step.iconType === 'document' ? <FileText className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </div>
          <div className="flex-1 pt-1.5 pb-4 px-4 rounded-xl"
            style={{ background: '#ffffff08', border: '1px solid #ffffff0d' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold text-sm">{step.label}</span>
              <span className="text-slate-500 text-xs">{step.time}</span>
            </div>
            <p className="text-slate-300 text-xs mb-1">{step.detail}</p>
            {step.actor && <span className="text-indigo-400 text-xs">· {step.actor}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BoardView: React.FC<{ nodes: KnowledgeNode[] }> = ({ nodes }) => {
  const columns: { label: string; types: NodeType[]; color: string }[] = [
    { label: 'Meetings', types: ['meeting'], color: '#6366f1' },
    { label: 'Documents', types: ['document'], color: '#0ea5e9' },
    { label: 'Tasks', types: ['task'], color: '#f59e0b' },
    { label: 'People', types: ['person'], color: '#10b981' },
  ];
  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full">
      {columns.map(col => (
        <div key={col.label} className="flex-shrink-0 w-64">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
            <span className="text-white font-semibold text-sm">{col.label}</span>
            <span className="text-slate-500 text-xs ml-auto">
              {nodes.filter(n => col.types.includes(n.type)).length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {nodes.filter(n => col.types.includes(n.type)).map(node => (
              <div key={node.id} className="p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background: nodeColors[node.type].bg, border: `1px solid ${nodeColors[node.type].border}33` }}>
                <div className="flex items-center gap-2 mb-1">
                  {getNodeIcon(node.type, 'w-4 h-4')}
                  <p className="text-white text-xs font-semibold truncate">{node.title}</p>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2">{node.subtitle}</p>
                {statusBadge(node.status)}
              </div>
            ))}
            <button className="w-full py-2 rounded-xl text-xs text-slate-500 border border-dashed border-slate-700 hover:border-slate-500 transition-colors flex items-center justify-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ListView: React.FC<{ nodes: KnowledgeNode[] }> = ({ nodes }) => (
  <div className="p-6 overflow-y-auto h-full">
    <table className="w-full">
      <thead>
        <tr className="text-slate-500 text-xs uppercase tracking-wider">
          <th className="text-left pb-4 pl-2">Name</th>
          <th className="text-left pb-4">Type</th>
          <th className="text-left pb-4">Status</th>
          <th className="text-left pb-4">People</th>
          <th className="text-left pb-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map(node => (
          <tr key={node.id}
            className="border-t border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-colors cursor-pointer group">
            <td className="py-3.5 pl-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg" style={{ background: nodeColors[node.type].border + '22' }}>
                  {getNodeIcon(node.type, 'w-4 h-4')}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{node.title}</p>
                  <p className="text-slate-500 text-xs">{node.subtitle}</p>
                </div>
              </div>
            </td>
            <td className="py-3.5">
              <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                style={{ background: nodeColors[node.type].border + '22', color: nodeColors[node.type].icon }}>
                {node.type}
              </span>
            </td>
            <td className="py-3.5">{statusBadge(node.status) ?? <span className="text-slate-600 text-xs">—</span>}</td>
            <td className="py-3.5">
              <div className="flex -space-x-1">
                {(node.people ?? []).slice(0, 3).map((p, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#0f1117]"
                    style={{ background: ['#6366f1', '#10b981', '#f59e0b'][i % 3] }}>
                    {typeof p === 'string' ? p[0] : 'U'}
                  </div>
                ))}
              </div>
            </td>
            <td className="py-3.5">
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {nodeHoverActions[node.type].slice(0, 2).map((a, i) => (
                  <button key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-300 hover:bg-white hover:bg-opacity-10 transition-colors">
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Journey Panel ────────────────────────────────────────────────────────────

const JourneyPanel: React.FC<{ node: KnowledgeNode; onClose: () => void; teamMembers: TeamMember[]; journeySteps: JourneyStep[]; nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> = ({ node, onClose, teamMembers, journeySteps, nodes, edges }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'chat' | 'files'>('overview');
  const [aiInsight, setAiInsight] = useState<string>('Analyzing node connections...');
  const colors = nodeColors[node.type];
  
  const connectedNodeIds = useMemo(() => {
    return edges
      .filter(e => e.from === node.id || e.to === node.id)
      .map(e => e.from === node.id ? e.to : e.from);
  }, [edges, node.id]);

  const connectedNodes = useMemo(() => {
    return nodes.filter(n => connectedNodeIds.includes(n.id));
  }, [nodes, connectedNodeIds]);

  const connectedTasks = connectedNodes.filter(n => n.type === 'task');
  const connectedPeople = connectedNodes.filter(n => n.type === 'person');
  const connectedDocs = connectedNodes.filter(n => n.type === 'document');
  const connectedChats = connectedNodes.filter(n => n.type === 'chat');

  useEffect(() => {
    async function fetchInsight() {
      setAiInsight('Analyzing node connections...');
      try {
        const { generate } = await import('@/services/ai');
        const connectedSummary = connectedNodes.map(n => n.title).join(', ');
        const prompt = `Analyze this ${node.type} node titled "${node.title}". It is connected to: ${connectedSummary || 'nothing'}. Generate a concise 2-sentence insight about its status and relationships.`;
        const answer = await generate({ prompt });
        setAiInsight(answer);
      } catch (err) {
        setAiInsight('Failed to generate AI insight.');
      }
    }
    fetchInsight();
  }, [node.id, connectedNodes]);

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'journey', label: 'Journey' },
    { id: 'files', label: `Files (${connectedDocs.length})` },
    { id: 'chat', label: `Chat (${connectedChats.length})` },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0f1a', borderLeft: '1px solid #ffffff0d' }}>
      {/* Header */}
      <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid #ffffff0a' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: colors.border + '22' }}>
            {getNodeIcon(node.type, 'w-5 h-5')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base leading-tight">{node.title}</h3>
              {node.type === 'document' && <DocumentLockBadge fileId={node.id} />}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{node.subtitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Health & Stats */}
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: '1px solid #ffffff0a' }}>
        <ProjectHealth score={node.health || 100} />
        <div className="grid grid-cols-3 gap-3 flex-1">
          {[{ label: 'Tasks', val: connectedTasks.length.toString() }, { label: 'People', val: connectedPeople.length.toString() }, { label: 'Files', val: connectedDocs.length.toString() }].map(m => (
            <div key={m.label} className="text-center p-2 rounded-lg" style={{ background: '#ffffff06' }}>
              <p className="text-white font-bold text-sm">{m.val}</p>
              <p className="text-slate-500 text-[10px]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-0" style={{ borderBottom: '1px solid #ffffff0a' }}>
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all"
            style={{
              color: activeTab === tab.id ? colors.icon : '#64748b',
              borderBottom: activeTab === tab.id ? `2px solid ${colors.border}` : '2px solid transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-5 space-y-4">
            {/* AI Insight */}
            <div className="p-4 rounded-xl" style={{ background: '#1a0f2e', border: '1px solid #a855f722' }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {aiInsight}
              </p>
              <button onClick={() => toast.info('Action triggered')} className="mt-3 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                <Send className="w-3 h-3" /> Take Action <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* People */}
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Participants</p>
              <div className="space-y-2">
                {teamMembers.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white hover:bg-opacity-5 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">{m.name}</p>
                      <p className="text-slate-500 text-[10px] truncate">{m.activity}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: m.status === 'online' ? '#22c55e' : m.status === 'busy' ? '#f59e0b' : '#64748b' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {nodeHoverActions[node.type].map((a, i) => (
                  <button key={i}
                    onClick={() => toast.success(`Triggered ${a.label}`)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5"
                    style={{ background: colors.border + '15', color: colors.icon, border: `1px solid ${colors.border}22` }}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="p-5">
            <p className="text-slate-400 text-xs mb-5">Every step in the lifecycle of this item</p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(to bottom, ${colors.border}, transparent)` }} />
              {journeySteps.map((step, i) => (
                <div key={i} className="flex gap-3 mb-6 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110"
                    style={{ background: colors.border + '33', color: colors.icon }}>
                    {step.iconType === 'meeting' ? <Calendar className="w-4 h-4" /> : step.iconType === 'document' ? <FileText className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-semibold">{step.label}</span>
                      <span className="text-slate-600 text-[10px]">{step.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{step.detail}</p>
                    {step.actor && <p className="text-slate-600 text-[10px] mt-0.5">by {step.actor}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-5 space-y-2">
            {connectedDocs.length === 0 ? (
              <p className="text-slate-500 text-sm">No connected documents.</p>
            ) : connectedDocs.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white hover:bg-opacity-5 transition-colors group"
                style={{ border: '1px solid #ffffff08' }}>
                <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <p className="text-white text-xs flex-1">{f.title}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toast.info(`Viewing ${f.title}`)} className="p-1 text-slate-400 hover:text-white"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toast.info(`Downloading ${f.title}`)} className="p-1 text-slate-400 hover:text-white"><Download className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full p-4">
            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
              {connectedChats.length === 0 ? (
                <p className="text-slate-500 text-sm text-center pt-10">No chats related to this item.</p>
              ) : connectedChats.map((c, i) => (
                <div key={c.id} className="flex justify-start">
                  <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-xs"
                    style={{ background: '#ffffff0d', color: '#e2e8f0' }}>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: colors.icon }}>{c.title}</p>
                    <p>{c.subtitle || 'Recent message in chat...'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl px-3 py-2 text-xs text-white outline-none"
                style={{ background: '#ffffff0d', border: '1px solid #ffffff15' }}
                placeholder="Start a discussion…"
              />
              <button onClick={() => toast.success('Message sent')} className="p-2 rounded-xl hover:opacity-80 transition-opacity" style={{ background: colors.border + '33' }}>
                <Send className="w-4 h-4" style={{ color: colors.icon }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const InfiniteCanvas: React.FC = () => {
  const { nodes, edges, updateNodePosition, teamMembers, journeySteps, workLog } = useKnowledgeGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [showAIAnswer, setShowAIAnswer] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{ summary: string; items: { type: string; title: string }[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'worklog' | 'analytics' | 'journey'>('worklog');

  const handleAISearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setAiLoading(true);
    setShowAIAnswer(true);
    setAiAnswer(null);
    try {
      // Build a rich context from the live knowledge graph
      const contextSummary = nodes.length > 0
        ? `Knowledge graph contains: ${nodes.map(n => `${n.type} "${n.title}"`).join(', ')}.`
        : 'Knowledge graph is currently empty.';

      const { generate } = await import('@/services/ai');
      const answer = await generate({
        prompt: `You are the AI assistant for the CHATR Knowledge Canvas. A user asked: "${query}". Context: ${contextSummary}. Give a concise, actionable answer in 2-3 sentences. If the knowledge graph is empty, suggest what they might want to do.`
      });

      setAiAnswer({
        summary: answer,
        items: nodes
          .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
          .map(n => ({ type: n.type, title: n.title }))
      });
    } catch (err: any) {
      // Graceful fallback to local search if AI is unavailable
      setAiAnswer({
        summary: `Showing local matches for "${query}". Connect CHATR Desktop for full AI search.`,
        items: nodes
          .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
          .map(n => ({ type: n.type, title: n.title }))
      });
    } finally {
      setAiLoading(false);
    }
  }, [nodes]);

  // Listen for autoTrigger shortcuts from Command Palette
  useEffect(() => {
    if (location.state?.autoTrigger) {
      let query = '';
      switch (location.state.autoTrigger) {
        case 'ai-summarize': query = 'Summarize yesterday'; break;
        case 'ai-draft': query = 'Draft a reply'; break;
        case 'ai-translate': query = 'Translate clipboard'; break;
        default: query = location.state.autoTrigger;
      }
      if (query) {
        setAiQuery(query);
        // We delay slightly to let the graph load first
        setTimeout(() => handleAISearch(query), 500);
      }
      window.history.replaceState({}, document.title); // clear state
    }
  }, [location, handleAISearch]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (viewMode !== 'graph') return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setScale(s => Math.min(Math.max(0.2, s + delta)));
    } else {
      setPosition(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, [viewMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'graph') return;
    if ((e.target as HTMLElement).closest('.canvas-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const filteredNodes = useMemo(() => nodes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [nodes, searchQuery]);

  const renderNavItems = useMemo(() => {
    const counts = nodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'projects', icon: <Briefcase className="w-4 h-4" />, label: 'Projects', count: counts['meeting'] || 0 },
      { id: 'people', icon: <Users className="w-4 h-4" />, label: 'People', count: counts['person'] || 0 },
      { id: 'meetings', icon: <Calendar className="w-4 h-4" />, label: 'Meetings', count: counts['meeting'] || 0 },
      { id: 'docs', icon: <FileText className="w-4 h-4" />, label: 'Documents', count: counts['document'] || 0 },
      { id: 'chats', icon: <MessageCircle className="w-4 h-4" />, label: 'Chats', count: counts['chat'] || 0 },
      { id: 'tasks', icon: <CheckCircle className="w-4 h-4" />, label: 'Tasks', count: counts['task'] || 0 },
    ].map(item => (
      <button key={item.id} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors group text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">{item.icon}</span>
          {!leftCollapsed && <span>{item.label}</span>}
        </div>
        {!leftCollapsed && <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full">{item.count}</span>}
      </button>
    ));
  }, [nodes, leftCollapsed]);

  const viewModes: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'graph', icon: <GitBranch className="w-4 h-4" />, label: 'Graph' },
    { id: 'timeline', icon: <Clock className="w-4 h-4" />, label: 'Timeline' },
    { id: 'board', icon: <LayoutGrid className="w-4 h-4" />, label: 'Board' },
    { id: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
    { id: 'calendar', icon: <Calendar className="w-4 h-4" />, label: 'Calendar' },
  ];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden text-white" style={{ background: '#080a10', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: '#0d0f1a', borderBottom: '1px solid #ffffff0d' }}>
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Knowledge Canvas</span>
        </div>

        <div className="flex-1 relative max-w-xl flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search people, docs, meetings, decisions…'
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white outline-none transition-all"
            style={{ background: '#ffffff0d', border: '1px solid #ffffff10' }}
          />
        </div>

        <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: '#ffffff0d' }}>
          {viewModes.map(vm => (
            <button
              key={vm.id}
              onClick={() => setViewMode(vm.id)}
              title={vm.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: viewMode === vm.id ? '#6366f1' : 'transparent',
                color: viewMode === vm.id ? '#fff' : '#64748b',
              }}>
              {vm.icon}
              <span className="hidden lg:inline">{vm.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT NAVIGATOR ── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300"
          style={{
            width: leftCollapsed ? 48 : 200,
            background: '#0d0f1a',
            borderRight: '1px solid #ffffff0d',
          }}>

          <button
            onClick={() => setLeftCollapsed(c => !c)}
            className="flex items-center justify-center p-3 text-slate-500 hover:text-white transition-colors self-end"
          >
            {leftCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex flex-col gap-0.5 px-2 flex-1">
            {renderNavItems}
          </div>
        </div>

        {/* ── CENTER: CANVAS / VIEWS ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">

          {/* Graph View */}
          {viewMode === 'graph' && (
            <div
              ref={containerRef}
              className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
                backgroundSize: `${32 * scale}px ${32 * scale}px`,
                backgroundPosition: `${position.x}px ${position.y}px`,
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute origin-top-left"
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, willChange: 'transform' }}
              >
                <CanvasEdges nodes={filteredNodes} edges={edges} />
                {filteredNodes.map(node => (
                  <NodeCard
                    key={node.id}
                    node={node as any}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node as any)}
                  />
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl z-50"
                style={{ background: '#0d0f1a', border: '1px solid #ffffff10', boxShadow: '0 8px 32px #00000040' }}>
                <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-400 w-10 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3, s + 0.2))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white bg-opacity-10 mx-1" />
                <button onClick={() => { setPosition({ x: 0, y: 0 }); setScale(1); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Empty state hint */}
              {filteredNodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Search className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No items match "{searchQuery}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="flex-1 overflow-y-auto" style={{ color: '#fff' }}>
              <TimelineView journeySteps={journeySteps} />
            </div>
          )}

          {viewMode === 'board' && (
            <div className="flex-1 overflow-hidden">
              <BoardView nodes={filteredNodes} />
            </div>
          )}

          {viewMode === 'list' && (
            <div className="flex-1 overflow-y-auto">
              <ListView nodes={filteredNodes} />
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-semibold">Calendar View</p>
                <p className="text-slate-600 text-sm mt-1">Showing 2 meetings this week</p>
                <div className="mt-6 grid grid-cols-7 gap-1 text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center py-2 text-slate-500">{d}</div>
                  ))}
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className={`text-center py-3 rounded-lg ${i === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                      style={i === 3 ? { background: '#0ea5e922', color: '#38bdf8' } : {}}>
                      {i + 1}
                      {i === 1 && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mx-auto mt-1" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom Work Log / Analytics ── */}
          <div className="flex-shrink-0" style={{ background: '#0d0f1a', borderTop: '1px solid #ffffff0d', height: 180 }}>
            {/* Bottom Tab Bar */}
            <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid #ffffff08' }}>
              {[
                { id: 'worklog' as const, label: 'Work Log', icon: <Activity className="w-3.5 h-3.5" /> },
                { id: 'journey' as const, label: 'Journey Timeline', icon: <GitBranch className="w-3.5 h-3.5" /> },
                { id: 'analytics' as const, label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveBottomTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeBottomTab === tab.id ? '#ffffff10' : 'transparent',
                    color: activeBottomTab === tab.id ? '#e2e8f0' : '#64748b',
                  }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Bottom Content */}
            <div className="flex gap-4 px-4 py-3 overflow-x-auto">
              {activeBottomTab === 'worklog' && workLog.map((item, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                  style={{ background: '#ffffff06', border: '1px solid #ffffff08' }}>
                  <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                  <div className="p-1.5 rounded-lg" style={{ background: nodeColors[item.type].border + '22' }}>
                    {getNodeIcon(item.type, 'w-3.5 h-3.5')}
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-medium whitespace-nowrap">
                      <span style={{ color: nodeColors[item.type].icon }}>{item.actor}</span> {item.action}
                    </p>
                    <p className="text-slate-500 text-[10px] whitespace-nowrap">{item.target}</p>
                  </div>
                </div>
              ))}

              {activeBottomTab === 'journey' && journeySteps.map((step, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                  style={{ background: '#ffffff06', border: '1px solid #ffffff08' }}>
                  {i > 0 && <ArrowRight className="w-3 h-3 text-slate-700 flex-shrink-0 -ml-1 mr-1" />}
                  <div className="p-1.5 rounded-lg text-indigo-400" style={{ background: '#6366f115' }}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-semibold whitespace-nowrap">{step.label}</p>
                    <p className="text-slate-500 text-[10px] whitespace-nowrap">{step.time}</p>
                  </div>
                </div>
              ))}

              {activeBottomTab === 'analytics' && (
                <div className="flex gap-4 flex-shrink-0">
                  {[
                    { label: 'Total Items', val: nodes.length.toString(), icon: <Layers className="w-4 h-4" />, color: '#6366f1' },
                    { label: 'Active People', val: (nodes.filter(n => n.type === 'person').length).toString(), icon: <Users className="w-4 h-4" />, color: '#10b981' },
                    { label: 'Open Tasks', val: (nodes.filter(n => n.type === 'task').length).toString(), icon: <CheckCircle className="w-4 h-4" />, color: '#f59e0b' },
                    { label: 'AI Confidence', val: nodes.length > 0 ? Math.min(99, 85 + nodes.length) + '%' : '0%', icon: <Cpu className="w-4 h-4" />, color: '#a855f7' },
                    { label: 'Documents', val: (nodes.filter(n => n.type === 'document').length).toString(), icon: <FileText className="w-4 h-4" />, color: '#0ea5e9' },
                    { label: 'Risks', val: '0', icon: <AlertTriangle className="w-4 h-4" />, color: '#ef4444' },
                  ].map((m, i) => (
                    <div key={i} className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ background: '#ffffff06', border: '1px solid #ffffff08' }}>
                      <div className="p-1.5 rounded-lg" style={{ background: m.color + '22', color: m.color }}>
                        {m.icon}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{m.val}</p>
                        <p className="text-slate-500 text-[10px]">{m.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: AI Workspace ── */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: selectedNode ? 320 : 280, background: '#0d0f1a', borderLeft: '1px solid #ffffff0d', transition: 'width 0.25s ease' }}>

          {selectedNode ? (
            <JourneyPanel node={selectedNode} onClose={() => setSelectedNode(null)} teamMembers={teamMembers} journeySteps={journeySteps} nodes={nodes} edges={edges} />
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* AI Header */}
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #ffffff0a' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f133, #a855f733)' }}>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white font-bold text-sm">AI Workspace</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#22c55e22', color: '#22c55e' }}>
                    Live
                  </span>
                </div>

                {/* Ask the Company */}
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && aiQuery) handleAISearch(aiQuery); }}
                      placeholder="Ask anything…"
                      className="flex-1 px-3 py-2 rounded-xl text-xs text-white outline-none"
                      style={{ background: '#ffffff0d', border: '1px solid #ffffff15' }}
                    />
                    <button
                      onClick={() => handleAISearch(aiQuery)}
                      disabled={aiLoading}
                      className="p-2 rounded-xl transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                      {aiLoading
                        ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        : <Send className="w-3.5 h-3.5 text-white" />}
                    </button>
                  </div>
                  {!aiQuery && (
                    <div className="flex flex-col gap-1.5 mt-3">
                      {['Show everything related to active tasks', 'Find all documents updated recently'].map((s, i) => (
                        <button key={i} onClick={() => { setAiQuery(s); setShowAIAnswer(true); }}
                          className="text-left text-[11px] text-white/40 hover:text-white/70 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Answer */}
              {showAIAnswer && (
                <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: '#1a0f2e', border: '1px solid #a855f722' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 text-[10px] font-bold uppercase tracking-wider">AI Answer</span>
                    <button onClick={() => { setShowAIAnswer(false); setAiQuery(''); setAiAnswer(null); }}
                      className="ml-auto text-slate-600 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-slate-400 text-xs">Searching your workspace…</span>
                    </div>
                  ) : aiAnswer ? (
                    <>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2">{aiAnswer.summary}</p>
                      {aiAnswer.items.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {aiAnswer.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400 py-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              <span className="font-medium text-white">{item.title}</span>
                              <span className="text-slate-600 capitalize">{item.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        {['Open Workspace', 'View Timeline', 'Generate Report'].map((a, i) => (
                          <button key={i} className="text-[10px] px-2 py-1 rounded-lg font-medium"
                            style={{ background: '#6366f122', color: '#818cf8' }}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* AI Insights */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">AI Insights</p>
                  <div className="space-y-2">
                    {[
                      { text: 'Several tasks are pending review.', icon: <Zap />, color: '#f59e0b', urgent: true },
                      { text: 'Unread mentions in active project channels.', icon: <AlertTriangle />, color: '#ef4444', urgent: true },
                      { text: 'Team Sync starts in 45 minutes.', icon: <Bell />, color: '#6366f1', urgent: false },
                      { text: 'AI generated 4 action items from today\'s meetings.', icon: <Brain />, color: '#a855f7', urgent: false },
                    ].map((insight, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-white hover:bg-opacity-5"
                        style={{ border: `1px solid ${insight.color}${insight.urgent ? '33' : '15'}` }}>
                        <div className="p-1 rounded-lg flex-shrink-0 mt-0.5" style={{ background: insight.color + '20', color: insight.color }}>
                          {React.cloneElement(insight.icon as React.ReactElement, { className: 'w-3 h-3' })}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Actions */}
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">Suggested Actions</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Remind Rahul about Budget review', color: '#ef4444' },
                      { label: 'Generate agenda for Pitch Prep', color: '#6366f1' },
                      { label: 'Share Q3 summary with Finance', color: '#0ea5e9' },
                    ].map((action, i) => (
                      <button key={i}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all hover:-translate-y-0.5"
                        style={{ background: '#ffffff06', border: '1px solid #ffffff08' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: action.color }} />
                        <span className="text-slate-300 text-[11px] flex-1">{action.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Presence */}
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">Team Presence</p>
                  <div className="space-y-1.5">
                    {teamMembers.map((m, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white hover:bg-opacity-5 cursor-pointer transition-colors">
                        <div className="relative flex-shrink-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: m.color }}>
                            {m.initials}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                            style={{
                              borderColor: '#0d0f1a',
                              background: m.status === 'online' ? '#22c55e' : m.status === 'busy' ? '#f59e0b' : '#64748b',
                            }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[11px] font-medium">{m.name}</p>
                          <p className="text-slate-500 text-[10px] truncate">{m.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automations Footer */}
              <div className="p-3 mx-3 mb-3 rounded-xl" style={{ background: '#1e1b4b', border: '1px solid #6366f122' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Automations</span>
                </div>
                <p className="text-slate-400 text-[11px] mb-2">3 automations active. Last ran 2 min ago.</p>
                <button className="text-[11px] font-medium text-indigo-400 flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Brain Panel — right side live knowledge graph */}
        <KnowledgeBrainPanel />
      </div>

    </div>
  );
};
