/*
DESCRIPTION: This is the middleware file that runs before every request to your app.
- Protects routes that require authentication
- Allows public access to sign-in and sign-up pages
- Integrates with Clerk for secure authentication
- Runs on the server before pages are rendered

WHAT EACH PART DOES:
1. clerkMiddleware - Clerk's built-in middleware that handles authentication
2. publicRoutes - Array of routes that don't require authentication
3. ignoredRoutes - Routes that Clerk should completely ignore

PSEUDOCODE:
- Import Clerk's clerkMiddleware from server package
- Define which routes are public (no login required)
- Define which routes to ignore completely
- Apply authentication to all other routes
*/

// Import Clerk's authentication middleware from server package
import { clerkMiddleware } from '@clerk/nextjs/server'

// Export the middleware configuration
export default clerkMiddleware({
  // Routes that don't require authentication (anyone can access)
  publicRoutes: [
    '/',                    // Home page (dashboard) - we'll handle auth in the component
    '/sign-in(.*)',        // Sign-in page and all sub-routes (catch-all)
    '/sign-up(.*)',        // Sign-up page and all sub-routes (catch-all)
    '/sign-out(.*)',       // Sign-out page and all sub-routes (catch-all)
    '/api/dashboard/summary', // Dashboard API (we'll handle auth in the API route)
  ],
  
  // Routes that Clerk should completely ignore (no auth check at all)
  ignoredRoutes: [
    '/api/webhook/clerk',   // Clerk webhooks (if you use them)
    '/_next',              // Next.js internal files
    '/favicon.ico',        // Browser favicon
  ]
})

// Configure which routes the middleware should run on
export const config = {
  // Run middleware on all routes except static files and API routes that don't need auth
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
