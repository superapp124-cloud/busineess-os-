/**
 * Resume Intelligence OS v3.0 — Layout Graph Builder
 *
 * Builds a structured DocumentLayoutGraph before entity extraction begins.
 * Context (section/region) determines entity type — not just lexical patterns.
 */

import type { LayoutNode, DocumentLayoutGraph, LayoutRegion, ExtractedPage } from '../core/types';
import type { ResumeFamilyProfile } from './familyRegistry';

// ─── Section Header Patterns ──────────────────────────────────────────────────

interface SectionMatcher {
  pattern: RegExp;
  label: string;
  region: LayoutRegion;
}

const UNIVERSAL_SECTION_MATCHERS: SectionMatcher[] = [
  { pattern: /^(work\s+experience|professional\s+experience|employment|career\s+history|experience)$/i, label: 'Employment', region: 'employment' },
  { pattern: /^(education|academic\s+background|qualification|degrees?)$/i, label: 'Education', region: 'education' },
  { pattern: /^(technical\s+skills?|skills?|core\s+competencies?|key\s+skills?|expertise)$/i, label: 'Skills', region: 'skills' },
  { pattern: /^(projects?|key\s+projects?|notable\s+projects?)$/i, label: 'Projects', region: 'projects' },
  { pattern: /^(certifications?|certificates?|credentials?)$/i, label: 'Certifications', region: 'certifications' },
  { pattern: /^(awards?|honours?|achievements?|recognitions?)$/i, label: 'Awards', region: 'awards' },
  { pattern: /^(summary|profile|about\s+me|professional\s+summary|executive\s+summary)$/i, label: 'Summary', region: 'summary' },
  { pattern: /^(objective|career\s+objective|professional\s+objective)$/i, label: 'Objective', region: 'objective' },
  { pattern: /^(contact|contact\s+information|personal\s+details?|personal\s+information)$/i, label: 'Contact', region: 'contact' },
];

// ─── Layout Classifier ────────────────────────────────────────────────────────

function classifyLine(
  line: string,
  lineIndex: number,
  allLines: string[],
  family: ResumeFamilyProfile
): { isHeader: boolean; label: string; region: LayoutRegion } | null {
  const cleaned = line.replace(/^[:\-–—•·\s]+|[:\-–—•·\s]+$/g, '').trim();
  if (!cleaned || cleaned.length < 2 || cleaned.length > 80) return null;

  // Check family-specific synonyms first
  for (const [canonicalLabel, synonyms] of Object.entries(family.extractionProfile.sectionSynonyms)) {
    if (synonyms.some(s => cleaned.toLowerCase() === s.toLowerCase())) {
      const region = canonicalLabel as LayoutRegion;
      return { isHeader: true, label: canonicalLabel.charAt(0).toUpperCase() + canonicalLabel.slice(1), region };
    }
  }

  // Check universal matchers
  for (const matcher of UNIVERSAL_SECTION_MATCHERS) {
    if (matcher.pattern.test(cleaned)) {
      return { isHeader: true, label: matcher.label, region: matcher.region };
    }
  }

  return null;
}

// ─── Column Count Detector ────────────────────────────────────────────────────

function detectColumnCount(pages: ExtractedPage[]): 1 | 2 | 3 {
  // Heuristic: multi-column PDFs often produce very short lines interleaved with long ones
  const allLines = pages.flatMap(p => p.text.split(/\r?\n/).filter(Boolean));
  const shortLines = allLines.filter(l => l.trim().length > 0 && l.trim().length < 30);
  const ratio = shortLines.length / Math.max(allLines.length, 1);
  if (ratio > 0.6) return 2;
  if (ratio > 0.8) return 3;
  return 1;
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildLayoutGraph(
  pages: ExtractedPage[],
  family: ResumeFamilyProfile
): DocumentLayoutGraph {
  const allLines = pages.flatMap(p =>
    p.text.split(/\r?\n/).map(l => l.trim())
  );

  const nodes: LayoutNode[] = [];
  let currentNode: LayoutNode | null = null;
  let readingOrder = 0;

  // Detect header region — first 5 non-empty lines are likely header/contact
  const headerBoundary = Math.min(
    allLines.findIndex((l, i) => i > 3 && l.length > 30) + 1, 8
  );

  // Always add a header node
  nodes.push({
    nodeId: 'header-0',
    label: 'Header',
    layoutRegion: 'header',
    startLine: 0,
    endLine: headerBoundary,
    page: 1,
    readingOrder: readingOrder++,
    confidence: 0.9,
    children: [],
  });

  let lineIdx = headerBoundary;

  while (lineIdx < allLines.length) {
    const line = allLines[lineIdx];

    if (!line) { lineIdx++; continue; }

    const headerMatch = classifyLine(line, lineIdx, allLines, family);

    if (headerMatch?.isHeader) {
      // Close previous node
      if (currentNode) {
        currentNode.endLine = lineIdx - 1;
        nodes.push(currentNode);
      }

      currentNode = {
        nodeId: `${headerMatch.region}-${nodes.length}`,
        label: headerMatch.label,
        layoutRegion: headerMatch.region,
        startLine: lineIdx,
        endLine: allLines.length - 1, // will be updated
        page: 1,
        readingOrder: readingOrder++,
        confidence: 0.85,
        children: [],
      };
    }

    lineIdx++;
  }

  // Close last open node
  if (currentNode) {
    currentNode.endLine = allLines.length - 1;
    nodes.push(currentNode);
  }

  // Quality score: ratio of lines that belong to a named section
  const classifiedLines = nodes.reduce((s, n) => s + (n.endLine - n.startLine + 1), 0);
  const qualityScore = Math.min(100, Math.round((classifiedLines / Math.max(allLines.length, 1)) * 100));

  return {
    nodes,
    totalPages: pages.length,
    columnCount: detectColumnCount(pages),
    readingDirection: 'ltr',
    qualityScore,
  };
}

/**
 * Find the most specific LayoutNode that contains a given line index.
 * Returns the unknown fallback if no node covers that line.
 */
export function getNodeForLine(graph: DocumentLayoutGraph, lineIndex: number): LayoutNode {
  const match = graph.nodes.find(n => lineIndex >= n.startLine && lineIndex <= n.endLine);
  return match ?? {
    nodeId: 'unknown', label: 'Unknown', layoutRegion: 'unknown',
    startLine: lineIndex, endLine: lineIndex, page: 1, readingOrder: 9999,
    confidence: 0.1, children: [],
  };
}
