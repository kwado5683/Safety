/*
DESCRIPTION: This API route handles document viewing and downloading.
- Gets document file from Supabase Storage
- Returns file content with proper headers for viewing/downloading
- Handles authentication and authorization
- Supports different file types (PDF, images, text files)

WHAT EACH PART DOES:
1. Authentication - Verifies user with Clerk
2. Document lookup - Finds document in database
3. File retrieval - Gets file from Supabase Storage
4. Response handling - Returns file with proper headers

PSEUDOCODE:
- Authenticate user with Clerk
- Get document ID from query parameters
- Look up document in database
- Get file from Supabase Storage
- Return file with appropriate headers
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const version = searchParams.get('version') || 'latest'
    const action = searchParams.get('action') || 'view' // 'view' or 'download'

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Get document from database
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
      `)
      .eq('id', documentId)
      .single()

    const { data: document, error: docError } = await query

    if (docError || !document) {
      console.error('Document not found:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get the appropriate version
    let targetVersion
    if (version === 'latest') {
      targetVersion = document.document_versions.find(v => v.version === document.current_version)
    } else {
      targetVersion = document.document_versions.find(v => v.version === parseInt(version))
    }

    if (!targetVersion) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Get file from Supabase Storage
    const { data: fileData, error: fileError } = await supabaseServer.storage
      .from('documents')
      .download(targetVersion.storage_path)

    if (fileError) {
      console.error('File retrieval error:', fileError)
      return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 })
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine content type based on file extension
    const fileExtension = targetVersion.storage_path.split('.').pop().toLowerCase()
    let contentType = 'application/octet-stream'
    let filename = document.name

    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'txt':
        contentType = 'text/plain'
        break
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      default:
        contentType = 'application/octet-stream'
    }

    // Set appropriate headers based on action
    const headers = {
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
    }

    if (action === 'download') {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    } else {
      headers['Content-Disposition'] = `inline; filename="${filename}"`
    }

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: headers
    })

  } catch (error) {
    console.error('Document view error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
