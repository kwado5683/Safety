/*
DESCRIPTION: This is an API route that provides a list of incidents from the database.
- Returns incidents data with optional filtering
- Protected by authentication (requires login)
- Uses Clerk's getAuth() function to get current user
- Fetches real data from Supabase database
- Includes image previews for incidents with images

WHAT EACH PART DOES:
1. getAuth() - Clerk function that gets current user information from request
2. NextRequest - Next.js utility for handling request data
3. GET method - Handles GET requests to this endpoint
4. Query parameters - Gets filters from the URL
5. Database query - Fetches incidents from Supabase
6. Image handling - Includes image URLs for preview

PSEUDOCODE:
- Check if user is authenticated
- Get filter parameters from request URL
- Query database for incidents with filters
- Return incidents with image previews as JSON
- Include pagination information
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import Supabase server client
import { supabaseServer } from '@/lib/supabaseServer'

// GET handler - called when someone makes a GET request to /api/incidents/list
export async function GET(request) {
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
    
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const incidentType = searchParams.get('incidentType')
    const severity = searchParams.get('severity')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    // Build query for Supabase
    let query = supabaseServer
      .from('incident')
      .select('*')
      .order('reporttimestamp', { ascending: false })
    
    // Apply filters if provided
    if (incidentType) {
      query = query.eq('incidenttype', incidentType)
    }
    
    if (severity) {
      query = query.eq('severity', severity)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    // Get total count for pagination
    const { count } = await supabaseServer
      .from('incident')
      .select('*', { count: 'exact', head: true })
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize - 1
    
    query = query.range(startIndex, endIndex)
    
    // Execute the query
    const { data: incidents, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      )
    }
    
    // Transform the data to match our form structure
    const transformedIncidents = incidents.map(incident => ({
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
    }))
    
    // Calculate pagination
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / pageSize)
    
    // Prepare response data
    const responseData = {
      items: transformedIncidents,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
    
    // Return the incidents data as JSON
    return NextResponse.json(responseData)
    
  } catch (error) {
    // If something goes wrong, return a server error
    console.error('Incidents API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
