import React, { useState } from 'react';
import { Search, Filter, Phone, Video, MoreVertical, CreditCard, Calendar, Clock, FileText, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const INBOX_THREADS = [
  { id: '1', name: 'Acme Corp', lastMessage: 'Can we schedule a demo?', time: '10:42 AM', unread: 2, status: 'Active' },
  { id: '2', name: 'Sarah Jenkins', lastMessage: 'Thank you for the invoice.', time: 'Yesterday', unread: 0, status: 'Resolved' },
  { id: '3', name: 'TechStart Inc', lastMessage: 'When will my order ship?', time: 'Yesterday', unread: 1, status: 'Active' },
];

const TIMELINE_EVENTS = [
  { type: 'message', content: 'Can we schedule a demo?', timestamp: '10:42 AM Today', author: 'Customer' },
  { type: 'ai_summary', content: 'Customer is interested in the Enterprise tier. Recommending a sales call.', timestamp: '10:43 AM Today', author: 'AI Receptionist' },
  { type: 'invoice', content: 'Invoice #INV-2024-089 generated for $1,200', timestamp: 'Yesterday', author: 'System' },
  { type: 'call', content: 'Outbound call lasting 14 mins', timestamp: 'Oct 24, 2024', author: 'Agent Alice' },
  { type: 'note', content: 'Prefers contact via email for billing matters.', timestamp: 'Oct 10, 2024', author: 'Agent Bob' }
];

export const BusinessInbox = () => {
  const [activeThread, setActiveThread] = useState(INBOX_THREADS[0].id);

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      
      {/* Inbox List (Left Panel) */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Team Inbox</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input className="pl-9 bg-gray-50 dark:bg-gray-900" placeholder="Search conversations..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {INBOX_THREADS.map((thread) => (
            <div 
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                activeThread === thread.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{thread.name}</span>
                <span className="text-xs text-gray-500">{thread.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate pr-4">{thread.lastMessage}</span>
                {thread.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {thread.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation View (Middle Panel) */}
      <div className="flex-1 flex flex-col min-w-[400px]">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=AC`} />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Acme Corp</h3>
              <p className="text-xs text-green-600 font-medium">Online • Assigned to You</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5 text-gray-600" /></Button>
            <Button variant="ghost" size="icon"><Video className="w-5 h-5 text-gray-600" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5 text-gray-600" /></Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col gap-4">
            <div className="self-start max-w-[75%]">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 dark:text-gray-200">
                Hi, I'm interested in learning more about your enterprise plans.
              </div>
              <span className="text-xs text-gray-500 mt-1 ml-1 block">10:41 AM</span>
            </div>
            
            {/* AI Auto-reply indicator */}
            <div className="self-end max-w-[75%] flex flex-col items-end">
              <div className="flex items-center gap-1 mb-1 text-xs text-primary font-medium">
                <Bot className="w-3 h-3" /> AI Receptionist replied
              </div>
              <div className="bg-primary/10 text-primary-foreground dark:text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                Hello! I'd be happy to help. Are you looking to schedule a quick demo with our sales team to discuss the enterprise features?
              </div>
              <span className="text-xs text-gray-500 mt-1 mr-1 block">10:41 AM</span>
            </div>

            <div className="self-start max-w-[75%]">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 dark:text-gray-200">
                Can we schedule a demo?
              </div>
              <span className="text-xs text-gray-500 mt-1 ml-1 block">10:42 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Type a message or press '/' for commands..." />
            <Button>Send</Button>
          </div>
        </div>
      </div>

      {/* Customer Timeline / CRM (Right Panel) */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
          <div className="px-4 pt-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Context</h3>
            <TabsList className="w-full grid grid-cols-2 mb-2">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timeline" className="flex-1 overflow-y-auto p-4 m-0">
            <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-6 pb-4">
              {TIMELINE_EVENTS.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Event Icon Node */}
                  <div className="absolute -left-[13px] top-1 bg-white dark:bg-gray-950 p-0.5 rounded-full border border-gray-200 dark:border-gray-800">
                    {event.type === 'message' && <div className="w-4 h-4 text-blue-500 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">💬</div>}
                    {event.type === 'ai_summary' && <Bot className="w-4 h-4 text-purple-500" />}
                    {event.type === 'invoice' && <CreditCard className="w-4 h-4 text-green-500" />}
                    {event.type === 'call' && <Phone className="w-4 h-4 text-orange-500" />}
                    {event.type === 'note' && <FileText className="w-4 h-4 text-gray-500" />}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-0.5">
                      {event.timestamp} • {event.author}
                    </span>
                    <div className={`text-sm p-2 rounded-md ${
                      event.type === 'ai_summary' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border border-purple-100 dark:border-purple-800' :
                      event.type === 'note' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-100 dark:border-yellow-800' :
                      'text-gray-700 dark:text-gray-300'
                    }`}>
                      {event.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold mb-2">Contact Info</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email: contact@acmecorp.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone: +1 (555) 019-2838</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold mb-2">Metrics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime Value: $14,500</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Orders: 12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status: VIP</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default BusinessInbox;
