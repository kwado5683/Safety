/*
DESCRIPTION: API route for checklist item creation.
- POST method: Creates a new checklist item
- Validates that the requesting user has admin privileges
- Returns the created checklist item

WHAT EACH PART DOES:
1. POST handler - Creates new checklist item
2. getAuth() - Gets current user from Clerk authentication
3. getMyRole() - Checks if current user has admin privileges
4. Database operations - Insert new checklist item
5. Response handling - Returns success/error responses

PSEUDOCODE:
- Validate admin role
- Create new checklist item with provided data
- Return created item or error response
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
 * POST handler - Creates a new checklist item
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

    // Only admin and owner roles can create checklist items
    if (!['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin privileges required' },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { checklist_id, text, critical } = body

    // Validate required fields
    if (!checklist_id) {
      return NextResponse.json(
        { error: 'Checklist ID is required' },
        { status: 400 }
      )
    }

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Verify that the checklist exists
    const { data: checklist, error: checklistError } = await supabaseServer
      .from('checklists')
      .select('id')
      .eq('id', checklist_id)
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    // Create new checklist item
    const { data: newItem, error: insertError } = await supabaseServer
      .from('checklist_items')
      .insert({
        checklist_id: checklist_id,
        text: text.trim(),
        critical: critical || false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating checklist item:', insertError)
      return NextResponse.json(
        { error: 'Failed to create checklist item' },
        { status: 500 }
      )
    }

    // Return success with new item data
    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Checklist item created successfully'
    })

  } catch (error) {
    // Handle any unexpected errors
    console.error('Checklist items POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
