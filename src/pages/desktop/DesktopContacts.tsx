import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, UserPlus, Phone, Video, MessageCircle, FileText, Clock, Activity, Sparkles, PhoneCall, PhoneMissed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCall } from '@/contexts/CallContext';

interface Contact {
  id: string; // contact table id
  profile_id?: string; // the linked user profile ID (if registered)
  display_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  email: string | null;
  is_online: boolean;
}

export const DesktopContacts: React.FC = () => {
  const { startCall } = useCall();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id, 
          name, 
          phone_number, 
          email, 
          contact_id,
          profiles!contact_id(id, username, full_name, avatar_url)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedContacts: Contact[] = (data || []).map((d: any) => {
        const profile = d.profiles;
        return {
          id: d.id,
          profile_id: profile?.id,
          display_name: profile?.full_name || profile?.username || d.name || 'Unknown',
          avatar_url: profile?.avatar_url || null,
          phone_number: d.phone_number,
          email: d.email,
          is_online: !!profile, // Just a placeholder indicator if they are a registered user
        };
      }).sort((a, b) => a.display_name.localeCompare(b.display_name));

      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone_number && c.phone_number.includes(searchQuery))
  );

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Contacts List */}
      <div className="w-80 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Contacts</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-24 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery ? 'No contacts found' : 'Your address book is empty'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                    selectedContact?.id === contact.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {contact.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.is_online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{contact.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.phone_number || contact.email || 'No phone'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Relationship Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedContact ? (
          <RelationshipWorkspace contact={selectedContact} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Relationship Workspace</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                Select a contact to view your complete history, shared documents, and AI insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Relationship Workspace Sub-Component
// ============================================

