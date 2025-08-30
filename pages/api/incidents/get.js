/*
Description: Pages API route to fetch a single incident by id.
- Requires authentication via Clerk.
- Expects query param `id`.

Pseudocode:
- If method !== GET → 405
- Check auth; if no user → 401
- Read id from req.query; validate
- Query Supabase incidents by id → single
- If no row → 404
- Return { incident }
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
    const { id } = req.query || {}
    if (!id) {
      return res.status(400).json({ error: 'Missing id' })
    }

    const { data, error } = await supabaseServer
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is PostgREST No rows found
      return res.status(500).json({ error: 'Failed to fetch incident' })
    }
    if (!data) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    return res.status(200).json({ incident: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}