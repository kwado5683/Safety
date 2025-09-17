/*
DESCRIPTION: API route to start a new inspection.
- Creates a new inspection record in the database
- Returns the inspection_id for subsequent operations
- Validates checklist exists and is active
- Requires user authentication

WHAT EACH PART DOES:
1. Authentication - Verifies user is logged in
2. Validation - Checks checklist exists and is active
3. Database operation - Creates new inspection record
4. Response - Returns inspection_id for client use

PSEUDOCODE:
- Get user from Clerk authentication
- Validate checklist exists and is active
- Create new inspection record with current timestamp
- Return inspection_id to client
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * POST handler - Start a new inspection
 */
export async function POST(request) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Parse request body
    const { checklistId } = await request.json()
    
    if (!checklistId) {
      return NextResponse.json(
        { error: 'Missing required field: checklistId' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify checklist exists and is active
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('id, name, is_active')
      .eq('id', checklistId)
      .eq('is_active', true)
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json(
        { error: 'Checklist not found or not active' },
        { status: 404 }
      )
    }

    // Check if inspection already exists for this user and checklist
    const { data: existingInspection, error: existingError } = await supabase
      .from('inspections')
      .select('id, started_at, submitted_at')
      .eq('checklist_id', checklistId)
      .eq('inspector_id', userId)
      .is('submitted_at', null) // Not yet submitted
      .single()

    if (existingInspection && !existingError) {
      // Return existing inspection ID
      return NextResponse.json({
        inspection_id: existingInspection.id,
        message: 'Existing inspection found',
        started_at: existingInspection.started_at
      })
    }

    // Create new inspection
    const { data: newInspection, error: createError } = await supabase
      .from('inspections')
      .insert({
        checklist_id: checklistId,
        inspector_id: userId,
        started_at: new Date().toISOString()
      })
      .select('id, started_at')
      .single()

    if (createError) {
      console.error('Error creating inspection:', createError)
      return NextResponse.json(
        { error: 'Failed to create inspection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      inspection_id: newInspection.id,
      message: 'Inspection started successfully',
      started_at: newInspection.started_at
    })

  } catch (error) {
    console.error('Inspection start API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
