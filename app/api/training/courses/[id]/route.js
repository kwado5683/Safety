/*
DESCRIPTION: API route for individual training course operations.
- GET: Retrieve a specific training course
- PATCH: Update a training course (admin only)
- DELETE: Delete a training course (admin only)
- Admin-only access for PATCH and DELETE operations

WHAT EACH PART DOES:
1. GET method - Fetches a specific course by ID
2. PATCH method - Updates course details (admin only)
3. DELETE method - Deletes a course (admin only)
4. Authentication - Verifies user is logged in
5. Authorization - Ensures only admins can modify courses

PSEUDOCODE:
- GET:
    - Get course ID from params
    - Fetch course from database
    - Return course data
- PATCH:
    - Get course ID from params
    - Check admin authorization
    - Update course details
    - Return updated course
- DELETE:
    - Get course ID from params
    - Check admin authorization
    - Delete course
    - Return success message
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'
import { getMyRole } from '@/lib/users'

/**
 * GET handler - Retrieve a specific training course
 */
export async function GET(request, { params }) {
  try {
    const { id: courseId } = await params

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the training course
    const { data: course, error } = await supabase
      .from('training_courses')
      .select(`
        id,
        name,
        validity_months
      `)
      .eq('id', courseId)
      .single()

    if (error || !course) {
      console.error('Error fetching training course:', error?.message || 'Course not found')
      return NextResponse.json({ error: 'Training course not found' }, { status: 404 })
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error('Training course GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH handler - Update a training course
 */
export async function PATCH(request, { params }) {
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

    const { id: courseId } = await params
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const { name, validity_months } = await request.json()

    const supabase = createAdminClient()

    // Build update data object
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (validity_months !== undefined) updateData.validity_months = validity_months

    // Update training course
    const { data: course, error } = await supabase
      .from('training_courses')
      .update(updateData)
      .eq('id', courseId)
      .select('id, name, validity_months')
      .single()

    if (error || !course) {
      console.error('Error updating training course:', error?.message || 'Course not found')
      return NextResponse.json(
        { error: 'Failed to update training course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: course.id,
      name: course.name,
      validity_months: course.validity_months,
      message: 'Training course updated successfully'
    })

  } catch (error) {
    console.error('Training course PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Delete a training course
 */
export async function DELETE(request, { params }) {
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

    const { id: courseId } = await params
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Delete training course
    const { error } = await supabase
      .from('training_courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting training course:', error)
      return NextResponse.json(
        { error: 'Failed to delete training course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Training course deleted successfully'
    })

  } catch (error) {
    console.error('Training course DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
