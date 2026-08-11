import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe2, Building2, BookOpen, Newspaper, FileSpreadsheet, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full mt-auto py-10 bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Core Product & Solution Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-xs">
          {/* Column 1: Solutions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Solutions</h3>
            <ul className="space-y-2">
              <li><Link to="/chatr/whatsapp-business-api" className="hover:text-indigo-400 transition-colors">WhatsApp Business API</Link></li>
              <li><Link to="/chatr/universal-inbox-ai" className="hover:text-indigo-400 transition-colors">Universal AI Inbox</Link></li>
              <li><Link to="/chatr/whatsapp-candidate-screening" className="hover:text-indigo-400 transition-colors">WhatsApp Candidate Screening</Link></li>
              <li><Link to="/talentxcel/ai-resume-parser" className="hover:text-indigo-400 transition-colors">AI Resume Parser</Link></li>
              <li><Link to="/talentxcel/ats-resume-builder" className="hover:text-indigo-400 transition-colors">ATS Resume Builder</Link></li>
            </ul>
          </div>

          {/* Column 2: Workflows */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Workflows</h3>
            <ul className="space-y-2">
              <li><Link to="/workflow/whatsapp-lead-response-workflow" className="hover:text-indigo-400 transition-colors">Lead Response SLA</Link></li>
              <li><Link to="/workflow/automated-candidate-screening-workflow" className="hover:text-indigo-400 transition-colors">Candidate Screening Flow</Link></li>
              <li><Link to="/problem/how-to-stop-losing-whatsapp-leads" className="hover:text-indigo-400 transition-colors">Stop Lead Loss</Link></li>
              <li><Link to="/problem/manage-multiple-whatsapp-business-accounts" className="hover:text-indigo-400 transition-colors">Multi-Account Scaling</Link></li>
              <li><Link to="/ai-business-os-for-startups" className="hover:text-indigo-400 transition-colors">Startup Business OS</Link></li>
            </ul>
          </div>

          {/* Column 3: Industries */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Industries</h3>
            <ul className="space-y-2">
              <li><Link to="/industries/recruitment-agencies" className="hover:text-indigo-400 transition-colors">Recruitment & Staffing</Link></li>
              <li><Link to="/industries/real-estate-messaging" className="hover:text-indigo-400 transition-colors">Real Estate Agencies</Link></li>
              <li><Link to="/industries/healthcare-patient-messaging" className="hover:text-indigo-400 transition-colors">Healthcare & Clinics</Link></li>
              <li><Link to="/industries/ecommerce-customer-support" className="hover:text-indigo-400 transition-colors">E-Commerce & D2C</Link></li>
              <li><Link to="/industries/education-student-admissions" className="hover:text-indigo-400 transition-colors">Education & Academies</Link></li>
            </ul>
          </div>

          {/* Column 4: Key Locations (Internal Discovery Links) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Location Hubs</span>
            </h3>
            <ul className="space-y-2">
              <li><Link to="/locations/mumbai" className="hover:text-indigo-400 transition-colors">Mumbai Hub</Link></li>
              <li><Link to="/locations/delhi-ncr" className="hover:text-indigo-400 transition-colors">Delhi NCR Hub</Link></li>
              <li><Link to="/locations/bangalore" className="hover:text-indigo-400 transition-colors">Bangalore Hub</Link></li>
              <li><Link to="/locations/dubai" className="hover:text-indigo-400 transition-colors">Dubai Hub</Link></li>
              <li><Link to="/locations/london" className="hover:text-indigo-400 transition-colors">London Hub</Link></li>
              <li><Link to="/locations" className="text-emerald-400 font-semibold hover:underline">All 1,758 Cities →</Link></li>
            </ul>
          </div>

          {/* Column 5: E-E-A-T Trust & Research */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Trust & Data</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About CHATR</Link></li>
              <li><Link to="/authors" className="hover:text-indigo-400 transition-colors">Authors & Experts</Link></li>
              <li><Link to="/editorial-policy" className="hover:text-indigo-400 transition-colors">Editorial Policy</Link></li>
              <li><Link to="/research/india-recruitment-communication-benchmark-2026" className="hover:text-indigo-400 transition-colors">Recruitment Benchmark</Link></li>
              <li><Link to="/company-info" className="hover:text-indigo-400 transition-colors">Company Information</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-medium text-slate-300">
              CHATR Business OS — A product of TalentXcel Services Pvt Ltd
            </p>
            <p className="text-[11px] text-slate-500">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-xs">
            <Link to="/about" className="hover:text-indigo-400 hover:underline">About</Link>
            <span>•</span>
            <Link to="/locations" className="hover:text-indigo-400 hover:underline font-semibold text-indigo-300">Locations Directory</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-indigo-400 hover:underline">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-indigo-400 hover:underline">Privacy</Link>
            <span>•</span>
            <Link to="/editorial-policy" className="hover:text-indigo-400 hover:underline">Editorial Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
