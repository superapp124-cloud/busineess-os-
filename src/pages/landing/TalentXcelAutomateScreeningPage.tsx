import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Bot, Clock, ShieldAlert, Zap, Filter, LayoutDashboard } from 'lucide-react';

export const TalentXcelAutomateScreeningPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // cc_logs tracking
    const trackVisit = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('cc_logs').insert({
          domain: 'talentxcel.in',
          path: '/talentxcel/automate-candidate-screening',
          event: 'page_view',
        });
      } catch (err) {
        console.log('Tracking error', err);
      }
    };
    trackVisit();

    // Pure DOM Head Management
    document.title = 'How to Automate Candidate Screening — TalentXcel | Recruiter Guide';
    
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = 'https://talentxcel.in/talentxcel/automate-candidate-screening';
    document.head.appendChild(canonicalLink);

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'Learn how to automate candidate screening using AI resume parsing, structured pre-screens, and workflow triggers. Cut time-to-shortlist by hours, not weeks.';
    document.head.appendChild(metaDesc);

    // Article JSON-LD
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Automate Candidate Screening: A Practical Guide for Recruiters",
      "author": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel",
        "logo": {
          "@type": "ImageObject",
          "url": "https://talentxcel.in/logo.png"
        }
      },
      "datePublished": "2026-08-10",
      "dateModified": "2026-08-10"
    };
    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.text = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    // FAQ JSON-LD
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is candidate screening automation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Candidate screening automation is the use of software—such as AI resume parsers, rules-based triggers, and automated pre-screen questionnaires—to filter and rank applicants without manual human review of every single application."
          }
        },
        {
          "@type": "Question",
          "name": "How does AI resume parsing work in screening?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI resume parsers read the unstructured data in a resume (like a PDF or DOCX) and extract structured fields—skills, years of experience, education, and job titles. This allows screening tools to easily match candidate data against job requirements."
          }
        },
        {
          "@type": "Question",
          "name": "What types of roles benefit most from automated screening?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "High-volume roles such as customer support, retail, entry-level sales, and tech roles with specific hard-skill requirements see the most benefit. Executive or highly nuanced creative roles generally require more manual, personalized screening."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between screening and shortlisting?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Screening is the process of removing candidates who do not meet the minimum requirements (the 'no' pile). Shortlisting is selecting the best candidates from the remaining pool to move forward to interviews."
          }
        },
        {
          "@type": "Question",
          "name": "How do I start automating candidate screening today?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Start by identifying your minimum hard requirements for a role. Next, implement a simple pre-screen questionnaire, and adopt an ATS or AI tool that automatically extracts and scores resume data."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    return () => {
      document.head.removeChild(canonicalLink);
      document.head.removeChild(metaDesc);
      document.head.removeChild(articleScript);
      document.head.removeChild(faqScript);
    };
  }, []);

  const faqs = [
    { q: "What is candidate screening automation?", a: "Candidate screening automation is the use of software—such as AI resume parsers, rules-based triggers, and automated pre-screen questionnaires—to filter and rank applicants without manual human review of every single application." },
    { q: "How does AI resume parsing work in screening?", a: "AI resume parsers read the unstructured data in a resume (like a PDF or DOCX) and extract structured fields—skills, years of experience, education, and job titles. This allows screening tools to easily match candidate data against job requirements." },
    { q: "What types of roles benefit most from automated screening?", a: "High-volume roles such as customer support, retail, entry-level sales, and tech roles with specific hard-skill requirements see the most benefit. Executive or highly nuanced creative roles generally require more manual, personalized screening." },
    { q: "What is the difference between screening and shortlisting?", a: "Screening is the process of removing candidates who do not meet the minimum requirements (the 'no' pile). Shortlisting is selecting the best candidates from the remaining pool to move forward to interviews." },
    { q: "How do I start automating candidate screening today?", a: "Start by identifying your minimum hard requirements for a role. Next, implement a simple pre-screen questionnaire, and adopt an ATS or AI tool that automatically extracts and scores resume data." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation (simplified for landing page) */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">Talent<span className="text-indigo-500">Xcel</span></Link>
          <div className="flex gap-4">
            <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Start Automating
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        
        {/* Article Header */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Filter className="w-4 h-4" /> Recruiter Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            How to Automate Candidate Screening: A Practical Guide for Recruiters
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Learn how to automate candidate screening using AI resume parsing, structured pre-screens, and workflow triggers. Cut time-to-shortlist by hours, not weeks.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span>By TalentXcel Product Team</span>
            <span>•</span>
            <time dateTime="2026-08-10">August 2026</time>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-xl">
          
          <h2 className="text-2xl font-bold mt-12 mb-6">The Real Problem with Manual Screening</h2>
          <p>
            If you've ever posted a job opening on a major board, you know the drill. Within 48 hours, you have 300 applicants. 
            When you finally sit down to review them, you realize that 60% of the applicants don't meet the basic location requirements, 
            another 20% lack the necessary experience, and you are left digging through a massive pile of unstructured PDFs just to find 10 qualified candidates.
          </p>
          <p>
            Manual screening is not just slow; it's inconsistent. Recruiter fatigue sets in, leading to bias and overlooked talent. 
            The goal of automation isn't to replace the human element of recruiting—it's to handle the high-volume data filtering so you can actually spend time talking to qualified human beings.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">Step 1: Set Up Your Screening Criteria</h2>
          <p>
            Automation only works when the rules are clear. Before touching any software, you must define the absolute non-negotiables for your role. 
            These are binary (yes/no) criteria that instantly disqualify a candidate.
          </p>
          <ul className="space-y-2 mt-4 list-disc pl-6">
            <li><strong>Work Authorization:</strong> Does the candidate have the legal right to work in the required location?</li>
            <li><strong>Location/Relocation:</strong> Are they located in the required city, or willing to relocate?</li>
            <li><strong>Hard Skills:</strong> Do they know the specific framework or machinery required to do the job on day one?</li>
            <li><strong>Certifications:</strong> Do they hold required licenses (e.g., nursing license, CPA)?</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6">Step 2: Use AI Resume Parsing to Extract Structured Data</h2>
          <p>
            Resumes are notoriously unstructured. Some candidates use functional formats, others chronological. Some hide their skills in dense paragraphs.
          </p>
          <p>
            This is where <Link to="/talentxcel/ai-resume-parser">AI resume parsing</Link> comes in. Modern parsers don't just rely on keyword matching; they use natural language processing to understand the context. They extract years of experience, aggregate skills, and map job titles to standard industry taxonomies. By turning a messy PDF into clean JSON data, your system can automatically check if a candidate meets the criteria you set in Step 1.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">Step 3: Define Automated Pass/Fail Rules</h2>
          <p>
            Once you have structured data, you can build your workflows. Most modern ATS platforms allow you to create trigger-based rules.
          </p>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg my-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-indigo-400" /> Practical Rule Examples</h4>
            <ul className="space-y-4 m-0 p-0 list-none text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>IF</strong> 'Years of Experience' &lt; 3 <strong>AND</strong> 'Role' = 'Senior Developer', <strong>THEN</strong> Move to 'Rejected' status.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>IF</strong> 'Location' != 'Remote' <strong>AND</strong> 'Location' != 'New York', <strong>THEN</strong> Send automated disqualification email.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>IF</strong> Parser Confidence Score &gt; 85%, <strong>THEN</strong> Flag for 'Priority Review'.</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Step 4: Add a Pre-Screen Questionnaire</h2>
          <p>
            Resume parsing isn't perfect. Sometimes candidates leave crucial information off their <Link to="/talentxcel/ats-resume-builder">ATS-friendly resume</Link>. 
            A short, automated pre-screen questionnaire acts as a failsafe. Keep it to 5 questions or fewer to avoid drop-off.
          </p>
          <p className="font-semibold mb-2">5 Example Questions That Actually Work:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Will you now, or in the future, require sponsorship for employment visa status?</li>
            <li>Are you comfortable with the listed salary range of [Range]?</li>
            <li>Are you able to commute to the [City] office 3 days a week?</li>
            <li>Do you have experience using [Critical Tool/Software] in a production environment?</li>
            <li>What is your required notice period?</li>
          </ol>

          <h2 className="text-2xl font-bold mt-12 mb-6">Step 5: Connect Your Screening to Your Hiring Pipeline</h2>
          <p>
            Automation shouldn't happen in a vacuum. It needs to connect to how you communicate. For example, if you are hiring for blue-collar or high-volume retail roles, email might be too slow.
          </p>
          <p>
            Integrating <Link to="/chatr/whatsapp-candidate-screening">WhatsApp candidate screening</Link> allows you to send those pre-screen questionnaires directly to the candidate's phone the moment they apply. If they answer the questions correctly via chat, the system can instantly present them with a calendar link to book a screening call.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">Manual vs Automated Screening</h2>
          <div className="overflow-x-auto my-8">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 bg-slate-900 border-b border-slate-800 text-white font-semibold">Feature</th>
                  <th className="p-4 bg-slate-900 border-b border-slate-800 text-slate-300">Manual Screening</th>
                  <th className="p-4 bg-slate-900 border-b border-slate-800 text-indigo-400">Automated Screening</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="p-4 border-b border-slate-800 font-medium">Time per Resume</td>
                  <td className="p-4 border-b border-slate-800">2 - 5 minutes</td>
                  <td className="p-4 border-b border-slate-800">Instant</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-800 font-medium">Consistency</td>
                  <td className="p-4 border-b border-slate-800 text-red-400">Low (Fatigue, Bias)</td>
                  <td className="p-4 border-b border-slate-800 text-emerald-400">100% Consistent</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-800 font-medium">Scalability</td>
                  <td className="p-4 border-b border-slate-800">Bottlenecks at high volume</td>
                  <td className="p-4 border-b border-slate-800">Handles 10,000+ easily</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-800 font-medium">Candidate Experience</td>
                  <td className="p-4 border-b border-slate-800">Delayed responses (ghosting)</td>
                  <td className="p-4 border-b border-slate-800">Instant feedback & progression</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            When NOT to Automate
          </h2>
          <p>
            While automation is powerful, it is not a silver bullet. You should avoid heavy automated screening for:
          </p>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
              <span><strong>C-Suite and Executive Roles:</strong> These candidates require high-touch relationship building, and their backgrounds are too nuanced for simple rules.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
              <span><strong>Creative Portfolios:</strong> An AI parser can read text, but it cannot evaluate the quality of a graphic designer's portfolio or a UX researcher's case study.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
              <span><strong>Culture Fit:</strong> Never automate final hiring decisions based on personality tests or 'culture' AI. These introduce massive compliance and bias risks. Automation is for the top of the funnel, not the bottom.</span>
            </li>
          </ul>

        </article>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-8 md:p-12 text-center">
          <Bot className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Ready to stop manually reading resumes?</h3>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Set up your automated screening rules in minutes. Parse resumes accurately, send instant pre-screens, and only talk to the best candidates.
          </p>
          <Link to="/auth" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
            Start Automating Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden transition-all duration-200"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-semibold text-white pr-8">{faq.q}</span>
                  <span className="text-slate-500 shrink-0">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === index ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-12 text-center">
        <p className="text-slate-500 text-sm">© 2026 TalentXcel. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default TalentXcelAutomateScreeningPage;
