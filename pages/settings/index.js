/*
Description: Settings page for user management and role changes.
- Shows current user profile.
- Allows managers to promote users to manager role.
- Simple interface for MVP.

Pseudocode:
- Load current user data
- If manager role → show user management
- If worker role → show profile only
- Handle role updates via API
*/
import { useEffect, useState } from 'react'
import ClientLayout from '../../components/ClientLayout'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    setLoading(true)
    const res = await fetch('/api/users/me')
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
      
      // If manager, load all users
      if (data.user.role === 'manager') {
        await loadAllUsers()
      }
    }
    setLoading(false)
  }

  async function loadAllUsers() {
    const res = await fetch('/api/users/list')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }

  async function updateUserRole(userId, newRole) {
    setUpdating(true)
    const res = await fetch('/api/users/update-role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    })

    if (res.ok) {
      await loadAllUsers() // Refresh the list
    } else {
      alert('Failed to update user role')
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">Loading...</div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Current User Profile */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
          {user && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-700">User ID</label>
                <div className="text-neutral-900 font-mono text-sm">{user.clerk_user_id}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Role</label>
                <div className="text-neutral-900">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === 'manager' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'officer'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Management (Managers Only) */}
        {user?.role === 'manager' && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">
                      User {u.id.slice(0, 8)}...
                    </div>
                    <div className="text-sm text-neutral-600 font-mono">{u.clerk_user_id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === 'manager' 
                        ? 'bg-purple-100 text-purple-800' 
                        : u.role === 'officer'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                    {u.id !== user.id && (
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={updating}
                        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                                               <option value="worker">Worker</option>
                       <option value="officer">Officer</option>
                       <option value="manager">Manager</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions for Workers */}
        {user?.role === 'worker' && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Need Manager Access?</h2>
            <p className="text-neutral-600">
              Contact your system administrator to be promoted to manager role. 
              Managers can access additional features like user management and system settings.
            </p>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}
