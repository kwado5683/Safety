/*
Description: Pages API route to create a new incident row (no photo upload).
- Requires authentication via Clerk.
- Validates HTTP method and minimal required fields.
- Inserts into Supabase `incidents` table.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse JSON body { title, description, date, severity, likelihood, status? }
- Validate required fields
- Insert row into Supabase with created_by = userId
- Return JSON { id, ... } or error
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { title, description, date, severity, likelihood, status } = req.body || {}

    if (!title || !description || !date || !severity || !likelihood) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = {
      title,
      description,
      created_at: date, // assumed client passes ISO date; adjust if needed
      severity,
      likelihood,
      status: status || 'open',
      created_by: userId,
    }

    const { data, error } = await supabaseServer
      .from('incidents')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create incident' })
    }

    return res.status(201).json({ incident: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}