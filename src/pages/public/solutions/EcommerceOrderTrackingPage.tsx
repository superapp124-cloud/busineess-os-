import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowRight, Package, Truck, MessageSquare, Clock, ShieldCheck, ShoppingBag, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';

// ─────────────────────────────────────────────────────────────────────────────
// /solutions/ecommerce-order-tracking
//
// This page captures the live GSC query "whatsapp order tracking" which was
// previously landing on /location/ecommerce-customer-support-port-louis (Mauritius).
// This is the canonical solution hub for e-commerce and retail stores.
// ─────────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Package,
    title: 'Instant WhatsApp Order Confirmation',
    desc: 'The moment a customer places an order on Shopify, WooCommerce, or your store, they receive a clear WhatsApp receipt with item details.',
  },
  {
    icon: Truck,
    title: 'Live Tracking Links in WhatsApp',
    desc: 'Send automated shipping updates when orders are dispatched, in transit, or out for delivery with one-tap courier tracking links.',
  },
  {
    icon: Clock,
    title: 'Cut "Where Is My Order?" Support by 70%',
    desc: 'Customers know exactly where their parcel is. Less repetitive support tickets, happier buyers, and fewer delivery disputes.',
  },
  {
    icon: MessageSquare,
    title: 'One Shared Inbox for Customer Inquiries',
    desc: 'When a buyer replies to a tracking message with delivery instructions or address changes, your whole support team can reply together.',
  },
  {
    icon: Zap,
    title: 'Automated Delivery Alerts & Reviews',
    desc: 'Automatically verify successful deliveries and send a polite review request or repeat purchase discount 24 hours later.',
  },
  {
    icon: ShieldCheck,
    title: 'High Open Rates vs. Buried Emails',
    desc: 'Emails get stuck in spam or go unread. WhatsApp delivery updates have a 98% open rate and get read in under 3 minutes.',
  },
];

const STEPS = [
  { step: '1', label: 'Connect your store or WhatsApp number', detail: 'Works with Shopify, WooCommerce, or custom orders in 3 minutes.' },
  { step: '2', label: 'Turn on automated order tracking messages', detail: 'Choose ready-made templates for order placed, dispatched, and delivered.' },
  { step: '3', label: 'Customers get real-time tracking on WhatsApp', detail: 'They click once to see delivery status from your courier partner.' },
  { step: '4', label: 'Handle questions in one simple inbox', detail: 'Address change? Delay? Your team replies from a single dashboard.' },
];

export const EcommerceOrderTrackingPage: React.FC = () => {
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
        title="WhatsApp Order Tracking for E-Commerce & Retail | CHATR"
        description="Send automated WhatsApp shipping and delivery tracking updates to your buyers. Reduce support tickets, prevent return-to-origin, and build repeat sales."
        canonicalUrl="https://www.chatrchat.in/solutions/ecommerce-order-tracking"
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
          <ShoppingBag className="w-3.5 h-3.5" />
          WhatsApp Order Tracking for E-Commerce
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111827] leading-tight">
          Send live order tracking to customers on<br className="hidden sm:block" />
          <span className="text-[#164E3F]"> WhatsApp automatically</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Keep your buyers updated with automated WhatsApp tracking alerts from checkout to doorstep. 
          Slash support questions, prevent return-to-origin, and build loyal repeat customers.
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
            Start sending tracking alerts free
          </button>
          <Link to="/auth" className="text-sm text-slate-500 hover:text-[#164E3F] font-medium">
            Sign up with phone instead →
          </Link>
        </div>
        <p className="text-xs text-slate-400">Works with Shopify, WooCommerce, Indian & Global Couriers · No credit card needed</p>
      </section>

      {/* ── Benefits Grid ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              Why WhatsApp is the #1 channel for order tracking
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Emails get lost in spam and SMS gets ignored. WhatsApp is where your customers actually read and respond to messages.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Get running in 4 quick steps</h2>
          <p className="text-slate-500 text-sm">Everything connects in minutes — no technical knowledge required.</p>
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
          <h2 className="text-2xl font-extrabold text-center text-[#111827]">Frequently Asked Questions</h2>
          {[
            { q: 'Which e-commerce platforms work with CHATR?', a: 'CHATR connects with Shopify, WooCommerce, Magento, custom e-commerce APIs, or simple CSV upload for order fulfillment.' },
            { q: 'Can customers reply to the tracking message?', a: 'Yes! Unlike one-way SMS, when a customer replies to ask about delivery times or change their address, your team sees the message in CHATR and can reply right away.' },
            { q: 'Does this help reduce Cash on Delivery (COD) cancellations?', a: 'Yes. Stores see an average 25% reduction in Return to Origin (RTO) because buyers confirm their delivery address and are aware of the exact delivery date.' },
            { q: 'Do I need special developer skills to set this up?', a: 'No. Everything is configured through simple point-and-click settings in your browser.' },
            { q: 'Can I send review requests after delivery?', a: 'Yes. You can trigger an automatic WhatsApp message 24 hours after the delivery confirmation asking for a review or rating.' },
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
          Ready to automate WhatsApp order updates?
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Delight your customers with instant delivery alerts. Free to start, no credit card required.
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#164E3F] hover:bg-[#2E6B59] text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-60 shadow-lg shadow-emerald-900/20"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Start Free with Google <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <Link to="/" className="font-bold text-[#164E3F] mr-4">CHATR</Link>
        <Link to="/solutions/hotel-guest-messaging" className="hover:underline mr-4">Hotel Messaging</Link>
        <Link to="/whatsapp-team-inbox" className="hover:underline mr-4">Team Inbox</Link>
        <Link to="/tools/whatsapp-link-generator" className="hover:underline">Free WhatsApp Link Generator</Link>
      </footer>
    </div>
  );
};

export default EcommerceOrderTrackingPage;
