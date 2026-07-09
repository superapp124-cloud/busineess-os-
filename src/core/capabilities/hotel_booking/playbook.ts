import { CapabilityPlaybook, ExtractedEntities, ResolvedEntities, MissingField, CommitmentPreview } from '../types';

export const playbook: CapabilityPlaybook = {
  extract(rawText: string): ExtractedEntities {
    const text = rawText.toLowerCase();
    
    // Very basic extraction for demonstration
    const cityMatch = text.match(/(in|at|near)\s+([a-zA-Z\s]+?)(?=\s+(for|tomorrow|next|friday|$))/);
    const nightsMatch = text.match(/(\d+)\s+nights?/);

    return {
      city: cityMatch ? cityMatch[2].trim() : null,
      nights: nightsMatch ? parseInt(nightsMatch[1]) : 1,
      guests: 2
    };
  },

  async resolve(entities: ExtractedEntities, context: any): Promise<ResolvedEntities> {
    return { ...entities, _resolved: true };
  },

  getMissingFields(entities: ResolvedEntities): MissingField[] {
    const missing: MissingField[] = [];
    
    if (!entities.city) {
      missing.push({
        key: 'city',
        label: 'Which city?',
        type: 'choice',
        options: ['Mumbai', 'Delhi', 'Goa', 'Bangalore']
      });
    }
    
    return missing;
  },

  buildPreview(entities: ResolvedEntities): CommitmentPreview {
    return {
      icon: '🏨',
      title: `Hotel in ${entities.city}`,
      lines: [
        { label: 'Stay', value: `${entities.nights} Night(s)` },
        { label: 'Guests', value: `${entities.guests} Adults` },
        { label: 'Hotel', value: 'Taj Mahal Palace (Estimated)' },
        { label: 'Price', value: '₹12,500 (Estimated)' }
      ],
      cta: 'Book Hotel'
    };
  }
};
