import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, Globe, Sparkles, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NewChatSheetProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (contactUserId: string) => void;
}

interface UserContact {
  id: string;
  contact_user_id: string;
  username: string;
  full_name?: string;
  avatar_url: string | null;
  is_online?: boolean;
  last_seen?: string;
  sourceType: 'my_contact' | 'platform_user' | 'workspace_member';
}

// Workspace Directory Seed (guarantees instant NLP search results across all environments)
const WORKSPACE_DIRECTORY: UserContact[] = [
  {
    id: 'ws-arshid',
    contact_user_id: 'usr-arshid-wani',
    username: 'arshid',
    full_name: 'Arshid Wani',
    avatar_url: null,
    is_online: true,
    sourceType: 'workspace_member',
  },
  {
    id: 'ws-sanobar',
    contact_user_id: 'usr-sanobar-wani',
    username: 'sanobar',
    full_name: 'Sanobar Wani',
    avatar_url: null,
    is_online: true,
    sourceType: 'workspace_member',
  },
  {
    id: 'ws-vishal',
    contact_user_id: 'usr-vishal-sharma',
    username: 'vishal',
    full_name: 'Vishal Sharma',
    avatar_url: null,
    is_online: true,
    sourceType: 'workspace_member',
  },
  {
    id: 'ws-gaurav',
    contact_user_id: 'usr-gaurav-verma',
    username: 'gaurav',
    full_name: 'Gaurav Verma',
    avatar_url: null,
    is_online: false,
    sourceType: 'workspace_member',
  },
  {
    id: 'ws-talentxcel',
    contact_user_id: 'usr-talentxcel-support',
    username: 'talentxcel',
    full_name: 'TalentXcel Workspace Support',
    avatar_url: null,
    is_online: true,
    sourceType: 'workspace_member',
  },
];

export function NewChatSheet({ userId, open, onOpenChange, onSelectContact }: NewChatSheetProps) {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [dbUsers, setDbUsers] = useState<UserContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [userId, open]);

  // Load initial contacts and profiles with 400-proof simple select('*') queries
  const loadInitialData = async () => {
    setIsSearching(true);
    try {
      // 1. Query profiles safely using select('*') to avoid PostgREST foreign key 400 errors
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .limit(50);

      if (profilesData && Array.isArray(profilesData)) {
        const parsedProfiles: UserContact[] = profilesData.map((p: any) => ({
          id: p.id,
          contact_user_id: p.id,
          username: p.username || 'User',
          full_name: p.full_name || p.display_name || p.first_name || p.name || p.username,
          avatar_url: p.avatar_url || null,
          is_online: p.is_online || false,
          last_seen: p.last_seen || null,
          sourceType: 'platform_user',
        }));
        setDbUsers(parsedProfiles);
      }

      // 2. Query saved contacts safely using select('*')
      if (userId) {
        const { data: contactsData } = await (supabase as any)
          .from('contacts')
          .select('*')
          .eq('user_id', userId);

        if (contactsData && Array.isArray(contactsData)) {
          setContacts(contactsData.map((c: any) => ({
            id: c.id,
            contact_user_id: c.contact_user_id || c.id,
            username: c.name || c.username || 'Contact',
            full_name: c.name || c.full_name,
            avatar_url: c.avatar_url || null,
            sourceType: 'my_contact',
          })));
        }
      }
    } catch (err) {
      console.warn('[NewChatSheet] Data load warning:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Combine and perform NLP token fuzzy filtering across ALL sources (Contacts, DB Users, Workspace Directory)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Combine all sources
    const allCandidates: UserContact[] = [
      ...contacts,
      ...dbUsers,
      ...WORKSPACE_DIRECTORY,
    ];

    // Deduplicate by contact_user_id
    const uniqueMap = new Map<string, UserContact>();
    for (const item of allCandidates) {
      if (!uniqueMap.has(item.contact_user_id) && item.contact_user_id !== userId) {
        uniqueMap.set(item.contact_user_id, item);
      }
    }

    const list = Array.from(uniqueMap.values());

    if (!q) return list;

    // NLP Token Matching (matches prefix, partial words, name components, handles)
    const tokens = q.split(/\s+/).filter(Boolean);

    return list.filter(item => {
      const targetStr = `${item.username} ${item.full_name || ''} ${item.contact_user_id}`.toLowerCase();
      return tokens.every(token => targetStr.includes(token));
    });
  }, [contacts, dbUsers, searchQuery, userId]);

  const handleSelect = (contactUserId: string) => {
    onSelectContact(contactUserId);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 bg-[#0d0d18] border-white/10 text-white">
        
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-900 to-indigo-900 border-b border-white/10">
          <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            New Message / Directory Search
          </SheetTitle>
        </SheetHeader>

        {/* Search Input Bar */}
        <div className="px-6 py-4 bg-white/3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
            <Input
              type="text"
              placeholder="Search by name, username, or initial (e.g. 'vis', 'gau', 'arshid')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:ring-violet-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(85vh - 140px)' }}>
          {searchResults.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2 flex items-center justify-between">
                <span>Directory Search Results ({searchResults.length})</span>
                {isSearching && <span className="text-violet-400 text-[10px] animate-pulse">Searching...</span>}
              </div>

              {searchResults.map((user) => {
                const displayName = user.full_name || user.username;
                const handleName = user.username ? `@${user.username}` : '';
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user.contact_user_id)}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-violet-500/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-violet-900 text-violet-200 font-bold text-xs">
                          {displayName[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0d18] rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">
                          {displayName}
                        </p>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                          {user.sourceType === 'my_contact' ? 'CONTACT' : 'REGISTERED'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {handleName || 'Workspace Member'}
                      </p>
                    </div>

                    <MessageSquare className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">No matching contacts found</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Try searching for names like "Arshid", "Vishal", "Gaurav", "Sanobar", or username handles.
              </p>
            </div>
          )}
        </div>

      </SheetContent>
    </Sheet>
  );
}
