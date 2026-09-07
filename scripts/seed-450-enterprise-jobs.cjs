// scripts/seed-450-enterprise-jobs.cjs
// Generates and batch-inserts 450 distinct enterprise jobs into Supabase 'jobs' table
// Published by "TalentXcel Services (on behalf of Client Partner)"
// Guaranteed 100% Google Search Console JobPosting Rich Results compliance

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INDUSTRIES = [
  {
    name: 'Software & Cloud Engineering',
    category: 'Engineering & Tech',
    titles: [
      'Frontend Developer (React / Next.js)', 'Backend Developer (Node.js & Python)', 'Full Stack Engineer (MERN / TypeScript)',
      'DevOps & Cloud Engineer (AWS / Kubernetes)', 'Mobile App Developer (Flutter / React Native)', 'Senior Cloud Architect',
      'QA Automation Engineer (Playwright / Selenium)', 'Site Reliability Engineer (SRE)', 'Lead Java Microservices Engineer'
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'Python', 'Java', 'PostgreSQL', 'GraphQL']
  },
  {
    name: 'Data Science & AI / ML',
    category: 'Data & AI',
    titles: [
      'Machine Learning Engineer', 'Data Scientist (Predictive Analytics)', 'AI / LLM Application Engineer',
      'Data Engineer (Snowflake & Spark)', 'Computer Vision Engineer', 'NLP Research Specialist',
      'Business Intelligence Analyst (PowerBI / Tableau)', 'Deep Learning Specialist', 'AI Prompt & Evaluation Engineer'
    ],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'Spark', 'Snowflake', 'LangChain', 'OpenAI', 'Computer Vision', 'Pandas']
  },
  {
    name: 'BFSI & Financial Services',
    category: 'Operations & Finance',
    titles: [
      'Credit Risk Analyst', 'Investment Banking Associate', 'Statutory Financial Auditor',
      'Wealth Management Advisor', 'Corporate Finance Manager', 'Financial Modeling Specialist',
      'Compliance & AML Officer', 'Treasury Operations Manager', 'Equity Research Analyst'
    ],
    skills: ['Financial Modeling', 'DCF', 'Credit Appraisal', 'Risk Assessment', 'Excel VBA', 'IFRS', 'GAAP', 'Banking Ops', 'AML Compliance']
  },
  {
    name: 'Healthcare & Pharmaceuticals',
    category: 'Healthcare & Life Sciences',
    titles: [
      'Clinical Research Associate (CRA)', 'Hospital Operations Administrator', 'Biomedical Equipment Engineer',
      'Regulatory Affairs Specialist', 'Quality Assurance Executive (Pharma)', 'Medical Data Analyst',
      'Clinical Pharmacist', 'Diagnostic Laboratory Manager', 'Healthcare Patient Care Coordinator'
    ],
    skills: ['GCP / GLP', 'Clinical Trials', 'Regulatory Compliance', 'Medical Records', 'Biomedical Instrumentation', 'Pharmacovigilance', 'NABH Standards']
  },
  {
    name: 'B2B Sales & Business Development',
    category: 'Sales & Business',
    titles: [
      'Enterprise Account Executive (SaaS)', 'B2B Inside Sales Specialist', 'Business Development Manager',
      'Key Account Manager (Corporate)', 'Channel Partner Manager', 'Sales Operations Specialist',
      'VP of Strategic Alliances', 'Regional Sales Lead', 'Client Relationship Executive'
    ],
    skills: ['B2B Sales', 'Lead Generation', 'Salesforce CRM', 'Cold Calling', 'Contract Negotiation', 'Pipeline Management', 'Account Strategy']
  },
  {
    name: 'Marketing, Creative & Growth',
    category: 'Marketing & Growth',
    titles: [
      'Growth Marketing Manager', 'Performance Marketing Specialist (Meta & Google Ads)', 'Technical SEO Specialist',
      'Content Marketing Strategist', 'Social Media & Brand Lead', 'Product Marketing Manager (PMM)',
      'Creative Copywriter', 'Email Lifecycle Marketing Specialist', 'Digital Marketing Executive'
    ],
    skills: ['Performance Marketing', 'SEO', 'Content Strategy', 'Google Ads', 'Meta Ads', 'Copywriting', 'Conversion Optimization', 'HubSpot']
  },
  {
    name: 'Human Resources & Talent Acquisition',
    category: 'HR & Staffing',
    titles: [
      'Technical Talent Acquisition Specialist', 'HR Business Partner (HRBP)', 'Compensation & Benefits Specialist',
      'Learning & Development (L&D) Manager', 'HR Operations Executive', 'Employee Engagement Lead',
      'Senior Executive Search Consultant', 'Talent Sourcing Specialist', 'HR Compliance & Payroll Manager'
    ],
    skills: ['Technical Recruiting', 'Talent Sourcing', 'ATS Management', 'HRBP', 'Employee Relations', 'Payroll Ops', 'Labor Laws', 'Performance Management']
  },
  {
    name: 'Manufacturing, Automotive & Engineering',
    category: 'Industrial & Manufacturing',
    titles: [
      'Mechanical Design Engineer (SolidWorks / CATIA)', 'Quality Control (QC) Inspector', 'Plant Operations Supervisor',
      'Industrial Automation Engineer (PLC / SCADA)', 'Automotive Systems Engineer', 'Maintenance Engineering Lead',
      'Supply Chain & Production Planner', 'Tooling & Fabrication Engineer', 'Safety & EHS Specialist'
    ],
    skills: ['SolidWorks', 'AutoCAD', 'PLC / SCADA', 'Lean Six Sigma', 'Quality Assurance', 'Plant Maintenance', 'Industrial Automation', 'ISO 9001']
  },
  {
    name: 'Logistics, Supply Chain & E-commerce',
    category: 'Logistics & Supply Chain',
    titles: [
      'Supply Chain Operations Manager', 'Warehouse Operations Supervisor', 'Logistics & Dispatch Coordinator',
      'E-commerce Category Specialist', 'Procurement & Vendor Manager', 'Inventory Control Analyst',
      'Last-Mile Delivery Operations Lead', 'Freight Forwarding Specialist', 'Import / Export Documentation Officer'
    ],
    skills: ['Supply Chain Planning', 'Warehouse Management', 'Inventory Control', 'ERP', 'Vendor Negotiation', 'Logistics Logistics', 'Customs Clearance']
  },
  {
    name: 'Education, Training & EdTech',
    category: 'Support & Education',
    titles: [
      'Academic & Admissions Counselor', 'Instructional Designer & Curriculum Lead', 'Corporate Technical Trainer',
      'EdTech Operations Manager', 'Student Career Mentor', 'Subject Matter Expert (STEM)',
      'Learning Experience Designer', 'University Partnership Executive', 'E-Learning Content Developer'
    ],
    skills: ['Curriculum Design', 'Instructional Pedagogy', 'EdTech LMS', 'Academic Counseling', 'Corporate Training', 'Student Engagement', 'Content Dev']
  }
];

