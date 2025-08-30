/*
Description: Pages API route to mark training assignments as complete.
- Requires authentication via Clerk.
- Updates assignment status and completion date.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { assignment_id, completed_by? }
- Update training_assignments with status='completed'
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
    const { assignment_id, completed_by } = req.body || {}
    if (!assignment_id) {
      return res.status(400).json({ error: 'Missing assignment_id' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data, error } = await supabaseServer
      .from('training_assignments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: completed_by || userId,
      })
      .eq('id', assignment_id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to complete training' })
    }

    return res.status(200).json({ assignment: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}