const RelationshipWorkspace: React.FC<{ contact: Contact }> = ({ contact }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  
  // Data
  const [messages, setMessages] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab('overview');
    setAiSummary(null);
    fetchRelationshipData();
  }, [contact.id]);

  const fetchRelationshipData = async () => {
    if (!contact.profile_id) {
      setLoading(false);
      return; // Not a registered CHATR user, no history
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Find the shared conversation between these two users
      // A simple approach since it's a 1-on-1: find conversations where both are participants
      const { data: myParticipations } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
      const myConvIds = myParticipations?.map(p => p.conversation_id) || [];
      
      let convId = null;
      if (myConvIds.length > 0) {
        const { data: shared } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', myConvIds)
          .eq('user_id', contact.profile_id)
          .limit(1);
        
        if (shared && shared.length > 0) {
          convId = shared[0].conversation_id;
          setConversationId(convId);
        }
      }

      // 2. Fetch Calls
      const { data: callData } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${contact.profile_id},receiver_id.eq.${contact.profile_id}`)
        .order('started_at', { ascending: false })
        .limit(20);
      setCalls(callData || []);

      if (convId) {
        // 3. Fetch Messages
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(20);
        setMessages((msgData || []).reverse());

        // 4. Fetch Files
        const { data: fileData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .eq('message_type', 'file')
          .order('created_at', { ascending: false })
          .limit(20);
        setFiles(fileData || []);
      } else {
        setMessages([]);
        setFiles([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!conversationId) return toast.info("No conversation history to summarize.");
    setAiSummary('Generating...');
    try {
      const { data, error } = await supabase.functions.invoke('summarize-chat', {
        body: { conversation_id: conversationId, max_messages: 50 }
      });
      if (data?.summary) setAiSummary(data.summary);
      else throw new Error("Failed");
    } catch {
      setAiSummary("Could not generate summary.");
    }
  };

  const quickAction = (action: string) => {
    if (!contact.profile_id) return toast.error("User is not registered on CHATR.");
    
    if (action === 'message' && conversationId) {
      navigate(`/desktop/chat?conversation=${conversationId}`);
    } else if (action === 'audio call') {
      startCall(contact.display_name, false);
    } else if (action === 'video call') {
      startCall(contact.display_name, true);
    } else {
      toast.success(`Starting ${action}...`);
    }
  };

  // Build a unified timeline for the "Timeline" tab
  const timelineItems = [...messages, ...calls, ...files].map(item => {
    if (item.caller_id) return { ...item, _type: 'call', _date: new Date(item.started_at) };
    if (item.message_type === 'file') return { ...item, _type: 'file', _date: new Date(item.created_at) };
    return { ...item, _type: 'message', _date: new Date(item.created_at) };
  }).sort((a, b) => b._date.getTime() - a._date.getTime());

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header Profile */}
      <div className="p-8 border-b border-border/50 flex items-start gap-6 bg-card/30">
        <Avatar className="w-24 h-24 shadow-sm border-2 border-background">
          <AvatarImage src={contact.avatar_url || undefined} />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {contact.display_name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold truncate text-foreground">{contact.display_name}</h1>
            {contact.is_online && <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Registered</span>}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {contact.phone_number && (
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {contact.phone_number}</span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {contact.email}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Button onClick={() => quickAction('message')} className="rounded-full shadow-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
            <Button onClick={() => quickAction('audio call')} variant="outline" className="rounded-full">
              <Phone className="w-4 h-4 mr-2" /> Call
            </Button>
            <Button onClick={() => quickAction('video call')} variant="outline" className="rounded-full">
              <Video className="w-4 h-4 mr-2" /> Video
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-8 border-b border-border/50 bg-card/30">
          <TabsList className="bg-transparent h-12 gap-6 w-full justify-start p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium">Overview</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium">Messages</TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium">Calls</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium">Files</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium">Timeline</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 max-w-4xl mx-auto">
            
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Sparkles className="w-24 h-24 text-blue-500" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-blue-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Relationship Summary
                    </h3>
                    <Button variant="secondary" size="sm" onClick={generateSummary} className="h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-none">
                      {aiSummary === 'Generating...' ? 'Analyzing...' : 'Generate Insights'}
                    </Button>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed min-h-[60px]">
                    {aiSummary ? (
                      aiSummary
                    ) : (
                      <p className="text-muted-foreground italic">
                        Generate an AI summary to get a quick digest of your recent interactions, open action items, and context with {contact.display_name}.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 border border-border rounded-2xl bg-card">
                  <h4 className="text-sm font-semibold mb-1">Recent Activity</h4>
                  <p className="text-2xl font-bold">{messages.length + calls.length} <span className="text-sm font-normal text-muted-foreground">interactions</span></p>
                </div>
                <div className="p-5 border border-border rounded-2xl bg-card">
                  <h4 className="text-sm font-semibold mb-1">Shared Files</h4>
                  <p className="text-2xl font-bold">{files.length} <span className="text-sm font-normal text-muted-foreground">documents</span></p>
                </div>
              </div>
            </TabsContent>

            {/* MESSAGES TAB */}
            <TabsContent value="messages" className="mt-0">
              {messages.length === 0 ? (
                <EmptyState icon={MessageCircle} message="No recent messages" />
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-4 rounded-xl border border-border bg-card/50">
                      <p className="text-sm mb-2">{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(msg.created_at), {addSuffix: true})}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CALLS TAB */}
            <TabsContent value="calls" className="mt-0">
              {calls.length === 0 ? (
                <EmptyState icon={Phone} message="No recent calls" />
              ) : (
                <div className="space-y-3">
                  {calls.map(call => (
                    <div key={call.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        call.status === 'missed' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {call.status === 'missed' ? <PhoneMissed className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{call.call_type} Call</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(call.started_at), 'MMM dd, yyyy · hh:mm a')}</p>
                      </div>
                      {call.status === 'ended' && call.ended_at && (
                        <div className="text-xs font-mono text-muted-foreground">
                          {Math.floor((new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* FILES TAB */}
            <TabsContent value="files" className="mt-0">
              {files.length === 0 ? (
                <EmptyState icon={FileText} message="No files shared" />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{f.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(f.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="mt-0 relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/80" />
              {timelineItems.length === 0 ? (
                <EmptyState icon={Activity} message="No activity yet" />
              ) : (
                <div className="space-y-6">
                  {timelineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 relative z-10">
                      <div className="w-14 h-14 rounded-full bg-background border-4 border-background flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white",
                          item._type === 'call' ? "bg-emerald-500" : 
                          item._type === 'file' ? "bg-indigo-500" : "bg-blue-500"
                        )}>
                          {item._type === 'call' ? <Phone className="w-4 h-4" /> :
                           item._type === 'file' ? <FileText className="w-4 h-4" /> : 
                           <MessageCircle className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="flex-1 bg-card border border-border p-5 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {item._type}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatDistanceToNow(item._date, {addSuffix: true})}
                          </span>
                        </div>
                        <p className="text-sm">
                          {item._type === 'call' ? `${item.call_type} call (${item.status})` : item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
    <Icon className="w-12 h-12 mb-4 opacity-20" />
    <p className="font-medium">{message}</p>
  </div>
);

export default DesktopContacts;
