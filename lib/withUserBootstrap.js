/*
DESCRIPTION: Higher-order function to automatically bootstrap user profiles in API routes.
- Wraps API route handlers to ensure user profiles exist
- Runs user profile bootstrap before the main API logic
- Handles errors gracefully without breaking API functionality
- Provides user profile information to the wrapped handler

WHAT EACH PART DOES:
1. withUserBootstrap() - Wraps API handlers with bootstrap functionality
2. bootstrapUserProfile() - Ensures user profile exists
3. Error handling - Graceful fallback if bootstrap fails
4. Profile injection - Provides profile data to wrapped handler
5. Silent operation - Bootstrap runs transparently

PSEUDOCODE:
- Wrap the original API handler function
- Run user profile bootstrap before main logic
- Pass profile information to the original handler
- Handle bootstrap errors gracefully
*/

// Import user profile bootstrap function
import { bootstrapUserProfile } from './userBootstrap'

/**
 * Higher-order function that wraps API route handlers with user profile bootstrap
 * Automatically ensures user profiles exist before running the main API logic
 * 
 * @param {Function} handler - The original API route handler function
 * @returns {Function} Wrapped handler that includes user profile bootstrap
 */
export function withUserBootstrap(handler) {
  return async (request, ...args) => {
    try {
      // Bootstrap user profile (ensure it exists)
      const bootstrapResult = await bootstrapUserProfile(request)
      
      // Extract user ID from request for profile injection
      const { userId } = await getAuth(request)
      
      // Create enhanced request object with profile information
      const enhancedRequest = {
        ...request,
        userProfile: bootstrapResult.profile,
        userId: userId,
        bootstrapResult: bootstrapResult
      }
      
      // Call the original handler with enhanced request
      return await handler(enhancedRequest, ...args)
      
    } catch (bootstrapError) {
      // If bootstrap fails, log error but continue with original handler
      console.error('User bootstrap failed, continuing with original handler:', bootstrapError)
      
      // Call original handler without profile information
      return await handler(request, ...args)
    }
  }
}

/**
 * Simple function to bootstrap user profile in any API route
 * Can be called directly in API route handlers
 * 
 * @param {Object} request - Next.js request object
 * @returns {Promise<Object>} Bootstrap result
 */
export async function ensureUserBootstrap(request) {
  return await bootstrapUserProfile(request)
}

// Import getAuth for use in the wrapper
import { getAuth } from '@clerk/nextjs/server'
