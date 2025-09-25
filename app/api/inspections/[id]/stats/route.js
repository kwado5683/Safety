/*
DESCRIPTION: API route for fetching inspection statistics.
- Returns summary statistics for a specific inspection
- Includes total items, passed, failed, and critical failures count
- Used by the InspectionsList component to display stats on inspection cards

WHAT EACH PART DOES:
1. GET handler - Fetches inspection responses and calculates statistics
2. Authentication - Verifies user is logged in
3. Statistics calculation - Counts different result types and critical items

PSEUDOCODE:
- Get inspection ID from params
- Fetch all inspection responses for the inspection
- Count total items, passed, failed, and critical failures
- Return statistics object
*/

import { getAuth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'

export async function GET(request, { params }) {
  try {
    // Check authentication
    const { userId } = await getAuth(request)
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inspectionId } = await params

    if (!inspectionId) {
      return Response.json({ error: 'Inspection ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch inspection responses with checklist items
    const { data: responses, error } = await supabase
      .from('inspection_responses')
      .select(`
        result,
        checklist_items (
          critical
        )
      `)
      .eq('inspection_id', inspectionId)

    if (error) {
      console.error('Error fetching inspection responses:', error)
      return Response.json({ error: 'Failed to fetch inspection data' }, { status: 500 })
    }

    // Calculate statistics
    const total = responses.length
    const passed = responses.filter(r => r.result === 'pass').length
    const failed = responses.filter(r => r.result === 'fail').length
    const na = responses.filter(r => r.result === 'na').length
    const criticalFails = responses.filter(r => 
      r.result === 'fail' && r.checklist_items?.critical
    ).length

    return Response.json({
      total,
      passed,
      failed,
      na,
      critical_fails: criticalFails
    })

  } catch (error) {
    console.error('Inspection stats API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
