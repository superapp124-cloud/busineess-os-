/**
 * KnowledgeBrainPanel — Canvas / Infinite Canvas right-side Knowledge Graph
 *
 * Shows live extracted entities as a visual knowledge graph:
 * - People nodes with connections
 * - Topic clusters
 * - Timeline of knowledge
 * - AI "connect the dots" insights
 * - Document search
 */

import React, { useState, useEffect } from 'react';
import {
  Brain, Users, FileText, Calendar, Sparkles, Search,
  ArrowRight, Clock, Hash, Link2, Loader2, Plus, BookOpen,
  Network, Lightbulb, ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCHATROS } from '@/core/os/GlobalIntentProvider';
import { generate } from '@/services/ai';

interface KnowledgeNode {
  id: string;
  type: 'person' | 'topic' | 'date' | 'company' | 'intent';
  label: string;
  connections: string[];
  strength: number; // 0–1
}

interface KnowledgeBrainPanelProps {
  onNodeClick?: (node: KnowledgeNode) => void;
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  person:  { bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', dot: 'bg-blue-500' },
  topic:   { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  date:    { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', dot: 'bg-amber-500' },
  company: { bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', dot: 'bg-violet-500' },
  intent:  { bg: 'bg-rose-500/10', border: 'border-rose-500/25', text: 'text-rose-400', dot: 'bg-rose-500' },
};

const NODE_ICONS: Record<string, React.ReactNode> = {
  person:  <Users className="w-3 h-3" />,
  topic:   <Hash className="w-3 h-3" />,
  date:    <Calendar className="w-3 h-3" />,
  company: <FileText className="w-3 h-3" />,
  intent:  <ArrowRight className="w-3 h-3" />,
};

export const KnowledgeBrainPanel: React.FC<KnowledgeBrainPanelProps> = ({ onNodeClick }) => {
  const { knowledge, observeText } = useCHATROS();
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Build knowledge nodes from extracted data
  useEffect(() => {
    const built: KnowledgeNode[] = [];

    knowledge.people.forEach((p, i) => {
      built.push({
        id: `person-${i}`,
        type: 'person',
        label: p,
        connections: [...knowledge.topics.slice(0, 2), ...knowledge.dates.slice(0, 1)],
        strength: 0.8,
      });
    });

    knowledge.topics.forEach((t, i) => {
      built.push({
        id: `topic-${i}`,
        type: 'topic',
        label: t,
        connections: knowledge.people.slice(0, 2),
        strength: 0.6,
      });
    });

    knowledge.dateLabels.forEach((d, i) => {
      built.push({
        id: `date-${i}`,
        type: 'date',
        label: d,
        connections: [],
        strength: 0.5,
      });
    });

    knowledge.companies.forEach((c, i) => {
      built.push({
        id: `company-${i}`,
        type: 'company',
        label: c,
        connections: knowledge.people.slice(0, 1),
        strength: 0.7,
      });
    });

    knowledge.intents.forEach((intent, i) => {
      built.push({
        id: `intent-${i}`,
        type: 'intent',
        label: intent.charAt(0).toUpperCase() + intent.slice(1),
        connections: [],
        strength: 0.9,
      });
    });

    setNodes(built);
  }, [knowledge]);

  const generateInsight = async () => {
    if (nodes.length < 2) return;
    setAiLoading(true);
    try {
      const summary = `People: ${knowledge.people.join(', ')}. Topics: ${knowledge.topics.join(', ')}. Intents: ${knowledge.intents.join(', ')}.`;
      const prompt = `Based on this knowledge graph: ${summary}. Generate one actionable AI insight connecting these entities. 1-2 sentences, be specific.`;
      const insight = await generate({ prompt });
      setAiInsight(insight || 'Connect with the people mentioned and follow up on the detected topics to move work forward.');
    } catch {
      setAiInsight('The detected entities suggest a follow-up conversation is needed. Consider scheduling a meeting.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node.id === selectedNode?.id ? null : node);
    observeText(node.label);
    onNodeClick?.(node);
  };

  const hasKnowledge = nodes.length > 0;
  const filteredNodes = searchQuery
    ? nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : nodes;

  return (
    <div className="w-[270px] shrink-0 flex flex-col border-l border-white/[0.04] bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/[0.04] shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Knowledge Brain</span>
          <span className="ml-auto text-[9px] font-bold text-white/20">{nodes.length} nodes</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search knowledge..."
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-7 pr-3 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">

          {/* Empty state */}
          {!hasKnowledge && (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/[0.06] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white/20" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-white/30">Knowledge graph is empty</p>
                <p className="text-[10px] text-white/20 mt-1">Start working — people, topics and<br/>dates appear automatically</p>
              </div>
              <div className="w-full space-y-1.5">
                {['Find my most active projects', 'Show documents from last week', 'Connect meetings to active tasks'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => observeText(s)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] text-[10px] text-white/40 hover:text-white/70 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Insight */}
          {hasKnowledge && (
            <div className="p-2.5 rounded-xl bg-purple-500/[0.07] border border-purple-500/15">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3 h-3 text-purple-400" />
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">AI Insight</span>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                  <Loader2 className="w-3 h-3 animate-spin" /> Connecting dots...
                </div>
              ) : aiInsight ? (
                <p className="text-[10px] text-white/60 leading-relaxed">{aiInsight}</p>
              ) : (
                <button
                  onClick={generateInsight}
                  disabled={nodes.length < 2}
                  className="w-full py-1.5 text-[10px] text-purple-400 font-semibold hover:text-purple-300 transition-colors text-left disabled:opacity-40"
                >
                  Connect the dots →
                </button>
              )}
            </div>
          )}

          {/* Node type legend */}
          {hasKnowledge && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(NODE_COLORS).map(([type, colors]) => (
                nodes.some(n => n.type === type) && (
                  <span key={type} className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border', colors.bg, colors.border, colors.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                    {type}
                  </span>
                )
              ))}
            </div>
          )}

          {/* Knowledge nodes */}
          {filteredNodes.length > 0 && (
            <div className="space-y-1.5">
              {filteredNodes.map(node => {
                const colors = NODE_COLORS[node.type];
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div key={node.id}>
                    <button
                      onClick={() => handleNodeClick(node)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all text-left',
                        isSelected
                          ? `${colors.bg} ${colors.border} border-opacity-60`
                          : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.10]'
                      )}
                    >
                      <div className={cn('p-1.5 rounded-lg shrink-0', colors.bg)}>
                        <span className={colors.text}>{NODE_ICONS[node.type]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white/80 truncate">{node.label}</p>
                        {node.connections.length > 0 && (
                          <p className="text-[9px] text-white/30 truncate">
                            linked to {node.connections.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Strength bar */}
                        <div className="w-8 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', colors.dot)}
                            style={{ width: `${node.strength * 100}%` }}
                          />
                        </div>
                        <ChevronRight className={cn('w-3 h-3 text-white/15 transition-transform', isSelected && 'rotate-90')} />
                      </div>
                    </button>

                    {/* Expanded node detail */}
                    {isSelected && node.connections.length > 0 && (
                      <div className="ml-8 mt-1 space-y-1">
                        {node.connections.slice(0, 3).map((conn, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02]">
                            <Link2 className="w-2.5 h-2.5 text-white/20 shrink-0" />
                            <span className="text-[10px] text-white/50">{conn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Timeline */}
          {knowledge.dateLabels.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 px-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Timeline
              </p>
              <div className="relative pl-4 space-y-2">
                <div className="absolute left-1 top-2 bottom-2 w-px bg-white/[0.06]" />
                {knowledge.dateLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500/50 border border-amber-500/30 shrink-0 -ml-[3px]" />
                    <span className="text-[10px] text-white/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
