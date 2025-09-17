/*
DESCRIPTION: API route to submit inspection responses.
- Accepts inspection responses and saves them to database
- Creates incident actions for critical failures
- Updates inspection status to submitted
- Returns summary of created actions

WHAT EACH PART DOES:
1. Authentication - Verifies user is logged in
2. Validation - Checks inspection exists and belongs to user
3. Response processing - Saves responses to database
4. Incident creation - Creates actions for critical failures
5. Status update - Marks inspection as submitted

PSEUDOCODE:
- Get user from Clerk authentication
- Validate inspection exists and belongs to user
- Save all responses to inspection_responses table
- For each FAIL response on critical items, create incident action
- Update inspection status to submitted
- Return summary of created actions
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * POST handler - Submit inspection responses
 */
export async function POST(request, { params }) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Get inspection ID from URL parameters
    const { id: inspectionId } = await params
    
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const { responses } = await request.json()
    
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Missing or invalid responses data' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify inspection exists and belongs to user
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id,
        checklist_id,
        inspector_id,
        started_at,
        submitted_at,
        checklists (
          name,
          checklist_items (
            id,
            text,
            critical
          )
        )
      `)
      .eq('id', inspectionId)
      .eq('inspector_id', userId)
      .single()

    if (inspectionError || !inspection) {
      return NextResponse.json(
        { error: 'Inspection not found or access denied' },
        { status: 404 }
      )
    }

    if (inspection.submitted_at) {
      return NextResponse.json(
        { error: 'Inspection already submitted' },
        { status: 400 }
      )
    }

    // Get checklist items for critical check
    const checklistItems = inspection.checklists.checklist_items
    const itemsMap = new Map(checklistItems.map(item => [item.id, item]))

    // Save responses to database
    const responseRecords = responses.map(response => ({
      inspection_id: inspectionId,
      item_id: response.item_id,
      result: response.result,
      note: response.note || '',
      photos: response.photos || []
    }))

    const { error: responsesError } = await supabase
      .from('inspection_responses')
      .insert(responseRecords)

    if (responsesError) {
      console.error('Error saving inspection responses:', responsesError)
      return NextResponse.json(
        { error: 'Failed to save inspection responses' },
        { status: 500 }
      )
    }

    // Create incident actions for critical failures
    let createdActions = 0
    const criticalFailures = responses.filter(response => {
      const item = itemsMap.get(response.item_id)
      return response.result === 'fail' && item && item.critical
    })

    for (const failure of criticalFailures) {
      const item = itemsMap.get(failure.item_id)
      
      try {
        const { error: actionError } = await supabase
          .from('corrective_actions')
          .insert({
            incident_id: null, // No specific incident, created from inspection
            action_plan: `Inspection failure: ${item.text}`,
            corrective_action: failure.note || 'Critical item failed inspection - requires immediate attention',
            responsible_officer: null, // Unassigned for now
            target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            status: 'pending',
            priority: 'high',
            attachments: failure.photos || [],
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (!actionError) {
          createdActions++
        } else {
          console.error('Error creating corrective action:', actionError)
        }
      } catch (error) {
        console.error('Error creating corrective action:', error)
      }
    }

    // Update inspection status to submitted
    const { error: updateError } = await supabase
      .from('inspections')
      .update({
        submitted_at: new Date().toISOString()
      })
      .eq('id', inspectionId)

    if (updateError) {
      console.error('Error updating inspection status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update inspection status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Inspection submitted successfully',
      inspection_id: inspectionId,
      submitted_at: new Date().toISOString(),
      createdActions: createdActions,
      criticalFailures: criticalFailures.length
    })

  } catch (error) {
    console.error('Inspection submit API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
