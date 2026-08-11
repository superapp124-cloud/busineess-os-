import { EXPANSION_PAGES } from '@/data/expansionPagesData';

export interface InternalLinkGraphNode {
  route: string;
  category: string;
  parentRoute: string;
  siblingRoutes: string[];
  childRoutes: string[];
  inboundLinkCount: number;
  outboundLinkCount: number;
  proposedInternalLinks: { route: string; anchorText: string }[];
}

export function computeInternalLinkGraphNode(route: string): InternalLinkGraphNode {
  const page = EXPANSION_PAGES.find(p => p.path === route);
  const category = page?.category || 'Product';

  const parentRoute = /;
  const siblings = EXPANSION_PAGES.filter(p => p.category === category && p.path !== route).map(p => p.path);
  const children = EXPANSION_PAGES.filter(p => p.path.startsWith(${route}/)).map(p => p.path);

  const proposedInternalLinks = siblings.slice(0, 3).map(s => {
    const sPage = EXPANSION_PAGES.find(p => p.path === s);
    return {
      route: s,
      anchorText: sPage ? sPage.h1 : s
    };
  });

  return {
    route,
    category,
    parentRoute,
    siblingRoutes: siblings,
    childRoutes: children,
    inboundLinkCount: 4 + siblings.length,
    outboundLinkCount: proposedInternalLinks.length + 2,
    proposedInternalLinks
  };
}
