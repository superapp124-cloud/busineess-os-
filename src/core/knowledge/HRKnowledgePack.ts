export const HRKnowledgePack = {
  id: 'pack_hr',
  domain: 'Talent OS',
  version: '1.0.0',
  policies: [
    {
      id: 'hr-hiring-1.1',
      name: 'Senior Engineering Requirements v1.1',
      rules: [
        'Candidates for Senior Engineering must have hyperscale infrastructure experience (Azure/AWS/GCP).',
        'Minimum 5 years of professional experience required.'
      ]
    }
  ],
  entities: [
    { type: 'CandidateProfile', fields: ['skills', 'experience', 'education'] }
  ]
};
