/*
DESCRIPTION: API route for training records management.
- GET: List user's training records
- POST: Create a new training record
- User can only access their own records
- Certificate upload integration

WHAT EACH PART DOES:
1. GET method - Fetches user's training records with course details
2. POST method - Creates new training records for the user
3. Authentication - Verifies user is logged in
4. Authorization - Users can only access their own records
5. Validation - Validates required fields

PSEUDOCODE:
- GET:
    - Get user ID from authentication
    - Fetch user's training records with course details
    - Return records list
- POST:
    - Get user ID from authentication
    - Validate required fields
    - Create new training record
    - Return created record
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * GET handler - List user's training records
 */
export async function GET(request) {
  try {
    // Get current user from Clerk
    const { userId } = await getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    
    // Fetch user's training records with course details
    const { data: records, error } = await supabase
      .from('training_records')
      .select(`
        id,
        course_id,
        user_id,
        completed_on,
        expires_on,
        certificate_url,
        training_courses (
          id,
          name,
          validity_months
        )
      `)
      .eq('user_id', userId)
      .order('completed_on', { ascending: false })

    if (error) {
      console.error('Error fetching training records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training records' },
        { status: 500 }
      )
    }

    return NextResponse.json(records || [])

  } catch (error) {
    console.error('Training records GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Create a new training record
 */
export async function POST(request) {
  try {
    // Get current user from Clerk
    const { userId } = await getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    const { course_id, completed_on, expires_on, certificate_url } = await request.json()

    // Validate required fields
    if (!course_id || !completed_on) {
      return NextResponse.json(
        { error: 'Course and completion date are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create new training record
    const { data: record, error } = await supabase
      .from('training_records')
      .insert({
        course_id,
        user_id: userId,
        completed_on,
        expires_on: expires_on || null,
        certificate_url: certificate_url || null
      })
      .select(`
        id,
        course_id,
        user_id,
        completed_on,
        expires_on,
        certificate_url,
        training_courses (
          id,
          name,
          validity_months
        )
      `)
      .single()

    if (error) {
      console.error('Error creating training record:', error)
      return NextResponse.json(
        { error: 'Failed to create training record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: record.id,
      course_id: record.course_id,
      user_id: record.user_id,
      completed_on: record.completed_on,
      expires_on: record.expires_on,
      certificate_url: record.certificate_url,
      training_courses: record.training_courses,
      message: 'Training record created successfully'
    })

  } catch (error) {
    console.error('Training records POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
