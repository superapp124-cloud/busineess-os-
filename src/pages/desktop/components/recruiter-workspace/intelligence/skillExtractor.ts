/**
 * skillExtractor.ts — Domain-aware resume skill token extractor.
 *
 * Scans raw document text against curated term dictionaries and returns
 * a deduplicated list of SkillToken objects with category + confidence.
 *
 * Governance rule: all term lists are explicit arrays — no scattered regex.
 */

export interface SkillToken {
  value: string;
  category: SkillCategory;
  confidence: number; // 0–100
}

export type SkillCategory =
  | 'sap_module'
  | 'sap_object'
  | 'sap_project'
  | 'cloud'
  | 'data'
  | 'devops'
  | 'erp_other'
  | 'database'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'testing'
  | 'domain';

// ── Term dictionaries ──────────────────────────────────────────────────────

const SAP_MODULES: string[] = [
  'SAP MM', 'SAP SD', 'SAP FI', 'SAP CO', 'SAP PP', 'SAP PM', 'SAP QM',
  'SAP HCM', 'SAP HR', 'SAP WM', 'SAP EWM', 'SAP PS', 'SAP GRC', 'SAP BW',
  'SAP HANA', 'SAP S/4HANA', 'SAP ECC', 'SAP Ariba', 'SAP Fiori',
  'SAP SuccessFactors', 'SAP Concur', 'SAP Analytics Cloud',
];

const SAP_OBJECTS: string[] = [
  'Material Master', 'Vendor Master', 'Customer Master',
  'Purchase Order', 'Purchase Requisition', 'Source List',
  'Purchase Info Record', 'Info Record', 'LSMW', 'MRP',
  'MIGO', 'MIRO', 'BAPI', 'BDC', 'IDOC', 'RFC',
  'Goods Receipt', 'Goods Issue', 'Inventory Management', 'Physical Inventory',
  'Pricing Procedure', 'Account Determination', 'Batch Management',
  'Release Procedure', 'Output Determination', 'Purchasing Organization',
  'Storage Location', 'Plant', 'Bill of Materials', 'BOM', 'Routing',
  'Work Center', 'Cost Center', 'Profit Center', 'Internal Order',
  'Movement Type', 'Valuation Class', 'Special Stock', 'Consignment',
  'Scheduling Agreement', 'Framework Order', 'Blanket PO', 'RFQ',
  'Request for Quotation', 'Outline Agreement', 'ABAP', 'ALV',
];

const SAP_PROJECT_SKILLS: string[] = [
  'SAP Implementation', 'SAP Rollout', 'SAP Go-Live', 'SAP Support',
  'SAP Migration', 'Data Migration', 'Legacy Data Migration',
  'Integration Testing', 'UAT', 'User Acceptance Testing',
  'Cutover', 'Blueprint', 'Fit-Gap', 'Business Blueprint',
  'End User Training', 'User Training', 'Change Management',
  'Production Support', 'Go Live Support',
];

const CLOUD_SKILLS: string[] = [
  'Azure', 'AWS', 'GCP', 'Google Cloud', 'Azure DevOps', 'Azure ADF',
  'Azure Synapse', 'Azure Data Factory', 'Azure Blob', 'Azure SQL',
  'Azure Functions', 'Azure Logic Apps', 'AWS Lambda', 'AWS S3', 'AWS EC2',
  'AWS RDS', 'AWS Glue', 'Terraform', 'Ansible', 'CloudFormation',
  'Kubernetes', 'Docker', 'Helm', 'OpenShift', 'AKS', 'EKS', 'GKE',
];

const DATA_SKILLS: string[] = [
  'SQL Server', 'MySQL', 'PostgreSQL', 'Oracle Database', 'MongoDB',
  'Redis', 'Cassandra', 'Power BI', 'Tableau', 'Looker', 'Qlik',
  'SSRS', 'SSAS', 'SSIS', 'ETL', 'Data Warehouse', 'Data Lake',
  'Apache Spark', 'Apache Kafka', 'Hadoop', 'Databricks', 'Snowflake',
  'dbt', 'Airflow', 'Crystal Reports', 'SQL Views', 'Stored Procedures',
];

const DEVOPS_SKILLS: string[] = [
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jenkins', 'CircleCI',
  'GitHub Actions', 'CI/CD', 'Jira', 'Confluence', 'ServiceNow',
  'Omni Tracker', 'ITSM', 'ITIL', 'SLA Management',
  'Incident Management', 'Problem Management',
];

const ERP_OTHER: string[] = [
  'MS Navision', 'Microsoft Dynamics', 'Dynamics 365', 'Coral ERP',
  'Tally', 'Busy', 'QuickBooks', 'Zoho', 'Odoo',
];

const BACKEND_SKILLS: string[] = [
  'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot',
  'ASP.NET', '.NET Core', 'Java', 'Python', 'Go', 'Rust',
  'PHP', 'Laravel', 'GraphQL', 'REST API', 'gRPC', 'Microservices',
];

