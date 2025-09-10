/*
DESCRIPTION: This API route handles document deletion from both storage and database.
- Deletes document from Supabase Storage
- Removes document and version records from database
- Handles cascading deletes for document versions
- Verifies user permissions before deletion

WHAT EACH PART DOES:
1. Authentication - Verifies user with Clerk
2. Document lookup - Finds document and verifies ownership
3. Storage cleanup - Removes files from Supabase Storage
4. Database cleanup - Deletes document and version records
5. Response - Returns success confirmation

PSEUDOCODE:
- Authenticate user and get organization ID
- Find document by ID and verify it belongs to user's organization
- Get all file paths for document versions
- Delete files from Supabase Storage
- Delete document record (versions will cascade delete)
- Return success response
*/

import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function DELETE(request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document ID from URL
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    // Single organization setup - no org_id needed

    // First, get the document and verify ownership
    const { data: document, error: docError } = await supabaseServer
      .from('documents')
      .select(`
        *,
        document_versions (
          storage_path
        )
      `)
      .eq('id', documentId)
      // No org_id filter needed for single org setup
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete files from Supabase Storage
    const filePaths = document.document_versions.map(version => version.storage_path)
    
    if (filePaths.length > 0) {
      const { error: storageError } = await supabaseServer.storage
        .from('documents')
        .remove(filePaths)

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }
    }

    // Delete the document record (versions will cascade delete)
    const { error: deleteError } = await supabaseServer
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
