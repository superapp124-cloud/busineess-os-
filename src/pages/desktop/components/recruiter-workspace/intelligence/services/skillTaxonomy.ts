/**
 * Resume Intelligence OS v3.0 — Skill Taxonomy
 *
 * Hierarchical skill tree for semantic search.
 * Returns the full ancestry path from broadest category to specific skill.
 */

import { ontologyRegistry } from '../ontologies/registry';

// ─── Skill Taxonomy Node ──────────────────────────────────────────────────────

export interface SkillTaxonomyNode {
  id: string;
  label: string;
  level: number;       // 0 = root, 1 = category, 2 = subcategory, 3 = skill
  children: SkillTaxonomyNode[];
  aliases: string[];
}

// ─── Taxonomy Functions ───────────────────────────────────────────────────────

/**
 * Get the full taxonomy path for a skill using the ontology registry.
 * Returns an array from broadest to most specific.
 * e.g. "Spring Boot" → ["Software Engineering", "Java", "Frameworks", "Spring", "Spring Boot"]
 */
export function resolveTaxonomy(skill: string): string[] {
  const entry = ontologyRegistry.lookup(skill);
  if (entry?.taxonomy && entry.taxonomy.length > 0) return entry.taxonomy;

  // Fallback: build minimal taxonomy
  return ['Unknown', skill];
}

/**
 * Check if a skill belongs to a given category at any level of the taxonomy.
 * e.g. isSkillInCategory("Spring Boot", "Java") → true
 */
export function isSkillInCategory(skill: string, category: string): boolean {
  const taxonomy = resolveTaxonomy(skill);
  return taxonomy.some(t => t.toLowerCase() === category.toLowerCase());
}

/**
 * Get the immediate parent category of a skill.
 * e.g. parentCategory("Spring Boot") → "Spring"
 */
export function parentCategory(skill: string): string | null {
  const taxonomy = resolveTaxonomy(skill);
  if (taxonomy.length < 2) return null;
  return taxonomy[taxonomy.length - 2];
}

/**
 * Get the root category (top-level domain) of a skill.
 * e.g. rootCategory("Spring Boot") → "Software Engineering"
 */
export function rootCategory(skill: string): string | null {
  const taxonomy = resolveTaxonomy(skill);
  return taxonomy[0] ?? null;
}

/**
 * Filter a list of skills to those belonging to a given category.
 * e.g. filterSkillsByCategory(["Spring Boot","SAP FICO","Docker"], "Java") → ["Spring Boot"]
 */
export function filterSkillsByCategory(skills: string[], category: string): string[] {
  return skills.filter(s => isSkillInCategory(s, category));
}

/**
 * Group a list of skills by their root category.
 * Returns a map of category → skill[]
 */
export function groupSkillsByCategory(skills: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const root = rootCategory(skill) ?? 'Other';
    const group = groups.get(root) ?? [];
    group.push(skill);
    groups.set(root, group);
  }
  return groups;
}

/**
 * Check if two skills are semantically related (same parent or sibling in taxonomy).
 */
export function areSkillsRelated(skillA: string, skillB: string): boolean {
  const taxA = resolveTaxonomy(skillA);
  const taxB = resolveTaxonomy(skillB);
  // Related if they share any common ancestor except the root
  return taxA.slice(1, -1).some(a => taxB.includes(a));
}
