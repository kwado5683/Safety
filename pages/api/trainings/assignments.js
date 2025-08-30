/*
Description: Pages API route to list training assignments.
- Requires authentication via Clerk.
- Supports status and user filters.

Pseudocode:
- If method !== GET → 405
- Check auth; if no user → 401
- Parse page, pageSize, status, user_id from req.query
- Query training_assignments with joins to trainings
- Return { items, page, pageSize, total, totalPages }
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
    const { page = '1', pageSize = '10', status, user_id } = req.query || {}
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100)
    const from = (pageNum - 1) * sizeNum
    const to = from + sizeNum - 1

    // Count total with filters applied
    let countQuery = supabaseServer
      .from('training_assignments')
      .select('*', { count: 'exact', head: true })
    if (status) countQuery = countQuery.eq('status', status)
    if (user_id) countQuery = countQuery.eq('user_id', user_id)
    const { count = 0, error: countError } = await countQuery
    if (countError) {
      return res.status(500).json({ error: 'Failed to count assignments' })
    }

    // Fetch rows with same filters and range
    let rowsQuery = supabaseServer
      .from('training_assignments')
      .select(`
        *,
        trainings(title, description, duration, category)
      `)
      .order('due_date', { ascending: true })
      .range(from, to)
    if (status) rowsQuery = rowsQuery.eq('status', status)
    if (user_id) rowsQuery = rowsQuery.eq('user_id', user_id)

    const { data: items = [], error } = await rowsQuery
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assignments' })
    }

    const totalPages = Math.max(Math.ceil(count / sizeNum), 1)
    return res.status(200).json({ items, page: pageNum, pageSize: sizeNum, total: count, totalPages })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}