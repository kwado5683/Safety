/*
DESCRIPTION: API route for admin user management operations.
- PATCH method: Updates a user's role in the user_profiles table
- Validates that the requesting user has admin privileges
- Validates that the new role is one of the allowed values
- Returns the updated user profile

WHAT EACH PART DOES:
1. PATCH handler - Updates user role with validation
2. getAuth() - Gets current user from Clerk authentication
3. getMyRole() - Checks if current user has admin privileges
4. Role validation - Ensures new role is valid (worker, manager, admin, owner)
5. Database update - Updates user_profiles table with new role
6. Response handling - Returns success/error responses

PSEUDOCODE:
- Get current user from Clerk
- Check if current user has admin role
- Validate new role parameter
- Update user role in database
- Return updated user profile or error
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user role management functions
import { getMyRole, updateUserRole } from '@/lib/users'

/**
 * PATCH handler - Updates a user's role
 * Only admin users can update other users' roles
 */
export async function PATCH(request, { params }) {
  try {
    // Get current user information from Clerk
    const { userId: currentUserId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Check if current user has admin privileges
    const { success: roleCheckSuccess, role: currentUserRole, error: roleError } = await getMyRole(currentUserId)
    
    if (!roleCheckSuccess || roleError) {
      console.error('Error checking current user role:', roleError)
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      )
    }

    // Only admin and owner roles can update user roles
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the user ID from the URL parameters
    const { userId } = params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Parse the request body to get the new role
    const body = await request.json()
    const { role: newRole } = body

    // Validate that new role is provided
    if (!newRole) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate that the new role is one of the allowed values
    const allowedRoles = ['worker', 'manager', 'admin', 'owner']
    if (!allowedRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Prevent users from changing their own role (security measure)
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Update the user's role in the database
    const { success, profile: updatedProfile, error: updateError } = await updateUserRole(userId, newRole)

    if (!success || updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    // Return success with updated profile
    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: updatedProfile
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Admin user update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
