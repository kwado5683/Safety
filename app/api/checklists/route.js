/*
DESCRIPTION: API route for checklist management operations.
- GET method: Retrieves all checklists with their items
- POST method: Creates a new checklist
- Validates that the requesting user has admin privileges
- Returns checklist data with nested items

WHAT EACH PART DOES:
1. GET handler - Fetches all checklists with their items
2. POST handler - Creates new checklist with validation
3. getAuth() - Gets current user from Clerk authentication
4. getMyRole() - Checks if current user has admin privileges
5. Database operations - CRUD operations on checklists table
6. Response handling - Returns success/error responses

PSEUDOCODE:
- GET: Fetch all checklists with items from database
- POST: Validate admin role, create new checklist
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
 * GET handler - Retrieves all checklists with their items
 */
export async function GET(request) {
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

    // Only admin and owner roles can manage checklists
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Fetch all checklists with their items
    const { data: checklists, error: checklistsError } = await supabaseServer
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
      .order('name', { ascending: true })

    if (checklistsError) {
      console.error('Error fetching checklists:', checklistsError)
      return NextResponse.json(
        { error: 'Failed to fetch checklists' },
        { status: 500 }
      )
    }

    // Return success with checklists data
    return NextResponse.json({
      success: true,
      checklists: checklists || [],
      message: `${checklists?.length || 0} checklists retrieved successfully`
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklists GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Creates a new checklist
 */
export async function POST(request) {
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

    // Only admin and owner roles can create checklists
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { name, category } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create new checklist
    const { data: newChecklist, error: insertError } = await supabaseServer
      .from('checklists')
      .insert({
        name: name.trim(),
        category: category?.trim() || 'General',
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating checklist:', insertError)
      return NextResponse.json(
        { error: 'Failed to create checklist' },
        { status: 500 }
      )
    }

    // Return success with new checklist data
    return NextResponse.json({
      success: true,
      checklist: newChecklist,
      message: 'Checklist created successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklists POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
