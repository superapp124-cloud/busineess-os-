import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Disclaimer() {
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
          <h1 className="text-lg font-bold text-slate-900">Disclaimer</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6 text-sm text-slate-600">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Disclaimer</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: January 2025</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. General Information</h2>
            <p className="leading-relaxed">
              The information provided by Chatr (operated by TalentXcel Services Pvt. Ltd.) is for general informational and communication purposes only. All content is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Health and Wellness Features</h2>
            <p className="leading-relaxed">
              Chatr offers wellness tracking, symptom checking, and health-related features. These are NOT substitutes for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns. Never disregard professional medical advice based on information from Chatr.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. AI-Powered Features</h2>
            <p className="leading-relaxed">
              Chatr uses AI for smart replies, chat summaries, and content suggestions. AI-generated content may not always be accurate or appropriate. Users should verify important information independently.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. User-Generated Content</h2>
            <p className="leading-relaxed">
              Chatr users can share messages, photos, videos, and other content. We do not endorse, verify, or take responsibility for user-generated content. Views expressed by users do not represent our official position.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Third-Party Services and Links</h2>
            <p className="leading-relaxed">
              Chatr may integrate with or link to third-party services, websites, or apps. We are not responsible for the content, privacy practices, or availability of external services. Use them at your own discretion.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Financial Transactions</h2>
            <p className="leading-relaxed">
              Features like Chatr Coins, payments, and business transactions are facilitated through third-party payment providers. We are not responsible for payment failures, delays, or disputes. Users should verify transaction details before confirming.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, TalentXcel Services Pvt. Ltd. shall not be liable for any damages arising from use of Chatr, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900">8. Contact Information</h2>
            <p className="leading-relaxed">
              For questions about this disclaimer:<br />
              <strong>TalentXcel Services Pvt. Ltd.</strong><br />
              Email: legal@chatr.app<br />
              Address: Noida, Uttar Pradesh, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
