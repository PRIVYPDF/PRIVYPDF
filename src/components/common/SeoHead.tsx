import React, { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  noindex?: boolean;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  breadcrumbs,
  faqs,
  noindex = false,
}) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title.includes('PrivyPDF') ? title : `${title} — PrivyPDF`;
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta description
    setMeta('name', 'description', description);

    // 3. Robots
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    // 4. OpenGraph
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://privypdf.app';
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    setMeta('property', 'og:url', canonicalUrl);

    // 5. Twitter
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', description);

    // 6. Canonical link tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 7. Structured Data (JSON-LD)
    const scriptId = 'privypdf-seo-ldjson';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PrivyPDF',
        url: baseUrl,
        description: 'Private, in-browser PDF workspace. Edit, merge, split, compress, sign, and convert PDF files without uploading to servers.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All modern web browsers',
        browserRequirements: 'Requires JavaScript and WebAssembly capable browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Client-side PDF Editing',
          'PDF Merging',
          'PDF Splitting',
          'PDF Compression',
          'Image to PDF',
          'PDF to Image',
          'Page Rotation & Deletion',
          'Watermark Insertion',
          'Client-side Document Encryption',
        ],
      },
    ];

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`,
        })),
      });
    }

    if (faqs && faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    scriptTag.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);

    return () => {
      // Optional cleanup on unmount if needed
    };
  }, [title, description, canonicalPath, ogType, breadcrumbs, faqs, noindex]);

  return null;
};
