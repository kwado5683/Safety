/*
Description: Pages API route to list document versions history.
- Requires authentication via Clerk.
- Returns all versions of a specific document.

Pseudocode:
- If method !== GET → 405
- Check auth; if no user → 401
- Parse document_id from req.query
- Query document_versions for the document
- Return { versions }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  
  try {
    // Get authentication info
    const { userId } = await getAuth(req)
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { document_id } = req.query || {}
    if (!document_id) {
      return res.status(400).json({ error: 'Missing document_id' })
    }

    const { data: versions = [], error } = await supabaseServer
      .from('document_versions')
      .select('*')
      .eq('document_id', document_id)
      .order('version_number', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch versions' })
    }

    return res.status(200).json({ versions })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}