const FRONTEND_SKILLS: string[] = [
  'React', 'Angular', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript',
  'HTML', 'CSS', 'SCSS', 'Tailwind', 'Redux', 'MobX', 'Webpack', 'Vite',
];

const MOBILE_SKILLS: string[] = [
  'Android', 'iOS', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'Xamarin', 'Ionic', 'Android SDK', 'Android NDK',
];

const ANDROID_ECOSYSTEM_SKILLS: string[] = [
  'Jetpack Compose', 'MVVM', 'Kotlin Flow', 'Coroutines', 'Hilt', 'Dagger',
  'Retrofit', 'Room DB', 'Room Database', 'Navigation Component', 'WorkManager',
  'LiveData', 'Glide', 'Picasso', 'Clean Architecture', 'RxJava',
  'ViewBinding', 'DataBinding', 'Ktor', 'MVI', 'Firebase', 'JSON',
];

const BLUETOOTH_CONNECTIVITY_SKILLS: string[] = [
  'BLE', 'Bluetooth Low Energy', 'Bluetooth Classic', 'A2DP', 'HFP', 'HSP',
  'Qualcomm Bluetooth', 'Qualcomm Bluetooth SDK', 'Bluetooth Profiles',
  'Wireshark', 'Logcat', 'ADB', 'Android Debug Bridge', 'UART', 'SPI',
  'Embedded Connectivity', 'GATT', 'GAP', 'SPP',
];

const HUMANITARIAN_SKILLS: string[] = [
  'Cluster Coordination', 'Food Security', 'Livelihoods', 'Resilience Programming',
  'Emergency Response', 'Disaster Risk Reduction', 'DRR', 'Grant Acquisition',
  'Donor Relations', 'Policy Advocacy', 'Government Liaison', 'Sphere Standards',
  'Humanitarian-Development-Peace Nexus', 'MEAL', 'IPC Analysis', 'IPC',
  'Market-Based Approaches', 'Pastoralism', 'Cash Transfer', 'Malnutrition',
  'Crisis Response', 'Food Economy', 'Multistakeholder Engagement',
];

const TESTING_SKILLS: string[] = [
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'Postman', 'JUnit',
  'Pytest', 'TestNG', 'Appium', 'K6', 'LoadRunner', 'JMeter',
];

// ── Helpers ────────────────────────────────────────────────────────────────

function escRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scanTerms(
  text: string,
  terms: string[],
  category: SkillCategory,
  confidence: number,
  found: Map<string, SkillToken>,
): void {
  for (const term of terms) {
    const key = term.toLowerCase();
    if (found.has(key)) continue;
    if (new RegExp(`\\b${escRx(term)}\\b`, 'i').test(text)) {
      found.set(key, { value: term, category, confidence });
    }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Extract skill tokens from raw resume text.
 * Returns deduplicated array ordered by confidence desc, then alpha.
 */
export function extractSkills(rawText: string): SkillToken[] {
  if (!rawText || rawText.length < 20) return [];

  const found = new Map<string, SkillToken>();

  scanTerms(rawText, SAP_MODULES,        'sap_module',   95, found);
  scanTerms(rawText, SAP_OBJECTS,        'sap_object',   90, found);
  scanTerms(rawText, SAP_PROJECT_SKILLS, 'sap_project',  85, found);
  scanTerms(rawText, CLOUD_SKILLS,       'cloud',        90, found);
  scanTerms(rawText, DATA_SKILLS,        'data',         88, found);
  scanTerms(rawText, DEVOPS_SKILLS,      'devops',       80, found);
  scanTerms(rawText, ERP_OTHER,          'erp_other',    85, found);
  scanTerms(rawText, BACKEND_SKILLS,     'backend',      85, found);
  scanTerms(rawText, FRONTEND_SKILLS,    'frontend',     85, found);
  scanTerms(rawText, MOBILE_SKILLS,                 'mobile',       85, found);
  scanTerms(rawText, ANDROID_ECOSYSTEM_SKILLS,     'mobile',       92, found);
  scanTerms(rawText, BLUETOOTH_CONNECTIVITY_SKILLS, 'domain',       95, found);
  scanTerms(rawText, HUMANITARIAN_SKILLS,          'domain',       96, found);
  scanTerms(rawText, TESTING_SKILLS,                'testing',      80, found);

  return [...found.values()].sort(
    (a, b) => b.confidence - a.confidence || a.value.localeCompare(b.value),
  );
}

const FORBIDDEN_SKILL_NOISE_RE = /^(curriculum\s*vitae|resume|cv|education|busy|technical\s*and\s*system\s*expertise|objective|career\s*objective|personal\s*statement|profile\s*summary|professional\s*summary|experience|employment|work\s*history|references|declaration|page|confidential|needs\s*review|over|details)$/i;

/**
 * Returns just the display-friendly skill strings.
 * Drop-in replacement for the current c.skills string array.
 */
export function extractSkillStrings(rawText: string): string[] {
  return extractSkills(rawText)
    .map(t => t.value)
    .filter(val => !FORBIDDEN_SKILL_NOISE_RE.test(val.trim()));
}
