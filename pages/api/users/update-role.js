/*
Description: API route to update user roles (managers only).
- Requires manager role to access.
- Updates user role in users table.

Pseudocode:
- Check if current user has manager role
- Validate target user exists
- Update user role
- Return updated user
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { userId } = req.auth
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { user_id, role } = req.body || {}
    if (!user_id || !role) {
      return res.status(400).json({ error: 'Missing user_id or role' })
    }

    // Validate role
    if (!['worker', 'officer', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
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

    // Update user role
    const { data: updatedUser, error } = await supabaseServer
      .from('users')
      .update({ role })
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update user role' })
    }

    return res.status(200).json({ user: updatedUser })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}