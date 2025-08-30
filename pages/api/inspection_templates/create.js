/*
Description: Pages API route to create inspection templates.
- Requires authentication via Clerk.
- Accepts template structure with checklist items.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { name, description, checklist_items[] }
- Insert into inspection_templates with created_by
- Return { template }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { name, description, checklist_items = [] } = req.body || {}
    if (!name) {
      return res.status(400).json({ error: 'Missing template name' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = {
      name,
      description: description || null,
      checklist_items,
      created_by: userId,
    }

    const { data, error } = await supabaseServer
      .from('inspection_templates')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to create template' })
    }

    return res.status(201).json({ template: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}