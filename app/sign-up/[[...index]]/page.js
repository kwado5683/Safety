/*
DESCRIPTION: This is the sign-up page using Clerk's catch-all route pattern.
- Uses Clerk's SignUp component for user registration
- Catch-all route handles all sign-up related paths
- Matches the styling of the sign-in page

WHAT EACH PART DOES:
1. SignUp component - Clerk's built-in registration form
2. Styling - Consistent with sign-in page design
3. Catch-all routing - Handles /sign-up, /sign-up/continue, etc.

PSEUDOCODE:
- Import Clerk's SignUp component
- Create a styled container matching sign-in design
- Render the SignUp component with proper styling
- Handle all sign-up related routes with catch-all pattern
*/

'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join our safety management platform
          </p>
        </div>

        {/* Sign-up Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl',
                card: 'shadow-none bg-transparent',
                headerTitle: 'text-gray-900 font-bold text-2xl',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 
                  'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200',
                formFieldInput: 
                  'border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link 
              href="/sign-in" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
