/*
Description: Custom hook for authentication and role-based access control.
- Manages user state and role checking.
- Provides role-based permission functions.
- Handles user sync on first login.

Pseudocode:
- Load user data on mount
- Sync user if not exists in local table
- Provide role checking functions
- Return user data and permission helpers
*/
import { useEffect, useState, useCallback } from 'react'
import { useAuth as useClerkAuth } from '@clerk/nextjs'

export function useAuth() {
  const { userId, isLoaded } = useClerkAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && userId) {
      loadUser()
    } else if (isLoaded && !userId) {
      setLoading(false)
    }
  }, [isLoaded, userId, loadUser])

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else if (res.status === 404) {
        // User doesn't exist in local table, sync them
        await syncUser()
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  async function syncUser() {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to sync user:', error)
    }
  }

  const isManager = user?.role === 'manager'
  const isOfficer = user?.role === 'officer'
  const isWorker = user?.role === 'worker'
  const hasRole = (role) => user?.role === role
  const hasAnyRole = (roles) => roles.includes(user?.role)

  return {
    user,
    loading,
    isManager,
    isOfficer,
    isWorker,
    hasRole,
    hasAnyRole,
    refreshUser: loadUser,
  }
}
