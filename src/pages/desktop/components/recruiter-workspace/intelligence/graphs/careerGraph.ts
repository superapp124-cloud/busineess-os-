import { SemanticEntity, StageConfidence } from '../core/types';

export interface CareerNode {
  nodeId: string;
  employer: string;
  employerType: 'Employer' | 'Client' | 'Vendor' | 'StaffingAgency' | 'ImplementationPartner';
  role: string;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  isCurrent: boolean;
  location?: string;
  achievements: string[];
  evidenceId: string;
  confidence: StageConfidence;
}

export interface ProjectNode {
  nodeId: string;
  title: string;
  client?: string;
  role?: string;
  techStack: string[];
  duration?: string;
  evidenceId: string;
}

export interface CareerGraph {
  employmentHistory: CareerNode[];
  projects: ProjectNode[];
  totalDeclaredYears: number | null;
}

export function buildCareerGraph(entities: SemanticEntity[], rawLines: string[]): CareerGraph {
  const employmentHistory: CareerNode[] = [];
  const projects: ProjectNode[] = [];

  const empEntities = entities.filter(e => e.layoutRegion === 'employment');
  const employers = empEntities.filter(e => e.canonicalType === 'Employer');

  employers.forEach((employerEntity, i) => {
    const roleEntity = empEntities.find(e => e.canonicalType === 'JobTitle' && e.layoutRegion === employerEntity.layoutRegion);
    const periodEntity = empEntities.find(e => e.canonicalType === 'EmploymentPeriod' && e.layoutRegion === employerEntity.layoutRegion);
    
    let startDate = null;
    let endDate = null;
    let isCurrent = false;

    if (periodEntity) {
      const yearMatches = periodEntity.value.match(/(19|20)\d{2}/g);
      if (yearMatches) {
        startDate = yearMatches[0];
        if (yearMatches.length > 1) {
          endDate = yearMatches[1];
        }
      }
      if (/present|current|ongoing/i.test(periodEntity.value)) {
        isCurrent = true;
      }
    }

    employmentHistory.push({
      nodeId: `emp_${i}_${employerEntity.id}`,
      employer: employerEntity.value,
      employerType: 'Employer',
      role: roleEntity ? roleEntity.value : '',
      startDate,
      endDate,
      duration: null,
      isCurrent,
      achievements: [],
      evidenceId: employerEntity.evidenceId ?? employerEntity.id,
      confidence: employerEntity.confidence ?? { lexical: 0.5, layout: 0.7, section: 0.7, ontology: 0.5, relationship: 0.5, overall: 0.6 }
    });
  });

  if (employmentHistory.length === 0) {
    const companyPatterns = [/inc\.?/i, /llc/i, /corp\.?/i, /ltd\.?/i];
    rawLines.forEach((line, i) => {
      if (companyPatterns.some(p => p.test(line))) {
        employmentHistory.push({
          nodeId: `emp_fallback_${i}`,
          employer: line.trim(),
          employerType: 'Employer',
          role: '',
          startDate: null,
          endDate: null,
          duration: null,
          isCurrent: false,
          achievements: [],
          evidenceId: `fallback_${i}`,
          confidence: { lexical: 0.4, layout: 0.4, section: 0.3, ontology: 0.2, relationship: 0.2, overall: 0.35 }
        });
      }
    });
  }

  employmentHistory.sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    return bDate.localeCompare(aDate);
  });

  const projEntities = entities.filter(e => e.layoutRegion === 'projects');
  const projectTitles = projEntities.filter(e => e.canonicalType === 'ProjectTitle');

  projectTitles.forEach((pt, i) => {
    const techStack = projEntities
      .filter(e => e.canonicalType === 'TechnicalSkill')
      .map(e => e.value);

    projects.push({
      nodeId: `proj_${i}_${pt.id}`,
      title: pt.value,
      techStack,
      evidenceId: pt.id
    });
  });

  return {
    employmentHistory,
    projects,
    totalDeclaredYears: null
  };
}
