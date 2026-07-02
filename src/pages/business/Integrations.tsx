import React from 'react';
import { Mail, Calendar, CreditCard, ExternalLink, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INTEGRATIONS = [
  {
    id: 'email',
    name: 'Gmail / Google Workspace',
    description: 'Sync customer emails directly into the CHATR Team Inbox and Customer Timeline.',
    icon: Mail,
    status: 'connected',
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Allow AI Receptionist to check availability and book appointments for you.',
    icon: Calendar,
    status: 'connected',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Generate invoices and accept payments directly within CHATR messages.',
    icon: CreditCard,
    status: 'disconnected',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  }
];

export const Integrations = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations Hub</h1>
          <p className="text-gray-500 mt-1">Connect CHATR Business with your favorite tools.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Browse App Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map(integration => (
          <Card key={integration.id} className="border-gray-200 dark:border-gray-800 flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className={`p-3 rounded-xl ${integration.bgColor}`}>
                  <integration.icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                {integration.status === 'connected' ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
                    Not Connected
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="mt-2 text-sm h-10">
                {integration.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              {integration.status === 'connected' ? (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-gray-200 dark:border-gray-800">
                  Disconnect
                </Button>
              ) : (
                <Button className="w-full flex items-center gap-2">
                  Connect <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">Looking for custom integrations?</h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm mt-1 mb-3">
            With the upcoming CHATR Enterprise release, you'll be able to build custom Mini-Apps and use our Public APIs to connect with your proprietary systems.
          </p>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-800/50">
            Join the API Waitlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
