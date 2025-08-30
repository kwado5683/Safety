/*
Description: API route to list all users (managers only).
- Requires manager role to access.
- Returns list of all users with roles.

Pseudocode:
- Check if current user has manager role
- Query all users from users table
- Return users list
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
    const { userId } = req.auth
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if current user is manager
    const { data: currentUser, error: userError } = await supabaseServer
      .from('users')
      .select('role')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (currentUser.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Manager role required.' })
    }

    // Get all users
    const { data: users, error } = await supabaseServer
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' })
    }

    return res.status(200).json({ users })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}