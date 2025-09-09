/*
DESCRIPTION: This is the sign-out page using Clerk's catch-all route pattern.
- Handles user sign-out functionality
- Uses useClerk hook for programmatic sign-out
- Redirects to sign-in page after successful sign-out

WHAT EACH PART DOES:
1. useClerk hook - Provides access to Clerk's signOut function
2. useEffect - Automatically signs out user when page loads
3. Loading state - Shows loading message during sign-out process
4. Redirect - Sends user to sign-in page after sign-out

PSEUDOCODE:
- Import useClerk hook and useEffect
- Create a client component for sign-out handling
- Use useEffect to call signOut when component mounts
- Show loading message during the process
- Redirect to sign-in page after completion
*/

'use client'

import { useClerk } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut()
        // Redirect to sign-in page after successful sign-out
        router.push('/sign-in')
      } catch (error) {
        console.error('Error signing out:', error)
        // Still redirect even if there's an error
        router.push('/sign-in')
      }
    }

    handleSignOut()
  }, [signOut, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Signing you out...
          </h2>
          <p className="text-gray-600">
            Please wait while we sign you out of your account.
          </p>
        </div>
      </div>
    </div>
  )
}
