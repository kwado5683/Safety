/*
DESCRIPTION: User profile management functions for single-organization setup.
- Handles user profile creation, retrieval, and role management
- Automatically assigns 'worker' role to new users
- Provides role-based access control (RBAC) functionality
- Uses Supabase admin client for secure database operations

WHAT EACH PART DOES:
1. ensureUserProfile() - Creates user profile if it doesn't exist, assigns 'worker' role
2. getMyRole() - Retrieves current user's role from database
3. requireRole() - Validates if user has required role for access
4. Error handling - Returns consistent error responses
5. Database operations - Uses Supabase admin client for secure operations

PSEUDOCODE:
- Check if user profile exists in database
- If not exists, create new profile with 'worker' role
- Return role information for authorization checks
- Validate user permissions before allowing access
*/

// Import Supabase admin client for database operations
import { createAdminClient } from './supabaseServer'

/**
 * Ensures a user profile exists in the database
 * Creates a new profile with 'worker' role if user doesn't exist
 * 
 * @param {Object} params - Parameters object
 * @param {string} params.userId - Clerk user ID (from authentication)
 * @param {string} params.fullName - User's full name (optional)
 * @returns {Promise<Object>} Result object with success status and profile data
 */
export async function ensureUserProfile({ userId, fullName }) {
  try {
    // Get admin client for database operations
    const supabase = createAdminClient()
    
    // First, check if user profile already exists in database
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If user profile exists, return the existing profile
    if (existingProfile && !fetchError) {
      return {
        success: true,
        profile: existingProfile,
        isNew: false,
        message: 'User profile already exists'
      }
    }

    // If user doesn't exist, create new profile with 'worker' role
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: fullName || 'Unknown User',
        role: 'worker', // Default role for new users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    // Handle database insertion errors
    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return {
        success: false,
        error: insertError.message,
        profile: null,
        isNew: false
      }
    }

    // Return success with new profile data
    return {
      success: true,
      profile: newProfile,
      isNew: true,
      message: 'New user profile created with worker role'
    }

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in ensureUserProfile:', error)
    return {
      success: false,
      error: error.message,
      profile: null,
      isNew: false
    }
  }
}

/**
 * Gets the current user's role from the database
 * Returns role for authorization and access control
 * 
 * @param {string} userId - Clerk user ID to look up
 * @returns {Promise<string>} User role ('admin', 'manager', 'worker')
 */
export async function getMyRole(userId) {
  try {
    // Get admin client for database operations
    const supabase = createAdminClient()
    
    // Query database for user profile and role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    // Handle database query errors
    if (error) {
      console.error('Error fetching user role:', error)
      return 'worker' // Default to worker role if error
    }

    // Return user role or default to worker
    return profile?.role || 'worker'

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in getMyRole:', error)
    return 'worker' // Default to worker role if error
  }
}

/**
 * Validates if user has required role for access
 * Throws error if user doesn't have sufficient permissions
 * 
 * @param {string[]} allowedRoles - Array of roles that can access the resource
 * @param {string} myRole - Current user's role
 * @throws {Error} Throws 'FORBIDDEN' error if access denied
 */
export function requireRole(allowedRoles, myRole) {
  // Check if user's role is in the allowed roles list
  if (!allowedRoles.includes(myRole)) {
    throw new Error('FORBIDDEN')
  }
}

/**
 * Updates a user's role (admin functionality)
 * Allows administrators to change user roles
 * 
 * @param {string} userId - Clerk user ID to update
 * @param {string} newRole - New role to assign (worker, manager, admin, owner)
 * @returns {Promise<Object>} Result object with updated profile or error
 */
export async function updateUserRole(userId, newRole) {
  try {
    // Validate role parameter
    const validRoles = ['worker', 'manager', 'admin', 'owner']
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error: 'Invalid role. Must be one of: worker, manager, admin, owner',
        profile: null
      }
    }

    // Get admin client for database operations
    const supabase = createAdminClient()

    // Update user role in database
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    // Handle database update errors
    if (error) {
      return {
        success: false,
        error: error.message,
        profile: null
      }
    }

    // Return success with updated profile
    return {
      success: true,
      profile: updatedProfile,
      message: `User role updated to ${newRole}`
    }

  } catch (error) {
    // Handle unexpected errors
    console.error('Error updating user role:', error)
    return {
      success: false,
      error: error.message,
      profile: null
    }
  }
}

/**
 * Gets all users in the system (admin functionality)
 * Returns list of all user profiles for admin panel
 * 
 * @returns {Promise<Object>} Result object with users list or error
 */
export async function getAllUsers() {
  try {
    // Get admin client for database operations
    const supabase = createAdminClient()

    // Query database for all user profiles
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Handle database query errors
    if (error) {
      return {
        success: false,
        error: error.message,
        users: []
      }
    }

    // Return success with users list
    return {
      success: true,
      users: users,
      message: `${users.length} users retrieved successfully`
    }

  } catch (error) {
    // Handle unexpected errors
    console.error('Error fetching all users:', error)
    return {
      success: false,
      error: error.message,
      users: []
    }
  }
}
