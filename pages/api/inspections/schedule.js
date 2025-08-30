/*
Description: Pages API route to schedule inspections.
- Requires authentication via Clerk.
- Creates inspection from template with scheduled date.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { template_id, scheduled_date, location?, notes? }
- Insert into inspections with status='scheduled'
- Return { inspection }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { template_id, scheduled_date, location, notes } = req.body || {}
    if (!template_id || !scheduled_date) {
      return res.status(400).json({ error: 'Missing template_id or scheduled_date' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get template to copy checklist
    const { data: template, error: templateError } = await supabaseServer
      .from('inspection_templates')
      .select('checklist_items')
      .eq('id', template_id)
      .single()
    
    if (templateError || !template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    const payload = {
      template_id,
      scheduled_date,
      location: location || null,
      notes: notes || null,
      checklist_items: template.checklist_items,
      status: 'scheduled',
      scheduled_by: userId,
    }

    const { data, error } = await supabaseServer
      .from('inspections')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to schedule inspection' })
    }

    return res.status(201).json({ inspection: data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}