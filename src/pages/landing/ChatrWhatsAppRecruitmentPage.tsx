import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ChatrWhatsAppRecruitmentPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Pure DOM Head Management
    document.title = 'WhatsApp Business for Recruitment Agencies — CHATR | Hire Faster';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover how recruitment agencies use WhatsApp Business to screen candidates, send job alerts, and manage hiring pipelines at scale with CHATR.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Discover how recruitment agencies use WhatsApp Business to screen candidates, send job alerts, and manage hiring pipelines at scale with CHATR.';
      document.head.appendChild(meta);
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://chatr.chat/chatr/whatsapp-business-recruitment');
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://chatr.chat/chatr/whatsapp-business-recruitment';
      document.head.appendChild(link);
    }

    // Article Schema
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How Recruitment Agencies Use WhatsApp Business to Hire Faster",
      "author": {
        "@type": "Organization",
        "name": "CHATR",
        "url": "https://chatr.chat"
      },
      "datePublished": "2026-08-10",
      "dateModified": "2026-08-10"
    };

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Can recruitment agencies use WhatsApp Business for hiring?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, recruitment agencies can and do use WhatsApp Business for hiring. It provides a direct, high-engagement channel to reach candidates for job alerts, initial screening, and interview scheduling, often yielding faster response times than email."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between WhatsApp and WhatsApp Business for recruiters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The standard WhatsApp app is for personal use, while WhatsApp Business offers features like business profiles, quick replies, automated away messages, and labels. For larger agencies, the WhatsApp Business API allows integration with ATS platforms and multi-agent inboxes."
          }
        },
        {
          "@type": "Question",
          "name": "How do I send bulk job alerts on WhatsApp without getting blocked?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To send bulk job alerts safely, you must use the WhatsApp Business API, obtain explicit opt-in consent from candidates, and use pre-approved message templates. Avoiding spam and ensuring content is relevant are critical to maintaining a good quality rating."
          }
        },
        {
          "@type": "Question",
          "name": "Can WhatsApp be used for candidate screening?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. WhatsApp is highly effective for preliminary candidate screening. Recruiters can ask basic qualifying questions (e.g., salary expectations, location, availability) and receive quick replies, significantly speeding up the initial stages of the pipeline."
          }
        },
        {
          "@type": "Question",
          "name": "What is CHATR and how does it help recruiters on WhatsApp?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CHATR is a platform that enhances WhatsApp Business capabilities for teams. For recruiters, CHATR offers a universal inbox, allowing multiple team members to manage candidate conversations collaboratively, ensuring no message slips through the cracks."
          }
        }
      ]
    };

    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.id = 'article-schema';
    articleScript.text = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.id = 'faq-schema';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    // Visit tracking
    const logVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          agent: 'web_sensor',
          action: 'Organic Visit on chatr.chat/chatr/whatsapp-business-recruitment',
          level: 'info',
          details: {
            domain: 'chatr.chat',
            path: '/chatr/whatsapp-business-recruitment',
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to log visit', error);
      }
    };
    logVisit();

    return () => {
      // Cleanup
      const articleEl = document.getElementById('article-schema');
      if (articleEl) articleEl.remove();
      const faqEl = document.getElementById('faq-schema');
      if (faqEl) faqEl.remove();
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Can recruitment agencies use WhatsApp Business for hiring?",
      a: "Yes, recruitment agencies can and do use WhatsApp Business for hiring. It provides a direct, high-engagement channel to reach candidates for job alerts, initial screening, and interview scheduling, often yielding faster response times than email."
    },
    {
      q: "What is the difference between WhatsApp and WhatsApp Business for recruiters?",
      a: "The standard WhatsApp app is for personal use, while WhatsApp Business offers features like business profiles, quick replies, automated away messages, and labels. For larger agencies, the WhatsApp Business API allows integration with ATS platforms and multi-agent inboxes."
    },
    {
      q: "How do I send bulk job alerts on WhatsApp without getting blocked?",
      a: "To send bulk job alerts safely, you must use the WhatsApp Business API, obtain explicit opt-in consent from candidates, and use pre-approved message templates. Avoiding spam and ensuring content is relevant are critical to maintaining a good quality rating."
    },
    {
      q: "Can WhatsApp be used for candidate screening?",
      a: "Absolutely. WhatsApp is highly effective for preliminary candidate screening. Recruiters can ask basic qualifying questions (e.g., salary expectations, location, availability) and receive quick replies, significantly speeding up the initial stages of the pipeline."
    },
    {
      q: "What is CHATR and how does it help recruiters on WhatsApp?",
      a: "CHATR is a platform that enhances WhatsApp Business capabilities for teams. For recruiters, CHATR offers a universal inbox, allowing multiple team members to manage candidate conversations collaboratively, ensuring no message slips through the cracks."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <header className="relative py-24 lg:py-32 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <p className="text-cyan-400 font-semibold tracking-wide uppercase text-sm mb-4">The Future of Hiring</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            How Recruitment Agencies Use WhatsApp Business to Hire Faster
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop losing candidates to buried emails. Discover how top agencies use WhatsApp Business to screen talent, send immediate job alerts, and manage pipelines directly where candidates spend their time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
              Start Using CHATR Free
            </Link>
            <Link to="/chatr/universal-inbox-ai" className="px-8 py-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700 w-full sm:w-auto">
              Explore Universal Inbox
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24 space-y-20">
        
        {/* Section: Why WhatsApp */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why WhatsApp is the recruiter's best kept secret</h2>
          <div className="prose prose-invert max-w-none text-slate-300">
            <p>
              The recruitment landscape is shifting. Candidates are increasingly ignoring long emails and screening phone calls from unknown numbers. WhatsApp, however, is a different story. It is inherently personal, immediate, and accessible.
            </p>
            <p>
              When a recruiter reaches out via WhatsApp, the message lands directly in the candidate's most-checked app. The read rates are consistently higher, and response times are measured in minutes, not days. This speed is critical in competitive markets where top talent is off the market within a week.
            </p>
            <p>
              But there is a caveat: you cannot just use your personal WhatsApp for scalable agency recruitment. Doing so creates data silos, compliance risks, and limits your volume. This is where WhatsApp Business and the WhatsApp Business API step in.
            </p>
          </div>
        </section>

        {/* Section: What WhatsApp Business enables */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">What WhatsApp Business enables for agencies</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Instant Job Alerts</h3>
              <p className="text-sm text-slate-400">
                Notify your talent pool about new roles immediately. With proper API integration, you can segment candidates and send targeted alerts that actually get read.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-semibold text-indigo-400 mb-3">Rapid Screening</h3>
              <p className="text-sm text-slate-400">
                Send out three quick qualifying questions (e.g., location, salary expectations, right to work) via WhatsApp before scheduling a call. See our guide on <Link to="/chatr/whatsapp-candidate-screening" className="text-indigo-400 hover:underline">WhatsApp candidate screening</Link>.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Status Updates</h3>
              <p className="text-sm text-slate-400">
                Keep candidates warm by dropping quick interview feedback or next steps. It removes the anxiety of the "black hole" and improves candidate experience.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Comparison Table */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">WhatsApp vs Traditional Recruitment Channels</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 font-semibold border-b border-slate-800">Channel</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Average Open Rate</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Typical Response Time</th>
                  <th className="p-4 font-semibold border-b border-slate-800">Best Used For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="bg-slate-950">
                  <td className="p-4 font-medium text-white">WhatsApp Business</td>
                  <td className="p-4">High</td>
                  <td className="p-4">Minutes</td>
                  <td className="p-4">Urgent updates, quick screening, nudges</td>
                </tr>
                <tr className="bg-slate-950">
                  <td className="p-4 font-medium text-white">Email</td>
                  <td className="p-4">Moderate</td>
                  <td className="p-4">1-2 Days</td>
                  <td className="p-4">Contracts, long-form details, formal offers</td>
                </tr>
                <tr className="bg-slate-950">
                  <td className="p-4 font-medium text-white">Phone Calls</td>
                  <td className="p-4">Low (unanswered)</td>
                  <td className="p-4">Immediate (if answered)</td>
                  <td className="p-4">In-depth interviews, complex negotiations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Workflows */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">5 practical WhatsApp workflows for recruitment agencies</h2>
          <ol className="space-y-6 list-decimal list-inside text-slate-300">
            <li className="pl-2">
              <strong className="text-white">The Pre-Call Nudge:</strong> Before dialing a candidate, send a quick WhatsApp message introducing yourself and asking if it's a good time to call. This dramatically increases pickup rates.
            </li>
            <li className="pl-2">
              <strong className="text-white">Document Collection:</strong> Request portfolios or CVs via WhatsApp. If you pair this with tools like the <Link to="/talentxcel/ai-resume-parser" className="text-indigo-400 hover:underline">AI resume parser</Link>, you can streamline candidate intake significantly.
            </li>
            <li className="pl-2">
              <strong className="text-white">Interview Reminders:</strong> Send an automated message 24 hours and 1 hour before an interview with Google Maps links or Zoom details to reduce no-shows.
            </li>
            <li className="pl-2">
              <strong className="text-white">Post-Interview Debrief:</strong> A simple "How did it go?" message sent 30 minutes after an interview shows you care and gets you immediate feedback to pass to the client.
            </li>
            <li className="pl-2">
              <strong className="text-white">Re-engagement Campaigns:</strong> Ping your silver medalist candidates from 6 months ago with a highly relevant new role.
            </li>
          </ol>
        </section>

        {/* Section: What NOT to do */}
        <section className="space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tight">What NOT to do on WhatsApp recruiting</h2>
          <div className="space-y-4 text-slate-300">
            <p>While WhatsApp is powerful, abusing it will get your number blocked or banned by Meta.</p>
            <ul className="list-disc list-outside pl-5 space-y-2">
              <li><strong>Do not ignore consent:</strong> Always get opt-in before messaging candidates on WhatsApp. A simple checkbox on your application form suffices.</li>
              <li><strong>Do not send generic spam:</strong> Mass messaging the exact same generic template to 5,000 people is a surefire way to ruin your domain reputation and WhatsApp quality rating.</li>
              <li><strong>Do not text outside business hours:</strong> WhatsApp is intimate. A job alert at 11:00 PM on a Saturday crosses boundaries.</li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white tracking-tight text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 font-semibold text-white hover:bg-slate-800/50 transition-colors flex justify-between items-center focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`transform transition-transform text-indigo-400 ${openFaq === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 text-slate-400 bg-slate-900 border-t border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer / Meta Info */}
      <footer className="border-t border-slate-800 py-12 mt-12 bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            <p>Author: <span className="font-semibold text-slate-300">CHATR Product Team</span></p>
            <p>Published: August 2026</p>
          </div>
          <div className="flex gap-4">
            <Link to="/auth" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
              Get Started with CHATR
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatrWhatsAppRecruitmentPage;
