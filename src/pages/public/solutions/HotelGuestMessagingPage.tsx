import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, MessageSquare, Phone, Clock, Star, Zap, Users, 
  Sparkles, CheckCircle2, Building2, Bell, Shield, Compass
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// /solutions/hotel-guest-messaging
//
// Canonical solution hub for hotels, resorts & hospitality teams.
// Completely consistent with CHATR Design System (Image 3) & Zero Jargon.
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  'Boutique Hotels',
  'Luxury Resorts',
  'Serviced Apartments',
  'Guesthouses & B&Bs',
  'Homestays & Villas',
  'Airport & Business Hotels'
];

const BENEFITS = [
  {
    icon: MessageSquare,
    title: 'Guests message you directly on WhatsApp',
    desc: 'No apps to install, no passwords, no confusing web portals. Guests message your official WhatsApp for room service, housekeeping, or check-in questions using the app already on their phone.',
  },
  {
    icon: Users,
    title: 'One shared inbox for your entire hotel staff',
    desc: 'Front desk, housekeeping, concierge, and reservations all view and reply from one coordinated screen. Assign requests to specific staff and never miss a guest message.',
  },
  {
    icon: Zap,
    title: 'Instant 24/7 answers, even at 2:00 AM',
    desc: 'Automate answers for your most repetitive guest questions — Wi-Fi password, breakfast hours, pool timings, and parking directions — so guests get help instantly at any hour.',
  },
  {
    icon: Star,
    title: 'Automated post-checkout review requests',
    desc: 'Automatically message guests an hour after check-out thanking them for their stay and providing a 1-tap link to leave a 5-star review on Google or TripAdvisor.',
  },
  {
    icon: Clock,
    title: 'Full guest conversation history & notes',
    desc: 'Track every conversation by room number and guest name. Keep internal notes on guest preferences (extra pillows, late checkout, anniversary) so return visits feel personalized.',
  },
  {
    icon: Phone,
    title: 'Free 1-tap browser calling for international guests',
    desc: 'International guests can call your front desk directly from their web browser with HD voice — zero roaming fees and zero software downloads on their side.',
  },
];

const STEPS = [
  { 
    step: '1', 
    label: 'Connect your hotel WhatsApp number', 
    detail: 'Add your existing WhatsApp Business number to CHATR in under 2 minutes.' 
  },
  { 
    step: '2', 
    label: 'Invite your front desk & housekeeping team', 
    detail: 'Add receptionists, managers, and room service attendants to the shared team inbox.' 
  },
  { 
    step: '3', 
    label: 'Display your WhatsApp QR code to guests', 
    detail: 'Place the QR code on room keycards, reception desks, Wi-Fi login pages, or booking emails.' 
  },
  { 
    step: '4', 
    label: 'Guests message — your team replies seamlessly', 
    detail: 'Deliver fast five-star guest hospitality from any computer or mobile browser.' 
  },
];

const FAQS = [
  { 
    q: 'Do guests need to download an app or create an account?', 
    a: 'No. Guests use their standard WhatsApp app that is already installed on their phone. They simply scan your hotel QR code or click your link and start messaging immediately.' 
  },
  { 
    q: 'Can multiple receptionists reply from the same WhatsApp number simultaneously?', 
    a: 'Yes! CHATR allows your whole team to share one WhatsApp number. Team members can see who is responding to each room, avoiding double replies or missed requests.' 
  },
  { 
    q: 'What happens when reception is busy or away at night?', 
    a: 'You can set up polite automatic replies for common questions — like Wi-Fi passwords, pool timings, room service menu links, and emergency contacts — ensuring guests receive immediate assistance.' 
  },
  { 
    q: 'Can we connect multiple properties or hotel branches?', 
    a: 'Yes. You can manage multiple hotel locations or departments under one CHATR account, keeping conversation channels organized by property.' 
  },
  { 
    q: 'Is CHATR free to get started?', 
    a: 'Yes. You can start completely free with no credit card required. Connect your WhatsApp number and invite your team in minutes.' 
  },
];

