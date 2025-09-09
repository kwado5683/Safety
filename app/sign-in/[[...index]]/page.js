/*
DESCRIPTION: This is the sign-in page using Clerk's catch-all route pattern.
- Uses Clerk's SignIn component for authentication
- Catch-all route handles all sign-in related paths
- Styled with gradients and modern design

WHAT EACH PART DOES:
1. SignIn component - Clerk's built-in sign-in form
2. Styling - Modern gradient background and glassmorphism effects
3. Catch-all routing - Handles /sign-in, /sign-in/continue, etc.

PSEUDOCODE:
- Import Clerk's SignIn component
- Create a styled container with gradient background
- Render the SignIn component with proper styling
- Handle all sign-in related routes with catch-all pattern
*/

'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your safety dashboard
          </p>
        </div>

        {/* Sign-in Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <SignIn 
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
            Don't have an account?{' '}
            <a 
              href="/sign-up" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
