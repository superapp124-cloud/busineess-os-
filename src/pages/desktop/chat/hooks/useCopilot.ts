import { useState, useRef, useCallback } from 'react';
import { generate } from '@/services/ai';
import { toast } from 'sonner';
import { triggerCabBooking } from '@/core/capabilities/travel/CabBookingWorkflow';
import { triggerCalendarMeeting } from '@/core/capabilities/calendar/CalendarMeetingWorkflow';
import { triggerFoodOrdering } from '@/core/capabilities/commerce/FoodOrderingWorkflow';
import { triggerFlightDeparture } from '@/core/capabilities/travel/FlightDepartureWorkflow';
import { triggerEnterpriseApproval } from '@/core/capabilities/enterprise/EnterpriseApprovalWorkflow';
import { triggerDocumentUnderstanding } from '@/core/capabilities/document/DocumentUnderstandingWorkflow';
import type { CopilotMessage, Room } from '../types';

export function useCopilot() {
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotAttachments, setCopilotAttachments] = useState<File[]>([]);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement | null>(null);

  const handleCopilotSubmit = useCallback(async (e: React.FormEvent, selectedRoom?: Room) => {
    e.preventDefault();
    if ((!copilotInput.trim() && copilotAttachments.length === 0) || copilotLoading) return;

    const userMsg = copilotInput.trim();
    const currentAttachments = [...copilotAttachments];
    setCopilotInput('');
    setCopilotAttachments([]);
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMsg || `[Attached ${currentAttachments.length} document(s)]` }]);
    
    // ─── Attachments / Document Understanding ────────────────────────────────
    if (currentAttachments.length > 0) {
      const workflowId = triggerDocumentUnderstanding(currentAttachments, userMsg);
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `I'll analyze those ${currentAttachments.length} document(s) for you.`, workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }
    
    // ─── Intent Detection ────────────────────────────────────────────────────
    const CAB_BOOKING_PATTERNS = [
      /book.{0,10}cab/i,
      /book.{0,10}ride/i,
      /get.{0,10}cab/i,
      /need.{0,10}cab/i,
      /ola|uber|rapido/i,
      /book.{0,10}taxi/i,
    ];

    if (CAB_BOOKING_PATTERNS.some(p => p.test(userMsg))) {
      const conversationId = `conv-${Date.now()}`;
      const workflowId = await triggerCabBooking(conversationId, { rawText: userMsg });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: "Sure, I'll book a cab for you. Working on it...", workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }

    const CALENDAR_MEETING_PATTERNS = [
      /schedule.{0,10}meeting/i,
      /book.{0,10}meeting/i,
      /set up.{0,10}meeting/i,
    ];

    if (CALENDAR_MEETING_PATTERNS.some(p => p.test(userMsg))) {
      const conversationId = `conv-${Date.now()}`;
      
      let attendees = 'Team';
      const match = userMsg.match(/with\s+([a-zA-Z\s]+)(?:for|next|tomorrow|$)/i);
      if (match) attendees = match[1].trim();

      const workflowId = await triggerCalendarMeeting(conversationId, { rawText: userMsg, attendees });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `I'll help you schedule a meeting with ${attendees}. Checking calendars...`, workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }

    const FOOD_ORDERING_PATTERNS = [
      /hungry/i,
      /order.{0,10}food/i,
      /order.{0,10}pizza/i,
      /get.{0,10}food/i,
    ];

    if (FOOD_ORDERING_PATTERNS.some(p => p.test(userMsg))) {
      const conversationId = `conv-${Date.now()}`;
      
      let foodItem = 'food';
      if (userMsg.toLowerCase().includes('pizza')) foodItem = 'Pizza';
      else if (userMsg.toLowerCase().includes('burger')) foodItem = 'Burger';
      else if (userMsg.toLowerCase().includes('sushi')) foodItem = 'Sushi';

      const workflowId = await triggerFoodOrdering(conversationId, { rawText: userMsg, foodItem });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `I'll help you order some ${foodItem.toLowerCase()}. Looking for the best places nearby...`, workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }

    const FLIGHT_DEPARTURE_PATTERNS = [
      /flight.{0,10}tomorrow/i,
      /get me there on time/i,
      /catch my flight/i,
    ];

    if (FLIGHT_DEPARTURE_PATTERNS.some(p => p.test(userMsg))) {
      const conversationId = `conv-${Date.now()}`;
      
      const workflowId = await triggerFlightDeparture(conversationId, { rawText: userMsg });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `I'll make sure you catch your flight. Let me coordinate everything for you...`, workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }

    const ENTERPRISE_APPROVAL_PATTERNS = [
      /access.{0,10}production/i,
      /request.{0,10}access/i,
      /need.{0,10}database/i,
    ];

    if (ENTERPRISE_APPROVAL_PATTERNS.some(p => p.test(userMsg))) {
      const conversationId = `conv-${Date.now()}`;
      
      const workflowId = await triggerEnterpriseApproval(conversationId, { rawText: userMsg });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `I'll help you request access. Checking IAM policies...`, workflowId }]);
      setTimeout(() => { copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      return;
    }

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
  }, [copilotInput, copilotLoading, copilotAttachments]);

  return {
    copilotInput,
    setCopilotInput,
    copilotAttachments,
    setCopilotAttachments,
    copilotMessages,
    copilotLoading,
    copilotEndRef,
    handleCopilotSubmit
  };
}
