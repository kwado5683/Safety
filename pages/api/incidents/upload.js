/*
Description: Pages API route to upload incident photos to Supabase Storage.
- Accepts multipart/form-data (FormData) with fields: incidentId, file(s).
- Stores at bucket `incident-photos/<incidentId>/<filename>`.
- Appends uploaded file entry to incident.photos JSON array.

Pseudocode:
- Disable Next bodyParser to handle multipart
- Auth with Clerk; if no user → 401
- Parse multipart via formidable → get incidentId and files[]
- For each file: read buffer and contentType; upload to Supabase storage
- Get public URL; push to photos array [{ path, url, name, size, type }]
- Update incident row photos
- Return uploaded entries
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
      const form = formidable.default({ multiples: true, keepExtensions: true })
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
    const incidentId = Array.isArray(fields.incidentId) ? fields.incidentId[0] : fields.incidentId
    if (!incidentId) {
      return res.status(400).json({ error: 'Missing incidentId' })
    }

    // Normalize to array of files
    const fileInput = files.file || files.files || files.upload || []
    const fileList = Array.isArray(fileInput) ? fileInput : [fileInput]
    if (fileList.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    // Load existing photos field
    const { data: existing, error: fetchErr } = await supabaseServer
      .from('incidents')
      .select('id, photos')
      .eq('id', incidentId)
      .single()
    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    const uploads = []
    for (const f of fileList) {
      if (!f || !f.filepath) continue
      const fs = await import('node:fs')
      const path = `incident-photos/${incidentId}/${f.originalFilename}`
      const fileBuffer = await fs.promises.readFile(f.filepath)
      const contentType = f.mimetype || 'application/octet-stream'

      const { error: upErr } = await supabaseServer
        .storage
        .from('incident-photos')
        .upload(path, fileBuffer, { contentType, upsert: true })
      if (upErr) {
        return res.status(500).json({ error: 'Upload failed' })
      }

      const { data: publicData } = await supabaseServer
        .storage
        .from('incident-photos')
        .getPublicUrl(path)

      uploads.push({
        path,
        url: publicData?.publicUrl || null,
        name: f.originalFilename,
        size: f.size,
        type: contentType,
      })
    }

    const newPhotos = Array.isArray(existing.photos) ? [...existing.photos, ...uploads] : uploads
    const { error: updErr } = await supabaseServer
      .from('incidents')
      .update({ photos: newPhotos })
      .eq('id', incidentId)
    if (updErr) {
      return res.status(500).json({ error: 'Failed to update incident photos' })
    }

    return res.status(200).json({ uploaded: uploads })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}