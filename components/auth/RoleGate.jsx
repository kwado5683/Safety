/*
DESCRIPTION: Role-based access control component for protecting content.
- Client component that checks user role before rendering content
- Shows "Not permitted" message for users without required roles
- Can be used to wrap any content that requires specific permissions
- Integrates with Clerk authentication and user role system

WHAT EACH PART DOES:
1. useUser() - Clerk hook to get current user information
2. useState/useEffect - Manages user role state and fetching
3. Role validation - Checks if user's role is in allowed roles array
4. Conditional rendering - Shows content or access denied message
5. Loading states - Handles loading and error states gracefully

PSEUDOCODE:
- Get current user from Clerk
- Fetch user's role from database
- Check if user's role is in allowed roles array
- If allowed, render children content
- If not allowed, render "Not permitted" message
- Handle loading and error states
*/

'use client'

// Import React hooks
import { useState, useEffect } from 'react'

// Import Clerk's user hook
import { useUser } from '@clerk/nextjs'

// Import Next.js Link component
import Link from 'next/link'

/**
 * RoleGate component - Protects content based on user roles
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.roles - Array of allowed roles (e.g., ['admin', 'manager'])
 * @param {React.ReactNode} props.children - Content to render if user has required role
 * @param {string} props.fallbackMessage - Custom message to show when access denied
 * @param {boolean} props.showRole - Whether to show user's current role in error message
 * @returns {React.ReactNode} Protected content or access denied message
 */
export default function RoleGate({ 
  roles = [], 
  children, 
  fallbackMessage = "You don't have permission to access this content.",
  showRole = true 
}) {
  // Get current user from Clerk
  const { user, isLoaded: userLoaded } = useUser()
  
  // State for user role and loading
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user role when user is loaded
  useEffect(() => {
    if (userLoaded && user) {
      fetchUserRole()
    } else if (userLoaded && !user) {
      // No user logged in
      setIsLoading(false)
    }
  }, [userLoaded, user])

  /**
   * Fetches user role from the database
   */
  const fetchUserRole = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Call API to get user role
      const response = await fetch('/api/users/role')
      const data = await response.json()
      
      if (data.success) {
        setUserRole(data.role)
      } else {
        setError(data.error || 'Failed to fetch user role')
        setUserRole('worker') // Default fallback
      }
    } catch (err) {
      console.error('Error fetching user role:', err)
      setError('Failed to fetch user role')
      setUserRole('worker') // Default fallback
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (!userLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600 dark:text-slate-300">Loading...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error Loading Permissions
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user is logged in
  if (!user) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Please Sign In
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            You need to be logged in to access this content.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Check if user has required role
  const hasRequiredRole = roles.includes(userRole)

  // If user has required role, render children
  if (hasRequiredRole) {
    return <>{children}</>
  }

  // User doesn't have required role - show access denied
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Not Permitted
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-2">
          {fallbackMessage}
        </p>
        {showRole && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Your current role: <span className="font-medium capitalize">{userRole}</span>
          </p>
        )}
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Required roles: <span className="font-medium">{roles.join(', ')}</span>
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
