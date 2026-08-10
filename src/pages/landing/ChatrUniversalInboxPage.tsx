import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Inbox, 
  MessageSquare, 
  Bot, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Smartphone, 
  ChevronDown,
  Mail,
  Network
} from 'lucide-react';

export const ChatrUniversalInboxPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Pure DOM Head Management
    document.title = 'Universal AI Inbox for Business — CHATR | Unified Message Management';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'CHATR gives your business a single AI-powered inbox for WhatsApp, email, CRM notes, and team chats. Stop switching tabs, start managing conversations intelligently.');
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', 'https://chatr.chat/chatr/universal-inbox-ai');

    // Visit tracking
    const trackVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          domain: 'chatr.chat',
          path: '/chatr/universal-inbox-ai',
          action: 'page_view',
          details: { keyword: 'universal inbox ai for business' }
        });
      } catch (error) {
        console.error('Failed to track visit', error);
      }
    };
    
    trackVisit();

    return () => {
      // Optional cleanup if needed in SPA transitions
    };
  }, []);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CHATR Universal Inbox",
    "description": "CHATR gives your business a single AI-powered inbox for WhatsApp, email, CRM notes, and team chats. Stop switching tabs, start managing conversations intelligently.",
    "url": "https://chatr.chat/chatr/universal-inbox-ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a universal inbox for business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A universal inbox consolidates messages from various channels—like email, WhatsApp, SMS, and live chat—into a single interface. This prevents context switching and ensures no customer query is lost across different apps."
        }
      },
      {
        "@type": "Question",
        "name": "How does CHATR AI handle multiple messaging channels?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CHATR connects to your existing communication channels via API and funnels them into one stream. The built-in AI triages incoming messages, assigns them to the correct team member, and can even draft suggested replies based on conversation context."
        }
      },
      {
        "@type": "Question",
        "name": "Can my team use CHATR as a shared inbox?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. CHATR is designed for collaboration. Multiple team members can view the same inbox, assign threads to one another, leave internal notes, and see who is currently replying to a customer in real time."
        }
      },
      {
        "@type": "Question",
        "name": "Does CHATR integrate with WhatsApp Business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CHATR fully supports WhatsApp Business integration. You can send and receive WhatsApp messages directly from the CHATR interface alongside your emails and team chats."
        }
      },
      {
        "@type": "Question",
        "name": "How is CHATR different from a regular email client?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While a regular email client is limited to email protocols, CHATR handles multi-modal communication (text, WhatsApp, CRM notes). Furthermore, it incorporates AI to summarize threads and automate routing, making it a complete Business OS rather than just an email reader."
        }
      }
    ]
  };

  const faqs = [
    {
      q: "What is a universal inbox for business?",
      a: "A universal inbox consolidates messages from various channels—like email, WhatsApp, SMS, and live chat—into a single interface. This prevents context switching and ensures no customer query is lost across different apps."
    },
    {
      q: "How does CHATR AI handle multiple messaging channels?",
      a: "CHATR connects to your existing communication channels via API and funnels them into one stream. The built-in AI triages incoming messages, assigns them to the correct team member, and can even draft suggested replies based on conversation context."
    },
    {
      q: "Can my team use CHATR as a shared inbox?",
      a: "Yes. CHATR is designed for collaboration. Multiple team members can view the same inbox, assign threads to one another, leave internal notes, and see who is currently replying to a customer in real time."
    },
    {
      q: "Does CHATR integrate with WhatsApp Business?",
      a: "Yes, CHATR fully supports WhatsApp Business integration. You can send and receive WhatsApp messages directly from the CHATR interface alongside your emails and team chats."
    },
    {
      q: "How is CHATR different from a regular email client?",
      a: "While a regular email client is limited to email protocols, CHATR handles multi-modal communication (text, WhatsApp, CRM notes). Furthermore, it incorporates AI to summarize threads and automate routing, making it a complete Business OS rather than just an email reader."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">CHATR</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/business-os" className="hover:text-white transition-colors hidden sm:block">Business OS</Link>
            <Link to="/chatr/whatsapp-candidate-screening" className="hover:text-white transition-colors hidden sm:block">WhatsApp Screening</Link>
            <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Intelligent Inbox Consolidation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Universal AI Inbox for Business <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">All Your Messages in One Place</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop switching between WhatsApp, email, and CRM notes. CHATR gives your business a single AI-powered inbox to manage conversations intelligently, triage requests, and collaborate as a team.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
              Try CHATR for Your Business <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
             <div className="flex items-center gap-2"><Mail className="w-5 h-5" /> <span>Email Integration</span></div>
             <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> <span>WhatsApp Business</span></div>
             <div className="flex items-center gap-2"><Network className="w-5 h-5" /> <span>CRM Notes</span></div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The real problem with business messaging today</h2>
            <p className="text-lg text-slate-400">As a modern business operator, your communication is severely fragmented.</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 md:p-8 bg-slate-950 rounded-2xl border border-slate-800/60 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                <Layers className="text-indigo-400" />
                The Context-Switching Tax
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Your sales team is talking to a client on WhatsApp, support is emailing them, and the account manager is leaving notes in the CRM. Nobody has the full picture. Jumping between tools doesn't just waste time—it creates embarrassing overlaps and dropped balls in customer service.
              </p>
            </div>
            
            <div className="p-6 md:p-8 bg-slate-950 rounded-2xl border border-slate-800/60 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                <Users className="text-indigo-400" />
                Siloed Ownership
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Personal inboxes mean institutional knowledge is locked away. When a key employee is out sick, their ongoing conversations stall. A universal inbox ensures conversations belong to the business, not just an individual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How CHATR Universal Inbox works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Built from the ground up for modern teams who need speed, context, and intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50 hover:bg-slate-900 transition-colors">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <Inbox className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Consolidation</h3>
              <p className="text-slate-400 leading-relaxed">
                Plug in your company's email addresses, WhatsApp Business numbers, and web chat. CHATR normalizes every message format and streams it into a unified interface. You see the customer, not the protocol.
              </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50 hover:bg-slate-900 transition-colors">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
                <Bot className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. AI Triage</h3>
              <p className="text-slate-400 leading-relaxed">
                Not all messages are equal. CHATR's built-in AI automatically tags conversations by intent (e.g., support, sales, billing), drafts contextual replies, and surfaces urgent issues to the top of the queue.
              </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50 hover:bg-slate-900 transition-colors">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Team Collaboration</h3>
              <p className="text-slate-400 leading-relaxed">
                Treat threads like tasks. Assign a conversation to a teammate, leave internal @mention notes alongside customer emails, and track resolution states. Never send a "Did you reply to them?" message again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">The Old Way vs. The CHATR Approach</h2>
          
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 border-b border-slate-800 text-slate-400 font-semibold w-1/3">Feature</th>
                  <th className="p-6 border-b border-slate-800 text-slate-400 font-semibold w-1/3">Traditional Setup</th>
                  <th className="p-6 border-b border-slate-800 bg-indigo-900/10 text-indigo-300 font-bold w-1/3 border-l border-indigo-500/20">CHATR Universal Inbox</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-6 font-medium text-white">Channel Management</td>
                  <td className="p-6 text-slate-400">Multiple tabs and distinct apps</td>
                  <td className="p-6 bg-indigo-900/5 border-l border-indigo-500/20 text-white flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/> Unified multi-modal feed</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium text-white">Prioritization</td>
                  <td className="p-6 text-slate-400">Chronological (newest first)</td>
                  <td className="p-6 bg-indigo-900/5 border-l border-indigo-500/20 text-white flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/> AI intent-based triage</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium text-white">Internal Communication</td>
                  <td className="p-6 text-slate-400">Forwarding emails, Slack copy-paste</td>
                  <td className="p-6 bg-indigo-900/5 border-l border-indigo-500/20 text-white flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/> Inline comments and @mentions</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium text-white">Drafting Responses</td>
                  <td className="p-6 text-slate-400">Manual typing or basic templates</td>
                  <td className="p-6 bg-indigo-900/5 border-l border-indigo-500/20 text-white flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/> AI suggested replies based on context</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-white text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking & Meta info */}
      <section className="py-12 border-t border-slate-800/50 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="text-slate-500">
            Written by <span className="font-medium text-slate-400">CHATR Product Team</span> • August 2026
          </div>
          <div className="flex gap-6">
             <Link to="/business-os" className="text-indigo-400 hover:text-indigo-300">Explore Business OS →</Link>
             <Link to="/chatr/whatsapp-candidate-screening" className="text-cyan-400 hover:text-cyan-300">WhatsApp Screening →</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatrUniversalInboxPage;
