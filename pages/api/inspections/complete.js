/*
Description: Pages API route to complete inspections.
- Requires authentication via Clerk.
- Saves findings JSON and auto-creates corrective actions for failed items.

Pseudocode:
- If method !== POST → 405
- Check auth; if no user → 401
- Parse body { id, findings, completed_by }
- Update inspection with findings and status='completed'
- For each failed item in findings → create corrective action
- Return { inspection, actions_created }
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { id, findings, completed_by } = req.body || {}
    if (!id || !findings) {
      return res.status(400).json({ error: 'Missing inspection id or findings' })
    }

    const { userId } = req.auth || {}
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Update inspection with findings
    const { data: inspection, error: updateError } = await supabaseServer
      .from('inspections')
      .update({
        findings,
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: completed_by || userId,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return res.status(500).json({ error: 'Failed to complete inspection' })
    }

    // Auto-create corrective actions for failed items
    const actionsCreated = []
    if (Array.isArray(findings)) {
      for (const finding of findings) {
        if (finding.status === 'failed' && finding.item) {
          const actionPayload = {
            incident_id: null, // Not tied to specific incident
            title: `Inspection Finding: ${finding.item}`,
            description: finding.notes || `Failed inspection item: ${finding.item}`,
            status: 'open',
            created_by: userId,
            source: 'inspection',
            source_id: id,
          }

          const { data: action, error: actionError } = await supabaseServer
            .from('corrective_actions')
            .insert(actionPayload)
            .select()
            .single()

          if (!actionError && action) {
            actionsCreated.push(action)
          }
        }
      }
    }

    return res.status(200).json({
      inspection,
      actions_created: actionsCreated,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}