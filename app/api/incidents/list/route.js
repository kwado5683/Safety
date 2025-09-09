/*
DESCRIPTION: This is an API route that provides a list of incidents.
- Returns incidents data with optional filtering
- Protected by authentication (requires login)
- Uses Clerk's getAuth() function to get current user
- Returns mock data for demonstration purposes

WHAT EACH PART DOES:
1. getAuth() - Clerk function that gets current user information from request
2. NextRequest - Next.js utility for handling request data
3. GET method - Handles GET requests to this endpoint
4. Query parameters - Gets filters from the URL
5. Mock data - Returns sample incidents data

PSEUDOCODE:
- Check if user is authenticated
- Get filter parameters from request URL
- Apply filters to mock data
- Return filtered incidents as JSON
- Include pagination information
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

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
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    // Mock incidents data - in a real app, this would come from your database
    const mockIncidents = [
      {
        id: 1,
        title: 'Slip and Fall in Warehouse',
        status: 'open',
        category: 'slip_trip',
        description: 'Employee slipped on wet floor in warehouse area',
        created_at: '2024-01-15T10:30:00Z',
        location: 'Warehouse A',
        severity: 'medium'
      },
      {
        id: 2,
        title: 'Equipment Malfunction',
        status: 'in_progress',
        category: 'equipment',
        description: 'Forklift brake system malfunction',
        created_at: '2024-01-14T14:20:00Z',
        location: 'Loading Dock',
        severity: 'high'
      },
      {
        id: 3,
        title: 'Chemical Spill',
        status: 'resolved',
        category: 'chemical',
        description: 'Small chemical spill in laboratory',
        created_at: '2024-01-13T09:15:00Z',
        location: 'Lab B',
        severity: 'low'
      },
      {
        id: 4,
        title: 'Fire Alarm Activation',
        status: 'closed',
        category: 'fire',
        description: 'False fire alarm activation',
        created_at: '2024-01-12T16:45:00Z',
        location: 'Building C',
        severity: 'low'
      },
      {
        id: 5,
        title: 'Electrical Hazard',
        status: 'open',
        category: 'electrical',
        description: 'Exposed electrical wiring in office area',
        created_at: '2024-01-11T11:00:00Z',
        location: 'Office Floor 2',
        severity: 'high'
      }
    ]
    
    // Apply filters if provided
    let filteredIncidents = mockIncidents
    
    if (status) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.status === status
      )
    }
    
    if (category) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.category === category
      )
    }
    
    // Calculate pagination
    const totalItems = filteredIncidents.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)
    
    // Prepare response data
    const responseData = {
      items: paginatedIncidents,
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
