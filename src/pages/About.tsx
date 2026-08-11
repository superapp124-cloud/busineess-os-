import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Zap, Shield, Globe, Award } from 'lucide-react';
import chatrLogo from '@/assets/chatr-brand-logo.png';
import { SEOHead } from '@/components/SEOHead';

export default function About() {
  const navigate = useNavigate();

  const values = [
    { icon: Users, title: 'Community First', description: 'Building meaningful connections through technology' },
    { icon: Heart, title: 'Health & Wellness', description: 'Making healthcare accessible to everyone' },
    { icon: Zap, title: 'Innovation', description: 'Constantly evolving with cutting-edge features' },
    { icon: Shield, title: 'Privacy & Security', description: 'Your data, your control, always protected' },
    { icon: Globe, title: 'Accessibility', description: 'Available anytime, anywhere, for everyone' },
    { icon: Award, title: 'Excellence', description: 'Delivering world-class user experience' }
  ];

  const milestones = [
    { year: '2025', event: 'CHATR Launch', description: 'Launched as India\'s unified business messaging platform' },
    { year: '2025 Q2', event: 'AI Integration', description: 'Integrated advanced AI for lead triage and chat' },
    { year: '2025 Q3', event: 'Business Hub', description: 'Launched comprehensive business tools' },
    { year: '2025 Q4', event: 'Community Growth', description: 'Reached 325+ active business users and growing' }
  ];

  return (
    <>
      <SEOHead
        title="About CHATR | Universal AI Business Messaging Platform"
        description="Learn about CHATR Communication OS, India's unified platform for business messaging, WhatsApp integration, and team inbox workflows."
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
            <h1 className="text-lg font-bold text-slate-900">About CHATR Communication OS</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-8 text-center space-y-4">
            <img src={chatrLogo} alt="CHATR" className="h-14 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Say It. Share It. Live It.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              CHATR Communication OS is India's unified platform that seamlessly integrates business messaging,
              healthcare, business tools, and lifestyle services into one powerful ecosystem.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-3">
              <h3 className="text-lg font-bold text-purple-600">Our Mission</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To revolutionize digital communication by creating an all-in-one platform that
                empowers users to connect, collaborate, and thrive in their personal and professional lives.
              </p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-3">
              <h3 className="text-lg font-bold text-cyan-600">Our Vision</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To become the most trusted and comprehensive digital ecosystem in India,
                making technology accessible, meaningful, and beneficial for everyone.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-center text-slate-900">Our Core Values</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <value.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{value.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-center text-slate-900">Our Journey</h3>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="font-bold text-sm text-purple-600">{milestone.year}</span>
                    </div>
                    <div className="flex-shrink-0 w-px bg-slate-200 relative">
                      <div className="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-purple-600"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-semibold text-sm text-slate-900">{milestone.event}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Company Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Product</p>
                <p className="font-semibold text-slate-800">CHATR Communication OS</p>
              </div>
              <div>
                <p className="text-slate-400">Operated By</p>
                <p className="font-semibold text-slate-800">TalentXcel Services Pvt Ltd</p>
              </div>
              <div>
                <p className="text-slate-400">Headquarters</p>
                <p className="font-semibold text-slate-800">Noida, Uttar Pradesh, India</p>
              </div>
              <div>
                <p className="text-slate-400">Industry</p>
                <p className="font-semibold text-slate-800">Technology, Healthcare, Communication</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 border border-purple-200/60 rounded-3xl p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Join the CHATR Business Community</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Experience the future of digital communication today
            </p>
            <div className="flex gap-3 justify-center pt-1">
              <Button onClick={() => navigate('/auth')} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6">
                Get Started
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')} className="border-slate-300 rounded-xl px-6">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
