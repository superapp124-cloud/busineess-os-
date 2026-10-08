import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
 title?: string;
 description?: string;
 keywords?: string;
 ogImage?: string;
 ogUrl?: string;
 canonicalUrl?: string;
 schemaData?: object;
 noIndex?: boolean;
 articleData?: {
 publishedTime?: string;
 modifiedTime?: string;
 author?: string;
 section?: string;
 };
 breadcrumbList?: Array<{ name: string; url: string }>;
}

const BASE_URL = 'https://www.chatrchat.in';

export const SEOHead = ({
 title = 'CHATR — Customer Conversation OS for Businesses & Teams (Chat, Call, Book, Track)',
 description = 'CHATR is the Customer Conversation Operating System. Handle customer inquiries, free browser calling, shared team inboxes, appointment booking, and request tracking in one place.',
 keywords = 'customer conversation OS, business messaging, free browser calling, team inbox, appointment booking, request tracking, chatrchat',
 ogImage = '/og-image.jpg',
 ogUrl,
 canonicalUrl,
 schemaData,
 noIndex = false,
 articleData,
 breadcrumbList,
}: SEOHeadProps) => {
 const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
 const fullUrl = ogUrl || `${BASE_URL}${currentPath}`;
 const canonical = canonicalUrl || fullUrl;
 const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

 // Default SoftwareApplication schema
 const defaultSchema = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "CHATR Customer Conversation OS",
 "alternateName": "ChatrChat",
 "description": description,
 "url": fullUrl,
 "applicationCategory": "BusinessApplication",
 "operatingSystem": "Web, Windows, macOS, Android, iOS",
 "offers": {
 "@type": "Offer",
 "price": "0",
 "priceCurrency": "INR"
 },
 "featureList": [
 "Customer Inquiries & Shared Team Inbox",
 "Zero-Download Direct Browser Calling",
 "Appointment Booking & Callbacks",
 "Request & Order Tracking Hub",
 "Business Profile & QR Code Generation"
 ],
 "author": {
 "@type": "Organization",
 "name": "TalentXcel Services Pvt Ltd",
 "url": "https://talentxcel.in"
 }
 };

 // Organization schema (explicit brand disambiguation)
 const organizationSchema = {
 "@context": "https://schema.org",
 "@type": "Organization",
 "name": "CHATR",
 "alternateName": ["ChatrChat", "CHATR Customer Conversation OS", "CHATR Business OS"],
 "url": BASE_URL,
 "logo": `${BASE_URL}/assets/chatrplus-logo512.png`,
 "sameAs": [
 "https://chatr.chat"
 ],
 "description": "CHATR is the Customer Conversation Operating System helping businesses handle customer inquiries, calling, shared team inboxes, appointment booking, and request tracking.",
 "contactPoint": {
 "@type": "ContactPoint",
 "contactType": "customer service",
 "availableLanguage": ["English", "Hindi"]
 }
 };

 // WebSite schema with Sitelinks Searchbox
 const websiteSchema = {
 "@context": "https://schema.org",
 "@type": "WebSite",
 "name": "CHATR",
 "alternateName": ["ChatrChat", "CHATR Customer Conversation OS"],
 "url": BASE_URL,
 "potentialAction": {
 "@type": "SearchAction",
 "target": {
 "@type": "EntryPoint",
 "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
 },
 "query-input": "required name=search_term_string"
 }
 };

 // SiteNavigationElement schema
 const siteNavigationSchema = {
 "@context": "https://schema.org",
 "@type": "ItemList",
 "itemListElement": [
 {
 "@type": "SiteNavigationElement",
 "position": 1,
 "name": "Free Web Calling",
 "description": "Zero-download direct browser voice and video calling",
 "url": `${BASE_URL}/call`
 },
 {
 "@type": "SiteNavigationElement",
 "position": 2,
 "name": "Free Business Tools",
 "description": "WhatsApp link generator, QR code maker, and booking links",
 "url": `${BASE_URL}/tools`
 },
 {
 "@type": "SiteNavigationElement",
 "position": 3,
 "name": "Industry Solutions",
 "description": "Conversation operating systems for clinics, hotels, real estate, and D2C",
 "url": `${BASE_URL}/solutions`
 },
 {
 "@type": "SiteNavigationElement",
 "position": 4,
 "name": "Customer Hubs",
 "description": "Universal multi-action contact hub for businesses",
 "url": `${BASE_URL}/c`
 }
 ]
 };

 // Breadcrumb schema
 const breadcrumbSchema = breadcrumbList ? {
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": breadcrumbList.map((item, index) => ({
 "@type": "ListItem",
 "position": index + 1,
 "name": item.name,
 "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
 }))
 } : null;

 // Combine all schemas
 const schemas = [
 schemaData || defaultSchema,
 organizationSchema,
 websiteSchema,
 siteNavigationSchema,
 ...(breadcrumbSchema ? [breadcrumbSchema] : [])
 ];

 return (
 <Helmet>
 {/* Primary Meta Tags */}
 <title>{title}</title>
 <meta name="title" content={title} />
 <meta name="description" content={description} />
 <meta name="keywords" content={keywords} />
 
 {/* Robots */}
 {noIndex ? (
 <meta name="robots" content="noindex, nofollow" />
 ) : (
 <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
 )}
 
 {/* Canonical URL */}
 <link rel="canonical" href={canonical} />

 {/* Favicon & Web App Icons */}
 <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
 <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
 <link rel="icon" href="/favicon.ico" sizes="any" />
 <link rel="apple-touch-icon" href="/favicon.png" />
 <link rel="shortcut icon" href="/favicon.ico" />
 
 {/* Alternate Languages (for future i18n) */}
 <link rel="alternate" hrefLang="en" href={canonical} />
 <link rel="alternate" hrefLang="hi" href={`${canonical}?lang=hi`} />
 <link rel="alternate" hrefLang="x-default" href={canonical} />
 
 {/* Open Graph / Facebook */}
 <meta property="og:type" content={articleData ? 'article' : 'website'} />
 <meta property="og:url" content={fullUrl} />
 <meta property="og:title" content={title} />
 <meta property="og:description" content={description} />
 <meta property="og:image" content={absoluteOgImage} />
 <meta property="og:image:width" content="1200" />
 <meta property="og:image:height" content="630" />
 <meta property="og:site_name" content="Chatr" />
 <meta property="og:locale" content="en_IN" />
 
 {/* Article specific OG tags */}
 {articleData?.publishedTime && (
 <meta property="article:published_time" content={articleData.publishedTime} />
 )}
 {articleData?.modifiedTime && (
 <meta property="article:modified_time" content={articleData.modifiedTime} />
 )}
 {articleData?.author && (
 <meta property="article:author" content={articleData.author} />
 )}
 {articleData?.section && (
 <meta property="article:section" content={articleData.section} />
 )}
 
 {/* Twitter */}
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:site" content="@chatrapp" />
 <meta name="twitter:creator" content="@chatrapp" />
 <meta name="twitter:url" content={fullUrl} />
 <meta name="twitter:title" content={title} />
 <meta name="twitter:description" content={description} />
 <meta name="twitter:image" content={absoluteOgImage} />
 
 {/* Mobile Optimization */}
 <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
 <meta name="theme-color" content="#0EA5E9" />
 <meta name="apple-mobile-web-app-capable" content="yes" />
 <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
 <meta name="apple-mobile-web-app-title" content="Chatr" />
 
 {/* App Links — used by FB/WhatsApp to route taps directly into the native app */}
 <meta property="al:android:url" content={`chatr://${currentPath}`} />
 <meta property="al:android:package" content="com.chatr.app" />
 <meta property="al:android:app_name" content="Chatr" />
 <meta property="al:ios:url" content={`chatr://${currentPath}`} />
 <meta property="al:ios:app_name" content="Chatr" />
 <meta property="al:web:url" content={fullUrl} />
 
 {/* Schema.org Structured Data */}
 {schemas.map((schema, index) => (
 <script key={index} type="application/ld+json">
 {JSON.stringify(schema)}
 </script>
 ))}
 </Helmet>
 );
};

// Helper function to generate page-specific schema
export const generatePageSchema = (type: string, data: Record<string, any>) => {
 switch (type) {
 case 'Product':
 return {
 "@context": "https://schema.org",
 "@type": "Product",
 ...data
 };
 case 'Service':
 return {
 "@context": "https://schema.org",
 "@type": "Service",
 ...data
 };
 case 'JobPosting':
 return {
 "@context": "https://schema.org",
 "@type": "JobPosting",
 ...data
 };
 case 'MedicalOrganization':
 return {
 "@context": "https://schema.org",
 "@type": "MedicalOrganization",
 ...data
 };
 case 'FAQPage':
 return {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": data.questions?.map((q: { question: string; answer: string }) => ({
 "@type": "Question",
 "name": q.question,
 "acceptedAnswer": {
 "@type": "Answer",
 "text": q.answer
 }
 }))
 };
 default:
 return {
 "@context": "https://schema.org",
 "@type": type,
 ...data
 };
 }
};
