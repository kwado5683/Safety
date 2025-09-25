/*
DESCRIPTION: API route for individual checklist management operations.
- GET method: Retrieves a specific checklist with its items
- PATCH method: Updates a checklist
- DELETE method: Deletes a checklist and its items
- Validates that the requesting user has admin privileges

WHAT EACH PART DOES:
1. GET handler - Fetches specific checklist with items
2. PATCH handler - Updates checklist details
3. DELETE handler - Removes checklist and all its items
4. getAuth() - Gets current user from Clerk authentication
5. getMyRole() - Checks if current user has admin privileges
6. Database operations - CRUD operations on specific checklist

PSEUDOCODE:
- GET: Fetch specific checklist with items by ID
- PATCH: Validate admin role, update checklist details
- DELETE: Validate admin role, delete checklist and items
- Return checklist data or error responses
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
 * GET handler - Retrieves a specific checklist with its items
 */
export async function GET(request, { params }) {
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

    // Only admin and owner roles can view checklists
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the checklist ID from the URL parameters
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Checklist ID is required' },
        { status: 400 }
      )
    }

    // Fetch the specific checklist with its items
    const { data: checklist, error: checklistError } = await supabaseServer
      .from('checklists')
      .select(`
        *,
        checklist_items (
          id,
          checklist_id,
          text,
          critical
        )
      `)
      .eq('id', id)
      .single()

    if (checklistError) {
      if (checklistError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Checklist not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching checklist:', checklistError)
      return NextResponse.json(
        { error: 'Failed to fetch checklist' },
        { status: 500 }
      )
    }

    // Return success with checklist data
    return NextResponse.json({
      success: true,
      checklist: checklist,
      message: 'Checklist retrieved successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler - Updates a checklist
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

    // Only admin and owner roles can update checklists
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the checklist ID from the URL parameters
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Checklist ID is required' },
        { status: 400 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { name, category, is_active } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Update the checklist
    const { data: updatedChecklist, error: updateError } = await supabaseServer
      .from('checklists')
      .update({
        name: name.trim(),
        category: category?.trim() || 'General',
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Checklist not found' },
          { status: 404 }
        )
      }
      console.error('Error updating checklist:', updateError)
      return NextResponse.json(
        { error: 'Failed to update checklist' },
        { status: 500 }
      )
    }

    // Return success with updated checklist data
    return NextResponse.json({
      success: true,
      checklist: updatedChecklist,
      message: 'Checklist updated successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Deletes a checklist and all its items
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

    // Only admin and owner roles can delete checklists
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Get the checklist ID from the URL parameters
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Checklist ID is required' },
        { status: 400 }
      )
    }

    // First, delete all checklist items
    const { error: itemsDeleteError } = await supabaseServer
      .from('checklist_items')
      .delete()
      .eq('checklist_id', id)

    if (itemsDeleteError) {
      console.error('Error deleting checklist items:', itemsDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete checklist items' },
        { status: 500 }
      )
    }

    // Then, delete the checklist
    const { error: checklistDeleteError } = await supabaseServer
      .from('checklists')
      .delete()
      .eq('id', id)

    if (checklistDeleteError) {
      console.error('Error deleting checklist:', checklistDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete checklist' },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Checklist and all items deleted successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
