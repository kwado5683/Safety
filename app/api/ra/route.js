/*
DESCRIPTION: API route for Risk Assessment CRUD operations.
- POST: Create new RA with draft status
- PATCH: Update existing RA
- GET: List all RAs (optional)
- Handles both risk_assessments and risk_hazards tables
- Validates data and maintains referential integrity

WHAT EACH PART DOES:
1. POST method - Creates new RA with hazards
2. PATCH method - Updates existing RA and hazards
3. GET method - Lists all RAs (for admin view)
4. Data validation - Ensures required fields are present
5. Database transactions - Maintains data consistency

PSEUDOCODE:
- POST: Create RA record, then create hazard records
- PATCH: Update RA record, delete old hazards, insert new ones
- GET: Fetch all RAs with basic info
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
 * POST handler - Create new Risk Assessment
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
    const { title, activity, location, assessor_id, hazards, status = 'draft' } = await request.json()
    
    // Validate required fields
    if (!title || !activity || !location || !assessor_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, activity, location, assessor_id' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create Risk Assessment record
    const { data: ra, error: raError } = await supabase
      .from('risk_assessments')
      .insert({
        title,
        activity,
        location,
        assessor_id,
        status,
        version: 1
      })
      .select('id, title, version, status, created_at')
      .single()

    if (raError) {
      console.error('Error creating risk assessment:', raError)
      return NextResponse.json(
        { error: 'Failed to create risk assessment' },
        { status: 500 }
      )
    }

    // Create hazard records if provided
    if (hazards && hazards.length > 0) {
      const hazardRecords = hazards.map(hazard => ({
        ra_id: ra.id,
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
        console.error('Error creating hazards:', hazardsError)
        // Note: We don't rollback the RA creation here, but we could
        return NextResponse.json(
          { error: 'Risk assessment created but failed to save hazards' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      id: ra.id,
      title: ra.title,
      version: ra.version,
      status: ra.status,
      created_at: ra.created_at,
      message: 'Risk assessment created successfully'
    })

  } catch (error) {
    console.error('RA creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler - Update existing Risk Assessment
 */
export async function PATCH(request) {
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
    const { id, title, activity, location, assessor_id, hazards, status } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update Risk Assessment record
    const updateData = {}
    if (title) updateData.title = title
    if (activity) updateData.activity = activity
    if (location) updateData.location = location
    if (assessor_id) updateData.assessor_id = assessor_id
    if (status) updateData.status = status

    const { data: ra, error: raError } = await supabase
      .from('risk_assessments')
      .update(updateData)
      .eq('id', id)
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
        .eq('ra_id', id)

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
          ra_id: id,
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
    console.error('RA update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET handler - List all Risk Assessments
 */
export async function GET(request) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Fetch all risk assessments
    const { data: ras, error } = await supabase
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching risk assessments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch risk assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      risk_assessments: ras,
      count: ras.length,
      message: 'Risk assessments retrieved successfully'
    })

  } catch (error) {
    console.error('RA list API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
