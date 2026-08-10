import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, MessageSquare, Zap, Clock, Inbox, CheckCircle, ChevronDown, ChevronUp, Briefcase, Users, Phone } from 'lucide-react';

export const ChatrAIMessagingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Pure DOM Head Management
    document.title = 'AI Messaging for Small Business — CHATR | Smart Business Chat';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'CHATR brings AI-powered messaging to small businesses. Auto-triage incoming messages, respond intelligently, and never miss a lead on WhatsApp, email, or team chat.');
    } else {
      const newMetaDesc = document.createElement('meta');
      newMetaDesc.name = 'description';
      newMetaDesc.content = 'CHATR brings AI-powered messaging to small businesses. Auto-triage incoming messages, respond intelligently, and never miss a lead on WhatsApp, email, or team chat.';
      document.head.appendChild(newMetaDesc);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://chatr.chat/chatr/ai-messaging-for-business');

    // JSON-LD Structured Data
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CHATR",
      "url": "https://chatr.chat",
      "applicationCategory": "CommunicationApplication"
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is AI messaging for small business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI messaging for small business refers to software that helps owners and small teams manage incoming messages using artificial intelligence. It automatically reads, categorises, and prioritises messages from multiple channels like WhatsApp, email, and web chat, helping businesses respond faster and never miss a potential lead."
          }
        },
        {
          "@type": "Question",
          "name": "How does CHATR use AI to manage business messages?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CHATR uses AI to understand the context and urgency of incoming messages. It groups threads from a single person into a unified inbox, drafts suggested replies based on your business context, and highlights messages that require immediate human attention, reducing the manual workload for small teams."
          }
        },
        {
          "@type": "Question",
          "name": "Can a small business afford an AI messaging tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, modern AI messaging tools like CHATR are designed specifically to be accessible for small businesses. They often replace the need for multiple separate subscriptions (like standalone WhatsApp or email tools) and save significant owner-operator time, making them a cost-effective operational upgrade."
          }
        },
        {
          "@type": "Question",
          "name": "Does CHATR work with WhatsApp for business messaging?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, CHATR integrates with WhatsApp to bring your business messaging into a central inbox. This ensures that WhatsApp messages are treated with the same priority and AI-powered intelligence as your emails and web inquiries."
          }
        },
        {
          "@type": "Question",
          "name": "How is AI messaging different from a regular chatbot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A regular chatbot uses rigid rules to force customers into pre-defined flows, often frustrating them. AI messaging acts more like a smart assistant for the business owner—it reads natural language, understands intent, helps draft accurate human-in-the-loop responses, and routes complex issues directly to you."
          }
        }
      ]
    };

    const softwareScript = document.createElement('script');
    softwareScript.type = 'application/ld+json';
    softwareScript.text = JSON.stringify(softwareSchema);
    document.head.appendChild(softwareScript);

    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    // Visit tracking
    const trackVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          domain: 'chatr.chat',
          path: '/chatr/ai-messaging-for-business',
          event: 'page_view'
        });
      } catch (error) {
        console.error('Failed to log visit', error);
      }
    };
    trackVisit();

    return () => {
      if (document.head.contains(softwareScript)) document.head.removeChild(softwareScript);
      if (document.head.contains(faqScript)) document.head.removeChild(faqScript);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is AI messaging for small business?",
      a: "AI messaging for small business refers to software that helps owners and small teams manage incoming messages using artificial intelligence. It automatically reads, categorises, and prioritises messages from multiple channels like WhatsApp, email, and web chat, helping businesses respond faster and never miss a potential lead."
    },
    {
      q: "How does CHATR use AI to manage business messages?",
      a: "CHATR uses AI to understand the context and urgency of incoming messages. It groups threads from a single person into a unified inbox, drafts suggested replies based on your business context, and highlights messages that require immediate human attention, reducing the manual workload for small teams."
    },
    {
      q: "Can a small business afford an AI messaging tool?",
      a: "Yes, modern AI messaging tools like CHATR are designed specifically to be accessible for small businesses. They often replace the need for multiple separate subscriptions (like standalone WhatsApp or email tools) and save significant owner-operator time, making them a cost-effective operational upgrade."
    },
    {
      q: "Does CHATR work with WhatsApp for business messaging?",
      a: "Yes, CHATR integrates with WhatsApp to bring your business messaging into a central inbox. This ensures that WhatsApp messages are treated with the same priority and AI-powered intelligence as your emails and web inquiries."
    },
    {
      q: "How is AI messaging different from a regular chatbot?",
      a: "A regular chatbot uses rigid rules to force customers into pre-defined flows, often frustrating them. AI messaging acts more like a smart assistant for the business owner—it reads natural language, understands intent, helps draft accurate human-in-the-loop responses, and routes complex issues directly to you."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            CHATR
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="/chatr/universal-inbox-ai" className="hover:text-white transition-colors">Universal Inbox</a>
            <a href="/chatr/whatsapp-candidate-screening" className="hover:text-white transition-colors">WhatsApp Hiring</a>
            <a href="/business-os" className="hover:text-white transition-colors">Business OS</a>
          </div>
          <a 
            href="/auth" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Log In
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Built for Small Business Operators
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            AI Messaging for Small Business — <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Respond Faster, Miss Nothing</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Missed WhatsApp messages, slow email replies, and leads going cold are the silent killers of small businesses. CHATR acts as your intelligent operator, triaging every message across channels so you can focus on doing the work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="/auth" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
            >
              Get CHATR for Your Business
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="/chatr/universal-inbox-ai" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center transition-all"
            >
              Explore Universal Inbox
            </a>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Why small business messaging is fundamentally broken
            </h2>
            <div className="space-y-4">
              <p className="text-slate-400">
                Most owner-operated businesses struggle with communication simply because there are too many channels. You're trying to check emails, monitor a business WhatsApp, reply to Instagram DMs, and take phone calls while actually delivering your service.
              </p>
              <p className="text-slate-400">
                Weekend inquiries pile up. Leads message you on WhatsApp but expect an email quote. Context gets lost, and prospects move on to the next local competitor who answered faster.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-red-500/10 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">The Speed Expectation</h3>
                  <p className="text-sm text-slate-400 mt-1">Modern clients expect responses in minutes, not days. Owner-operators rarely have the time.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-amber-500/10 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Channel Fragmentation</h3>
                  <p className="text-sm text-slate-400 mt-1">The context is split across WhatsApp, email, and social media, making continuity impossible.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What AI Does Section */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What AI messaging actually does for a small business
            </h2>
            <p className="text-slate-400">
              Forget clunky bots that frustrate customers. True AI messaging runs in the background, making your human team faster, smarter, and more organised.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Intelligent Triage", desc: "Instantly reads incoming messages to determine if it's a hot lead, a support request, or spam.", icon: Inbox },
              { title: "Smart Routing", desc: "Directs specific types of inquiries to the right team member or flags them for your urgent review.", icon: ArrowRight },
              { title: "Drafted Replies", desc: "Analyses your previous responses to draft accurate replies you just have to click to send.", icon: MessageSquare },
              { title: "Thread Context", desc: "Merges a customer's WhatsApp text and email history into a single view so you have full context.", icon: CheckCircle }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                <feature.icon className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How CHATR AI messaging works</h2>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/4 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 -z-10"></div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-400 mx-auto">1</div>
                <h3 className="text-white font-semibold">Connect channels</h3>
                <p className="text-sm text-slate-400">Link your business WhatsApp, support email, and web chat into one unified CHATR workspace.</p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-400 mx-auto">2</div>
                <h3 className="text-white font-semibold">AI reads & prioritises</h3>
                <p className="text-sm text-slate-400">As messages arrive, the AI instantly categorises them, flags urgent leads, and prepares contextual information.</p>
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-400 mx-auto">3</div>
                <h3 className="text-white font-semibold">You respond (or auto-reply)</h3>
                <p className="text-sm text-slate-400">Review AI-drafted responses for one-click sending, or let the AI handle routine FAQs automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">Manual Messaging vs CHATR AI</h2>
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <div className="grid grid-cols-2 bg-slate-950/50 p-4 border-b border-slate-800">
              <div className="font-semibold text-slate-400 text-center">Without CHATR</div>
              <div className="font-semibold text-indigo-400 text-center">With CHATR AI</div>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                ["Jump between WhatsApp phone & email client", "All messages routed to one unified inbox"],
                ["Type the same answers over and over", "AI drafts responses based on past context"],
                ["Weekend leads wait until Monday", "AI replies instantly or triages for urgency"],
                ["Missed context when customers switch channels", "Full customer history linked automatically"],
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-2 p-4 text-sm">
                  <div className="text-slate-400 px-4 text-center">{row[0]}</div>
                  <div className="text-white px-4 text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    {row[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Common small business use cases</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Service Businesses", desc: "Plumbers, electricians, and cleaners who are on the job and can't answer inquiries immediately.", icon: Briefcase },
              { title: "Local Retail", desc: "Shops receiving constant messages about inventory, opening hours, and local delivery.", icon: Inbox },
              { title: "Freelancers", desc: "Solo operators needing to look professional while managing client communication and actual work.", icon: Users },
              { title: "Local Agencies", desc: "Small teams managing real estate, marketing, or design clients demanding fast updates.", icon: Zap }
            ].map((useCase, i) => (
              <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <useCase.icon className="w-6 h-6 text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-slate-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* Author / Metadata */}
        <div className="text-center pb-8 border-t border-slate-800 pt-8">
          <p className="text-sm text-slate-500 font-medium">
            Written by CHATR Product Team &bull; August 2026
          </p>
        </div>

      </main>

    </div>
  );
};

export default ChatrAIMessagingPage;
