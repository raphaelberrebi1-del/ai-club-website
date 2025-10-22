/**
 * AI Club - Automatic Mobile/Desktop Detection and Redirect
 *
 * This script automatically detects whether the user is on a mobile or desktop device
 * and redirects them to the appropriate version of the page.
 */

(function() {
    'use strict';

    // Configuration
    const MOBILE_BREAKPOINT = 768; // pixels - matches Tailwind's md breakpoint
    const REDIRECT_KEY = 'aiclub_device_redirect';

    /**
     * Detects if the user is on a mobile device
     * Uses both screen width and user agent detection for accuracy
     */
    function isMobileDevice() {
        // Check screen width
        const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;

        // Check user agent for mobile devices
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

        // Consider it mobile if either condition is true
        return isMobileWidth || isMobileUserAgent;
    }

    /**
     * Checks if we should redirect based on current page and device type
     */
    function shouldRedirect() {
        // Check if we've already redirected in this session (prevent loops)
        const hasRedirected = sessionStorage.getItem(REDIRECT_KEY);
        if (hasRedirected === 'true') {
            return false;
        }

        const currentPath = window.location.pathname;
        const isMobile = isMobileDevice();

        // If on desktop page and using mobile device, should redirect to mobile
        if (isMobile && !currentPath.includes('-mobile') && !currentPath.includes('/mobile')) {
            return true;
        }

        // If on mobile page and using desktop device, should redirect to desktop
        if (!isMobile && (currentPath.includes('-mobile') || currentPath.includes('/mobile'))) {
            return true;
        }

        return false;
    }

    /**
     * Gets the appropriate redirect URL based on current page and device
     */
    function getRedirectUrl() {
        const currentPath = window.location.pathname;
        const isMobile = isMobileDevice();
        let newPath = currentPath;

        if (isMobile) {
            // Redirect to mobile version
            if (currentPath === '/' || currentPath === '/index.html') {
                newPath = '/mobile.html';
            } else if (currentPath === '/index-he.html') {
                newPath = '/mobile-he.html';
            } else if (currentPath === '/pricing.html') {
                newPath = '/pricing-mobile.html';
            } else if (currentPath === '/pricing-he-desktop.html') {
                newPath = '/pricing-mobile-he.html';
            } else if (currentPath === '/curriculum.html') {
                newPath = '/curriculum-mobile.html';
            } else if (currentPath === '/curriculum-he.html') {
                newPath = '/curriculum-mobile-he.html';
            } else if (currentPath === '/faq.html') {
                newPath = '/faq-mobile.html';
            } else if (currentPath === '/faq-he.html') {
                newPath = '/faq-mobile-he.html';
            } else if (currentPath === '/terms.html') {
                newPath = '/terms-mobile.html';
            } else if (currentPath === '/terms-he.html') {
                newPath = '/terms-mobile-he.html';
            } else if (currentPath === '/privacy.html') {
                newPath = '/privacy-mobile.html';
            } else if (currentPath === '/privacy-he.html') {
                newPath = '/privacy-mobile-he.html';
            }
        } else {
            // Redirect to desktop version
            if (currentPath === '/mobile.html') {
                newPath = '/index.html';
            } else if (currentPath === '/mobile-he.html') {
                newPath = '/index-he.html';
            } else if (currentPath === '/pricing-mobile.html') {
                newPath = '/pricing.html';
            } else if (currentPath === '/pricing-mobile-he.html') {
                newPath = '/pricing-he-desktop.html';
            } else if (currentPath === '/curriculum-mobile.html') {
                newPath = '/curriculum.html';
            } else if (currentPath === '/curriculum-mobile-he.html') {
                newPath = '/curriculum-he.html';
            } else if (currentPath === '/faq-mobile.html') {
                newPath = '/faq.html';
            } else if (currentPath === '/faq-mobile-he.html') {
                newPath = '/faq-he.html';
            } else if (currentPath === '/terms-mobile.html') {
                newPath = '/terms.html';
            } else if (currentPath === '/terms-mobile-he.html') {
                newPath = '/terms-he.html';
            } else if (currentPath === '/privacy-mobile.html') {
                newPath = '/privacy.html';
            } else if (currentPath === '/privacy-mobile-he.html') {
                newPath = '/privacy-he.html';
            }
        }

        // Preserve hash and search params
        return newPath + window.location.search + window.location.hash;
    }

    /**
     * Performs the redirect
     */
    function redirect() {
        if (shouldRedirect()) {
            const newUrl = getRedirectUrl();

            // Mark that we've redirected to prevent loops
            sessionStorage.setItem(REDIRECT_KEY, 'true');

            // Perform the redirect
            window.location.replace(newUrl);
        }
    }

    // Execute redirect check immediately on page load
    redirect();

    // Also check on window resize (in case user rotates device or resizes browser)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Clear the redirect flag on resize to allow re-detection
            sessionStorage.removeItem(REDIRECT_KEY);
            redirect();
        }, 250);
    });

})();
