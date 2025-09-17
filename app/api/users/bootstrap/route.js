/*
DESCRIPTION: API route for user profile bootstrap functionality.
- Handles user profile creation and role assignment
- Automatically assigns 'worker' role to new users
- Can be called to manually bootstrap user profiles
- Returns bootstrap status and profile information

WHAT EACH PART DOES:
1. POST method - Handles POST requests to bootstrap user profiles
2. getAuth() - Clerk function to get current user information
3. bootstrapUserProfile() - Creates profile if it doesn't exist
4. Response handling - Returns bootstrap result as JSON
5. Error handling - Graceful error responses

PSEUDOCODE:
- Get current user from Clerk authentication
- If logged in, bootstrap user profile
- Return bootstrap result with profile information
- Handle errors appropriately
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user profile bootstrap function
import { bootstrapUserProfile } from '@/lib/userBootstrap'

// POST handler - called when someone makes a POST request to /api/users/bootstrap
export async function POST(request) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No user logged in',
          message: 'User must be authenticated to bootstrap profile'
        },
        { status: 401 }
      )
    }
    
    // Bootstrap user profile (creates with 'worker' role if new)
    const bootstrapResult = await bootstrapUserProfile(request)
    
    // Return bootstrap result
    return NextResponse.json({
      success: bootstrapResult.success,
      message: bootstrapResult.message || 'User profile bootstrap completed',
      profile: bootstrapResult.profile,
      isNew: bootstrapResult.isNew,
      error: bootstrapResult.error || null
    })
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('User bootstrap API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to bootstrap user profile'
      },
      { status: 500 }
    )
  }
}

// GET handler - can be used to check bootstrap status
export async function GET(request) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No user logged in',
          message: 'User must be authenticated to check bootstrap status'
        },
        { status: 401 }
      )
    }
    
    // Import user profile functions
    const { getUserProfile } = await import('@/lib/users')
    
    // Get user profile to check if it exists
    const profileResult = await getUserProfile(userId)
    
    // Return profile status
    return NextResponse.json({
      success: profileResult.success,
      message: profileResult.profile ? 'User profile exists' : 'User profile does not exist',
      profile: profileResult.profile,
      needsBootstrap: !profileResult.profile
    })
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('User bootstrap status API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to check bootstrap status'
      },
      { status: 500 }
    )
  }
}
