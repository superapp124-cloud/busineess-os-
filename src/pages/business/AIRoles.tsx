import React, { useState } from 'react';
import { Bot, Plus, Settings2, Database, Wrench, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MOCK_AI_ROLES = [
  {
    id: '1',
    name: 'Front Desk Receptionist',
    status: 'active',
    objective: 'Greet customers, answer FAQs about business hours and location, and route complex queries to humans.',
    knowledgeSources: ['Website FAQ', 'Company Policy Doc'],
    tools: ['Calendar Booking', 'Knowledge Base Search'],
    escalationRule: 'If confidence < 80% or user asks for a human',
    confidenceThreshold: '80%',
    allowedActions: ['Schedule Appointment', 'Send Information Link']
  },
  {
    id: '2',
    name: 'Sales Assistant',
    status: 'training',
    objective: 'Qualify leads, provide product pricing, and schedule discovery calls with the sales team.',
    knowledgeSources: ['Product Catalog', 'Pricing PDF'],
    tools: ['CRM Lookup', 'Calendar Booking'],
    escalationRule: 'If deal size > $10k or complex pricing requested',
    confidenceThreshold: '90%',
    allowedActions: ['Create Lead', 'Update CRM', 'Schedule Call']
  }
];

export const AIRoles = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            AI Team Roles
          </h1>
          <p className="text-gray-500 mt-1">Configure and manage AI employees for your business.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_AI_ROLES.map(role => (
          <Card key={role.id} className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">{role.objective}</CardDescription>
                </div>
                <Badge variant={role.status === 'active' ? 'default' : 'secondary'} className={role.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {role.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-gray-500" /> Knowledge Sources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.knowledgeSources.map(source => (
                    <span key={source} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md text-gray-600 dark:text-gray-300">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-gray-500" /> Available Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.tools.map(tool => (
                    <span key={tool} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md text-gray-600 dark:text-gray-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" /> Allowed Actions
                </h4>
                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {role.allowedActions.map(action => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md mt-4 border border-orange-100 dark:border-orange-900">
                <h4 className="text-xs font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-3 h-3" /> Escalation Rule (Confidence: {role.confidenceThreshold})
                </h4>
                <p className="text-xs text-orange-700 dark:text-orange-400">{role.escalationRule}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Configure Role
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIRoles;
