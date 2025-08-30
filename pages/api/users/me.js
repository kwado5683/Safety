/*
Description: API route to get current user's profile and role.
- Returns user data from local users table.
- Includes role for permission checking.

Pseudocode:
- Get userId from Clerk auth
- Query local users table by clerk_user_id
- Return user data with role
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

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}