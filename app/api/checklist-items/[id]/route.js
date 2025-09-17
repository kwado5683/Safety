/*
DESCRIPTION: API route for individual checklist item management operations.
- PATCH method: Updates a checklist item
- DELETE method: Deletes a checklist item
- Validates that the requesting user has admin privileges

WHAT EACH PART DOES:
1. PATCH handler - Updates checklist item details
2. DELETE handler - Removes checklist item
3. getAuth() - Gets current user from Clerk authentication
4. getMyRole() - Checks if current user has admin privileges
5. Database operations - CRUD operations on specific checklist item
6. Response handling - Returns success/error responses

PSEUDOCODE:
- PATCH: Validate admin role, update checklist item details
- DELETE: Validate admin role, delete checklist item
- Return item data or error responses
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user role management functions
import { getMyRole } from '@/lib/users'

// Import Supabase server client
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * PATCH handler - Updates a checklist item
 */
export async function PATCH(request, { params }) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Check if current user has admin privileges
    const currentUserRole = await getMyRole(userId)
    
    if (!currentUserRole) {
      console.error('Error checking current user role: No role returned')
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      )
    }

    // Only admin and owner roles can update checklist items
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the item ID from the URL parameters
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { text, critical } = body

    // Validate required fields
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Update the checklist item
    const { data: updatedItem, error: updateError } = await supabaseServer
      .from('checklist_items')
      .update({
        text: text.trim(),
        critical: critical || false
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Checklist item not found' },
          { status: 404 }
        )
      }
      console.error('Error updating checklist item:', updateError)
      return NextResponse.json(
        { error: 'Failed to update checklist item' },
        { status: 500 }
      )
    }

    // Return success with updated item data
    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Checklist item updated successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist item PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Deletes a checklist item
 */
export async function DELETE(request, { params }) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Check if current user has admin privileges
    const currentUserRole = await getMyRole(userId)
    
    if (!currentUserRole) {
      console.error('Error checking current user role: No role returned')
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      )
    }

    // Only admin and owner roles can delete checklist items
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the item ID from the URL parameters
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Delete the checklist item
    const { error: deleteError } = await supabaseServer
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting checklist item:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete checklist item' },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Checklist item deleted successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist item DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
