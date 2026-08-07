import React, { useEffect, useState } from 'react';
import { Search, X, UserPlus, Globe, Sparkles } from 'lucide-react';
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

interface Contact {
  id: string;
  contact_user_id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  isGlobal?: boolean;
}

export function NewChatSheet({ userId, open, onOpenChange, onSelectContact }: NewChatSheetProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [globalProfiles, setGlobalProfiles] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [userId, open]);

  // Load saved local contacts
  const loadContacts = async () => {
    if (!userId) return;
    try {
      const { data } = await (supabase as any)
        .from('contacts')
        .select(`
          id,
          contact_user_id,
          profiles!contacts_contact_user_id_fkey(
            username,
            full_name,
            avatar_url,
            is_online,
            last_seen
          )
        `)
        .eq('user_id', userId);

      if (data) {
        setContacts(data.map((c: any) => ({
          id: c.id,
          contact_user_id: c.contact_user_id,
          username: c.profiles?.full_name || c.profiles?.username || 'User',
          avatar_url: c.profiles?.avatar_url,
          is_online: c.profiles?.is_online,
          last_seen: c.profiles?.last_seen
        })));
      }
    } catch (err) {
      console.warn('[NewChatSheet] Failed to load local contacts:', err);
    }
  };

  // Live search across global registered users in Supabase profiles
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalProfiles([]);
      return;
    }

    const searchGlobal = async () => {
      setIsSearching(true);
      try {
        const q = searchQuery.trim();
        const { data } = await (supabase as any)
          .from('profiles')
          .select('id, username, full_name, avatar_url, is_online, last_seen')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,phone_number.ilike.%${q}%`)
          .neq('id', userId || '')
          .limit(12);

        if (data && data.length > 0) {
          setGlobalProfiles(data.map((p: any) => ({
            id: p.id,
            contact_user_id: p.id,
            username: p.full_name || p.username || 'User',
            avatar_url: p.avatar_url,
            is_online: p.is_online,
            last_seen: p.last_seen,
            isGlobal: true
          })));
        } else {
          setGlobalProfiles([]);
        }
      } catch (err) {
        console.warn('[NewChatSheet] Global profile search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchGlobal, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, userId]);

  const filteredContacts = contacts.filter(c =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine results (avoiding duplicates)
  const contactUserIds = new Set(filteredContacts.map(c => c.contact_user_id));
  const uniqueGlobalProfiles = globalProfiles.filter(p => !contactUserIds.has(p.contact_user_id));

  const getStatusText = (contact: Contact) => {
    if (contact.is_online) return 'Online';
    if (contact.last_seen) {
      try {
        return `Last seen ${formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })}`;
      } catch {
        return 'Offline';
      }
    }
    return 'Registered User';
  };

  const handleContactClick = (contactUserId: string) => {
    onSelectContact(contactUserId);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 bg-[#0d0d18] border-white/10 text-white">
        <SheetHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-900 to-indigo-900 border-b border-white/10">
          <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            New Message / Directory Search
          </SheetTitle>
        </SheetHeader>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-white/3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by name, username, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:ring-violet-500"
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

        {/* Contacts & Global Profiles List */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ height: 'calc(85vh - 140px)' }}>
          
          {/* Section 1: Saved Contacts */}
          {filteredContacts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2 flex items-center justify-between">
                <span>My Contacts ({filteredContacts.length})</span>
              </div>
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactClick(contact.contact_user_id)}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl bg-white/3 hover:bg-white/8 border border-white/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={contact.avatar_url || ''} />
                        <AvatarFallback className="bg-violet-900 text-violet-200 font-bold text-xs">
                          {contact.username[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {contact.is_online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0d18] rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">{contact.username}</p>
                      <p className="text-xs text-zinc-400 truncate">{getStatusText(contact)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Global Platform Users */}
          {uniqueGlobalProfiles.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400 px-3 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-violet-400" />
                  Global Platform Users ({uniqueGlobalProfiles.length})
                </span>
              </div>
              <div className="space-y-1">
                {uniqueGlobalProfiles.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleContactClick(user.contact_user_id)}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all text-left group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-violet-500/30">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-indigo-900 text-indigo-200 font-bold text-xs">
                          {user.username[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0d18] rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">{user.username}</p>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">REGISTERED</span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{getStatusText(user)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredContacts.length === 0 && uniqueGlobalProfiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">
                {isSearching ? 'Searching platform directory...' : 'No users found matching your query'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Try searching by full name, username, or phone number.
              </p>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}
