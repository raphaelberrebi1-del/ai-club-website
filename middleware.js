import { next, rewrite } from '@vercel/edge';

export default function middleware(request) {
  // Get user agent from request headers
  const userAgent = request.headers.get('user-agent') || '';

  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Parse the URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // PHASE 1: Only handle /pricing page as proof of concept
  // If successful, we'll expand to all other pages

  if (pathname === '/pricing') {
    // Rewrite to appropriate version based on device
    const targetPath = isMobile ? '/pricing-mobile.html' : '/pricing.html';

    // Rewrite (not redirect) - URL stays /pricing but serves different file
    return rewrite(new URL(targetPath, request.url));
  }

  // Let all other requests pass through unchanged
  // Other pages will continue using detect-device.js for now
  return next();
}

export const config = {
  matcher: '/pricing'
};
