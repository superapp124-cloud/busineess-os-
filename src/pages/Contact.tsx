import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      toast.success('Message sent successfully!', {
        description: "We'll get back to you within 24 hours."
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@chatr.chat',
      link: 'mailto:support@chatr.chat'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 97178 45477',
      link: 'tel:+919717845477'
    },
    {
      icon: MapPin,
      title: 'Headquarters',
      value: 'Noida, NCR, India',
      link: null
    },
    {
      icon: Clock,
      title: 'Response SLA',
      value: '< 24 Hours',
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Contact Us — CHATR Communication OS"
        description="Contact the CHATR team. Inquire about enterprise deployments, WhatsApp Business API integrations, or reach our technical support desk."
        canonicalUrl="https://www.chatrchat.in/contact"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-8 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center mx-auto text-[#164E3F]">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111817]">Get in Touch</h1>
          <p className="text-[#53605C] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Have questions about CHATR or need help deploying a solution for your team? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#DDE3DF] p-6 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center flex-shrink-0 text-[#164E3F]">
                <info.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111817] text-sm mb-0.5">{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="text-xs text-[#164E3F] hover:underline font-medium">
                    {info.value}
                  </a>
                ) : (
                  <p className="text-xs text-[#53605C]">{info.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] p-6 sm:p-10 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-[#111817]">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#111817] mb-1.5 block">Your Name</label>
                <input
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] focus:border-[#164E3F] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#111817]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#111817] mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] focus:border-[#164E3F] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#111817]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111817] mb-1.5 block">Subject</label>
              <input
                placeholder="What is this inquiry regarding?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full bg-[#FAFBF9] border border-[#DDE3DF] focus:border-[#164E3F] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#111817]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111817] mb-1.5 block">Message</label>
              <textarea
                placeholder="How can we assist you or your organization?"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full bg-[#FAFBF9] border border-[#DDE3DF] focus:border-[#164E3F] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#111817]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
