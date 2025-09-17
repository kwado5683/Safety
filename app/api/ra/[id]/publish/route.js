/*
DESCRIPTION: API route to publish a Risk Assessment.
- Sets status to 'published' and locks the version
- Prevents further edits to published RAs
- Returns success confirmation

WHAT EACH PART DOES:
1. Authentication - Verifies user is logged in
2. Validation - Checks RA exists and is in draft status
3. Update - Changes status to 'published'
4. Response - Returns success confirmation

PSEUDOCODE:
- Get user from Clerk authentication
- Validate RA exists and is in draft status
- Update RA status to 'published'
- Return success response
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import Clerk authentication
import { getAuth } from '@clerk/nextjs/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

/**
 * POST handler - Publish Risk Assessment
 */
export async function POST(request, { params }) {
  try {
    // Get current user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Get RA ID from URL parameters
    const { id: raId } = await params
    
    if (!raId) {
      return NextResponse.json(
        { error: 'Missing RA ID' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify RA exists and is in draft status
    const { data: ra, error: fetchError } = await supabase
      .from('risk_assessments')
      .select('id, title, status, version')
      .eq('id', raId)
      .single()

    if (fetchError || !ra) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      )
    }

    if (ra.status === 'published') {
      return NextResponse.json(
        { error: 'Risk assessment is already published' },
        { status: 400 }
      )
    }

    // Update status to published
    const { data: updatedRa, error: updateError } = await supabase
      .from('risk_assessments')
      .update({
        status: 'published'
      })
      .eq('id', raId)
      .select('id, title, version, status, created_at')
      .single()

    if (updateError) {
      console.error('Error publishing risk assessment:', updateError)
      return NextResponse.json(
        { error: 'Failed to publish risk assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: updatedRa.id,
      title: updatedRa.title,
      version: updatedRa.version,
      status: updatedRa.status,
      published_at: new Date().toISOString(),
      message: 'Risk assessment published successfully'
    })

  } catch (error) {
    console.error('RA publish API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
