import { next, rewrite } from '@vercel/edge';

export default function middleware(request) {
  // Get user agent from request headers
  const userAgent = request.headers.get('user-agent') || '';

  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Parse the URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Device-specific routing with clean language-based URLs
  // English pages: /page | Hebrew pages: /he/page

  // ENGLISH HOME PAGE
  if (pathname === '/') {
    const targetPath = isMobile ? '/mobile' : '/index';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW HOME PAGE
  if (pathname === '/he') {
    const targetPath = isMobile ? '/mobile-he' : '/index-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // ENGLISH PRICING
  if (pathname === '/pricing') {
    const targetPath = isMobile ? '/pricing-mobile' : '/pricing';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW PRICING
  if (pathname === '/he/pricing') {
    const targetPath = isMobile ? '/pricing-mobile-he' : '/pricing-he-desktop';
    return rewrite(new URL(targetPath, request.url));
  }

  // ENGLISH CURRICULUM
  if (pathname === '/curriculum') {
    const targetPath = isMobile ? '/curriculum-mobile' : '/curriculum';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW CURRICULUM
  if (pathname === '/he/curriculum') {
    const targetPath = isMobile ? '/curriculum-mobile-he' : '/curriculum-he-desktop';
    return rewrite(new URL(targetPath, request.url));
  }

  // ENGLISH FAQ
  if (pathname === '/faq') {
    const targetPath = isMobile ? '/faq-mobile' : '/faq';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW FAQ
  if (pathname === '/he/faq') {
    const targetPath = isMobile ? '/faq-mobile-he' : '/faq-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // ENGLISH TERMS
  if (pathname === '/terms') {
    const targetPath = isMobile ? '/terms-mobile' : '/terms';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW TERMS
  if (pathname === '/he/terms') {
    const targetPath = isMobile ? '/terms-mobile-he' : '/terms-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // ENGLISH PRIVACY
  if (pathname === '/privacy') {
    const targetPath = isMobile ? '/privacy-mobile' : '/privacy';
    return rewrite(new URL(targetPath, request.url));
  }

  // HEBREW PRIVACY
  if (pathname === '/he/privacy') {
    const targetPath = isMobile ? '/privacy-mobile-he' : '/privacy-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // Let all other requests pass through unchanged
  return next();
}

export const config = {
  matcher: [
    '/',
    '/he',
    '/pricing',
    '/he/pricing',
    '/curriculum',
    '/he/curriculum',
    '/faq',
    '/he/faq',
    '/terms',
    '/he/terms',
    '/privacy',
    '/he/privacy'
  ]
};
