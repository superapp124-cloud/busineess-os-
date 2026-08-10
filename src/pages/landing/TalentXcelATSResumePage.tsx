import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  CheckCircle, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Shield,
  Briefcase
} from 'lucide-react';

export const TalentXcelATSResumePage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // DOM head management
    document.title = 'ATS Resume Builder for Freshers — TalentXcel | Free Resume Templates';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Build ATS-optimized resumes with TalentXcel. Choose from professionally designed templates, add skills, and pass ATS filters to land your first job.');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://talentxcel.in/talentxcel/ats-resume-builder');

    // JSON-LD Schema
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TalentXcel ATS Resume Builder",
      "description": "ATS-friendly resume builder designed to help freshers and job seekers create professional, keyword-optimized resumes.",
      "url": "https://talentxcel.in/talentxcel/ats-resume-builder",
      "applicationCategory": "BusinessApplication"
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an ATS resume builder?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An ATS resume builder is a tool that helps you create resumes specifically formatted to pass through Applicant Tracking Systems. It avoids complex layouts and graphics that confuse ATS algorithms, ensuring your text and skills are easily read by the software."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know if my resume will pass ATS filters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our builder uses standard, ATS-compliant formats without tables, columns, or embedded images that typically cause parsing errors. We also help you structure your skills and experience in a way that ATS software can easily categorize."
          }
        },
        {
          "@type": "Question",
          "name": "Is TalentXcel resume builder free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, TalentXcel offers free ATS-friendly resume templates to help freshers and job seekers kickstart their careers."
          }
        },
        {
          "@type": "Question",
          "name": "What resume templates are available for freshers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We provide clean, professional, reverse-chronological and functional templates that highlight education, projects, and skills over extensive work history, making them ideal for freshers."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to create a resume with TalentXcel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "With our streamlined builder, you can typically create a complete, ATS-optimized resume in 10 to 15 minutes, provided you have your details ready."
          }
        }
      ]
    };

    const scriptId = 'talentxcel-ats-schema';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify([softwareSchema, faqSchema]);

    // Tracking
    const logVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          domain: 'talentxcel.in',
          path: '/talentxcel/ats-resume-builder'
        });
      } catch (err) {
        console.error('Failed to log visit', err);
      }
    };
    logVisit();

    return () => {
      if (metaDesc) metaDesc.removeAttribute('content');
      if (canonical) canonical.removeAttribute('href');
      if (script) script.remove();
    };
  }, []);

  const faqs = [
    {
      q: "What is an ATS resume builder?",
      a: "An ATS resume builder is a tool that helps you create resumes specifically formatted to pass through Applicant Tracking Systems. It avoids complex layouts and graphics that confuse ATS algorithms, ensuring your text and skills are easily read by the software."
    },
    {
      q: "How do I know if my resume will pass ATS filters?",
      a: "Our builder uses standard, ATS-compliant formats without tables, columns, or embedded images that typically cause parsing errors. We also help you structure your skills and experience in a way that ATS software can easily categorize."
    },
    {
      q: "Is TalentXcel resume builder free?",
      a: "Yes, TalentXcel offers free ATS-friendly resume templates to help freshers and job seekers kickstart their careers."
    },
    {
      q: "What resume templates are available for freshers?",
      a: "We provide clean, professional, reverse-chronological and functional templates that highlight education, projects, and skills over extensive work history, making them ideal for freshers."
    },
    {
      q: "How long does it take to create a resume with TalentXcel?",
      a: "With our streamlined builder, you can typically create a complete, ATS-optimized resume in 10 to 15 minutes, provided you have your details ready."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          ATS-Friendly Resume Builder for <span className="text-indigo-400">Freshers and Job Seekers</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          Build ATS-optimized resumes with TalentXcel. Choose from professionally designed templates, add skills, and pass ATS filters to land your first job.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            to="/auth"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg transition-colors flex items-center"
          >
            Build Your ATS Resume <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">Published: August 2026</p>
      </section>

      {/* What is ATS */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">What is ATS and why does it matter for freshers?</h2>
          <div className="prose prose-invert max-w-none text-slate-300">
            <p className="mb-4">
              An Applicant Tracking System (ATS) is software used by employers to collect, scan, and sort thousands of job applications. For freshers entering a competitive job market, understanding how these systems work is critical.
            </p>
            <p className="mb-4">
              When you submit a resume, the ATS scans it for specific keywords, formatting, and sections. If your resume uses complex designs, charts, or images, the system may fail to parse your text correctly, resulting in an automatic rejection—even if you are qualified.
            </p>
            <p>
              An ATS-friendly resume ensures that your skills, education, and projects are perfectly readable by both the software and the human recruiter who eventually reviews your profile.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Flow */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Create Your Resume in 3 Simple Steps</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">1. Choose a Template</h3>
            <p className="text-slate-400">Select an ATS-compliant template that matches your industry and highlights your fresher status.</p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center hover:border-emerald-500/50 transition-colors">
            <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">2. Add Your Details</h3>
            <p className="text-slate-400">Fill in your education, projects, skills, and internships. Our builder ensures the formatting stays intact.</p>
          </div>

          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center hover:border-indigo-500/50 transition-colors">
            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">3. Download & Share</h3>
            <p className="text-slate-400">Export your optimized resume as a clean PDF ready for your next job application.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Built for Applicant Tracking Systems</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <Search className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">ATS Keyword Optimization</h3>
                <p className="text-slate-400">Ensure your resume contains the right terminology and industry-standard phrases that systems look for when filtering freshers.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Strict Formatting Checks</h3>
                <p className="text-slate-400">Our builder enforces single-column layouts and standard fonts, preventing parsing errors common with visual-heavy resumes.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <CheckCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Skill Suggestions</h3>
                <p className="text-slate-400">Get guidance on how to structure hard and soft skills effectively, maximizing your match rate for entry-level roles.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <FileText className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Clean PDF Exports</h3>
                <p className="text-slate-400">Generate PDFs that maintain text-layer integrity, allowing ATS bots to easily highlight and extract your information.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">5 Tips to Improve Your ATS Score as a Fresher</h2>
        <ul className="space-y-6">
          <li className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-2">1. Use Standard Section Headings</h4>
            <p className="text-slate-400">Stick to clear, recognizable headings like "Education", "Work Experience", and "Skills". Avoid creative titles like "My Journey" which confuse parsers.</p>
          </li>
          <li className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-2">2. Avoid Graphics and Tables</h4>
            <p className="text-slate-400">Information placed inside tables, columns, or infographics is often completely invisible to older Applicant Tracking Systems.</p>
          </li>
          <li className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-2">3. Spell Out Acronyms</h4>
            <p className="text-slate-400">Include both the spelled-out term and the acronym (e.g., Search Engine Optimization (SEO)) to ensure you match however the recruiter typed the query.</p>
          </li>
          <li className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-2">4. Tailor Keywords to the Job Description</h4>
            <p className="text-slate-400">Read the job description carefully and mirror the exact phrasing for skills and requirements in your own resume.</p>
          </li>
          <li className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h4 className="text-lg font-semibold text-white mb-2">5. Save as an ATS-Friendly Format</h4>
            <p className="text-slate-400">Unless a specific format is requested, stick to a standard PDF with selectable text. Never submit a scanned image of your resume.</p>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-slate-900/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 border-t border-slate-800 text-slate-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links & CTA */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Explore More Tools</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
          <Link to="/talentxcel/ai-resume-parser" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Test Your Resume with AI Parser
          </Link>
          <Link to="/chatr/whatsapp-candidate-screening" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            WhatsApp Candidate Screening for Recruiters
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-900/50 to-emerald-900/50 p-10 rounded-2xl border border-slate-800">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to bypass the bots?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Create an ATS-friendly resume that highlights your true potential and increases your interview chances.</p>
          <Link 
            to="/auth"
            className="inline-flex px-8 py-4 bg-white text-indigo-950 hover:bg-slate-100 rounded-lg font-semibold text-lg transition-colors items-center"
          >
            Build Your ATS Resume Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TalentXcelATSResumePage;
