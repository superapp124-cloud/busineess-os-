import React from 'react';
import { Check, Shield, Phone, Mail, Link2, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface IdentityInfo {
  phone: string;
  verified: boolean;
}

interface ConnectedService {
  category: 'Communication' | 'Professional' | 'Cloud Storage' | 'Business Apps' | 'Social';
  name: string;
  value: string;
  status: 'connected' | 'not_connected';
}

export const ConnectedAccounts = () => {
  const navigate = useNavigate();
  const [identity, setIdentity] = React.useState<IdentityInfo | null>(null);
  const [services, setServices] = React.useState<ConnectedService[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIdentityAndServices = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, phone_number')
          .eq('id', user.id)
          .maybeSingle();

        // Permanent CHATR Identity = Phone number
        if (profile?.phone_number) {
          setIdentity({
            phone: profile.phone_number,
            verified: true,
          });
        }

        const activeServices: ConnectedService[] = [];

        // Email / Communication connector (Google, Outlook, or custom email)
        const googleEmail = user.user_metadata?.email;
        if (googleEmail) {
          activeServices.push({
            category: 'Communication',
            name: 'Google Workspace',
            value: googleEmail,
            status: 'connected',
          });
        }

        if (profile?.email && !profile.email.endsWith('@chatr.local') && profile.email !== googleEmail) {
          activeServices.push({
            category: 'Communication',
            name: 'Connected Email',
            value: profile.email,
            status: 'connected',
          });
        }

        setServices(activeServices);
      } catch (error) {
        console.error('Error loading identity and services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIdentityAndServices();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-section flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[#090A15]/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-section flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-purple-400" />
          Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Section 1: CHATR Identity */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/40 mb-3 font-semibold">
            CHATR Identity (Permanent)
          </h4>
          {identity ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{identity.phone}</p>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/20 border-purple-500/30 text-purple-300">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">Primary CHATR Account</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-xs font-medium">
                <Shield className="w-4 h-4" />
                <span>Protected</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/50 text-sm p-3 rounded-lg bg-white/5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No phone identity linked</span>
            </div>
          )}
        </div>

        {/* Section 2: Connected Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
              Connected Services
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/desktop/settings/connectors')}
              className="h-7 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Service
            </Button>
          </div>

          {services.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
              <p className="text-sm text-white/60">No external services connected</p>
              <p className="text-xs text-white/35">
                Connect your email, calendar, cloud storage, or CRM anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{service.name}</p>
                      <p className="text-xs text-white/40 truncate max-w-[200px]">
                        {service.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
                    <Check className="w-4 h-4" />
                    <span>Connected</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};
