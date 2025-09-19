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
import { sendActionAssignedEmail } from '@/lib/email'

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

    // Send assignment email if responsible officer has an email
    try {
      // Get incident details for email
      const { data: incidentDetails, error: incidentError } = await supabaseServer
        .from('incident')
        .select('incidenttype, location')
        .eq('id', incidentId)
        .single()

      if (incidentDetails && !incidentError) {
        // Check if responsible officer is a user with email
        const { data: userProfile, error: userError } = await supabaseServer
          .from('user_profiles')
          .select('user_id')
          .eq('full_name', responsibleOfficer)
          .single()

        if (userProfile && !userError) {
          // For now, we'll use the user_id as email since we don't have email in user_profiles
          // In a real implementation, you'd want to store email addresses
          const assigneeEmail = userProfile.user_id // This would be the actual email in production
          
          // Generate action details for email
          const actionTitle = `${incidentDetails.incidenttype} - ${incidentDetails.location}`
          const incidentRef = `INC-${incidentId}`
          const actionLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/incidents/${incidentId}`
          
          // Send assignment email
          const emailResult = await sendActionAssignedEmail({
            toEmail: assigneeEmail,
            title: actionTitle,
            dueDate: targetDate,
            incidentRef: incidentRef,
            link: actionLink
          })

          console.log('Action assignment email result:', emailResult)
        }
      }
    } catch (emailError) {
      // Don't fail the API call if email sending fails
      console.error('Error sending action assignment email:', emailError)
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
