/*
DESCRIPTION: User profile bootstrap functionality for automatic role assignment.
- Automatically creates user profiles for new logged-in users
- Assigns 'worker' role by default to all new users
- Runs silently in the background without UI changes
- Ensures every authenticated user has a profile in the database

WHAT EACH PART DOES:
1. bootstrapUserProfile() - Main function that handles user profile creation
2. getAuth() - Clerk function to get current user information
3. ensureUserProfile() - Creates profile if it doesn't exist
4. Error handling - Graceful handling of bootstrap failures
5. Silent operation - No UI changes, just database setup

PSEUDOCODE:
- Get current user from Clerk authentication
- If user is logged in, ensure they have a profile
- Create profile with 'worker' role if needed
- Return success status without affecting UI
*/

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user profile management functions
import { ensureUserProfile } from './users'

/**
 * Bootstraps user profile for the current authenticated user
 * Creates a profile with 'worker' role if it doesn't exist
 * Runs silently without affecting the UI
 * 
 * @param {Object} request - Next.js request object
 * @returns {Promise<Object>} Bootstrap result with success status
 */
export async function bootstrapUserProfile(request) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return success (nothing to bootstrap)
    if (!userId) {
      return {
        success: true,
        message: 'No user logged in - bootstrap not needed',
        profile: null,
        isNew: false
      }
    }
    
    // Ensure user profile exists (creates with 'worker' role if new)
    const result = await ensureUserProfile({ 
      userId: userId,
      fullName: null // We'll let the system use 'Unknown User' as default
    })
    
    // Log bootstrap result for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('User profile bootstrap:', {
        userId: userId,
        success: result.success,
        isNew: result.isNew,
        role: result.profile?.role || 'unknown'
      })
    }
    
    return result
    
  } catch (error) {
    // Handle bootstrap errors gracefully
    console.error('User profile bootstrap error:', error)
    return {
      success: false,
      error: error.message,
      profile: null,
      isNew: false
    }
  }
}

/**
 * Bootstraps user profile with user's full name from Clerk
 * Enhanced version that includes the user's actual name
 * 
 * @param {Object} request - Next.js request object
 * @param {Object} user - Clerk user object with fullName
 * @returns {Promise<Object>} Bootstrap result with success status
 */
export async function bootstrapUserProfileWithName(request, user) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return success (nothing to bootstrap)
    if (!userId) {
      return {
        success: true,
        message: 'No user logged in - bootstrap not needed',
        profile: null,
        isNew: false
      }
    }
    
    // Extract full name from Clerk user object
    const fullName = user?.fullName || user?.firstName + ' ' + user?.lastName || 'Unknown User'
    
    // Ensure user profile exists with actual name
    const result = await ensureUserProfile({ 
      userId: userId,
      fullName: fullName
    })
    
    // Log bootstrap result for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('User profile bootstrap with name:', {
        userId: userId,
        fullName: fullName,
        success: result.success,
        isNew: result.isNew,
        role: result.profile?.role || 'unknown'
      })
    }
    
    return result
    
  } catch (error) {
    // Handle bootstrap errors gracefully
    console.error('User profile bootstrap error:', error)
    return {
      success: false,
      error: error.message,
      profile: null,
      isNew: false
    }
  }
}
