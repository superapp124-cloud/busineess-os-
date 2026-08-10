/**
 * Sitemap Generator for CHATR
 * Auto-generates sitemap.xml from valid routes
 */

import { VALID_ROUTES } from './deepLinkHandler';

const BASE_URL = 'https://chatrchat.in';

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Route priority mapping
const ROUTE_PRIORITIES: Record<string, number> = {
  '/': 1.0,
  '/chatr/whatsapp-candidate-screening': 1.0,
  '/business-os': 1.0,
  '/ai-business-os': 1.0,
  '/ai-revenue-operations': 1.0,
  '/ai-agents-for-business': 1.0,
  '/business-automation': 1.0,
  // Cycle 1 — SEO Opportunity Pages (2026-08-10)
  '/talentxcel/ai-resume-parser': 0.9,
  '/talentxcel/ats-resume-builder': 0.9,
  '/chatr/universal-inbox-ai': 0.9,
  // Cycle 2 — SEO Article Pages (2026-08-10)
  '/talentxcel/automate-candidate-screening': 0.85,
  '/chatr/whatsapp-business-recruitment': 0.85,
  // Supporting pages
  '/ai-browser': 0.8,
  '/communities': 0.7,
  '/chatr-wallet': 0.7,
  '/chatr-games': 0.7,
  '/chatr-studio': 0.7,
  '/marketplace': 0.8,
  '/about': 0.7,
  '/help': 0.7,
  '/contact': 0.7,
  '/download': 0.7,
  '/terms': 0.5,
  '/privacy-policy': 0.5,
  '/refund': 0.4,
  '/disclaimer': 0.4,
};

// Route change frequency mapping
const ROUTE_CHANGEFREQ: Record<string, SitemapEntry['changefreq']> = {
  '/': 'daily',
  '/chatr/whatsapp-candidate-screening': 'daily',
  '/business-os': 'daily',
  '/ai-business-os': 'daily',
  '/ai-revenue-operations': 'daily',
  '/ai-agents-for-business': 'daily',
  '/business-automation': 'daily',
  // Cycle 1 — SEO Opportunity Pages
  '/talentxcel/ai-resume-parser': 'daily',
  '/talentxcel/ats-resume-builder': 'daily',
  '/chatr/universal-inbox-ai': 'daily',
  '/ai-browser': 'daily',
  '/communities': 'daily',
  '/about': 'monthly',
  '/terms': 'yearly',
  '/privacy-policy': 'yearly',
};


// Routes to exclude from sitemap (auth-protected, private app, or dynamic)
const EXCLUDED_ROUTES = [
  '/admin',
  '/auth',
  '/chat',
  '/contacts',
  '/settings',
  '/notifications',
  '/call-history',
  '/smart-inbox',
  '/stories',
  '/provider-portal',
  '/provider-register',
  '/device-management',
  '/geofence-history',
  '/notification-settings',
  '/account',
  '/qr-login',
  '/onboarding',
  '/booking',
  '/lab-reports',
  '/wellness-tracking',
  '/health-passport',
  '/medicine-reminders',
];

// Filter out dynamic routes (with :param)
const getStaticRoutes = (): string[] => {
  return VALID_ROUTES.filter(route => {
    // Exclude routes with dynamic segments
    if (route.includes(':')) return false;
    // Exclude auth-protected routes
    if (EXCLUDED_ROUTES.includes(route)) return false;
    return true;
  });
};

// Generate sitemap entries
export const generateSitemapEntries = (): SitemapEntry[] => {
  const routes = getStaticRoutes();
  const today = new Date().toISOString().split('T')[0];

  return routes.map(route => ({
    loc: `${BASE_URL}${route}`,
    lastmod: today,
    changefreq: ROUTE_CHANGEFREQ[route] || 'weekly',
    priority: ROUTE_PRIORITIES[route] || 0.6,
  }));
};

// Generate sitemap XML string
export const generateSitemapXML = (): string => {
  const entries = generateSitemapEntries();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  return `# CHATR Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin and auth routes
Disallow: /admin
Disallow: /provider-portal
Disallow: /device-management
Disallow: /qr-login
Disallow: /onboarding

# Allow crawling of main content
Allow: /health
Allow: /care
Allow: /jobs
Allow: /ai-browser
Allow: /communities
Allow: /chatr-games
Allow: /chatr-studio
Allow: /marketplace
Allow: /about
Allow: /help
Allow: /contact
`;
};

// Export sitemap data for API endpoint
export const getSitemapData = () => ({
  xml: generateSitemapXML(),
  robots: generateRobotsTxt(),
  entries: generateSitemapEntries(),
  totalRoutes: getStaticRoutes().length,
});
