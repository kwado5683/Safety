/*
Description: Pages API route to upload documents with version control.
- Accepts multipart/form-data with document file and metadata.
- Uploads to documents/ bucket and creates version records.
- Updates documents.current_version.

Pseudocode:
- Disable bodyParser for multipart handling
- Auth with Clerk; if no user → 401
- Parse multipart → get file, title, description, category
- Upload file to documents/ bucket with versioned path
- Create/update documents row and document_versions row
- Return { document, version }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export const config = {
  api: { bodyParser: false },
}

function parseForm(req) {
  return new Promise(async (resolve, reject) => {
    try {
      const formidable = await import('formidable')
      const form = formidable.default({ multiples: false, keepExtensions: true })
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    } catch (e) {
      reject(e)
    }
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { userId } = req.auth || {}
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { fields, files } = await parseForm(req)
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category
    const documentId = Array.isArray(fields.document_id) ? fields.document_id[0] : fields.document_id

    if (!title || !files.file) {
      return res.status(400).json({ error: 'Missing title or file' })
    }

    const file = files.file
    if (!file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Read file buffer
    const fs = await import('node:fs')
    const fileBuffer = await fs.promises.readFile(file.filepath)
    const contentType = file.mimetype || 'application/octet-stream'
    const fileExtension = file.originalFilename.split('.').pop()
    const fileName = file.originalFilename

    let document
    let versionNumber = 1

    if (documentId) {
      // Update existing document
      const { data: existingDoc } = await supabaseServer
        .from('documents')
        .select('current_version')
        .eq('id', documentId)
        .single()
      
      if (existingDoc) {
        versionNumber = existingDoc.current_version + 1
      }
    } else {
      // Create new document
      const { data: newDoc, error: docError } = await supabaseServer
        .from('documents')
        .insert({
          title,
          description: description || null,
          category: category || null,
          current_version: 1,
          created_by: userId,
        })
        .select()
        .single()

      if (docError) {
        return res.status(500).json({ error: 'Failed to create document' })
      }
      document = newDoc
    }

    // Upload file to storage
    const filePath = documentId 
      ? `documents/${documentId}/v${versionNumber}.${fileExtension}`
      : `documents/${document.id}/v${versionNumber}.${fileExtension}`

    const { error: uploadError } = await supabaseServer
      .storage
      .from('documents')
      .upload(filePath, fileBuffer, { contentType, upsert: true })

    if (uploadError) {
      return res.status(500).json({ error: 'Failed to upload file' })
    }

    // Get public URL
    const { data: publicData } = await supabaseServer
      .storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create version record
    const versionPayload = {
      document_id: documentId || document.id,
      version_number: versionNumber,
      file_name: fileName,
      file_path: filePath,
      file_url: publicData?.publicUrl || null,
      file_size: file.size,
      content_type: contentType,
      uploaded_by: userId,
    }

    const { data: version, error: versionError } = await supabaseServer
      .from('document_versions')
      .insert(versionPayload)
      .select()
      .single()

    if (versionError) {
      return res.status(500).json({ error: 'Failed to create version record' })
    }

    // Update document current_version if new document
    if (!documentId) {
      await supabaseServer
        .from('documents')
        .update({ current_version: versionNumber })
        .eq('id', document.id)
    } else {
      await supabaseServer
        .from('documents')
        .update({ current_version: versionNumber })
        .eq('id', documentId)
    }

    return res.status(201).json({ 
      document: document || { id: documentId },
      version 
    })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}