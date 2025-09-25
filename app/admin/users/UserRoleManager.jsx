'use client'
/*
DESCRIPTION: Client component for managing user roles in the admin panel.
- Displays a dropdown selector for user roles
- Handles role updates via API calls
- Shows loading states and success/error messages
- Prevents users from changing their own role

WHAT EACH PART DOES:
1. useState - Manages loading state and success/error messages
2. handleRoleChange - Makes API call to update user role
3. Role selector - Dropdown with all available roles
4. Feedback display - Shows success/error messages
5. Disabled state - Prevents self-role changes

PSEUDOCODE:
- Show role selector dropdown
- On change, make PATCH request to API
- Show loading state during update
- Display success/error message
- Disable selector for current user
*/

import { useState } from 'react'

/**
 * UserRoleManager component - Handles role updates for individual users
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - The user ID to update
 * @param {string} props.currentRole - The user's current role
 * @param {boolean} props.isCurrentUser - Whether this is the current user (prevents self-updates)
 */
export default function UserRoleManager({ userId, currentRole, isCurrentUser }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  // Available roles in the system
  const availableRoles = [
    { value: 'worker', label: 'Worker' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' }
  ]

  /**
   * Handles role change when user selects a new role from dropdown
   * Makes API call to update the user's role
   */
  const handleRoleChange = async (newRole) => {
    // Don't allow users to change their own role
    if (isCurrentUser) {
      setMessage('Cannot change your own role')
      setMessageType('error')
      return
    }

    // Don't update if role hasn't changed
    if (newRole === currentRole) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // Make PATCH request to update user role
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - show success message
        setMessage(`Role updated to ${newRole}`)
        setMessageType('success')
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('')
          setMessageType('')
        }, 3000)
      } else {
        // Error - show error message
        setMessage(data.error || 'Failed to update role')
        setMessageType('error')
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage('')
          setMessageType('')
        }, 5000)
      }
    } catch (error) {
      // Network or other error
      console.error('Error updating user role:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Role selector dropdown */}
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={isLoading || isCurrentUser}
        className={`text-sm border rounded-md px-3 py-1 ${
          isCurrentUser 
            ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
            : 'bg-white text-slate-900 border-slate-300 hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
        } transition-colors duration-200`}
      >
        {availableRoles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-xs text-slate-500">
          Updating...
        </div>
      )}

      {/* Success/Error message */}
      {message && (
        <div className={`text-xs ${
          messageType === 'success' 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {message}
        </div>
      )}

      {/* Current user indicator */}
      {isCurrentUser && (
        <div className="text-xs text-slate-500">
          (Current user)
        </div>
      )}
    </div>
  )
}
