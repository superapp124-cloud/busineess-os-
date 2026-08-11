import { RESEARCH_REPORTS, ResearchReportConfig } from '../data/researchReportsData';

export interface EvidenceNode {
  researchId: string;
  reportTitle: string;
  reportPath: string;
  findingIndex: number;
  findingText: string;
  doiStatus: string;
  confidenceInterval?: string;
  sampleSize: string;
}

export const getEvidenceNodesForCategory = (category: string): EvidenceNode[] => {
  const nodes: EvidenceNode[] = [];

  RESEARCH_REPORTS.forEach(report => {
    report.keyFindings.forEach((finding, idx) => {
      let isRelevant = false;

      if (category.toLowerCase() === 'product' || category.toLowerCase() === 'problem') {
        if (finding.toLowerCase().includes('whatsapp') || finding.toLowerCase().includes('response') || finding.toLowerCase().includes('lead')) {
          isRelevant = true;
        }
      } else if (category.toLowerCase() === 'workflow' || category.toLowerCase() === 'recruitment') {
        if (finding.toLowerCase().includes('candidate') || finding.toLowerCase().includes('screening') || finding.toLowerCase().includes('resume')) {
          isRelevant = true;
        }
      } else if (category.toLowerCase() === 'comparison' || category.toLowerCase() === 'industry') {
        isRelevant = true;
      }

      if (isRelevant) {
        nodes.push({
          researchId: report.researchId,
          reportTitle: report.title,
          reportPath: report.path,
          findingIndex: idx + 1,
          findingText: finding,
          doiStatus: report.doiStatus,
          confidenceInterval: report.confidenceIntervals,
          sampleSize: report.datasetSize
        });
      }
    });
  });

  return nodes;
};

export const getPrimaryEvidenceNode = (path: string): EvidenceNode | null => {
  const report = RESEARCH_REPORTS.find(r => r.path === path);
  if (!report || report.keyFindings.length === 0) return null;

  return {
    researchId: report.researchId,
    reportTitle: report.title,
    reportPath: report.path,
    findingIndex: 1,
    findingText: report.keyFindings[0],
    doiStatus: report.doiStatus,
    confidenceInterval: report.confidenceIntervals,
    sampleSize: report.datasetSize
  };
};
