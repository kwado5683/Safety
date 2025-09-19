/*
DESCRIPTION: API route to create incident actions from additional controls.
- Reads RA hazards with additional controls
- Creates corrective_actions for each additional control
- Links actions to the RA for reference
- Returns count of created actions

WHAT EACH PART DOES:
1. Authentication - Verifies user is logged in
2. Data retrieval - Fetches RA and hazards with additional controls
3. Action creation - Creates corrective_actions for each additional control
4. Response - Returns count of created actions

PSEUDOCODE:
- Get user from Clerk authentication
- Fetch RA and hazards with additional controls
- For each hazard with additional controls, create corrective action
- Return count of created actions
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * POST handler - Create actions from additional controls
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

    // Get RA ID from URL parameters
    const { id: raId } = await params
    
    if (!raId) {
      return NextResponse.json(
        { error: 'Missing RA ID' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch RA and hazards with additional controls
    const { data: ra, error: raError } = await supabase
      .from('risk_assessments')
      .select(`
        id,
        title,
        risk_hazards (
          id,
          hazard,
          additional_controls
        )
      `)
      .eq('id', raId)
      .single()

    if (raError || !ra) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      )
    }

    // Filter hazards that have additional controls
    const hazardsWithControls = ra.risk_hazards.filter(hazard => 
      hazard.additional_controls && hazard.additional_controls.trim() !== ''
    )

    if (hazardsWithControls.length === 0) {
      return NextResponse.json({
        createdActions: 0,
        message: 'No additional controls found to create actions from'
      })
    }

    // Create corrective actions for each hazard with additional controls
    let createdActions = 0
    const actionPromises = hazardsWithControls.map(async (hazard) => {
      try {
        const { error: actionError } = await supabase
          .from('corrective_actions')
          .insert({
            incident_id: null, // No specific incident, created from RA
            action_plan: `Risk Assessment Action: ${hazard.hazard} - Created from RA: ${ra.title} (ID: ${raId})`,
            corrective_action: hazard.additional_controls,
            responsible_officer: null, // Unassigned for now
            target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            status: 'pending',
            priority: 'medium',
            attachments: [],
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
    })

    // Wait for all actions to be created
    await Promise.all(actionPromises)

    return NextResponse.json({
      createdActions: createdActions,
      totalHazards: hazardsWithControls.length,
      raId: raId,
      raTitle: ra.title,
      message: `Created ${createdActions} actions from additional controls`
    })

  } catch (error) {
    console.error('RA actions creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
