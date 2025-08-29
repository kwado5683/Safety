/*
Description: Pages API for CRUD of corrective actions tied to an incident.
- Requires authentication via Clerk.
- Supports methods:
  - GET: list actions by incidentId (?incidentId=...)
  - POST: create action ({ incident_id, title, description?, due_date?, status? })
  - PUT: update action (?id=...) with body fields
  - DELETE: delete action (?id=...)

Pseudocode:
- If not GET/POST/PUT/DELETE → 405
- Check auth; if no user → 401
- Switch by method:
  - GET: validate incidentId, query corrective_actions filtered + ordered
  - POST: validate incident_id, title; insert row with created_by
  - PUT: validate id; update allowed fields
  - DELETE: validate id; delete row
- Return JSON or error
*/
import { requireAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '../../../lib/supabaseServer'

export default requireAuth(async function handler(req, res) {
  const { userId } = req.auth || {}
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    if (req.method === 'GET') {
      const { incidentId, status } = req.query || {}
      if (!incidentId) {
        return res.status(400).json({ error: 'Missing incidentId' })
      }
      let query = supabaseServer
        .from('corrective_actions')
        .select('*')
        .eq('incident_id', incidentId)
        .order('due_date', { ascending: true })
      if (status) query = query.eq('status', status)
      const { data = [], error } = await query
      if (error) return res.status(500).json({ error: 'Failed to fetch actions' })
      return res.status(200).json({ items: data })
    }

    if (req.method === 'POST') {
      const { incident_id, title, description, due_date, status } = req.body || {}
      if (!incident_id || !title) {
        return res.status(400).json({ error: 'Missing incident_id or title' })
      }
      const payload = {
        incident_id,
        title,
        description: description || null,
        due_date: due_date || null,
        status: status || 'open',
        created_by: userId,
      }
      const { data, error } = await supabaseServer
        .from('corrective_actions')
        .insert(payload)
        .select()
        .single()
      if (error) return res.status(500).json({ error: 'Failed to create action' })
      return res.status(201).json({ action: data })
    }

    if (req.method === 'PUT') {
      const { id } = req.query || {}
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { title, description, due_date, status } = req.body || {}
      const updates = {}
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (due_date !== undefined) updates.due_date = due_date
      if (status !== undefined) updates.status = status
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }
      const { data, error } = await supabaseServer
        .from('corrective_actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) return res.status(500).json({ error: 'Failed to update action' })
      return res.status(200).json({ action: data })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query || {}
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { error } = await supabaseServer
        .from('corrective_actions')
        .delete()
        .eq('id', id)
      if (error) return res.status(500).json({ error: 'Failed to delete action' })
      return res.status(204).end()
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
})


