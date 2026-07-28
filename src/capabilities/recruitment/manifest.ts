import { CapabilityManifest } from '../../core/sdk/CapabilityManifest';

export const recruitmentManifest: CapabilityManifest = {
  id: 'recruitment-os',
  name: 'RecruitmentOS',
  version: '1.0.0',
  description: 'AI Talent Operating System for sourcing, screening, and hiring.',
  icon: 'Users',
  color: 'indigo',
  category: 'hr',

  permissions: [
    { name: 'gmail.send', description: 'Send emails to candidates' },
    { name: 'calendar.write', description: 'Schedule interviews' }
  ],

  routes: [
    { path: '/desktop/recruitment', component: 'RecruiterWorkspace' }
  ],

  sidebar: {
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/desktop/recruitment?tab=dashboard' },
      { label: 'Pipeline', icon: 'GitBranch', path: '/desktop/recruitment?tab=pipeline' },
      { label: 'Candidates', icon: 'Users', path: '/desktop/recruitment?tab=candidates' },
      { label: 'Jobs', icon: 'Briefcase', path: '/desktop/recruitment?tab=jobs' }
    ]
  },

  search: {
    entities: ['rec_candidates', 'rec_jobs']
  },

  workflows: [
    { id: 'auto-schedule', name: 'Auto-Schedule Interview', description: 'Schedule interview when moved to Interview stage' },
    { id: 'send-offer', name: 'Send Offer Letter', description: 'Generate and send offer letter on Offer stage' }
  ],

  notifications: {
    types: ['candidate_applied', 'interview_scheduled', 'offer_accepted']
  },

  events: [
    { name: 'candidate.applied', description: 'Fired when a new candidate applies or is imported' },
    { name: 'candidate.hired', description: 'Fired when a candidate accepts an offer' },
    { name: 'interview.scheduled', description: 'Fired when an interview is scheduled' }
  ],

  handlers: [
    { event: 'employee.onboarded', handler: 'handleEmployeeOnboarded' }
  ],

  deploySteps: [
    { label: 'Creating talent workspace', detail: 'Setting up isolated environment' },
    { label: 'Installing ATS database', detail: 'rec_jobs, rec_candidates' },
    { label: 'Configuring AI ranker', detail: 'Seeding prompt templates' }
  ],

  tables: [
    'rec_jobs',
    'rec_candidates',
    'rec_interviews',
    'rec_offer_letters'
  ],
  
  seedFunction: 'seedRecruitmentOS'
};
