/*
DESCRIPTION: This API route handles document uploads to Supabase Storage and database.
- Accepts multipart form data with file uploads
- Uploads files to Supabase Storage
- Creates document records in the database
- Handles versioning for existing documents
- Manages file metadata and organization association

WHAT EACH PART DOES:
1. Authentication - Verifies user with Clerk
2. File parsing - Handles multipart form data
3. Storage upload - Uploads files to Supabase Storage
4. Database operations - Creates/updates document records
5. Versioning - Manages document versions

PSEUDOCODE:
- Authenticate user and get organization ID
- Parse multipart form data to extract file and metadata
- Upload file to Supabase Storage with unique path
- Create or update document record in database
- Create document version record
- Return success response with document info
*/

import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single organization setup - no org_id needed

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file')
    const documentName = formData.get('name') || file?.name || 'Untitled Document'
    const existingDocumentId = formData.get('documentId') // For versioning

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const storagePath = `documents/${uniqueFilename}`
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    let documentId = existingDocumentId
    let currentVersion = 1

    // If this is a new document, create the document record
    if (!existingDocumentId) {
      const { data: newDocument, error: docError } = await supabaseServer
        .from('documents')
        .insert({
          name: documentName,
          current_version: 1
        })
        .select()
        .single()

      if (docError) {
        console.error('Document creation error:', docError)
        return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
      }

      documentId = newDocument.id
    } else {
      // Update existing document version
      const { data: existingDoc, error: fetchError } = await supabaseServer
        .from('documents')
        .select('current_version')
        .eq('id', existingDocumentId)
        .single()

      if (fetchError) {
        console.error('Document fetch error:', fetchError)
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      currentVersion = existingDoc.current_version + 1

      // Update the document's current version
      const { error: updateError } = await supabaseServer
        .from('documents')
        .update({ current_version: currentVersion })
        .eq('id', existingDocumentId)

      if (updateError) {
        console.error('Document update error:', updateError)
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
      }
    }

    // Create document version record
    const { data: versionData, error: versionError } = await supabaseServer
      .from('document_versions')
      .insert({
        document_id: documentId,
        version: currentVersion,
        storage_path: storagePath,
        uploaded_by: userId
      })
      .select()
      .single()

    if (versionError) {
      console.error('Version creation error:', versionError)
      return NextResponse.json({ error: 'Failed to create version record' }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        name: documentName,
        current_version: currentVersion,
        created_at: new Date().toISOString()
      },
      version: versionData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
