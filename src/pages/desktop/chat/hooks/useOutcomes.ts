import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOutcomes(selectedId: string | null, currentUser: any) {
  const [outcomes, setOutcomes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('chatr_outcomes_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chatr_outcomes_v1', JSON.stringify(outcomes));
  }, [outcomes]);

  useEffect(() => {
    const handleOutcomesDetected = (e: any) => {
      const detectedOutcomes = e.detail;
      import('@/core/capabilities/CommitmentRuntime').then(({ commitmentRuntime }) => {
        detectedOutcomes.forEach((o: any) => commitmentRuntime.processCommitment(o));
      });
    };

    const handleCommitmentSuggested = (e: any) => {
      const commitment = e.payload.commitment;
      setOutcomes(prev => {
        const filtered = prev.filter(o => o.status !== 'suggested' && o.status !== 'detected' && o.status !== 'validated');
        return [...filtered, commitment];
      });
      // Optionally trigger something to open the outcomes pane
      window.dispatchEvent(new CustomEvent('chatr:open-outcomes-pane'));
    };

    const handleCommitmentStateChanged = (e: any) => {
      const commitment = e.payload;
      setOutcomes(prev => prev.map(o => o.id === commitment.id ? commitment : o));
    };

    const handleRealityVerified = (e: any) => {
      const { commitment } = e.payload;
      setOutcomes(prev => prev.map(o => o.id === commitment.id ? commitment : o));

      if (selectedId && currentUser) {
        let actionType = 'task';
        if (commitment.capability === 'core.flight_booking' || commitment.capability === 'core.hotel_booking') actionType = 'book';
        if (commitment.capability === 'core.candidate_interview' || commitment.capability === 'core.meeting' || commitment.capability === 'core.calendar_event') actionType = 'message';
        
        const sysMsg = {
          room_id: selectedId,
          content: `${commitment.title}`,
          sender_id: currentUser.id,
          type: 'system',
          metadata: { 
            isAction: true,
            actionType: actionType,
            actionTitle: `${commitment.type || commitment.capability} Completed`,
            actionDescription: e.payload.reality?.message + (e.payload.reality?.evidence?.pnr ? ` (PNR: ${e.payload.reality.evidence.pnr})` : '') || commitment.title,
            actionData: { 
              ...commitment.entities, 
              ...commitment.selectedResult,
              ...e.payload.reality?.evidence 
            }
          }
        };
        
        supabase.from('messages').insert(sysMsg).then(({ error }) => {
          if (error) console.error('Failed to save action message:', error);
        });
      }
    };

    window.addEventListener('chatr:outcomes-detected', handleOutcomesDetected);
    
    import('@/core/services/EventBus').then(({ eventBus }) => {
      eventBus.subscribe('chatr:commitment-suggested', handleCommitmentSuggested);
      eventBus.subscribe('chatr:commitment-state-changed', handleCommitmentStateChanged);
      eventBus.subscribe('chatr:reality-verified', handleRealityVerified);
    });
    
    return () => {
      window.removeEventListener('chatr:outcomes-detected', handleOutcomesDetected);
      import('@/core/services/EventBus').then(({ eventBus }) => {
        eventBus.unsubscribe('chatr:commitment-suggested', handleCommitmentSuggested);
        eventBus.unsubscribe('chatr:commitment-state-changed', handleCommitmentStateChanged);
        eventBus.unsubscribe('chatr:reality-verified', handleRealityVerified);
      });
    };
  }, [selectedId, currentUser]);

  return { outcomes, setOutcomes };
}
