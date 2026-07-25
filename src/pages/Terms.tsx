import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
 const navigate = useNavigate();

  return (
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
          <h1 className="text-lg font-bold text-slate-900">Terms and Conditions</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6 text-sm text-slate-600">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Terms and Conditions</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: January 2025</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Chatr (a product of TalentXcel Services Pvt Ltd), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Services Provided</h2>
            <p className="leading-relaxed">
              Chatr provides instant messaging, voice and video calling, health tracking, and social networking services. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. User Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 13 years old to use Chatr. Users between 13-18 years must have parental consent. By using our services, you represent that you meet these age requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. User Conduct</h2>
            <p className="leading-relaxed">
              You agree not to use Chatr to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Violate any laws or regulations of India</li>
              <li>Harass, threaten, or harm others</li>
              <li>Share false, misleading, or defamatory content</li>
              <li>Distribute spam, malware, or unauthorized advertising</li>
              <li>Infringe on intellectual property rights</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Content Ownership</h2>
            <p className="leading-relaxed">
              You retain ownership of content you share on Chatr. By posting content, you grant us a license to use, store, and display that content as necessary to provide our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Privacy and Data Protection</h2>
            <p className="leading-relaxed">
              Your privacy is important to us. Our data practices comply with the Information Technology Act, 2000 and applicable Indian privacy laws. Please review our Privacy Policy for details on how we collect and use your information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All intellectual property rights in Chatr, including trademarks, logos, and software, belong to TalentXcel Services Pvt Ltd. You may not copy, modify, or distribute our intellectual property without permission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Chatr is provided "as is" without warranties. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">9. Termination</h2>
            <p className="leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason deemed necessary.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">10. Governing Law</h2>
            <p className="leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh, India.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900">11. Contact Information</h2>
            <p className="leading-relaxed">
              For questions about these terms, please contact us at:<br />
              <strong>TalentXcel Services Pvt Ltd</strong><br />
              Email: legal@chatr.chat<br />
              Website: chatr.chat
            </p>
            <p className="text-xs text-slate-400 pt-3">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