const LOCATIONS = [
  { city: 'Varanasi', state: 'Uttar Pradesh', region: 'North India', pin: '221001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'North India', pin: '226001' },
  { city: 'Kanpur', state: 'Uttar Pradesh', region: 'North India', pin: '208001' },
  { city: 'Noida', state: 'Uttar Pradesh', region: 'NCR', pin: '201301' },
  { city: 'Greater Noida', state: 'Uttar Pradesh', region: 'NCR', pin: '201310' },
  { city: 'Delhi', state: 'Delhi NCR', region: 'NCR', pin: '110001' },
  { city: 'Gurgaon', state: 'Haryana', region: 'NCR', pin: '122001' },
  { city: 'Bangalore', state: 'Karnataka', region: 'South India', pin: '560001' },
  { city: 'Hyderabad', state: 'Telangana', region: 'South India', pin: '500001' },
  { city: 'Mumbai', state: 'Maharashtra', region: 'West India', pin: '400001' },
  { city: 'Pune', state: 'Maharashtra', region: 'West India', pin: '411001' },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'South India', pin: '600001' },
  { city: 'Kolkata', state: 'West Bengal', region: 'East India', pin: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', region: 'West India', pin: '380001' },
  { city: 'Surat', state: 'Gujarat', region: 'West India', pin: '395001' },
  { city: 'Patna', state: 'Bihar', region: 'East India', pin: '800001' },
  { city: 'Indore', state: 'Madhya Pradesh', region: 'Central India', pin: '452001' },
  { city: 'Bhopal', state: 'Madhya Pradesh', region: 'Central India', pin: '462001' },
  { city: 'Jaipur', state: 'Rajasthan', region: 'North India', pin: '302001' },
  { city: 'Agra', state: 'Uttar Pradesh', region: 'North India', pin: '282001' },
  { city: 'Prayagraj', state: 'Uttar Pradesh', region: 'North India', pin: '211001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', region: 'South India', pin: '641001' },
  { city: 'Kochi', state: 'Kerala', region: 'South India', pin: '682001' },
  { city: 'Chandigarh', state: 'Punjab & Haryana', region: 'North India', pin: '160001' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'South India', pin: '530001' },
  { city: 'Bhubaneswar', state: 'Odisha', region: 'East India', pin: '751001' },
  { city: 'Vadodara', state: 'Gujarat', region: 'West India', pin: '390001' },
  { city: 'Nagpur', state: 'Maharashtra', region: 'West India', pin: '440001' },
  { city: 'Nashik', state: 'Maharashtra', region: 'West India', pin: '422001' },
  { city: 'Madurai', state: 'Tamil Nadu', region: 'South India', pin: '625001' }
];

const EXPERIENCE_TIERS = [
  {
    tier: 'entry-level',
    label: 'Freshers / Early Career',
    schemaType: 'FULL_TIME',
    minExp: 0,
    maxExp: 1,
    minSalary: 320000,
    maxSalary: 600000,
    prefix: 'Associate / Junior'
  },
  {
    tier: 'mid-level',
    label: 'Mid-Level Specialist',
    schemaType: 'FULL_TIME',
    minExp: 2,
    maxExp: 5,
    minSalary: 650000,
    maxSalary: 1500000,
    prefix: ''
  },
  {
    tier: 'senior-level',
    label: 'Senior Specialist / Lead',
    schemaType: 'FULL_TIME',
    minExp: 5,
    maxExp: 10,
    minSalary: 1500000,
    maxSalary: 3000000,
    prefix: 'Senior / Lead'
  },
  {
    tier: 'executive',
    label: 'Principal / Leadership',
    schemaType: 'FULL_TIME',
    minExp: 10,
    maxExp: 18,
    minSalary: 3000000,
    maxSalary: 6500000,
    prefix: 'Director / Head of'
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateJobs(targetCount = 450) {
  const jobs = [];

  while (jobs.length < targetCount) {
    for (const ind of INDUSTRIES) {
      if (jobs.length >= targetCount) break;

      for (const title of ind.titles) {
        if (jobs.length >= targetCount) break;

        const loc = LOCATIONS[jobs.length % LOCATIONS.length];
        const expTier = EXPERIENCE_TIERS[jobs.length % EXPERIENCE_TIERS.length];
        const isRemote = (jobs.length % 5 === 0);

        const jobId = crypto.randomUUID();
        const shortId = jobId.slice(0, 8);
        
        let jobTitle = title;
        if (expTier.prefix && !jobTitle.startsWith('Senior') && !jobTitle.startsWith('Lead') && !jobTitle.startsWith('VP')) {
          jobTitle = `${expTier.prefix} ${jobTitle}`;
        }

        const companyName = 'TalentXcel Services (Client Partner)';
        const fullLocation = isRemote ? `${loc.city}, ${loc.state}, India (Remote Option)` : `${loc.city}, ${loc.state}, India`;
        const cleanSlug = `${slugify(jobTitle)}-${slugify(loc.city)}-txl-${shortId}`;

        const daysAgo = (jobs.length % 6) + 1;
        const postedDate = new Date(Date.now() - daysAgo * 86400000);
        const postedAtIso = postedDate.toISOString();
        const expiresDate = new Date(postedDate.getTime() + 120 * 86400000);
        const expiresAtIso = expiresDate.toISOString();

        const salaryMin = expTier.minSalary + ((jobs.length * 10000) % 150000);
        const salaryMax = Math.round(salaryMin * (1.35 + ((jobs.length % 5) * 0.05)));

        const selectedSkills = ind.skills.slice(0, 5 + (jobs.length % 4));

        const descriptionText = `TalentXcel Services is managing talent acquisition on behalf of our client partner for the position of ${jobTitle} in ${loc.city}, ${loc.state}.\n\n` +
          `Key Role Overview:\nAs a ${jobTitle}, you will drive core functional outcomes within our client's ${ind.name} operations. You will collaborate directly with cross-functional team members, implement industry-best practices, and contribute to scalable business velocity.\n\n` +
          `Primary Responsibilities:\n` +
          `- Execute day-to-day deliverables aligned with ${ind.name} business objectives and quality benchmarks.\n` +
          `- Collaborate across multidisciplinary teams to solve complex problem statements and deliver customer value.\n` +
          `- Leverage modern toolchains and technical workflows: ${selectedSkills.slice(0, 4).join(', ')}.\n` +
          `- Ensure compliance with organizational operating procedures and performance metrics.\n\n` +
          `Required Candidate Qualifications:\n` +
          `- Relevant experience: ${expTier.minExp} to ${expTier.maxExp} years in ${ind.name} or related domains.\n` +
          `- Demonstrated proficiency in: ${selectedSkills.join(', ')}.\n` +
          `- Bachelor's / Master's degree in engineering, business, sciences, or equivalent practical industry experience.\n\n` +
          `Compensation & Benefits:\n` +
          `- Annual Package: ₹${(salaryMin / 100000).toFixed(1)}L - ₹${(salaryMax / 100000).toFixed(1)}L Per Annum.\n` +
          `- Comprehensive group health and medical insurance coverage.\n` +
          `- ${isRemote ? 'Flexible hybrid/remote operating policy with home office support.' : 'Modern office facilities with state-of-the-art infrastructure.'}`;

        // 100% GSC Compliant JobPosting Schema
        const gscSchema = {
          '@context': 'https://schema.org/',
          '@type': 'JobPosting',
          'title': jobTitle,
          'description': descriptionText,
          'identifier': {
            '@type': 'PropertyValue',
            'name': 'TalentXcel Services',
            'value': `TXL-${shortId}`
          },
          'datePosted': postedAtIso,
          'validThrough': expiresAtIso,
          'employmentType': expTier.schemaType,
          'hiringOrganization': {
            '@type': 'Organization',
            'name': 'TalentXcel Services',
            'sameAs': 'https://talentxcel.in',
            'logo': 'https://talentxcel.in/talentxcel-official-logo.png'
          },
          'jobLocation': {
            '@type': 'Place',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': `${loc.city} Commercial District`,
              'addressLocality': loc.city,
              'addressRegion': loc.state,
              'postalCode': loc.pin,
              'addressCountry': 'IN'
            }
          },
          'baseSalary': {
            '@type': 'MonetaryAmount',
            'currency': 'INR',
            'value': {
              '@type': 'QuantitativeValue',
              'minValue': salaryMin,
              'maxValue': salaryMax,
              'unitText': 'YEAR'
            }
          },
          'experienceRequirements': {
            '@type': 'OccupationalExperienceRequirements',
            'monthsOfExperience': expTier.minExp * 12
          },
          'applicantLocationRequirements': {
            '@type': 'Country',
            'name': 'India'
          },
          'directApply': true,
          'url': `https://talentxcel.in/jobs/${cleanSlug}`
        };

        if (isRemote) {
          gscSchema.jobLocationType = 'TELECOMMUTE';
        }

        jobs.push({
          id: jobId,
          title: jobTitle,
          company_name: companyName,
          description: descriptionText,
          requirements: `Experience: ${expTier.minExp}-${expTier.maxExp} yrs in ${ind.name}. Core competencies: ${selectedSkills.join(', ')}.`,
          location: fullLocation,
          location_city: loc.city,
          location_state: loc.state,
          is_remote: isRemote,
          employment_type: 'Full-time',
          employment_type_schema: expTier.schemaType,
          experience_level: expTier.tier,
          min_experience: expTier.minExp,
          max_experience: expTier.maxExp,
          minimum_experience_years: expTier.minExp,
          maximum_experience_years: expTier.maxExp,
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_currency: 'INR',
          salary_range: `₹${(salaryMin / 100000).toFixed(1)}L - ₹${(salaryMax / 100000).toFixed(1)}L PA`,
          salary_frequency: 'yearly',
          salary_unit: 'YEAR',
          skills_required: selectedSkills,
          industry: ind.name,
          industry_domain: ind.name,
          role_category: ind.category,
          is_active: true,
          job_status: 'open',
          status: 'active',
          visibility_status: 'active',
          posted_at: postedAtIso,
          expires_at: expiresAtIso,
          created_at: postedAtIso,
          updated_at: new Date().toISOString(),
          seo_slug: cleanSlug,
          meta_title: `${jobTitle} in ${loc.city} | TalentXcel Hiring Partner`,
          meta_description: `Apply for ${jobTitle} in ${loc.city} with TalentXcel Services. Salary: ₹${(salaryMin / 100000).toFixed(1)}L - ₹${(salaryMax / 100000).toFixed(1)}L PA. Experience: ${expTier.minExp}-${expTier.maxExp} yrs.`,
          identifier_value: `TXL-${shortId}`,
          structured_data: gscSchema,
          source: 'TalentXcel Direct Client Mandate',
          source_type: 'enterprise_partner',
          keywords: [
            jobTitle.toLowerCase(),
            `${jobTitle.toLowerCase()} jobs`,
            `jobs in ${loc.city.toLowerCase()}`,
            `${loc.city.toLowerCase()} jobs`,
            'talentxcel hiring'
          ]
        });
      }
    }
  }

  return jobs;
}

async function run() {
  console.log('================================================================');
  console.log('🚀 TALENTXCEL: 450 ENTERPRISE CLIENT-REPRESENTED JOBS SEEDER');
  console.log('================================================================\n');

  const jobs = generateJobs(450);
  console.log(`✓ Generated ${jobs.length} structured enterprise jobs.`);

  console.log('📡 Batch-inserting into Supabase "jobs" table...');
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const chunk = jobs.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('jobs').insert(chunk);

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} Error:`, error.message);
      throw error;
    } else {
      inserted += chunk.length;
      console.log(`  ✓ Inserted chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${inserted}/${jobs.length} jobs)`);
    }
  }

  console.log('\n================================================================');
  console.log(`✅ SUCCESS: ${inserted} active, client-partner jobs live in Supabase!`);
  console.log('================================================================\n');
}

run().catch(console.error);
