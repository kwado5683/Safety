/*
DESCRIPTION: This is an API route that creates a new corrective action in the database.
- Creates corrective action records linked to incidents
- Protected by authentication (requires login)
- Uses Clerk's getAuth() function to get current user
- Stores corrective action data in Supabase database

WHAT EACH PART DOES:
1. getAuth() - Gets the current authenticated user from Clerk
2. supabaseServer - Server-side Supabase client for database operations
3. POST handler - Creates new corrective action record
4. Validation - Validates required fields before database insertion
5. Error handling - Returns appropriate error responses

PSEUDOCODE:
- Check if user is authenticated
- Validate required fields from request body
- Insert corrective action data into database
- Return success response with created record ID
*/

import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = getAuth(request)
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      incidentId,
      actionPlan,
      correctiveAction,
      responsibleOfficer,
      targetDate,
      status,
      priority,
      attachments
    } = body

    // Validate required fields
    if (!incidentId || !actionPlan || !correctiveAction || !responsibleOfficer || !targetDate || !status || !priority) {
      return Response.json({ 
        error: 'Missing required fields: incidentId, actionPlan, correctiveAction, responsibleOfficer, targetDate, status, priority' 
      }, { status: 400 })
    }

    // Verify incident exists
    const { data: incident, error: incidentError } = await supabaseServer
      .from('incident')
      .select('id')
      .eq('id', incidentId)
      .single()

    if (incidentError || !incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 })
    }

    // Prepare corrective action data
    const correctiveActionData = {
      incident_id: parseInt(incidentId),
      action_plan: actionPlan,
      corrective_action: correctiveAction,
      responsible_officer: responsibleOfficer,
      target_date: targetDate,
      status: status,
      priority: priority,
      attachments: attachments || [],
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert corrective action into database
    const { data: newCorrectiveAction, error: insertError } = await supabaseServer
      .from('corrective_actions')
      .insert([correctiveActionData])
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return Response.json({ error: 'Failed to create corrective action' }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      correctiveAction: newCorrectiveAction,
      message: 'Corrective action created successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
