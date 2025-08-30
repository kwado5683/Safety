/*
Description: Pages API route to create hazard records.
- Requires authentication via Clerk.
- Captures hazard details with risk assessment.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { title, description, location, severity, likelihood, category, status? }
- Insert into hazards with created_by
- Return { hazard }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { title, description, location, severity, likelihood, category, status } = req.body || {}
    if (!title || !description || !location || !severity || !likelihood) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = {
      title,
      description,
      location,
      severity,
      likelihood,
      category: category || null,
      status: status || 'open',
      created_by: userId,
    }

    const { data, error } = await supabaseServer
      .from('hazards')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create hazard' })
    }

    return res.status(201).json({ hazard: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}