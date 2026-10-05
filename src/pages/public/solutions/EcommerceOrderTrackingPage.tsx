import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, Package, Truck, MessageSquare, Clock, 
  ShieldCheck, ShoppingBag, Zap, Star, Sparkles, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// /solutions/ecommerce-order-tracking
//
// Canonical solution hub for e-commerce, D2C brands & retail stores.
// Completely consistent with CHATR Design System (Image 3) & Zero Jargon.
// ─────────────────────────────────────────────────────────────────────────────

const STORE_TYPES = [
  'Shopify Stores',
  'WooCommerce Brands',
  'D2C Lifestyle & Fashion',
  'Instagram Retailers',
  'Electronics & Gadgets',
  'Omnichannel Sellers'
];

const BENEFITS = [
  {
    icon: Package,
    title: 'Instant WhatsApp Order Confirmation',
    desc: 'The moment a buyer checks out on Shopify, WooCommerce, or your custom store, they automatically receive a clear WhatsApp receipt with item details, amount, and order ID.',
  },
  {
    icon: Truck,
    title: 'Live courier tracking links in WhatsApp',
    desc: 'Send automated shipping alerts when orders are dispatched, in transit, or out for delivery with one-tap live courier tracking (Bluedart, Delhivery, FedEx, DHL, DTDC, and more).',
  },
  {
    icon: Clock,
    title: 'Slash "Where is my order?" support by 70%',
    desc: 'Buyers stay proactively informed at every step of shipping. Dramatically reduce repetitive WISMO support tickets, customer anxiety, and delivery disputes.',
  },
  {
    icon: MessageSquare,
    title: 'One shared inbox for questions & address changes',
    desc: 'When a customer replies to a tracking message with delivery instructions or a gate code, your entire customer support team sees it and replies together without delays.',
  },
  {
    icon: Zap,
    title: 'Automated delivery alerts & repeat purchase prompts',
    desc: 'Automatically verify successful deliveries and send a polite review request or repeat purchase discount code 24 hours later to build lifetime customer value.',
  },
  {
    icon: ShieldCheck,
    title: '98% open rates vs. lost emails and spam folders',
    desc: 'Transactional emails often get buried in promotional tabs or spam folders. WhatsApp delivery alerts boast a 98% open rate and are read within 3 minutes of arrival.',
  },
];

const STEPS = [
  { 
    step: '1', 
    label: 'Connect your store or WhatsApp number', 
    detail: 'Integrate Shopify, WooCommerce, or upload orders via CSV in under 3 minutes.' 
  },
  { 
    step: '2', 
    label: 'Activate automated tracking alerts', 
    detail: 'Turn on ready-made message templates for Order Placed, Shipped, and Out for Delivery.' 
  },
  { 
    step: '3', 
    label: 'Customers receive real-time alerts in WhatsApp', 
    detail: 'Buyers tap one button to view live courier status without entering passwords or order numbers.' 
  },
  { 
    step: '4', 
    label: 'Support team replies from one shared screen', 
    detail: 'Handle buyer questions, delivery notes, and return requests in a collaborative team inbox.' 
  },
];

const FAQS = [
  { 
    q: 'Which e-commerce platforms connect with CHATR?', 
    a: 'CHATR easily connects with Shopify, WooCommerce, Magento, custom APIs, and spreadsheet CSV uploads for seamless fulfillment workflows.' 
  },
  { 
    q: 'Can customers reply directly to the WhatsApp tracking alert?', 
    a: 'Yes! Unlike one-way SMS or unmonitored automated emails, when a customer replies to request a change of delivery address or time, your support team sees the message in CHATR and can reply immediately.' 
  },
  { 
    q: 'Does this help reduce Cash on Delivery (COD) returns and cancellations?', 
    a: 'Yes. Online brands experience up to a 28% reduction in Return to Origin (RTO) because buyers confirm their delivery addresses and know the exact arrival date.' 
  },
  { 
    q: 'Do I need developer skills or technical experience to set this up?', 
    a: 'No technical or coding knowledge is needed. Everything is configured with simple point-and-click settings directly in your web browser.' 
  },
  { 
    q: 'Can we send automated review requests after delivery?', 
    a: 'Yes. You can trigger an automatic WhatsApp message 24 hours after a confirmed delivery asking for a product rating, Google review, or photo review.' 
  },
];

