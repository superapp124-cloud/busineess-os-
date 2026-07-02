import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { MessageBubble } from './MessageBubble';
import { MessageListSkeleton } from './MessageListSkeleton';
import { SwipeableMessage } from '../SwipeableMessage';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VIRTUAL_LIST_START_INDEX = 100000;

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type?: string;
  media_url?: string;
  read_at?: string;
  is_starred?: boolean;
  is_edited?: boolean;
  reactions?: any[];
  status?: string;
}

interface TrueVirtualMessageListProps {
  messages: Message[];
  userId: string;
  otherUser?: {
    username: string;
    avatar_url?: string;
  };
  currentUser?: {
    username?: string;
    avatar_url?: string;
  };
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onForward?: (message: Message) => void;
  onStar?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (message: Message) => void;
  selectionMode?: boolean;
  selectedMessages?: Set<string>;
  onSelectMessage?: (messageId: string) => void;
}

export const TrueVirtualMessageList = React.memo(({
  messages,
  userId,
  otherUser,
  currentUser,
  onLoadMore,
  hasMore,
  isLoading = false,
  onForward,
  onStar,
  onReply,
  onDelete,
  onEdit,
  onPin,
  onReport,
  selectionMode = false,
  selectedMessages = new Set(),
  onSelectMessage
}: TrueVirtualMessageListProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const wasAtBottom = useRef(true);
  const previousWindowRef = useRef<{ firstId?: string; lastId?: string; length: number }>({ length: 0 });
  const [firstItemIndex, setFirstItemIndex] = useState(VIRTUAL_LIST_START_INDEX);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const firstId = messages[0]?.id;
    const lastId = messages[messages.length - 1]?.id;
    const previous = previousWindowRef.current;
    const addedCount = messages.length - previous.length;

    if (messages.length === 0 || (previous.length > 0 && previous.lastId !== lastId && previous.firstId !== firstId)) {
      setFirstItemIndex(VIRTUAL_LIST_START_INDEX);
    } else if (addedCount > 0 && previous.firstId && previous.firstId !== firstId && previous.lastId === lastId) {
      setFirstItemIndex((current) => Math.max(0, current - addedCount));
    }

    previousWindowRef.current = { firstId, lastId, length: messages.length };
  }, [messages]);

  // Auto-scroll to bottom on new messages (like WhatsApp)
  useEffect(() => {
    if (wasAtBottom.current && messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior: 'smooth'
      });
    }
  }, [messages.length]);

  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    wasAtBottom.current = atBottom;
    setShowScrollButton(!atBottom);
  }, []);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      behavior: 'smooth'
    });
  };

  const handleStartReached = useCallback(() => {
    if (hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const Header = useCallback(() => {
    if (isLoading && hasMore) {
      return (
        <div className="text-center py-3">
          <div className="w-5 h-5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      );
    }
    return null;
  }, [isLoading, hasMore]);

  const Footer = useCallback(() => {
    return <div className="h-2" />;
  }, []);

  if (isLoading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground bg-background/80 px-4 py-2 rounded-full text-sm shadow-sm backdrop-blur-sm">
          No messages yet. Send a message to start the conversation!
        </p>
      </div>
    );
  }


  return (
    <div className="flex-1 h-full bg-transparent relative">
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
        atBottomStateChange={handleAtBottomStateChange}
        startReached={handleStartReached}
        overscan={200}
        components={{
          Header,
          Footer
        }}
        itemContent={(index, message) => {
          const isOwn = message.sender_id === userId;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          
          const msgDate = new Date(message.created_at);
          const prevDate = prevMessage ? new Date(prevMessage.created_at) : null;
          
          const showDateSeparator = !prevDate || msgDate.toDateString() !== prevDate.toDateString();
          const isSameSender = prevMessage?.sender_id === message.sender_id;
          const timeDiff = prevDate ? msgDate.getTime() - prevDate.getTime() : 0;
          const showAvatar = !isSameSender || timeDiff > 120000 || showDateSeparator;

          const getDateLabel = (d: Date) => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (d.toDateString() === today.toDateString()) return 'Today';
            if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          };

          return (
            <div className="px-2 py-[2px] flex flex-col">
              {showDateSeparator && (
                <div className="flex justify-center my-[16px]">
                  <div className="bg-[#FFFFFF] border-[0.5px] border-[#EEEEF4] text-[#3D3D5C] text-[12px] font-[600] px-[12px] py-[4px] rounded-full shadow-sm">
                    {getDateLabel(msgDate)}
                  </div>
                </div>
              )}
              <SwipeableMessage
                messageId={message.id}
                onReply={() => onReply?.(message)}
                onDelete={() => onDelete?.(message.id)}
              >
                <div className={showAvatar && !showDateSeparator ? 'mt-[8px]' : ''}>
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    showTimestamp={showAvatar}
                    otherUser={otherUser}
                    onForward={onForward}
                    onStar={onStar}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onPin={onPin}
                    onReport={onReport}
                    selectionMode={selectionMode}
                    isSelected={selectedMessages.has(message.id)}
                    onSelect={onSelectMessage}
                    currentUser={currentUser}
                  />
                </div>
              </SwipeableMessage>
            </div>
          );
        }}
      />
      
      {/* Scroll to bottom FAB */}
      {showScrollButton && (
        <div className="absolute bottom-[16px] right-[16px] z-20">
          <Button
            size="icon"
            onClick={scrollToBottom}
            className="w-[40px] h-[40px] rounded-full bg-[#FFFFFF] text-[#3D3D5C] border border-[#EEEEF4] shadow-md hover:bg-[#F5F5FA] transition-all"
          >
            <ChevronDown className="w-[20px] h-[20px]" />
          </Button>
        </div>
      )}
    </div>
  );
});

TrueVirtualMessageList.displayName = 'TrueVirtualMessageList';
