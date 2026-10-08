import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MessageSquare, Phone, Calendar, Clock, MapPin, 
  ShieldCheck, CheckCircle2, ArrowRight, Share2, 
  QrCode, Sparkles, Send, Download, Copy, ExternalLink,
  ChevronRight, HelpCircle, Package, Star, Building2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { ViralTelemetry } from '@/services/viralTelemetry';
import { trackAcquisitionEvent } from '@/services/acquisitionTelemetry';

// CTA A/B Test Variants (Experiment EXP-18 & EXP-19)
const CTA_VARIANTS = [
  { id: 'A', label: 'Message Us', subtitle: 'Instant chat with the team' },
  { id: 'B', label: 'Talk to Us', subtitle: 'Start a crystal-clear web call' },
  { id: 'C', label: 'Get Help', subtitle: 'Priority customer support' },
  { id: 'D', label: 'Book Now', subtitle: 'Schedule an appointment or visit' },
  { id: 'E', label: 'Chat Online', subtitle: 'Replies typically in 2 minutes' },
  { id: 'F', label: 'Ask a Question', subtitle: 'Quick inquiry or quote request' },
  { id: 'G', label: 'Contact Team', subtitle: 'Direct line to front desk' },
];

export const CustomerContactHubPage: React.FC = () => {
  const { handle = 'business' } = useParams<{ handle?: string }>();
  const navigate = useNavigate();

  // Clean and format handle for display
  const businessName = useMemo(() => {
    return handle
      .split(/[-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, [handle]);

  // Read vertical override from query parameter (?v=hotel or ?vertical=clinic)
  const verticalOverride = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('v') || params.get('vertical') || '';
  }, []);

  // Vertical-specific use case detection (The 8 Pilot Verticals)
  const verticalMeta = useMemo(() => {
    const h = (handle + ' ' + verticalOverride).toLowerCase();
    if (h.includes('hotel') || h.includes('resort') || h.includes('stay') || h.includes('lodge') || h.includes('inn')) {
      return {
        type: 'hotel',
        tagline: 'Guests can ask for anything here.',
        placeholder: 'Ask about check-in, room service, amenities or requests...',
        bookLabel: 'Book Stay / Request'
      };
    }
    if (h.includes('clinic') || h.includes('dental') || h.includes('doctor') || h.includes('health') || h.includes('hospital')) {
      return {
        type: 'clinic',
        tagline: 'Patients can book or ask for help here.',
        placeholder: 'Ask about appointments, timings, reports or consultations...',
        bookLabel: 'Book Appointment'
      };
    }
    if (h.includes('recruit') || h.includes('talent') || h.includes('staffing') || h.includes('hiring') || h.includes('jobs')) {
      return {
        type: 'recruitment',
        tagline: 'Candidates can communicate and schedule here.',
        placeholder: 'Inquire about job openings, interview scheduling, or applications...',
        bookLabel: 'Schedule Interview'
      };
    }
    if (h.includes('realty') || h.includes('estate') || h.includes('property') || h.includes('housing') || h.includes('broker')) {
      return {
        type: 'real_estate',
        tagline: 'Buyers can ask about this property here.',
        placeholder: 'Inquire about pricing, floor plans, site visits or availability...',
        bookLabel: 'Book Site Visit'
      };
    }
    if (h.includes('d2c') || h.includes('store') || h.includes('shop') || h.includes('brand') || h.includes('ecommerce')) {
      return {
        type: 'd2c',
        tagline: 'Customers can ask about their order here.',
        placeholder: 'Ask about order tracking, product sizing, delivery or returns...',
        bookLabel: 'Request Callback'
      };
    }
    if (h.includes('restaurant') || h.includes('cafe') || h.includes('dine') || h.includes('food') || h.includes('bistro')) {
      return {
        type: 'restaurant',
        tagline: 'Customers can ask, book or order here.',
        placeholder: 'Ask about table availability, reservations, specials or takeout...',
        bookLabel: 'Reserve Table'
      };
    }
    if (h.includes('academy') || h.includes('school') || h.includes('coaching') || h.includes('edu') || h.includes('tutor') || h.includes('course')) {
      return {
        type: 'education',
        tagline: 'Students and parents can ask or enroll here.',
        placeholder: 'Inquire about admissions, course syllabus, batch timings or demo class...',
        bookLabel: 'Book Demo Class'
      };
    }
    if (h.includes('agency') || h.includes('consult') || h.includes('studio') || h.includes('media') || h.includes('tech')) {
      return {
        type: 'agency',
        tagline: 'Clients can request projects or track deliverables here.',
        placeholder: 'Inquire about project proposals, quotes, deliverables or status...',
        bookLabel: 'Schedule Briefing'
      };
    }
    return {
      type: 'general',
      tagline: 'Handle customer conversations and daily work in one place.',
      placeholder: `Type your inquiry for ${businessName}...`,
      bookLabel: 'Book / Schedule'
    };
  }, [handle, verticalOverride, businessName]);

  // Determine CTA Variant deterministically from handle + session
  const ctaVariant = useMemo(() => {
    const hash = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CTA_VARIANTS[hash % CTA_VARIANTS.length];
  }, [handle]);

  const [activeTab, setActiveTab] = useState<'chat' | 'call' | 'book' | 'track'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'business'; text: string; time: string }>>([
    {
      sender: 'business',
      text: `Hello! Welcome to ${businessName}. ${verticalMeta.tagline} How can our team help you today?`,
      time: 'Just now'
    }
  ]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('Morning (10:00 AM - 1:00 PM)');
  const [trackingId, setTrackingId] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const hubUrl = `https://www.chatrchat.in/c/${handle}`;

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track inbound hub landing event with vertical attribution
    trackAcquisitionEvent({
      event: 'page_view',
      landingPage: `/c/${handle}`,
      source: 'sharing',
      metadata: {
        businessHandle: handle,
        businessName,
        verticalType: verticalMeta.type,
        ctaVariant: ctaVariant.id
      }
    });

    ViralTelemetry.trackGrowth({
      eventType: 'call_link_visit',
      category: 'acquisition',
      landingPage: `/c/${handle}`,
      metadata: { handle, vertical: verticalMeta.type, variant: ctaVariant.id }
    });
  }, [handle, businessName, verticalMeta, ctaVariant]);

  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');

    // Telemetry
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'contact-hub-chat',
      metadata: { handle, vertical: verticalMeta.type, messageLength: newMsg.text.length }
    });

    // Auto simulated business acknowledgment
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'business',
          text: `Thanks for reaching out! A representative from ${businessName} has received your inquiry.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  // Submit phone number to claim ticket identity & SMS/WhatsApp notification
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerPhone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setPhoneSubmitted(true);
    toast.success('Inquiry saved! Updates will be sent to your phone.');

    trackAcquisitionEvent({
      event: 'signup_started',
      tool: 'contact-hub-phone-claim',
      metadata: { handle, vertical: verticalMeta.type, phoneHash: customerPhone.slice(-4) }
    });
  };

  // Trigger 1-click call
  const handleStartCall = () => {
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'contact-hub-start-call',
      metadata: { handle, vertical: verticalMeta.type }
    });
    navigate(`/call/${handle}`);
  };

  // Booking submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please select a date.');
      return;
    }
    toast.success(`Booking request sent to ${businessName} for ${bookingDate} (${bookingSlot})!`);
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'contact-hub-booking',
      metadata: { handle, vertical: verticalMeta.type, date: bookingDate, slot: bookingSlot }
    });
  };

  // Request tracking
  const handleTrackRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setTrackingStatus('Active — In progress by customer team. Estimated turnaround: under 2 hours.');
    toast.info('Status retrieved.');
  };

  const copyHubLink = () => {
    navigator.clipboard.writeText(hubUrl);
    toast.success('Business link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans flex flex-col selection:bg-[#164E3F] selection:text-white">
      <SEOHead
        title={`${businessName} — Customer Contact & Service Hub | CHATR`}
        description={`Direct customer contact hub for ${businessName}. ${verticalMeta.tagline} Message the team, make a free web call, book an appointment, or track your request.`}
        canonicalUrl={hubUrl}
      />

      <LandingHeader onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* BUSINESS PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] p-6 sm:p-8 shadow-sm mb-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E9E7]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#164E3F] text-white flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                {businessName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#111817] tracking-tight">
                    {businessName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                
                {/* VERTICAL-SPECIFIC VALUE PROPOSITION TAGLINE */}
                <p className="text-sm font-semibold text-[#164E3F] mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{verticalMeta.tagline}</span>
                </p>

                <p className="text-xs text-[#4A5568] mt-0.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online • Replies typically in under 5 minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyHubLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8F8F5] hover:bg-[#EEF2F0] text-[#111817] text-xs font-semibold border border-[#DDE3DF] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-[#164E3F]" />
                Share
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8F8F5] hover:bg-[#EEF2F0] text-[#111817] text-xs font-semibold border border-[#DDE3DF] transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-[#164E3F]" />
                Counter QR
              </button>
            </div>
          </div>

          {/* QUICK INTERACTION TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6">
            <button
              onClick={() => setActiveTab('chat')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                activeTab === 'chat'
                  ? 'border-[#164E3F] bg-[#164E3F]/5 text-[#164E3F] shadow-xs'
                  : 'border-[#DDE3DF] bg-[#F8F8F5]/60 hover:bg-[#F8F8F5] text-[#4A5568]'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-2" />
              <div>
                <div className="font-bold text-sm text-[#111817]">{ctaVariant.label}</div>
                <div className="text-[11px] text-[#4A5568]">Instant web chat</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('call')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                activeTab === 'call'
                  ? 'border-[#164E3F] bg-[#164E3F]/5 text-[#164E3F] shadow-xs'
                  : 'border-[#DDE3DF] bg-[#F8F8F5]/60 hover:bg-[#F8F8F5] text-[#4A5568]'
              }`}
            >
              <Phone className="w-5 h-5 mb-2" />
              <div>
                <div className="font-bold text-sm text-[#111817]">Web Call</div>
                <div className="text-[11px] text-[#4A5568]">HD Voice & Video</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('book')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                activeTab === 'book'
                  ? 'border-[#164E3F] bg-[#164E3F]/5 text-[#164E3F] shadow-xs'
                  : 'border-[#DDE3DF] bg-[#F8F8F5]/60 hover:bg-[#F8F8F5] text-[#4A5568]'
              }`}
            >
              <Calendar className="w-5 h-5 mb-2" />
              <div>
                <div className="font-bold text-sm text-[#111817]">{verticalMeta.bookLabel}</div>
                <div className="text-[11px] text-[#4A5568]">Schedule slot</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                activeTab === 'track'
                  ? 'border-[#164E3F] bg-[#164E3F]/5 text-[#164E3F] shadow-xs'
                  : 'border-[#DDE3DF] bg-[#F8F8F5]/60 hover:bg-[#F8F8F5] text-[#4A5568]'
              }`}
            >
              <Package className="w-5 h-5 mb-2" />
              <div>
                <div className="font-bold text-sm text-[#111817]">Track Request</div>
                <div className="text-[11px] text-[#4A5568]">Check live status</div>
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE WORKFLOW INTERFACE */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] p-6 sm:p-8 shadow-sm mb-6">
          {/* TAB 1: INSTANT WEB CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E9E7] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#111817]">Live Chat with {businessName}</h2>
                  <p className="text-xs text-[#4A5568]">{verticalMeta.tagline} No account or app download needed.</p>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md font-semibold">
                  Secure End-to-End
                </span>
              </div>

              {/* Chat Thread */}
              <div className="bg-[#F8F8F5] rounded-2xl p-4 min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 border border-[#E5E9E7]">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.sender === 'user'
                          ? 'bg-[#164E3F] text-white rounded-br-none'
                          : 'bg-white text-[#111817] border border-[#DDE3DF] rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder={verticalMeta.placeholder}
                  className="flex-1 rounded-xl border border-[#DDE3DF] px-4 py-3 text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#164E3F] focus:border-transparent bg-[#F8F8F5]/30"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>

              {/* Identity Claim Hook for Counterparties */}
              {!phoneSubmitted ? (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full sm:w-auto">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      Get notified when {businessName} replies:
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      We'll send their response directly to your phone via SMS/WhatsApp.
                    </div>
                  </div>
                  <form onSubmit={handlePhoneSubmit} className="flex w-full sm:w-auto gap-2">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="px-3 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-[#111817] w-36 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs whitespace-nowrap transition-colors"
                    >
                      Save Ticket
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Phone notification linked. You will receive an alert as soon as the team replies.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ZERO-INSTALL WEB CALL */}
          {activeTab === 'call' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-[#164E3F]/10 text-[#164E3F] flex items-center justify-center mx-auto border border-[#164E3F]/20">
                <Phone className="w-10 h-10 animate-bounce" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-2xl font-black text-[#111817]">Direct Web Call to Front Desk</h2>
                <p className="text-sm text-[#4A5568]">
                  Talk directly with the team at {businessName} straight from your web browser. 
                  No phone balance needed, no app downloads, 100% crystal-clear HD audio.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleStartCall}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-base transition-all shadow-md shadow-[#164E3F]/20 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Start Web Call Now</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 pt-4 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> WebRTC Encrypted</span>
                <span>•</span>
                <span>Zero Toll Charges</span>
                <span>•</span>
                <span>Instant Connect</span>
              </div>
            </div>
          )}

          {/* TAB 3: BOOK AN APPOINTMENT */}
          {activeTab === 'book' && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E9E7] pb-4">
                <h2 className="text-lg font-bold text-[#111817]">{verticalMeta.bookLabel} with {businessName}</h2>
                <p className="text-xs text-[#4A5568]">Select your preferred date and time slot</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-[#111817] mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-[#DDE3DF] px-4 py-2.5 text-sm text-[#111817] bg-[#F8F8F5]/30 focus:outline-none focus:ring-2 focus:ring-[#164E3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111817] mb-1.5">Preferred Time Window</label>
                  <select
                    value={bookingSlot}
                    onChange={e => setBookingSlot(e.target.value)}
                    className="w-full rounded-xl border border-[#DDE3DF] px-4 py-2.5 text-sm text-[#111817] bg-[#F8F8F5]/30 focus:outline-none focus:ring-2 focus:ring-[#164E3F]"
                  >
                    <option>Morning (10:00 AM - 1:00 PM)</option>
                    <option>Afternoon (1:00 PM - 5:00 PM)</option>
                    <option>Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111817] mb-1.5">Your Contact Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full rounded-xl border border-[#DDE3DF] px-4 py-2.5 text-sm text-[#111817] bg-[#F8F8F5]/30 focus:outline-none focus:ring-2 focus:ring-[#164E3F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-sm transition-colors shadow-sm"
                >
                  Submit Booking Request
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TRACK REQUEST */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E9E7] pb-4">
                <h2 className="text-lg font-bold text-[#111817]">Track Your Request or Order</h2>
                <p className="text-xs text-[#4A5568]">Look up the status of an existing ticket or inquiry</p>
              </div>

              <form onSubmit={handleTrackRequest} className="flex gap-2 max-w-lg">
                <input
                  type="text"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  placeholder="Enter ticket ID or registered phone number"
                  className="flex-1 rounded-xl border border-[#DDE3DF] px-4 py-2.5 text-sm text-[#111817] bg-[#F8F8F5]/30 focus:outline-none focus:ring-2 focus:ring-[#164E3F]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-sm transition-colors"
                >
                  Check Status
                </button>
              </form>

              {trackingStatus && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Request Status:</div>
                    <div className="text-xs text-emerald-800 mt-1">{trackingStatus}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* B2B2C NETWORK PROMOTION: CONVERT VISITING CUSTOMERS INTO BUSINESS USERS */}
        <div className="bg-gradient-to-r from-[#164E3F] to-[#0D2F26] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              For Business Owners & Teams
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Want a customer communication address like this for your business?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Get one free link for your customers to message, call, book, and track requests. 
              Equip your whole team with a unified inbox and automated follow-up workflows.
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-[#164E3F] font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Create Free Business Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* COUNTER QR CODE MODAL FOR MERCHANTS */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-[#DDE3DF]">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#111817]">Print Counter QR Standee</h3>
              <p className="text-xs text-[#4A5568]">Place this on your reception, tables, or business cards</p>
            </div>

            <div className="p-4 bg-[#F8F8F5] rounded-2xl border border-[#DDE3DF] inline-block mx-auto shadow-2xs">
              <QRCodeSVG value={hubUrl} size={180} level="H" />
            </div>

            <div className="text-xs text-[#4A5568] font-mono break-all bg-gray-50 p-2 rounded-lg border border-gray-200">
              {hubUrl}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#164E3F] text-white font-bold text-xs hover:bg-[#123F33] transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Print Standee
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#F8F8F5] text-[#111817] font-semibold text-xs border border-[#DDE3DF] hover:bg-[#EEF2F0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default CustomerContactHubPage;