export const EcommerceOrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth session
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('[EcommercePage] Session check error:', err);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="WhatsApp Order Tracking for E-Commerce & Retail | CHATR"
        description="Send automated WhatsApp shipping and delivery tracking updates to your buyers. Reduce support tickets, prevent return-to-origin, and build repeat sales."
        canonicalUrl="https://www.chatrchat.in/solutions/ecommerce-order-tracking"
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1">
        {/* ── 1. Hero Section (Two-Column Editorial Composition matching Image 3) ── */}
        <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: Editorial Value Proposition */}
              <div className="lg:col-span-6 space-y-7 z-10">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
                  <span className="w-6 h-[1.5px] bg-[#164E3F]" />
                  <span>WHATSAPP FOR E-COMMERCE & RETAIL</span>
                </div>

                {/* Giant Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.08]">
                  Send live order tracking on WhatsApp —<br />
                  <span className="text-[#164E3F] drop-shadow-sm">automatically.</span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-xl">
                  Keep buyers updated with automated WhatsApp tracking alerts from checkout to doorstep. 
                  Slash repetitive support questions by 70%, prevent return-to-origin, and build loyal repeat customers.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F8F8F5] text-[#111817] border border-[#DDE3DF] text-sm sm:text-base font-medium shadow-sm hover:border-[#164E3F]/40 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#164E3F]" />
                    <span>Explore Demo Inbox</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#53605C] italic mt-1">
                  ✓ Free to start · ✓ No credit card · ✓ Setup in 30 seconds
                </p>

                {/* Trust Checklist */}
                <div className="pt-4 border-t border-[#DDE3DF]/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-[#53605C]">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>Automated Shipping Alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>Live Courier Links</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>Shared Support Inbox</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>98% Read Rate</span>
                  </div>
                </div>

                {/* Live Social Proof */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {(['#164E3F', '#2E6B59', '#00BDB1', '#53605C', '#111817'] as const).map((c, i) => (
                      <div key={i} style={{ backgroundColor: c }} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                        {(['UT', 'BK', 'AM', 'ZD', 'SN'] as const)[i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#53605C]">
                    <span className="font-bold text-[#111817]">Trusted by 1,200+ brands & online stores</span> worldwide
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Editorial Workspace Composition Preview Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Subtle decorative glow */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-100/50 to-teal-100/40 rounded-3xl blur-xl opacity-70 pointer-events-none" />

                  {/* Surface Card */}
                  <div className="relative bg-white rounded-3xl border border-[#DDE3DF] shadow-xl overflow-hidden">
                    {/* Store Header */}
                    <div className="px-5 py-4 bg-[#F8F8F5] border-b border-[#DDE3DF] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#164E3F] text-white flex items-center justify-center font-bold text-xs">
                          UT
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111817] flex items-center gap-1.5">
                            <span>Urban Threads Official</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="text-[11px] text-[#53605C]">Order #64821 • Verified WhatsApp</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#E8F0EB] text-[#164E3F] font-bold px-2.5 py-1 rounded-full border border-[#164E3F]/20">
                        Out for Delivery 🚚
                      </span>
                    </div>

                    {/* Chat Feed */}
                    <div className="p-5 space-y-4 bg-white min-h-[300px]">
                      {/* Automated WhatsApp Dispatch Notification */}
                      <div className="flex items-start gap-2.5 max-w-[90%] ml-auto flex-row-reverse">
                        <div className="w-7 h-7 rounded-full bg-[#164E3F] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          UT
                        </div>
                        <div className="bg-[#164E3F] text-white rounded-2xl rounded-tr-sm p-4 text-xs space-y-2 shadow-sm">
                          <p className="font-semibold text-emerald-200 text-[11px]">📦 Order Dispatched — On the Way!</p>
                          <p>Hi Ananya! Your order #64821 (Classic Linen Jacket, Navy / M) is out for delivery with Bluedart today.</p>
                          <div className="bg-[#0f382d] rounded-xl p-2.5 text-[11px] space-y-1">
                            <p className="text-emerald-100 font-medium">Tracking ID: BD-84920412</p>
                            <p className="text-emerald-300">Estimated Arrival: Today, before 4:30 PM</p>
                          </div>
                          <span className="text-[10px] text-emerald-200/80 block text-right">08:30 AM · Delivered</span>
                        </div>
                      </div>

                      {/* Customer Reply */}
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-stone-200 text-[#111817] text-[10px] font-bold flex items-center justify-center shrink-0">
                          AK
                        </div>
                        <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-2xl rounded-tl-sm p-3.5 text-xs text-[#111817] space-y-1 shadow-2xs">
                          <p className="font-semibold text-[11px] text-[#53605C]">Ananya Kapoor</p>
                          <p>Super fast! Can the delivery executive leave it at the security reception desk if I am not home?</p>
                          <span className="text-[10px] text-[#53605C] block text-right">09:02 AM</span>
                        </div>
                      </div>

                      {/* System Routing Pill */}
                      <div className="flex justify-center">
                        <span className="text-[10px] font-medium text-[#53605C] bg-[#F8F8F5] px-3 py-1 rounded-full border border-[#DDE3DF]">
                          ⚡ Courier Instruction Auto-Synced
                        </span>
                      </div>

                      {/* Support Team Response */}
                      <div className="flex items-start gap-2.5 max-w-[90%] ml-auto flex-row-reverse">
                        <div className="w-7 h-7 rounded-full bg-[#164E3F] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          UT
                        </div>
                        <div className="bg-[#164E3F] text-white rounded-2xl rounded-tr-sm p-3.5 text-xs space-y-1 shadow-sm">
                          <p className="font-semibold text-[11px] text-emerald-200">Kavita (Customer Support)</p>
                          <p>Noted Ananya! We have tagged your delivery note with Bluedart: "Deliver to Building Reception Gate". Have a wonderful day!</p>
                          <span className="text-[10px] text-emerald-200/80 block text-right">09:04 AM · Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick E-Commerce Action Strip */}
                    <div className="p-3 bg-[#F8F8F5] border-t border-[#DDE3DF] flex items-center gap-2 overflow-x-auto text-[11px]">
                      <span className="text-[#53605C] font-semibold text-[10px] uppercase tracking-wider shrink-0">1-Tap Macros:</span>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        📦 Live Courier Status
                      </button>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        🔄 Confirm Delivery Address
                      </button>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        ⭐ Send Review Request
                      </button>
                    </div>

                    {/* Bottom Metric Strip */}
                    <div className="px-5 py-3 bg-white border-t border-[#DDE3DF] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Return to Origin (RTO): Reduced by 28%</span>
                      </div>
                      <span className="text-[#53605C] text-[11px]">98.4% Delivery Open Rate</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Store Types Strip ── */}
        <section className="py-6 border-y border-[#DDE3DF] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-[#53605C]">
              <span className="text-[11px] uppercase tracking-widest text-[#164E3F] font-bold">
                INTEGRATES WITH:
              </span>
              {STORE_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2 text-[#111817]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#164E3F]" />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Six Core Capabilities Grid ── */}
        <section className="py-16 sm:py-24 bg-[#F8F8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
                <span>DESIGNED FOR RETAIL & E-COMMERCE</span>
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111817]">
                Everything you need to automate post-purchase communication
              </h2>
              <p className="text-sm sm:text-base text-[#53605C]">
                Turn shipping notifications into a brand-building experience that slashes support tickets and drives repeat sales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div 
                  key={title} 
                  className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-7 shadow-sm hover:border-[#164E3F]/40 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E8F0EB] text-[#164E3F] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-bold text-[#111817] text-base">{title}</h3>
                  <p className="text-xs sm:text-sm text-[#53605C] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Set Up Steps ── */}
        <section className="py-16 sm:py-24 bg-white border-t border-[#DDE3DF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111817]">
                Get running in 4 quick steps
              </h2>
              <p className="text-sm sm:text-base text-[#53605C]">
                Connect your e-commerce platform and start sending automated WhatsApp delivery updates in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STEPS.map(({ step, label, detail }) => (
                <div 
                  key={step} 
                  className="flex items-start gap-4 bg-[#F8F8F5] rounded-2xl p-6 border border-[#DDE3DF] shadow-2xs hover:border-[#164E3F]/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#164E3F] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-[#111817]">{label}</h3>
                    <p className="text-xs sm:text-sm text-[#53605C] leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Frequently Asked Questions ── */}
        <section className="py-16 sm:py-24 bg-[#F8F8F5] border-t border-[#DDE3DF]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-[#111817]">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-[#53605C]">
                Common questions from e-commerce brands and retailers.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div 
                  key={q} 
                  className="bg-white rounded-2xl p-6 border border-[#DDE3DF] shadow-sm space-y-2 hover:border-[#164E3F]/30 transition-all"
                >
                  <h3 className="font-bold text-sm sm:text-base text-[#111817]">{q}</h3>
                  <p className="text-xs sm:text-sm text-[#53605C] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Bottom Banner Call To Action (Signature Image 3 Styling) ── */}
        <section className="relative overflow-hidden py-16 sm:py-20 border-t border-[#DDE3DF] bg-[#F8F8F5]">
          {/* Subtle Decorative Leaves */}
          <div className="absolute -bottom-10 -left-10 w-44 h-44 opacity-20 pointer-events-none select-none text-[#164E3F]">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <path d="M45,150 C70,90 120,40 180,20 C160,80 120,130 50,150 Z" />
              <path d="M20,170 C40,110 90,70 150,50 C130,100 90,140 25,170 Z" opacity="0.6" />
            </svg>
          </div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-20 pointer-events-none select-none text-[#164E3F] transform scale-x-[-1]">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <path d="M45,150 C70,90 120,40 180,20 C160,80 120,130 50,150 Z" />
              <path d="M20,170 C40,110 90,70 150,50 C130,100 90,140 25,170 Z" opacity="0.6" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 px-6 sm:px-12 rounded-3xl bg-white border border-[#DDE3DF] shadow-sm">
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111817]">
                  Ready to automate WhatsApp order updates?
                </h3>
                <p className="text-xs sm:text-sm text-[#53605C]">
                  Delight your customers with live shipping alerts. Free to start, no credit card required.
                </p>
              </div>

              <div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Canonical Platform Footer ── */}
      <Footer />

      {/* ── Pure Phone OTP Auth Modal Overlay (No Google Login) ── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default EcommerceOrderTrackingPage;
