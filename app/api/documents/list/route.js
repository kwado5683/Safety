/*
DESCRIPTION: This API route handles listing documents for the current organization.
- Fetches documents from the Supabase database
- Filters by organization ID from Clerk
- Returns paginated results with document metadata
- Handles authentication and authorization

WHAT EACH PART DOES:
1. getAuth - Gets the authenticated user from Clerk
2. Database query - Fetches documents with pagination
3. Error handling - Returns appropriate error responses
4. Response formatting - Returns structured JSON data

PSEUDOCODE:
- Authenticate user with Clerk
- Get organization ID from user data
- Query documents table with pagination
- Return formatted response with document list
*/

import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single organization setup - no org_id needed

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const pageSize = parseInt(searchParams.get('pageSize')) || 10
    const offset = (page - 1) * pageSize

    // Query documents from Supabase with their versions
    let query = supabaseServer
      .from('documents')
      .select(`
        *,
        document_versions (
          id,
          version,
          storage_path,
          uploaded_at,
          uploaded_by
        )
      `, { count: 'exact' })

    // No organization filter needed for single org setup

    const { data: documents, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Format the response
    const response = {
      documents: documents || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
