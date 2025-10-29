import { next, rewrite } from '@vercel/edge';

export default function middleware(request) {
  // Get user agent from request headers
  const userAgent = request.headers.get('user-agent') || '';

  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Parse the URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // PHASE 2: Device-specific routing for all pages
  // Server-side rewrites based on device detection

  // HOME PAGES
  if (pathname === '/') {
    const targetPath = isMobile ? '/mobile' : '/index';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/index-he') {
    const targetPath = isMobile ? '/mobile-he' : '/index-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // PRICING PAGES
  if (pathname === '/pricing') {
    const targetPath = isMobile ? '/pricing-mobile' : '/pricing';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/pricing-he-desktop') {
    const targetPath = isMobile ? '/pricing-mobile-he' : '/pricing-he-desktop';
    return rewrite(new URL(targetPath, request.url));
  }

  // CURRICULUM PAGES
  if (pathname === '/curriculum') {
    const targetPath = isMobile ? '/curriculum-mobile' : '/curriculum';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/curriculum-he-desktop') {
    const targetPath = isMobile ? '/curriculum-mobile-he' : '/curriculum-he-desktop';
    return rewrite(new URL(targetPath, request.url));
  }

  // FAQ PAGES
  if (pathname === '/faq') {
    const targetPath = isMobile ? '/faq-mobile' : '/faq';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/faq-he') {
    const targetPath = isMobile ? '/faq-mobile-he' : '/faq-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // TERMS PAGES
  if (pathname === '/terms') {
    const targetPath = isMobile ? '/terms-mobile' : '/terms';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/terms-he') {
    const targetPath = isMobile ? '/terms-mobile-he' : '/terms-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // PRIVACY PAGES
  if (pathname === '/privacy') {
    const targetPath = isMobile ? '/privacy-mobile' : '/privacy';
    return rewrite(new URL(targetPath, request.url));
  }

  if (pathname === '/privacy-he') {
    const targetPath = isMobile ? '/privacy-mobile-he' : '/privacy-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // Let all other requests pass through unchanged
  return next();
}

export const config = {
  matcher: [
    '/',
    '/index-he',
    '/pricing',
    '/pricing-he-desktop',
    '/curriculum',
    '/curriculum-he-desktop',
    '/faq',
    '/faq-he',
    '/terms',
    '/terms-he',
    '/privacy',
    '/privacy-he'
  ]
};
