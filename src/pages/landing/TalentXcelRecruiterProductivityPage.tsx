import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  LineChart,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export const TalentXcelRecruiterProductivityPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Pure DOM Head Management
    document.title = 'Recruiter Productivity Tools — TalentXcel | Hire More, Work Less';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'TalentXcel gives recruiters AI-powered tools to parse resumes, screen candidates on WhatsApp, and manage hiring pipelines — without the manual busywork.');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'TalentXcel gives recruiters AI-powered tools to parse resumes, screen candidates on WhatsApp, and manage hiring pipelines — without the manual busywork.';
      document.head.appendChild(newMeta);
    }

    const canonicalUrl = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      canonicalUrl.setAttribute('href', 'https://talentxcel.in/talentxcel/recruiter-productivity');
    } else {
      const newCanonical = document.createElement('link');
      newCanonical.rel = 'canonical';
      newCanonical.href = 'https://talentxcel.in/talentxcel/recruiter-productivity';
      document.head.appendChild(newCanonical);
    }

    // JSON-LD
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TalentXcel",
      "url": "https://talentxcel.in",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web"
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are recruiter productivity tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Recruiter productivity tools are software applications designed to automate or streamline repetitive tasks in the hiring process. This includes parsing resumes, scheduling interviews, communicating with candidates, and managing pipelines, allowing recruiters to focus on candidate engagement and decision-making."
          }
        },
        {
          "@type": "Question",
          "name": "How do AI tools help recruiters screen candidates faster?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI tools accelerate screening by automatically extracting structured data from unstructured resumes, standardizing applicant profiles, and running preliminary text or chat-based screening sequences. This reduces the manual effort of reading through dozens of uniquely formatted CVs to find basic qualifications."
          }
        },
        {
          "@type": "Question",
          "name": "What is the biggest time drain for recruiters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The most significant time drains typically involve manual data entry (like copying details from a CV to an ATS), chasing candidates for initial responses or updates, and manually reading through completely unformatted or poorly structured resumes."
          }
        },
        {
          "@type": "Question",
          "name": "Can small recruitment agencies afford AI productivity tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. While enterprise legacy systems can be expensive, many modern platforms offer tiered or usage-based pricing models designed specifically to be accessible for small agencies and independent recruiters who need to maximize their efficiency."
          }
        },
        {
          "@type": "Question",
          "name": "What does TalentXcel offer to improve recruiter productivity?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TalentXcel focuses on eliminating manual administrative work. It provides an AI resume parser to standardize candidate data, automated WhatsApp screening to engage candidates where they are most responsive, and a streamlined pipeline tracker to manage the end-to-end process."
          }
        }
      ]
    };

    const schemaScript1 = document.createElement('script');
    schemaScript1.type = 'application/ld+json';
    schemaScript1.innerHTML = JSON.stringify(softwareSchema);
    document.head.appendChild(schemaScript1);

    const schemaScript2 = document.createElement('script');
    schemaScript2.type = 'application/ld+json';
    schemaScript2.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(schemaScript2);

    // Visit tracking
    const trackVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          domain: 'talentxcel.in',
          path: '/talentxcel/recruiter-productivity',
          event_type: 'page_view',
        });
      } catch (err) {
        console.error('Failed to log visit', err);
      }
    };
    trackVisit();

    return () => {
      if (schemaScript1.parentNode) schemaScript1.parentNode.removeChild(schemaScript1);
      if (schemaScript2.parentNode) schemaScript2.parentNode.removeChild(schemaScript2);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What are recruiter productivity tools?",
      a: "Recruiter productivity tools are software applications designed to automate or streamline repetitive tasks in the hiring process. This includes parsing resumes, scheduling interviews, communicating with candidates, and managing pipelines, allowing recruiters to focus on candidate engagement and decision-making."
    },
    {
      q: "How do AI tools help recruiters screen candidates faster?",
      a: "AI tools accelerate screening by automatically extracting structured data from unstructured resumes, standardizing applicant profiles, and running preliminary text or chat-based screening sequences. This reduces the manual effort of reading through dozens of uniquely formatted CVs to find basic qualifications."
    },
    {
      q: "What is the biggest time drain for recruiters?",
      a: "The most significant time drains typically involve manual data entry (like copying details from a CV to an ATS), chasing candidates for initial responses or updates, and manually reading through completely unformatted or poorly structured resumes."
    },
    {
      q: "Can small recruitment agencies afford AI productivity tools?",
      a: "Yes. While enterprise legacy systems can be expensive, many modern platforms offer tiered or usage-based pricing models designed specifically to be accessible for small agencies and independent recruiters who need to maximize their efficiency."
    },
    {
      q: "What does TalentXcel offer to improve recruiter productivity?",
      a: "TalentXcel focuses on eliminating manual administrative work. It provides an AI resume parser to standardize candidate data, automated WhatsApp screening to engage candidates where they are most responsive, and a streamlined pipeline tracker to manage the end-to-end process."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Navigation (Simplified for landing page) */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-indigo-600 p-1.5 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </span>
            TalentXcel
          </Link>
          <div className="flex gap-4">
            <Link to="/auth" className="text-sm font-medium hover:text-white transition-colors flex items-center">
              Login
            </Link>
            <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
              Try TalentXcel Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Recruiter Productivity Tools That <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Actually Save Time</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            The real cost of manual recruiting isn't just the hours spent; it's the high-value conversations you never have because you're busy formatting CVs and chasing unread emails. Stop doing data entry and start recruiting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all">
              Try TalentXcel Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-8 text-sm text-slate-500 flex items-center justify-center gap-2">
            By TalentXcel Product Team • August 2026
          </div>
        </section>

        {/* Where Time is Wasted */}
        <section className="mb-20">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Where Recruiters Waste the Most Time</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/50">
                <FileText className="w-10 h-10 text-rose-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Reading Unformatted CVs</h3>
                <p className="text-slate-400">Digging through uniquely formatted, visually messy PDFs just to find a candidate's last job title or core skills takes immense mental energy and time.</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/50">
                <MessageSquare className="w-10 h-10 text-rose-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Chasing Candidates</h3>
                <p className="text-slate-400">Sending emails that go to spam, making phone calls that go to voicemail, and manually following up trying to schedule a basic 10-minute screening call.</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/50">
                <Clock className="w-10 h-10 text-rose-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Copy-Pasting Data</h3>
                <p className="text-slate-400">Manually transferring applicant information from an inbox or job board into a spreadsheet or legacy ATS. It's tedious, error-prone, and soul-crushing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Tools That Make a Difference */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">The 5 Recruiter Productivity Tools That Make the Biggest Difference</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              { title: "1. AI Resume Parser", desc: "Instantly extracts and standardizes candidate data from any format, making profiles searchable and scannable.", link: "/talentxcel/ai-resume-parser" },
              { title: "2. WhatsApp Screening", desc: "Reaches candidates where they actually read messages, dramatically increasing response rates and speed.", link: "/chatr/whatsapp-candidate-screening" },
              { title: "3. Pipeline Tracker", desc: "A visual, kanban-style board that shows exactly where every candidate stands, preventing anyone from falling through the cracks." },
              { title: "4. Pre-screen Templates", desc: "Standardized question sets that can be sent automatically, ensuring you only spend phone time with qualified applicants.", link: "/talentxcel/automate-candidate-screening" },
              { title: "5. ATS Profile Builder", desc: "Automatically converts messy CVs into clean, standardized profiles ready for client presentation or internal review.", link: "/talentxcel/ats-resume-builder" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 mb-2">{item.desc}</p>
                  {item.link && (
                    <Link to={item.link} className="text-indigo-400 text-sm hover:text-indigo-300 font-medium inline-flex items-center gap-1">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How TalentXcel Handles Each */}
        <section className="mb-20">
          <div className="bg-gradient-to-b from-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">How TalentXcel Addresses These Roadblocks</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h4 className="text-lg font-bold text-indigo-400 mb-2">Automated Parsing</h4>
                <p className="text-slate-300">We built our <Link to="/talentxcel/ai-resume-parser" className="underline hover:text-white">AI resume parser</Link> to handle the messiest PDFs and Word docs. Upload a batch, and TalentXcel structures the data immediately.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-indigo-400 mb-2">Frictionless Communication</h4>
                <p className="text-slate-300">Instead of emails, we integrate <Link to="/chatr/whatsapp-candidate-screening" className="underline hover:text-white">WhatsApp candidate screening</Link>. Candidates respond in minutes instead of days.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-indigo-400 mb-2">Visual Workflows</h4>
                <p className="text-slate-300">No more spreadsheets. Our drag-and-drop pipeline tracker lets you see your entire hiring funnel at a glance, so you always know the next step.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-indigo-400 mb-2">Instant Formatting</h4>
                <p className="text-slate-300">Using our <Link to="/talentxcel/ats-resume-builder" className="underline hover:text-white">ATS resume builder</Link>, you can generate clean, branded candidate profiles to share with hiring managers instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Measuring Productivity */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Measuring Recruiter Productivity</h2>
          <p className="text-center text-slate-400 mb-10">You can't improve what you don't measure. Focus on these qualitative and quantitative metrics to gauge true efficiency:</p>
          
          <div className="space-y-6">
            <div className="p-6 border border-slate-800 rounded-lg bg-slate-900/50">
              <div className="flex items-center gap-3 mb-3">
                <LineChart className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Time-to-Shortlist</h3>
              </div>
              <p className="text-slate-400">The duration from opening a requisition to having a viable list of pre-screened candidates. This indicates how efficiently you source and initially filter applicants.</p>
            </div>
            
            <div className="p-6 border border-slate-800 rounded-lg bg-slate-900/50">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Screening-to-Interview Ratio</h3>
              </div>
              <p className="text-slate-400">The percentage of candidates you screen who are actually advanced to a formal interview. A higher ratio means your initial screening criteria (and tools) are accurately assessing quality.</p>
            </div>

            <div className="p-6 border border-slate-800 rounded-lg bg-slate-900/50">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Candidate Response Rate</h3>
              </div>
              <p className="text-slate-400">How many candidates reply to your outreach. Shifting from email to SMS or WhatsApp typically creates a massive spike in this metric, significantly reducing wasted outreach time.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 bg-slate-900 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-400">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16 bg-gradient-to-t from-indigo-950/40 to-transparent border-t border-slate-800 mt-12 rounded-xl">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to stop doing manual data entry?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Join the recruiters using TalentXcel to automate the busywork and focus on human connections.
          </p>
          <Link to="/auth" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-lg transition-colors">
            Try TalentXcel Free
          </Link>
        </section>

      </main>
    </div>
  );
};

export default TalentXcelRecruiterProductivityPage;
