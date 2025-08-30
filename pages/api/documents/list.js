/*
Description: Pages API route to list documents with latest versions.
- Requires authentication via Clerk.
- Returns documents with current version info.

Pseudocode:
- If method !== GET → 405
- Check auth; if no user → 401
- Parse page, pageSize, category from req.query
- Query documents with latest version info
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
    const { page = '1', pageSize = '10', category } = req.query || {}
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100)
    const from = (pageNum - 1) * sizeNum
    const to = from + sizeNum - 1

    // Count total with filters applied
    let countQuery = supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
    if (category) countQuery = countQuery.eq('category', category)
    const { count = 0, error: countError } = await countQuery
    if (countError) {
      return res.status(500).json({ error: 'Failed to count documents' })
    }

    // Fetch documents with latest version info
    let rowsQuery = supabaseServer
      .from('documents')
      .select(`
        *,
        document_versions!inner(
          version_number,
          file_name,
          file_url,
          file_size,
          content_type,
          uploaded_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (category) rowsQuery = rowsQuery.eq('category', category)

    const { data: items = [], error } = await rowsQuery
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch documents' })
    }

    // Process items to get latest version
    const processedItems = items.map(item => {
      const versions = Array.isArray(item.document_versions) ? item.document_versions : [item.document_versions]
      const latestVersion = versions.reduce((latest, version) => 
        version.version_number > latest.version_number ? version : latest
      )
      
      return {
        ...item,
        latest_version: latestVersion,
        document_versions: undefined // Remove the full versions array
      }
    })

    const totalPages = Math.max(Math.ceil(count / sizeNum), 1)
    return res.status(200).json({ 
      items: processedItems, 
      page: pageNum, 
      pageSize: sizeNum, 
      total: count, 
      totalPages 
    })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}