/*
DESCRIPTION: API route for getting current user's role.
- Returns the current user's role from the database
- Used by RoleGate component and other client-side components
- Protected by authentication (requires login)
- Returns role information for authorization checks

WHAT EACH PART DOES:
1. getAuth() - Clerk function to get current user information
2. getMyRole() - Gets user's role from database
3. Response handling - Returns role as JSON
4. Error handling - Graceful error responses
5. Authentication check - Ensures user is logged in

PSEUDOCODE:
- Get current user from Clerk authentication
- If not logged in, return unauthorized error
- Get user's role from database
- Return role information as JSON
- Handle errors appropriately
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user role management function
import { getMyRole } from '@/lib/users'

// GET handler - called when someone makes a GET request to /api/users/role
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
          role: null
        },
        { status: 401 }
      )
    }
    
    // Get user's role from database
    const userRole = await getMyRole(userId)
    
    // Return role information
    return NextResponse.json({
      success: true,
      role: userRole,
      message: `User role: ${userRole}`
    })
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('User role API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        role: null
      },
      { status: 500 }
    )
  }
}
