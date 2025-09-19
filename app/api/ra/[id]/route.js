/*
DESCRIPTION: API route for individual Risk Assessment operations.
- GET: Retrieve a specific RA with all its hazards
- PATCH: Update a specific RA and its hazards
- Handles both risk_assessments and risk_hazards tables
- Validates data and maintains referential integrity

WHAT EACH PART DOES:
1. GET method - Fetches RA with all associated hazards
2. PATCH method - Updates RA record and its hazards
3. Data validation - Ensures required fields are present
4. Database queries - Maintains data consistency
5. Error handling - Provides meaningful error messages

PSEUDOCODE:
- GET: Fetch RA by ID with all hazards
- PATCH: Update RA record, delete old hazards, insert new ones
- Validate required fields and data types
- Handle database errors gracefully
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * GET handler - Retrieve specific Risk Assessment
 */
export async function GET(request, { params }) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Get RA ID from URL parameters
    const { id: raId } = await params
    
    if (!raId) {
      return NextResponse.json(
        { error: 'Missing RA ID' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch Risk Assessment with all hazards
    const { data: ra, error: raError } = await supabase
      .from('risk_assessments')
      .select(`
        id,
        title,
        activity,
        location,
        assessor_id,
        version,
        status,
        created_at
      `)
      .eq('id', raId)
      .single()

    if (raError || !ra) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      )
    }

    // Fetch all hazards for this RA
    const { data: hazards, error: hazardsError } = await supabase
      .from('risk_hazards')
      .select(`
        id,
        hazard,
        who_might_be_harmed,
        existing_controls,
        likelihood_before,
        severity_before,
        risk_before,
        additional_controls,
        likelihood_after,
        severity_after,
        risk_after
      `)
      .eq('ra_id', raId)
      .order('created_at', { ascending: true })

    if (hazardsError) {
      console.error('Error fetching hazards:', hazardsError)
      return NextResponse.json(
        { error: 'Failed to fetch hazards' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...ra,
      hazards: hazards || [],
      message: 'Risk assessment retrieved successfully'
    })

  } catch (error) {
    console.error('RA GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler - Update specific Risk Assessment
 */
export async function PATCH(request, { params }) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Get RA ID from URL parameters
    const { id: raId } = await params
    
    if (!raId) {
      return NextResponse.json(
        { error: 'Missing RA ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const { title, activity, location, assessor_id, hazards, status } = await request.json()

    const supabase = createAdminClient()

    // Verify RA exists
    const { data: existingRa, error: fetchError } = await supabase
      .from('risk_assessments')
      .select('id, status')
      .eq('id', raId)
      .single()

    if (fetchError || !existingRa) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      )
    }

    // Check if RA is published (prevent editing)
    if (existingRa.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot edit published risk assessment' },
        { status: 400 }
      )
    }

    // Update Risk Assessment record
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (activity !== undefined) updateData.activity = activity
    if (location !== undefined) updateData.location = location
    if (assessor_id !== undefined) updateData.assessor_id = assessor_id
    if (status !== undefined) updateData.status = status

    const { data: ra, error: raError } = await supabase
      .from('risk_assessments')
      .update(updateData)
      .eq('id', raId)
      .select('id, title, version, status, created_at')
      .single()

    if (raError) {
      console.error('Error updating risk assessment:', raError)
      return NextResponse.json(
        { error: 'Failed to update risk assessment' },
        { status: 500 }
      )
    }

    // Update hazards if provided
    if (hazards && Array.isArray(hazards)) {
      // Delete existing hazards
      const { error: deleteError } = await supabase
        .from('risk_hazards')
        .delete()
        .eq('ra_id', raId)

      if (deleteError) {
        console.error('Error deleting existing hazards:', deleteError)
        return NextResponse.json(
          { error: 'Failed to update hazards' },
          { status: 500 }
        )
      }

      // Insert new hazards
      if (hazards.length > 0) {
        const hazardRecords = hazards.map(hazard => ({
          ra_id: raId,
          hazard: hazard.hazard,
          who_might_be_harmed: hazard.who_might_be_harmed,
          existing_controls: hazard.existing_controls || '',
          likelihood_before: hazard.likelihood_before || 1,
          severity_before: hazard.severity_before || 1,
          risk_before: hazard.risk_before || 1,
          additional_controls: hazard.additional_controls || '',
          likelihood_after: hazard.likelihood_after || 1,
          severity_after: hazard.severity_after || 1,
          risk_after: hazard.risk_after || 1
        }))

        const { error: hazardsError } = await supabase
          .from('risk_hazards')
          .insert(hazardRecords)

        if (hazardsError) {
          console.error('Error creating new hazards:', hazardsError)
          return NextResponse.json(
            { error: 'Failed to update hazards' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      id: ra.id,
      title: ra.title,
      version: ra.version,
      status: ra.status,
      created_at: ra.created_at,
      message: 'Risk assessment updated successfully'
    })

  } catch (error) {
    console.error('RA PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
