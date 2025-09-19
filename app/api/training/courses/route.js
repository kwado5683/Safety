/*
DESCRIPTION: API route for training courses management.
- GET: List all training courses
- POST: Create a new training course
- Admin-only access for POST operations
- Mobile-optimized responses

WHAT EACH PART DOES:
1. GET method - Fetches all active training courses
2. POST method - Creates new training courses (admin only)
3. Authentication - Verifies user is logged in
4. Authorization - Ensures only admins can create courses
5. Validation - Validates required fields

PSEUDOCODE:
- GET:
    - Fetch all training courses from database
    - Return courses list
- POST:
    - Check user authentication
    - Verify admin role
    - Validate required fields
    - Create new course
    - Return created course
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'
import { getMyRole } from '@/lib/users'

/**
 * GET handler - List all training courses
 */
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Fetch all training courses
    const { data: courses, error } = await supabase
      .from('training_courses')
      .select(`
        id,
        name,
        validity_months
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching training courses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training courses' },
        { status: 500 }
      )
    }

    return NextResponse.json(courses || [])

  } catch (error) {
    console.error('Training courses GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Create a new training course
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

    // Check if user is admin
    const userRole = await getMyRole(userId)
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      )
    }

    const { name, validity_months } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create new training course
    const { data: course, error } = await supabase
      .from('training_courses')
      .insert({
        name,
        validity_months: validity_months || null
      })
      .select('id, name, validity_months')
      .single()

    if (error) {
      console.error('Error creating training course:', error)
      return NextResponse.json(
        { error: 'Failed to create training course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: course.id,
      name: course.name,
      validity_months: course.validity_months,
      message: 'Training course created successfully'
    })

  } catch (error) {
    console.error('Training courses POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
