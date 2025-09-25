/*
DESCRIPTION: API route for creating new incidents in the database.
- Handles POST requests to create new incident records
- Validates input data and saves to PostgreSQL database
- Protected by authentication (requires login)
- Returns success/error responses

WHAT EACH PART DOES:
1. getAuth() - Clerk function that gets current user information from request
2. NextRequest - Next.js utility for handling request data
3. POST method - Handles POST requests to this endpoint
4. Data validation - Validates required fields and data types
5. Database insertion - Saves incident data to PostgreSQL via Supabase

PSEUDOCODE:
- Check if user is authenticated
- Validate request body data
- Insert incident data into database
- Return success response with incident ID
- Handle errors appropriately
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import Supabase server client
import { supabaseServer } from '@/lib/supabaseServer'

// Import email notification function
import { sendIncidentReportedEmail } from '@/lib/email'

// POST handler - called when someone makes a POST request to /api/incidents/create
export async function POST(request) {
  try {
    // Get current user information from Clerk
    const { userId } = await getAuth(request)
    
    // If no user is logged in, return unauthorized error
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const body = await request.json()
    
    // Validate required fields
    const { incidentType, severity, reportedBy, reporterPhone, timeOfIncident, location, description, imageUrl } = body
    
    if (!incidentType || !severity || !reportedBy || !reporterPhone || !timeOfIncident || !location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate incident type
    const validIncidentTypes = ['Nearmiss', 'Accident', 'Dangerous occurence']
    if (!validIncidentTypes.includes(incidentType)) {
      return NextResponse.json(
        { error: 'Invalid incident type' },
        { status: 400 }
      )
    }
    
    // Validate severity (1-5)
    const severityNum = parseInt(severity)
    if (isNaN(severityNum) || severityNum < 1 || severityNum > 5) {
      return NextResponse.json(
        { error: 'Severity must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    // Validate time of incident
    const incidentTime = new Date(timeOfIncident)
    if (isNaN(incidentTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid time of incident' },
        { status: 400 }
      )
    }
    
    // Prepare data for database insertion
    const incidentData = {
      incidenttype: incidentType,
      severity: severity,
      reportedby: reportedBy,
      reporterphone: reporterPhone,
      timeofincident: incidentTime.toISOString(),
      location: location,
      description: description,
      imageurl: imageUrl, // Optional image URL
      reporttimestamp: new Date().toISOString() // Current timestamp
    }
    
    // Insert incident into database
    const { data, error: dbError } = await supabaseServer
      .from('incident')
      .insert([incidentData])
      .select()
      .single()
    
    // Handle database errors
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create incident' },
        { status: 500 }
      )
    }

    // Send incident reported email notification
    try {
      // Get admin users to notify
      const { data: adminUsers, error: adminError } = await supabaseServer
        .from('user_profiles')
        .select('user_id, full_name')
        .in('role', ['admin', 'owner', 'manager'])

      if (adminUsers && !adminError) {
        const incidentRef = `INC-${data.id}`
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const incidentLink = `${baseUrl}/incidents/${data.id}`

        // Send email to each admin user
        for (const admin of adminUsers) {
          // For now, we'll use user_id as email since we don't have email in user_profiles
          // In a real implementation, you'd want to get email from Clerk or user_profiles
          const adminEmail = `${admin.user_id}@example.com` // Replace with actual email lookup
          
          await sendIncidentReportedEmail({
            toEmail: adminEmail,
            incidentType: incidentType,
            location: location,
            reportedBy: reportedBy,
            incidentRef: incidentRef,
            link: incidentLink
          })
        }
      }
    } catch (emailError) {
      // Don't fail the incident creation if email fails
      console.error('Error sending incident reported email:', emailError)
    }
    
    // Return success response with created incident data
    return NextResponse.json({
      success: true,
      incident: {
        id: data.id,
        incidentType: data.incidenttype,
        severity: data.severity,
        reportedBy: data.reportedby,
        reporterPhone: data.reporterphone,
        timeOfIncident: data.timeofincident,
        location: data.location,
        description: data.description,
        imageUrl: data.imageurl,
        reportTimestamp: data.reporttimestamp
      }
    }, { status: 201 })
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Incident creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
