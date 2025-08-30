/*
Description: Pages API route to assign trainings to users.
- Requires authentication via Clerk.
- Creates training assignments with due dates.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { training_id, user_id, due_date, assigned_by? }
- Insert into training_assignments
- Return { assignment }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { training_id, user_id, due_date, assigned_by } = req.body || {}
    if (!training_id || !user_id || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = {
      training_id,
      user_id,
      due_date,
      assigned_by: assigned_by || userId,
      status: 'assigned',
    }

    const { data, error } = await supabaseServer
      .from('training_assignments')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to assign training' })
    }

    return res.status(201).json({ assignment: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}