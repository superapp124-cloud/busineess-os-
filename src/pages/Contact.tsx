import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store contact form submission in database
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

      // Reset form
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
      value: '+91 120 XXX XXXX',
      link: 'tel:+911201234567'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Noida, Uttar Pradesh, India',
      link: 'https://maps.google.com'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      value: '24/7 Available',
      link: null
    }
  ];

  const socialLinks = [
    { name: 'Twitter', url: 'https://twitter.com/ChatrAppOfficial', icon: '𝕏' },
    { name: 'Instagram', url: 'https://instagram.com/chatrplus', icon: '📷' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/talentxcel', icon: '💼' },
    { name: 'Facebook', url: 'https://facebook.com/chatrplus', icon: '👍' }
  ];

  return (
    <>
      <SEOHead
        title="Contact Us | Chatr+ Support"
        description="Contact Chatr+ support team. Get help with your account, report issues, or share feedback. Available 24/7 via email, phone, or contact form."
      />
      <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-12">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-slate-900">Contact Us</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <info.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className="text-xs text-purple-600 hover:underline">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Name</label>
                  <Input
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Subject</label>
                <Input
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Message</label>
                <Textarea
                  placeholder="Tell us more..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => window.open(social.url, '_blank')}
                  className="border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700"
                >
                  <span className="mr-2">{social.icon}</span>
                  {social.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Support */}
          <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 border border-purple-200/60 rounded-3xl p-6 sm:p-8 space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Need Immediate Help?</h3>
            <p className="text-xs text-slate-600">
              Check out our Help Center for instant answers to common questions
            </p>
            <Button variant="outline" onClick={() => navigate('/help')} className="border-slate-300 rounded-xl bg-white text-slate-800">
              Visit Help Center
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
