import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe2, Building2, BookOpen, Newspaper, FileSpreadsheet, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full mt-auto py-12 bg-[#F8F8F5] border-t border-[#DDE3DF] text-[#53605C]">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Core Product & Solution Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-xs">
          {/* Column 1: Core Solutions */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#111817] uppercase tracking-wider text-[11px]">Solutions</h3>
            <ul className="space-y-2">
              <li><Link to="/whatsapp-team-inbox" className="text-[#164E3F] font-semibold hover:text-[#2E6B59] transition-colors">WhatsApp Team Inbox</Link></li>
              <li><Link to="/call" className="text-[#164E3F] font-semibold hover:text-[#2E6B59] transition-colors">Free Web Browser Calling</Link></li>
              <li><Link to="/solutions/ecommerce-order-tracking" className="text-[#53605C] hover:text-[#164E3F] transition-colors">E-Commerce Order Tracking</Link></li>
              <li><Link to="/solutions/hotel-guest-messaging" className="text-[#53605C] hover:text-[#164E3F] transition-colors">Hotel Guest Messaging</Link></li>
              <li><Link to="/wati-alternative" className="text-[#53605C] font-semibold hover:text-[#164E3F] transition-colors">WATI Alternative</Link></li>
              <li><Link to="/aisensy-alternative" className="text-[#53605C] font-semibold hover:text-[#164E3F] transition-colors">AiSensy Alternative</Link></li>
              <li><Link to="/chatr/whatsapp-business-api" className="hover:text-[#164E3F] transition-colors">WhatsApp Business API</Link></li>
            </ul>
          </div>

          {/* Column 2: Free Growth Tools */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#111817] uppercase tracking-wider text-[11px]">Free Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/whatsapp-link-generator" className="text-[#164E3F] font-semibold hover:text-[#2E6B59] transition-colors">WhatsApp Link Generator</Link></li>
              <li><Link to="/tools/resume-grader" className="text-[#53605C] hover:text-[#164E3F] transition-colors">AI Resume Grader & Match</Link></li>
              <li><Link to="/tools/meta-ad-cost-calculator" className="text-[#53605C] hover:text-[#164E3F] transition-colors">Meta Ad Cost Calculator</Link></li>
              <li><Link to="/tools/call-quality-checker" className="text-[#53605C] hover:text-[#164E3F] transition-colors">Call Quality Checker</Link></li>
              <li><Link to="/tools/business-voip-cost-calculator" className="hover:text-[#164E3F] transition-colors">VoIP Cost Calculator</Link></li>
              <li><Link to="/tools/contact-qr-generator" className="hover:text-[#164E3F] transition-colors">Contact QR Generator</Link></li>
            </ul>
          </div>

          {/* Column 3: Workflows & Automations */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#111817] uppercase tracking-wider text-[11px]">Workflows</h3>
            <ul className="space-y-2">
              <li><Link to="/workflow/whatsapp-lead-response-workflow" className="hover:text-[#164E3F] transition-colors">Lead Response SLA</Link></li>
              <li><Link to="/workflow/automated-candidate-screening-workflow" className="hover:text-[#164E3F] transition-colors">Candidate Screening Flow</Link></li>
              <li><Link to="/problem/how-to-stop-losing-whatsapp-leads" className="hover:text-[#164E3F] transition-colors">Stop Lead Loss</Link></li>
              <li><Link to="/problem/manage-multiple-whatsapp-business-accounts" className="hover:text-[#164E3F] transition-colors">Multi-Account Scaling</Link></li>
              <li><Link to="/ai-business-os-for-startups" className="hover:text-[#164E3F] transition-colors">Startup Business OS</Link></li>
            </ul>
          </div>

          {/* Column 4: Key Locations */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#111817] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#164E3F]" />
              <span>Global Metros</span>
            </h3>
            <ul className="space-y-2">
              <li><Link to="/locations/mumbai" className="hover:text-[#164E3F] transition-colors">Mumbai Hub</Link></li>
              <li><Link to="/locations/delhi-ncr" className="hover:text-[#164E3F] transition-colors">Delhi NCR Hub</Link></li>
              <li><Link to="/locations/bangalore" className="hover:text-[#164E3F] transition-colors">Bangalore Hub</Link></li>
              <li><Link to="/locations/dubai" className="hover:text-[#164E3F] transition-colors">Dubai Hub</Link></li>
              <li><Link to="/locations/london" className="hover:text-[#164E3F] transition-colors">London Hub</Link></li>
            </ul>
          </div>

          {/* Column 5: E-E-A-T Trust & Research */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#111817] uppercase tracking-wider text-[11px]">Trust & Data</h3>
            <ul className="space-y-2">
              <li><Link to="/download/android" className="text-[#164E3F] font-bold hover:text-[#2E6B59] transition-colors flex items-center gap-1"><span>Download for Android</span> <span className="text-[9px] bg-[#E8F0EB] text-[#164E3F] px-1 py-0.5 rounded border border-[#164E3F]/30">APK</span></Link></li>
              <li><Link to="/pricing" className="text-[#53605C] font-semibold hover:text-[#164E3F] transition-colors">Commercial Pricing</Link></li>
              <li><Link to="/security" className="text-[#164E3F] font-semibold hover:text-[#2E6B59] transition-colors">Security & Privacy</Link></li>
              <li><Link to="/about" className="hover:text-[#164E3F] transition-colors">About CHATR</Link></li>
              <li><Link to="/authors" className="hover:text-[#164E3F] transition-colors">Authors & Experts</Link></li>
              <li><Link to="/editorial-policy" className="hover:text-[#164E3F] transition-colors">Editorial Policy</Link></li>
              <li><Link to="/company-info" className="hover:text-[#164E3F] transition-colors">Company Information</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#DDE3DF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-[#111817]">
              CHATR Business OS — A product of TalentXcel Services Pvt Ltd
            </p>
            <p className="text-[11px] text-[#53605C]">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[#53605C] text-xs">
            <Link to="/about" className="hover:text-[#164E3F] hover:underline">About</Link>
            <span>•</span>
            <Link to="/security" className="hover:text-[#164E3F] hover:underline text-[#164E3F] font-medium">Security</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#164E3F] hover:underline">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#164E3F] hover:underline">Privacy</Link>
            <span>•</span>
            <Link to="/editorial-policy" className="hover:text-[#164E3F] hover:underline">Editorial Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
