import { useState, useRef, useCallback } from 'react';
import { generate } from '@/services/ai';
import { toast } from 'sonner';
import type { CopilotMessage, Room } from '../types';

export function useCopilot() {
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement | null>(null);

  const handleCopilotSubmit = useCallback(async (e: React.FormEvent, selectedRoom?: Room) => {
    e.preventDefault();
    if (!copilotInput.trim() || copilotLoading) return;

    const userMsg = copilotInput.trim();
    setCopilotInput('');
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setCopilotLoading(true);
    
    // Auto-scroll
    setTimeout(() => {
      copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const context = selectedRoom ? `The user is currently in a chat named "${selectedRoom.name}". ` : '';
      const response = await generate({
        prompt: userMsg,
        systemPrompt: `You are CHATR Copilot, an AI assistant built into the CHATR Desktop OS. ${context} Answer concisely and help the user navigate their operating system.`,
      });

      setCopilotMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e: any) {
      toast.error('Failed to get response from Copilot');
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your Ollama connection or try again later.' }]);
    } finally {
      setCopilotLoading(false);
      setTimeout(() => {
        copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [copilotInput, copilotLoading]);

  return {
    copilotInput,
    setCopilotInput,
    copilotMessages,
    copilotLoading,
    copilotEndRef,
    handleCopilotSubmit
  };
}
