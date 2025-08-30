/*
Description: Pages API route to create training records.
- Requires authentication via Clerk.
- Captures training details and content.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { title, description, content, duration, category }
- Insert into trainings with created_by
- Return { training }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { title, description, content, duration, category } = req.body || {}
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = {
      title,
      description,
      content: content || null,
      duration: duration || null,
      category: category || null,
      created_by: userId,
    }

    const { data, error } = await supabaseServer
      .from('trainings')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create training' })
    }

    return res.status(201).json({ training: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}