export const HotelGuestMessagingPage: React.FC = () => {
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
        console.warn('[HotelPage] Session check error:', err);
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
        title="WhatsApp Hotel Guest Messaging & Front Desk Inbox | CHATR"
        description="Give hotel guests an effortless way to message the front desk on WhatsApp for room service, check-in, and requests. Shared inbox for reception and housekeeping."
        canonicalUrl="https://www.chatrchat.in/solutions/hotel-guest-messaging"
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
                  <span>WHATSAPP FOR HOTELS & HOSPITALITY</span>
                </div>

                {/* Giant Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.08]">
                  Let hotel guests reach you on WhatsApp —<br />
                  <span className="text-[#164E3F] drop-shadow-sm">and reply as a team.</span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-xl">
                  Guests message your front desk, housekeeping or reservations on WhatsApp. 
                  Your entire team replies together from one shared screen. Zero missed requests, 
                  faster service, and happier guests.
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
                    <span>Shared Team Inbox</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>Zero Guest Downloads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>24/7 Automated Replies</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                    <span>Free Browser Calling</span>
                  </div>
                </div>

                {/* Live Social Proof */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {(['#164E3F', '#2E6B59', '#00BDB1', '#53605C', '#111817'] as const).map((c, i) => (
                      <div key={i} style={{ backgroundColor: c }} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                        {(['GH', 'OR', 'SV', 'PL', 'MD'] as const)[i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#53605C]">
                    <span className="font-bold text-[#111817]">Trusted by 500+ hotels & resorts</span> across 30+ countries
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
                    {/* Hotel Inbox Top Header */}
                    <div className="px-5 py-4 bg-[#F8F8F5] border-b border-[#DDE3DF] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#164E3F] text-white flex items-center justify-center font-bold text-xs">
                          GV
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111817] flex items-center gap-1.5">
                            <span>The Grand View Hotel</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="text-[11px] text-[#53605C]">WhatsApp Front Desk • 3 Staff Active</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#E8F0EB] text-[#164E3F] font-bold px-2.5 py-1 rounded-full border border-[#164E3F]/20">
                        Room 402 Active
                      </span>
                    </div>

                    {/* Chat Feed */}
                    <div className="p-5 space-y-4 bg-white min-h-[300px]">
                      {/* Guest Message */}
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-stone-200 text-[#111817] text-[10px] font-bold flex items-center justify-center shrink-0">
                          RS
                        </div>
                        <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-2xl rounded-tl-sm p-3.5 text-xs text-[#111817] space-y-1 shadow-2xs">
                          <p className="font-semibold text-[11px] text-[#53605C]">Rahul Sen (Room 402)</p>
                          <p>Good morning! Could we request 2 extra bath towels and a 1:00 PM late check-out today?</p>
                          <span className="text-[10px] text-[#53605C] block text-right">09:14 AM</span>
                        </div>
                      </div>

                      {/* System Auto-Tag Pill */}
                      <div className="flex justify-center">
                        <span className="text-[10px] font-medium text-[#53605C] bg-[#F8F8F5] px-3 py-1 rounded-full border border-[#DDE3DF]">
                          ⚡ Auto-routed to Housekeeping & Reception
                        </span>
                      </div>

                      {/* Staff Reply */}
                      <div className="flex items-start gap-2.5 max-w-[88%] ml-auto flex-row-reverse">
                        <div className="w-7 h-7 rounded-full bg-[#164E3F] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          PS
                        </div>
                        <div className="bg-[#164E3F] text-white rounded-2xl rounded-tr-sm p-3.5 text-xs space-y-1 shadow-sm">
                          <p className="font-semibold text-[11px] text-emerald-200">Priya Sharma (Front Desk)</p>
                          <p>Good morning Mr. Sen! Fresh towels are on their way to Room 402 now. Late check-out at 1:00 PM is confirmed with our compliments! 😊</p>
                          <span className="text-[10px] text-emerald-200/80 block text-right">09:15 AM · Delivered</span>
                        </div>
                      </div>

                      {/* Guest Reaction */}
                      <div className="flex items-start gap-2.5 max-w-[80%]">
                        <div className="w-7 h-7 rounded-full bg-stone-200 text-[#111817] text-[10px] font-bold flex items-center justify-center shrink-0">
                          RS
                        </div>
                        <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-2xl rounded-tl-sm p-2.5 text-xs text-[#111817] shadow-2xs">
                          <p>Thank you so much! Outstanding service. 🙏</p>
                          <span className="text-[10px] text-[#53605C] block text-right">09:16 AM</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Response Actions Strip */}
                    <div className="p-3 bg-[#F8F8F5] border-t border-[#DDE3DF] flex items-center gap-2 overflow-x-auto text-[11px]">
                      <span className="text-[#53605C] font-semibold text-[10px] uppercase tracking-wider shrink-0">1-Tap Macros:</span>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        📶 Send Wi-Fi Info
                      </button>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        🍽️ Room Service Menu
                      </button>
                      <button className="px-2.5 py-1 rounded-full bg-white border border-[#DDE3DF] text-[#111817] hover:border-[#164E3F] transition-colors shrink-0">
                        ⭐ Review Request Link
                      </button>
                    </div>

                    {/* Bottom Metric Strip */}
                    <div className="px-5 py-3 bg-white border-t border-[#DDE3DF] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>Average Guest Rating: 4.9 / 5.0</span>
                      </div>
                      <span className="text-[#53605C] text-[11px]">Average response: 42s</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Property Strip ── */}
        <section className="py-6 border-y border-[#DDE3DF] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-[#53605C]">
              <span className="text-[11px] uppercase tracking-widest text-[#164E3F] font-bold">
                BUILT FOR:
              </span>
              {PROPERTY_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2 text-[#111817]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#164E3F]" />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Six Core Hospitality Capabilities ── */}
        <section className="py-16 sm:py-24 bg-[#F8F8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
                <span>DESIGNED FOR HOSPITALITY</span>
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111817]">
                Everything your hotel needs to elevate guest communication
              </h2>
              <p className="text-sm sm:text-base text-[#53605C]">
                Turn WhatsApp into a high-touch, coordinated hospitality front desk that your guests love and your team can manage with ease.
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
                Set up in under 5 minutes
              </h2>
              <p className="text-sm sm:text-base text-[#53605C]">
                No complex IT infrastructure or hardware installations required. All you need is your WhatsApp number and a browser.
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
                Common questions from hoteliers and property managers.
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
                  Ready to give your hotel a WhatsApp inbox?
                </h3>
                <p className="text-xs sm:text-sm text-[#53605C]">
                  Set it up in under 5 minutes. Your whole team replies from one screen. Free to start.
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

export default HotelGuestMessagingPage;
