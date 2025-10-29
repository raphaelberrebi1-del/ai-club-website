import { next, rewrite } from '@vercel/edge';

export default function middleware(request) {
  // Get user agent from request headers
  const userAgent = request.headers.get('user-agent') || '';

  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Parse the URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // PHASE 1B: Handle home page and pricing page
  // If successful, we'll expand to all other pages

  // English Home Page
  if (pathname === '/') {
    const targetPath = isMobile ? '/mobile' : '/index';
    return rewrite(new URL(targetPath, request.url));
  }

  // Hebrew Home Page
  if (pathname === '/index-he') {
    const targetPath = isMobile ? '/mobile-he' : '/index-he';
    return rewrite(new URL(targetPath, request.url));
  }

  // Pricing Page
  if (pathname === '/pricing') {
    const targetPath = isMobile ? '/pricing-mobile' : '/pricing';
    return rewrite(new URL(targetPath, request.url));
  }

  // Let all other requests pass through unchanged
  // Other pages will continue using detect-device.js for now
  return next();
}

export const config = {
  matcher: ['/', '/index-he', '/pricing']
};
