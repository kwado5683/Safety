/*
DESCRIPTION: This is an API route that fetches a single incident by ID from the database.
- Returns incident data for a specific incident ID
- Protected by authentication (requires login)
- Uses Clerk's getAuth() function to get current user
- Queries Supabase database for incident details

WHAT EACH PART DOES:
1. getAuth() - Gets the current authenticated user from Clerk
2. supabaseServer - Server-side Supabase client for database operations
3. GET handler - Fetches incident data by ID from the database
4. Error handling - Returns appropriate error responses

PSEUDOCODE:
- Check if user is authenticated
- Get incident ID from URL parameters
- Query database for incident with matching ID
- Transform data to match frontend format
- Return incident data or error response
*/

import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(request, { params }) {
  try {
    // Check authentication
    const { userId } = getAuth(request)
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incidentId = params.id

    if (!incidentId) {
      return Response.json({ error: 'Incident ID is required' }, { status: 400 })
    }

    // Fetch incident from database
    const { data: incident, error } = await supabaseServer
      .from('incident')
      .select('*')
      .eq('id', incidentId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch incident' }, { status: 500 })
    }

    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 })
    }

    // Transform data to match frontend format
    const transformedIncident = {
      id: incident.id,
      incidentType: incident.incidenttype,
      severity: incident.severity,
      reportedBy: incident.reportedby,
      reporterPhone: incident.reporterphone,
      timeOfIncident: incident.timeofincident,
      location: incident.location,
      description: incident.description,
      imageUrl: incident.imageurl,
      reportTimestamp: incident.reporttimestamp,
      // Add computed fields for UI
      hasImage: !!incident.imageurl,
      imagePreview: incident.imageurl ? {
        url: incident.imageurl,
        alt: `Incident image for ${incident.incidenttype} at ${incident.location}`
      } : null
    }

    return Response.json({ incident: transformedIncident })

  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
