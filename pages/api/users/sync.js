/*
Description: API route to sync Clerk user to local users table.
- Called on first login or when user data changes.
- Creates user record with default role = 'worker'.
- Updates existing user if already exists.

Pseudocode:
- Get user data from Clerk auth
- Check if user exists in local users table
- If not exists → create with default role 'worker'
- If exists → update with latest Clerk data
- Return user record
*/
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { userId } = req.auth
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user data from Clerk
    const { user } = req.auth
    const userData = {
      clerk_user_id: userId,
      role: 'worker', // Default role
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    let result
    if (existingUser) {
      // Update existing user (no fields to update in this schema)
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('clerk_user_id', userId)
        .single()

      if (error) {
        return res.status(500).json({ error: 'Failed to update user' })
      }
      result = data
    } else {
      // Create new user
      const { data, error } = await supabaseServer
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: 'Failed to create user' })
      }
      result = data
    }

    return res.status(200).json({ user: result })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}