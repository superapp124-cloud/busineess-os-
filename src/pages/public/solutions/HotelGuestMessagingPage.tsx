import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowRight, MessageSquare, Star, Phone, Clock, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';

// ─────────────────────────────────────────────────────────────────────────────
// /solutions/hotel-guest-messaging
//
// This page captures the live GSC query "whatsapp hotel" which was previously
// landing on /location/hospitality-hotel-messaging-mzuzu (Mzuzu, Malawi) — a
// completely irrelevant location page. This is the canonical solution hub.
// ─────────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: MessageSquare,
    title: 'Guests message you on WhatsApp',
    desc: 'No app to download. Guests just tap your number and send a WhatsApp message — for room service, checkout, early check-in, anything.',
  },
  {
    icon: Users,
    title: 'Your whole team replies from one screen',
    desc: 'Front desk, housekeeping and reservations all see the same guest conversations. No missed messages, no duplicate replies.',
  },
  {
    icon: Zap,
    title: 'Instant replies, even at 2am',
    desc: 'Set up automatic replies for your most common questions — check-in time, Wi-Fi password, parking — so guests get answers instantly, any hour.',
  },
  {
    icon: Clock,
    title: 'Reminder messages that boost reviews',
    desc: 'Automatically message guests an hour after checkout with a thank-you and a link to leave a review on Google or TripAdvisor.',
  },
  {
    icon: Star,
    title: 'Track every guest conversation',
    desc: 'See the full history of every guest: when they arrived, what they asked, how your team replied. Nothing gets lost.',
  },
  {
    icon: Phone,
    title: 'Take calls too, not just messages',
    desc: 'Guests can also call your hotel directly from the browser — no software needed on their side.',
  },
];

const STEPS = [
  { step: '1', label: 'Add your hotel WhatsApp number to CHATR', detail: 'Takes about 2 minutes.' },
  { step: '2', label: 'Invite your front desk staff', detail: 'Everyone joins the same inbox.' },
  { step: '3', label: 'Share your WhatsApp link with guests', detail: 'Put it on the welcome card, TV screen or booking confirmation.' },
  { step: '4', label: 'Guests message — your team replies', detail: 'All conversations in one place, any device.' },
];

export const HotelGuestMessagingPage: React.FC = () => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth` },
      });
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#111827]">
      <SEOHead
        title="WhatsApp Hotel Guest Messaging & Front Desk Inbox | CHATR"
        description="Give hotel guests an effortless way to message the front desk on WhatsApp for room service, check-in, and requests. Shared inbox for reception and housekeeping."
        canonicalUrl="https://www.chatrchat.in/solutions/hotel-guest-messaging"
      />
      {/* ── Nav ── */}
      <header className="border-b border-slate-100 sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="font-black text-xl text-[#164E3F] tracking-tight">CHATR</Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-xs font-medium text-slate-600 hover:text-[#164E3F]">Sign in</Link>
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="px-4 py-2 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Get started free
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          WhatsApp for Hotels
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111827] leading-tight">
          Let hotel guests reach you on<br className="hidden sm:block" />
          <span className="text-[#164E3F]"> WhatsApp — and reply as a team</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Guests message your hotel on WhatsApp. Your whole team — front desk, housekeeping, 
          reservations — replies from the same screen. Simple, fast, no missed messages.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white border border-slate-200 text-[#111827] font-bold text-sm shadow-md hover:shadow-lg hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8196L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5936 3.68182 9C3.68182 8.4064 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.5796C10.3214 3.5796 11.5077 4.0341 12.4405 4.9259L15.0218 2.3446C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5796 9 3.5796Z" fill="#EA4335"/>
              </svg>
            )}
            Set up your hotel free with Google
          </button>
          <Link to="/auth" className="text-sm text-slate-500 hover:text-[#164E3F] font-medium">
            Use phone number instead →
          </Link>
        </div>
        <p className="text-xs text-slate-400">Free to start · No credit card · Works with any WhatsApp number</p>
      </section>

      {/* ── How guests experience it ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              How it works for your guests
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              No app to download, no login, no confusion. Your guests just tap a button and talk to your hotel.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#164E3F]" />
                </div>
                <h3 className="font-bold text-[#111827] text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Set up in under 5 minutes</h2>
          <p className="text-slate-500 text-sm">No IT team needed. Just a WhatsApp number and a browser.</p>
        </div>
        <div className="space-y-4">
          {STEPS.map(({ step, label, detail }) => (
            <div key={step} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-[#164E3F] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {step}
              </div>
              <div>
                <p className="font-bold text-sm text-[#111827]">{label}</p>
                <p className="text-xs text-slate-500">{detail}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl font-extrabold text-center text-[#111827]">Common questions</h2>
          {[
            { q: 'Do my guests need to install anything?', a: 'No. Guests use the WhatsApp app they already have on their phone. Nothing new to download.' },
            { q: 'Can multiple staff members reply from the same number?', a: 'Yes. Your whole team shares one inbox inside CHATR. You can see who replied to each guest.' },
            { q: 'What happens if no one is online?', a: 'You can set up automatic replies for common questions — check-in time, address, parking, etc. — so guests always get an answer.' },
            { q: 'Do I need the official WhatsApp Business API?', a: 'You can start with a regular WhatsApp Business number. For large hotels handling hundreds of guests, the Business API gives higher volume limits.' },
            { q: 'Is it free?', a: 'Yes. CHATR is free to get started. You can add your team and connect your WhatsApp number at no cost.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="font-bold text-sm text-[#111827] mb-2">{q}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Ready to give your hotel a WhatsApp inbox?
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Set it up in 5 minutes. Your whole team replies from one screen. Free to start.
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#164E3F] hover:bg-[#2E6B59] text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-60 shadow-lg shadow-emerald-900/20"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Start free — no card needed <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-slate-400">
          Works for hotels, guesthouses, resorts, serviced apartments and restaurants.
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <Link to="/" className="font-bold text-[#164E3F] mr-4">CHATR</Link>
        <Link to="/solutions/ecommerce-order-tracking" className="hover:underline mr-4">Order Tracking</Link>
        <Link to="/whatsapp-team-inbox" className="hover:underline mr-4">Team Inbox</Link>
        <Link to="/tools/whatsapp-link-generator" className="hover:underline">Free WhatsApp Link Generator</Link>
      </footer>
    </div>
  );
};

export default HotelGuestMessagingPage;
