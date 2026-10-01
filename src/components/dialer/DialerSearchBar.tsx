import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Phone, 
  PhoneCall, 
  Video, 
  MessageSquare, 
  UserPlus, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  User,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCall } from '@/contexts/CallContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SearchContactItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  initials?: string;
  color?: string;
  isRegistered?: boolean;
  chatrUserId?: string;
  source?: 'contact' | 'recent' | 'device';
}

interface DialerSearchBarProps {
  recentCalls?: Array<{
    id: string;
    displayName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    direction?: string;
  }>;
  onSelectContact?: (contact: SearchContactItem) => void;
  className?: string;
}

export const DialerSearchBar: React.FC<DialerSearchBarProps> = ({
  recentCalls = [],
  onSelectContact,
  className
}) => {
  const navigate = useNavigate();
  const { initiateCall } = useCall();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [contacts, setContacts] = useState<SearchContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load contacts from DB and Native runtime
  useEffect(() => {
    let isMounted = true;
    const loadAllContacts = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const loaded: SearchContactItem[] = [];

        // 1. Supabase contacts
        if (user) {
          const { data: dbContacts } = await supabase
            .from('contacts')
            .select(`
              id,
              contact_name,
              contact_phone,
              contact_user_id,
              is_registered,
              profiles:contact_user_id (
                id,
                username,
                avatar_url
              )
            `)
            .eq('user_id', user.id)
            .limit(100);

          (dbContacts || []).forEach((c: any) => {
            const name = c.profiles?.username || c.contact_name || c.contact_phone || 'Unknown';
            const phone = c.contact_phone || '';
            const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'C';
            loaded.push({
              id: c.id,
              name,
              phone,
              avatar: c.profiles?.avatar_url || null,
              initials,
              color: '#7C3AED',
              isRegistered: !!c.is_registered,
              chatrUserId: c.contact_user_id,
              source: 'contact'
            });
          });
        }

        // 2. Native device contacts if available
        if (window.ChatrNativeRuntime?.getDeviceContacts) {
          try {
            const raw = window.ChatrNativeRuntime.getDeviceContacts(200);
            const parsed = JSON.parse(raw || '[]');
            if (Array.isArray(parsed)) {
              parsed.forEach((c: any) => {
                const name = c.contact_name || c.displayName || c.normalized_number || 'Unknown';
                const phone = c.normalized_number || c.contact_phone || c.phone_number || '';
                // Deduplicate by phone
                if (!loaded.some(item => item.phone && phone && item.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))) {
                  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'C';
                  loaded.push({
                    id: c.id || phone || Math.random().toString(),
                    name,
                    phone,
                    avatar: c.photo_uri || null,
                    initials,
                    color: c.avatar_color || '#8B5CF6',
                    source: 'device'
                  });
                }
              });
            }
          } catch (e) {
            console.warn('[DialerSearchBar] Native contacts parsing error:', e);
          }
        }

        if (isMounted) {
          setContacts(loaded);
        }
      } catch (err) {
        console.error('[DialerSearchBar] Error loading contacts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllContacts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Voice Search setup using Web Speech API
  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast.info('Voice search is not supported on this browser/webview');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsFocused(true);
        toast.info('Listening... Say a name or number', { duration: 2500 });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          // If transcript is like "call Aamir", strip "call "
          const cleanQuery = transcript.replace(/^(call|dial|search|find)\s+/i, '').trim();
          setQuery(cleanQuery);
          inputRef.current?.focus();
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('[DialerSearchBar] Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('[DialerSearchBar] Could not start speech recognition:', e);
      setIsListening(false);
    }
  }, [isListening]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, []);

  // Filtered contacts based on search query
  const filteredContacts = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];

    const digitsOnly = clean.replace(/\D/g, '');

    return contacts.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(clean);
      const phoneClean = (c.phone || '').replace(/\D/g, '');
      const phoneMatch = digitsOnly && phoneClean.includes(digitsOnly);
      return nameMatch || phoneMatch;
    }).slice(0, 10);
  }, [contacts, query]);

  // Check if query is a direct dialable number
  const isDialableNumber = useMemo(() => {
    const digits = query.replace(/[^\d+*#]/g, '');
    return digits.length >= 3;
  }, [query]);

  // Handle direct call
  const handleCall = (contact: SearchContactItem, type: 'voice' | 'video' = 'voice') => {
    setIsFocused(false);
    if (onSelectContact) {
      onSelectContact(contact);
    }
    initiateCall({
      partnerId: contact.chatrUserId || contact.phone,
      partnerName: contact.name,
      partnerAvatar: contact.avatar || undefined,
      partnerPhone: contact.phone,
      callType: type
    });
  };

  const handleDialQuery = (type: 'voice' | 'video' = 'voice') => {
    setIsFocused(false);
    initiateCall({
      partnerId: query,
      partnerName: query,
      partnerPhone: query,
      callType: type
    });
  };

  const handleMessage = async (contact: SearchContactItem) => {
    setIsFocused(false);
    if (contact.chatrUserId) {
      try {
        const { data: convId } = await supabase.rpc('create_direct_conversation', {
          other_user_id: contact.chatrUserId
        });
        if (convId) {
          navigate(`/chat/${convId}`);
          return;
        }
      } catch {}
    }
    navigate('/chat', { state: { targetPhone: contact.phone, targetName: contact.name } });
  };

  return (
    <div ref={searchContainerRef} className={cn("relative w-full z-40 mb-4", className)}>
      {/* ── SEARCH INPUT CONTAINER ── */}
      <div 
        className={cn(
          "w-full h-12 rounded-[24px] bg-[#120F2B]/90 backdrop-blur-xl border transition-all duration-200 flex items-center px-4 gap-3 shadow-lg shadow-purple-950/20",
          isFocused 
            ? "border-purple-400 ring-2 ring-purple-500/30 bg-[#161234]" 
            : "border-purple-500/30 hover:border-purple-400/50"
        )}
      >
        <Search className={cn("w-5 h-5 shrink-0 transition-colors", isFocused ? "text-purple-400" : "text-slate-400")} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search contacts, numbers or AI..."
          className="w-full bg-transparent text-white placeholder-slate-400 text-[14px] font-medium outline-none"
        />

        {/* Clear Button */}
        {query && (
          <button 
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Mic / Voice Search Button */}
        <button
          onClick={startVoiceSearch}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200 active:scale-95 shrink-0",
            isListening 
              ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40" 
              : "text-purple-300 hover:text-white hover:bg-purple-900/40"
          )}
          title="Voice Search"
          aria-label="Voice search"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* ── SEARCH RESULTS DROPDOWN / OVERLAY ── */}
      {isFocused && (
        <div className="absolute top-[52px] inset-x-0 rounded-[24px] bg-[#120D2A]/95 backdrop-blur-2xl border border-purple-500/35 shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[440px] animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          
          {/* If user is typing: show matching results */}
          {query.trim().length > 0 ? (
            <div className="overflow-y-auto no-scrollbar p-3 space-y-2">
              
              {/* If query looks like a phone number: Show Direct Dial Card at top */}
              {isDialableNumber && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#171336] border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                      <Hash className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-white truncate">Dial {query}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">1-tap instant call</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDialQuery('voice')}
                      className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
                      title="Voice Call"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                    </button>
                    <button
                      onClick={() => handleDialQuery('video')}
                      className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-transform"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Matched contacts list */}
              {filteredContacts.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-[0.16em] text-purple-300/70 uppercase px-2 pt-1 pb-1">
                    Matching Contacts ({filteredContacts.length})
                  </div>
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.06] active:bg-white/[0.09] transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <div 
                        onClick={() => handleCall(contact, 'voice')}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0 overflow-hidden shadow-md border border-white/10"
                          style={{ backgroundColor: contact.color || '#7C3AED' }}
                        >
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                          ) : (
                            contact.initials || 'C'
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-white truncate flex items-center gap-1.5">
                            <span>{contact.name}</span>
                            {contact.isRegistered && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                CHATR
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{contact.phone}</div>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        {/* Voice Call */}
                        <button
                          onClick={() => handleCall(contact, 'voice')}
                          className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                        </button>
                        {/* Video Call */}
                        <button
                          onClick={() => handleCall(contact, 'video')}
                          className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                          title="Video"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                        {/* Message */}
                        <button
                          onClick={() => handleMessage(contact)}
                          className="w-8 h-8 rounded-full bg-white/10 border border-white/10 text-slate-300 hover:bg-white/20 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                          title="Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isDialableNumber ? (
                <div className="py-6 text-center space-y-2">
                  <User className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-[13px] text-slate-300 font-medium">No contacts match "{query}"</p>
                  <button
                    onClick={() => {
                      setIsFocused(false);
                      navigate('/calls/keypad');
                    }}
                    className="text-[12px] text-purple-400 hover:underline font-semibold"
                  >
                    Open Keypad to dial number →
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            /* ── ZERO-INPUT STATE (Frequent & Quick Actions) ── */
            <div className="p-3 space-y-3">
              {/* Quick Action Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => {
                    setIsFocused(false);
                    navigate('/calls/keypad');
                  }}
                  className="px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-semibold text-purple-300 hover:bg-purple-900/60 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  <PhoneCall className="w-3 h-3 text-purple-400" />
                  Keypad
                </button>
                <button
                  onClick={() => {
                    setIsFocused(false);
                    navigate('/calls/contacts');
                  }}
                  className="px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-semibold text-purple-300 hover:bg-purple-900/60 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  <User className="w-3 h-3 text-purple-400" />
                  All Contacts
                </button>
                <button
                  onClick={() => {
                    setIsFocused(false);
                    navigate('/calls/recents');
                  }}
                  className="px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-semibold text-purple-300 hover:bg-purple-900/60 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  <Clock className="w-3 h-3 text-purple-400" />
                  Recent Calls
                </button>
              </div>

              {/* Frequent / Suggested contacts */}
              {contacts.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-purple-300/70 uppercase px-2 pb-1.5">
                    Suggested Contacts
                  </div>
                  <div className="space-y-1">
                    {contacts.slice(0, 5).map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors"
                      >
                        <div 
                          onClick={() => handleCall(contact, 'voice')}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0 overflow-hidden shadow-sm"
                            style={{ backgroundColor: contact.color || '#7C3AED' }}
                          >
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              contact.initials || 'C'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-bold text-white truncate">{contact.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{contact.phone}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCall(contact, 'voice')}
                            className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                            title="Call"
                          >
                            <Phone className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent calls quick list */}
              {recentCalls.length > 0 && (
                <div className="pt-1 border-t border-white/[0.07]">
                  <div className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase px-2 py-1">
                    Recent
                  </div>
                  <div className="space-y-1">
                    {recentCalls.slice(0, 3).map((call) => (
                      <div
                        key={call.id}
                        onClick={() => {
                          setIsFocused(false);
                          if (call.phoneNumber) {
                            initiateCall({
                              partnerPhone: call.phoneNumber,
                              partnerName: call.displayName || call.phoneNumber,
                              callType: 'voice'
                            });
                          }
                        }}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium text-white truncate">
                              {call.displayName || call.phoneNumber}
                            </div>
                            <div className="text-[10px] text-slate-400">{call.phoneNumber}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default DialerSearchBar;
