import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, BrainCircuit, Calendar, CheckSquare, Clock, ShieldAlert, PhoneIncoming, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { useService } from '@/platform/Infrastructure/PlatformContext';

interface CalendarEvent {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

interface CallSummary {
  id: string;
  phone_number: string;
  contact_name: string | null;
  duration_seconds: number;
  summary: string;
  sentiment: string;
  key_points: string[];
  action_items: string[];
  calendar_events: CalendarEvent[];
  generated_at: string;
}

const DesktopIntelligence: React.FC = () => {
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark';

  const [summaries, setSummaries] = useState<CallSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Live AI Chat ──────────────────────────────────────────────────────────
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const ai = useService<any>('AIPlatform');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const handleAiSubmit = async () => {
    const prompt = aiInput.trim();
    if (!prompt || isStreaming) return;

    setAiInput('');
    setAiResponse('');
    setAiError(null);
    setIsStreaming(true);

    try {
      await ai.chatStream(
        prompt,
        (chunk: string) => {
          setAiResponse((prev) => prev + chunk);
          aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        },
        (_full: string) => {
          setIsStreaming(false);
        },
        'desktop-intelligence',
        currentUserId || 'anonymous'
      );
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI request failed');
      setIsStreaming(false);
    }
  };

  const handleAiKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_call_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error && error.code !== '42P01') { // Ignore missing table error if backend isn't deployed yet
        console.error('Error fetching ChatrAI summaries:', error);
        // Leave it empty so testers can load demo summaries when the backend is not deployed.
      } else if (data) {
        setSummaries(data);
      }
    } catch (error) {
      console.error('Failed to fetch ChatrAI summaries', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = (event: any, summary: any) => {
    // Create ICS file content
    const eventTitle = event.title || 'Meeting';
    
    // Parse date and time. Assuming format like "2026-06-30" and "14:30"
    let startStr = '';
    let endStr = '';
    try {
      if (event.date && event.time) {
        const d = new Date(`${event.date}T${event.time}:00`);
        // Format to YYYYMMDDTHHMMSSZ for ICS
        startStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        // Assume 1 hour duration
        d.setHours(d.getHours() + 1);
        endStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      } else {
        throw new Error('Invalid date/time');
      }
    } catch (e) {
      // Fallback to now + 1 hour
      const now = new Date();
      startStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      now.setHours(now.getHours() + 1);
      endStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChatrAI//Desktop App//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:ChatrAI-detected event from call with ${summary.contact_name}.\\n\\nOriginal call summary:\\n${summary.summary}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Real AI analysis of actual call history
  const generateRealAISummary = async () => {
    if (!currentUserId) return;
    setIsGeneratingAI(true);
    try {
      // Fetch real calls from Supabase
      const { data: calls } = await supabase
        .from('calls')
        .select('id, call_type, status, started_at, duration, receiver_phone, caller_id')
        .or(`caller_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('started_at', { ascending: false })
        .limit(10);

      if (!calls?.length) {
        toast.info('No calls found to analyze yet. Make some calls first!');
        setIsGeneratingAI(false);
        return;
      }

      // Build a prompt from real call data
      const callSummaryText = calls.map(c => 
        `Call on ${new Date(c.started_at).toLocaleDateString()}: type=${c.call_type}, status=${c.status}, duration=${c.duration || 0}s, phone=${c.receiver_phone || 'N/A'}`
      ).join('\n');

      const prompt = `You are CHATR AI Intelligence. Analyze these real call records and generate a JSON array of call summaries. For each call, infer realistic context from the data available.\n\nCall Records:\n${callSummaryText}\n\nGenerate a JSON array where each item has: id (string), phone_number, contact_name (infer or use 'Contact'), duration_seconds (number), summary (2-3 sentences), sentiment (positive/neutral/negative), key_points (array of 3 strings), action_items (array of 2 strings), calendar_events (empty array), generated_at (ISO string).\n\nReturn ONLY the JSON array, no markdown.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      // Clean potential markdown fences
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setSummaries(parsed);
      toast.success('AI analysis complete!');
    } catch (err) {
      console.error('AI analysis failed:', err);
      toast.error('AI analysis failed. Check your Gemini API key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const term = searchQuery.toLowerCase();
    return (
      s?.contact_name?.toLowerCase().includes(term) ||
      s?.phone_number?.includes(term) ||
      s?.summary?.toLowerCase().includes(term)
    );
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'negative': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'scam_risk': return 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/50';
      default: return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment.toLowerCase() === 'scam_risk') {
      return <ShieldAlert className="w-3 h-3 mr-1" />;
    }
    return <BrainCircuit className="w-3 h-3 mr-1" />;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            ChatrAI Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ChatrAI-powered post-call insights, scam reports, and actionable items.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-muted-foreground/20 rounded-full transition-all focus-visible:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-64 bg-muted/20 border-muted-foreground/10"></Card>
            ))}
          </div>
        ) : filteredSummaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <BrainCircuit className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Call Summaries Yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Complete calls on CHATR to generate AI-powered summaries. Click below to analyze your call history with Gemini AI.
              </p>
              <Button onClick={generateRealAISummary} disabled={isGeneratingAI} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="w-4 h-4 mr-2" />
                {isGeneratingAI ? 'Analyzing...' : 'Analyze My Calls with AI'}
              </Button>
            </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]">
                <CardHeader className="pb-3 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border-b border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <PhoneIncoming className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {summary.contact_name || 'Unknown Caller'}
                          {summary.sentiment === 'scam_risk' && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">
                          {summary.phone_number} - {formatDuration(summary.duration_seconds)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize px-2.5 py-0.5", getSentimentColor(summary.sentiment))}>
                      {getSentimentIcon(summary.sentiment)}
                      {summary.sentiment.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5 pt-4">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm leading-relaxed shadow-inner">
                    <span className="font-semibold text-white/90 mr-2">Summary:</span>
                    <span className="text-white/70">{summary.summary}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Points */}
                    {summary.key_points && summary.key_points.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> Key Points
                        </h4>
                        <ul className="space-y-2">
                          {summary.key_points.map((pt, i) => (
                            <li key={i} className="text-sm text-white/80 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {summary.action_items && summary.action_items.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Action Items
                        </h4>
                        <ul className="space-y-2">
                          {summary.action_items.map((action, i) => (
                            <li key={i} className="text-sm text-white/80 flex items-start gap-2.5">
                              <span className="w-3.5 h-3.5 mt-0.5 border-2 border-emerald-500/50 rounded flex-shrink-0" />
                              <span className="leading-snug">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Calendar Events */}
                  {summary.calendar_events && summary.calendar_events.length > 0 && (
                    <div className="pt-3 border-t border-white/5 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 mb-3">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> Detected Events
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {summary.calendar_events.map((event, i) => (
                          <div key={i} className="flex items-center justify-between w-full bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 hover:bg-purple-500/20 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-purple-300">{event.title}</span>
                              <span className="text-xs text-purple-400/70 mt-0.5 font-medium">{event.date} at {event.time}</span>
                            </div>
                            <Button size="sm" onClick={() => downloadICS(event, summary)} className="h-8 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                              Add to Calendar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 pb-4 text-[11px] font-medium text-white/40 flex items-center gap-1.5 bg-black/10 border-t border-white/5">
                  <Clock className="w-3 h-3" />
                  Generated {summary.generated_at ? format(parseISO(summary.generated_at), 'MMM d, h:mm a') : 'Unknown time'}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* ── Live AI Chat Panel ─────────────────────────────────────────── */}
        <div className="mt-8 mb-4 mx-1">
          <Card className="bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900/60 backdrop-blur-xl border border-indigo-500/20 shadow-[0_0_40px_-10px_rgba(99,102,241,0.25)]">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-300">
                <BrainCircuit className="w-4 h-4" />
                Ask ChatrAI
                <span className="text-xs text-indigo-400/60 font-normal ml-1">- powered by local Ollama</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Response area */}
              {(aiResponse || isStreaming || aiError) && (
                <div className="bg-black/30 rounded-xl border border-white/5 p-4 min-h-[80px] max-h-64 overflow-y-auto text-sm leading-relaxed text-white/80 font-mono">
                  {aiError ? (
                    <span className="text-red-400">{aiError}</span>
                  ) : (
                    <>
                      {aiResponse}
                      {isStreaming && (
                        <span className="inline-block w-[2px] h-[1em] bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                      )}
                    </>
                  )}
                  <div ref={aiResponseRef} />
                </div>
              )}

              {/* Input row */}
              <div className="flex gap-3 items-end">
                <Textarea
                  placeholder="Ask anything about your calls, summaries, or get AI assistance… (Enter to send)"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAiKeyDown}
                  disabled={isStreaming}
                  rows={2}
                  className="flex-1 resize-none bg-muted/30 border-muted-foreground/20 focus-visible:ring-indigo-500/50 text-sm placeholder:text-white/30"
                />
                <Button
                  onClick={handleAiSubmit}
                  disabled={!aiInput.trim() || isStreaming}
                  className="h-[60px] w-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 shadow-lg shadow-indigo-500/20"
                >
                  {isStreaming
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DesktopIntelligence;
