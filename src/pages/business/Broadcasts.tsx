import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Users, Mail, MessageSquare, Smartphone, Play, Plus, ArrowLeft } from 'lucide-react';
import WorkflowBuilder from '@/components/business/automation/WorkflowBuilder';
import { useBusinessCampaigns } from '@/hooks/useBusinessCampaigns';

export default function BusinessBroadcasts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'builder'>('campaigns');
  const { campaigns, isLoading, createCampaign } = useBusinessCampaigns();
  
  const [newCampaignName, setNewCampaignName] = useState('Holiday Promo sequence');
  const [newCampaignAudience, setNewCampaignAudience] = useState('All Customers');

  const handleCreateCampaign = async () => {
    // Note: Type defaults to 'whatsapp' or 'email' based on logic, but hardcoded to 'email' for now.
    const created = await createCampaign(newCampaignName, 'email', newCampaignAudience);
    if (created) {
      setActiveTab('campaigns');
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-[#0B0F19] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-primary" />
              Campaign Studio
            </h1>
            <p className="text-gray-500 dark:text-white/60 mt-2">
              Build omni-channel broadcasts (SMS, Email, WhatsApp) targeted at specific CRM segments.
            </p>
          </div>
          {activeTab === 'campaigns' ? (
            <Button onClick={() => setActiveTab('builder')} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setActiveTab('campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          )}
        </div>

        {activeTab === 'campaigns' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card hover-lift border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> Total Audience
                  </CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">12,450</div></CardContent>
              </Card>
              <Card className="glass-card hover-lift border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Messages Sent
                  </CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">45.2k</div></CardContent>
              </Card>
              <Card className="glass-card hover-lift border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Play className="w-4 h-4 text-amber-500" /> Avg. Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">8.4%</div></CardContent>
              </Card>
            </div>

            <Card className="glass-card border-gray-200 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No campaigns found. Create one!</div>
                  ) : (
                    campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10 text-primary">
                            {campaign.type === 'email' ? <Mail className="w-5 h-5" /> : campaign.type === 'sms' ? <Smartphone className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {campaign.name}
                              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className={campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-white/60 mt-1">
                              Audience: <span className="font-medium text-gray-700 dark:text-white/80">{campaign.audience_segment}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-white/40 uppercase font-semibold">Sent</div>
                            <div className="font-medium text-gray-900 dark:text-white">{campaign.sent_count.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-white/40 uppercase font-semibold">Conversion</div>
                            <div className="font-medium text-emerald-600 dark:text-emerald-400">
                              {campaign.sent_count > 0 ? ((campaign.click_count / campaign.sent_count) * 100).toFixed(1) + '%' : '-'}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-[600px] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden animate-fade-in relative flex">
            {/* Sidebar for Campaign config */}
            <div className="w-80 bg-white dark:bg-[#1A1F2E] border-r border-gray-200 dark:border-white/10 p-6 flex flex-col gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase">Campaign Name</label>
                <Input value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} className="mt-2" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase">Audience Segment</label>
                <select 
                  value={newCampaignAudience} 
                  onChange={e => setNewCampaignAudience(e.target.value)}
                  className="w-full mt-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md p-2 text-sm"
                >
                  <option>All Customers</option>
                  <option>VIP Customers</option>
                  <option>Inactive &gt; 30 Days</option>
                  <option>Cart Abandoners</option>
                </select>
              </div>
              <div className="mt-auto">
                <Button onClick={handleCreateCampaign} className="w-full bg-primary hover:bg-primary/90 text-white">
                  Save & Launch Campaign
                </Button>
              </div>
            </div>
            {/* Visual Builder Canvas */}
            <div className="flex-1 relative">
              <WorkflowBuilder workflowId="campaign-main" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
