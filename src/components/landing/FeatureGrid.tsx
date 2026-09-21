import React from 'react';
import { MessageSquare, Sparkles, Search, Briefcase, Users, Sliders } from 'lucide-react';
import { FeatureCard, FeatureCardProps } from './FeatureCard';

interface FeatureGridProps {
  onCardClick?: (featureKey: string) => void;
}

const features: (Omit<FeatureCardProps, 'onClick'> & { key: string })[] = [
  {
    key: 'chat',
    title: 'Chat',
    description: 'Have natural conversations and get things done.',
    imageUrl: '/images/landing/chat.jpg',
    imageAlt: 'Person communicating and getting work done through chat',
    icon: MessageSquare,
  },
  {
    key: 'agents',
    title: 'AI Agents',
    description: 'Specialized agents for career, research, travel and more.',
    imageUrl: '/images/landing/ai-agents.jpg',
    imageAlt: 'AI technology and intelligent agents working alongside humans',
    icon: Sparkles,
  },
  {
    key: 'search',
    title: 'Universal Search',
    description: 'Search people, knowledge and places — all in one.',
    imageUrl: '/images/landing/search.jpg',
    imageAlt: 'Universal discovery across places, knowledge, and information',
    icon: Search,
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    description: 'Find jobs, projects and business opportunities.',
    imageUrl: '/images/landing/opportunities.jpg',
    imageAlt: 'Professional career growth and business opportunities',
    icon: Briefcase,
  },
  {
    key: 'connect',
    title: 'Connect',
    description: 'Build your network and collaborate.',
    imageUrl: '/images/landing/connect.jpg',
    imageAlt: 'Team collaborating and building genuine relationships',
    icon: Users,
  },
  {
    key: 'tools',
    title: 'Business Tools',
    description: 'Tools to plan, analyze and execute.',
    imageUrl: '/images/landing/tools.jpg',
    imageAlt: 'Strategic planning, execution tools, and business operations',
    icon: Sliders,
  },
];

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onCardClick }) => {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#164E3F]">
            <span className="w-5 h-[1.5px] bg-[#164E3F]" />
            <span>HOW CHATR HELPS YOU</span>
            <span className="w-5 h-[1.5px] bg-[#164E3F]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111817]">
            One Platform. Many Possibilities.
          </h2>

          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed">
            From career and research to travel, business and everyday life — CHATR gives you the tools and AI agents to turn your intent into action.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.key}
              title={feature.title}
              description={feature.description}
              imageUrl={feature.imageUrl}
              imageAlt={feature.imageAlt}
              icon={feature.icon}
              onClick={() => onCardClick?.(feature.key)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
