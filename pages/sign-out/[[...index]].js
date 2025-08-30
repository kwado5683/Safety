/*
Description: Sign-out page that handles user sign-out.
- Uses Clerk's useClerk hook to sign out the user.
- Redirects to sign-in page after successful sign-out.

Pseudocode:
- Import useClerk and useEffect from React
- Use useClerk hook to get signOut function
- Call signOut on component mount
- Redirect to sign-in page
*/
'use client'

import { useClerk } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SignOutPage() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ redirectUrl: '/sign-in' })
      } catch (error) {
        console.error('Sign out error:', error)
        router.push('/sign-in')
      }
    }
    
    performSignOut()
  }, [signOut, router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Signing out...</h2>
          <p className="text-neutral-600">Please wait while we sign you out.</p>
        </div>
      </div>
    </div>
  )
}
