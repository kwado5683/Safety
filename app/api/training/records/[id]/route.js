/*
DESCRIPTION: API route for individual training record operations.
- GET: Retrieve a specific training record
- PATCH: Update a training record (user can only update their own)
- DELETE: Delete a training record (user can only delete their own)
- User authorization for record access

WHAT EACH PART DOES:
1. GET method - Fetches a specific record by ID
2. PATCH method - Updates record details (owner only)
3. DELETE method - Deletes a record (owner only)
4. Authentication - Verifies user is logged in
5. Authorization - Ensures users can only access their own records

PSEUDOCODE:
- GET:
    - Get record ID from params
    - Fetch record from database
    - Return record data
- PATCH:
    - Get record ID from params
    - Check user ownership
    - Update record details
    - Return updated record
- DELETE:
    - Get record ID from params
    - Check user ownership
    - Delete record
    - Return success message
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * GET handler - Retrieve a specific training record
 */
export async function GET(request, { params }) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    const { id: recordId } = await params

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the training record
    const { data: record, error } = await supabase
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
      .eq('id', recordId)
      .eq('user_id', userId)
      .single()

    if (error || !record) {
      console.error('Error fetching training record:', error?.message || 'Record not found')
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 })
    }

    return NextResponse.json(record)

  } catch (error) {
    console.error('Training record GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH handler - Update a training record
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

    const { id: recordId } = await params
    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 })
    }

    const { completed_on, expires_on, certificate_url } = await request.json()

    const supabase = createAdminClient()

    // Build update data object
    const updateData = {}
    if (completed_on !== undefined) updateData.completed_on = completed_on
    if (expires_on !== undefined) updateData.expires_on = expires_on
    if (certificate_url !== undefined) updateData.certificate_url = certificate_url

    // Update training record (only if user owns it)
    const { data: record, error } = await supabase
      .from('training_records')
      .update(updateData)
      .eq('id', recordId)
      .eq('user_id', userId)
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

    if (error || !record) {
      console.error('Error updating training record:', error?.message || 'Record not found or not owned by user')
      return NextResponse.json(
        { error: 'Failed to update training record' },
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
      message: 'Training record updated successfully'
    })

  } catch (error) {
    console.error('Training record PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Delete a training record
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

    const { id: recordId } = await params
    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Delete training record (only if user owns it)
    const { error } = await supabase
      .from('training_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting training record:', error)
      return NextResponse.json(
        { error: 'Failed to delete training record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Training record deleted successfully'
    })

  } catch (error) {
    console.error('Training record DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
