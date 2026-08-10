import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  Search, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What is an AI resume parser?',
    answer: 'An AI resume parser is a software tool that uses artificial intelligence and natural language processing to extract data from candidate resumes. It converts unstructured text into structured information like skills, work experience, education, and contact details.'
  },
  {
    question: 'How does TalentXcel parse resumes?',
    answer: 'TalentXcel uses advanced machine learning algorithms to identify and extract context from resumes. Unlike traditional keyword-based parsers, our AI understands the semantics of job titles, technical skills, and educational qualifications.'
  },
  {
    question: 'What file formats does the AI resume parser support?',
    answer: 'Our AI resume parser supports all common resume formats including PDF, DOCX, DOC, TXT, and RTF, ensuring you can process applications regardless of how candidates submit them.'
  },
  {
    question: 'How does AI candidate screening work?',
    answer: 'Once resumes are parsed, the extracted data is automatically mapped against your job requirements. The system screens candidates by matching their skills, experience, and qualifications to the role, helping you identify top talent faster.'
  },
  {
    question: 'Is TalentXcel GDPR compliant?',
    answer: 'Yes, TalentXcel takes data privacy seriously. Our AI resume parsing and candidate screening processes are fully compliant with GDPR and other major data protection regulations.'
  }
];

export const TalentXcelAIResumeParserPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Pure DOM head management
    document.title = 'AI Resume Parser for Candidate Screening — TalentXcel';
    
    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'TalentXcel AI Resume Parser extracts skills, experience, and qualifications from resumes in seconds. Screen candidates 10x faster with intelligent matching.');

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://talentxcel.in/talentxcel/ai-resume-parser');

    // JSON-LD Schemas
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "TalentXcel AI Resume Parser",
          "description": "TalentXcel AI Resume Parser extracts skills, experience, and qualifications from resumes in seconds. Screen candidates 10x faster with intelligent matching.",
          "applicationCategory": "BusinessApplication",
          "url": "https://talentxcel.in/talentxcel/ai-resume-parser"
        },
        {
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
      ]
    };

    let script = document.querySelector('#talentxcel-ai-resume-parser-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'talentxcel-ai-resume-parser-schema';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    // Track page visit
    const trackVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          event_type: 'page_view',
          page_url: '/talentxcel/ai-resume-parser',
          metadata: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };
    
    trackVisit();

    return () => {
      // Cleanup DOM changes
      if (metaDescription) metaDescription.remove();
      if (canonical) canonical.remove();
      if (script) script.remove();
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-500" />
            TalentXcel
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/talentxcel/ats-resume-builder" className="text-slate-300 hover:text-indigo-400 transition-colors">ATS Resume Builder</Link>
            <Link to="/chatr/whatsapp-candidate-screening" className="text-slate-300 hover:text-indigo-400 transition-colors">WhatsApp Screening</Link>
          </div>
          <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Candidate Screening</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            AI Resume Parser for Faster <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Candidate Screening
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            TalentXcel AI Resume Parser extracts skills, experience, and qualifications from resumes in seconds. Screen candidates faster with intelligent matching and eliminate manual data entry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg shadow-indigo-500/25">
              Start Screening Candidates
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            By TalentXcel Product Team • Updated August 2026
          </p>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">How Our AI Resume Parser Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A seamless 3-step process to transform unstructured candidate data into actionable hiring insights.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="relative p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Upload Resumes</h3>
                <p className="text-slate-400">Import resumes in any format (PDF, DOCX, TXT). Our system handles single file uploads or bulk imports seamlessly.</p>
              </div>
              
              <div className="relative p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. AI Parsing</h3>
                <p className="text-slate-400">Our natural language processing engine extracts key data points, normalizing job titles and standardizing candidate skills.</p>
              </div>

              <div className="relative p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Screen & Match</h3>
                <p className="text-slate-400">Instantly screen candidates against your job requirements. The AI surfaces the best matches based on qualifications.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Powerful Features for Candidate Screening</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="mt-1 flex-shrink-0">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced Skill Extraction</h3>
                  <p className="text-slate-400">Extract hard and soft skills automatically. The parser understands context, distinguishing between a skill mentioned in passing versus one applied in a professional setting.</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Experience Mapping</h3>
                  <p className="text-slate-400">Accurately calculate total years of experience. The AI resume parser maps work chronologies and identifies career progression or employment gaps.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="mt-1 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Qualification Matching</h3>
                  <p className="text-slate-400">Verify educational backgrounds instantly. Match degrees, certifications, and licenses against your specific open role requirements.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="mt-1 flex-shrink-0">
                  <Database className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Structured Data Output</h3>
                  <p className="text-slate-400">Convert messy documents into clean, structured data. Seamlessly integrate the parsed candidate information into your existing ATS or HRIS workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-900 border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-semibold text-white">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`px-6 text-slate-400 transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'pb-4 max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-500" />
            <span className="text-white font-bold text-xl">TalentXcel</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/talentxcel/ats-resume-builder" className="hover:text-white transition-colors">ATS Resume Builder</Link>
            <Link to="/chatr/whatsapp-candidate-screening" className="hover:text-white transition-colors">WhatsApp Candidate Screening</Link>
          </div>
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} TalentXcel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TalentXcelAIResumeParserPage;
