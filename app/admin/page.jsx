/*
DESCRIPTION: Admin dashboard page with role-based access control.
- Server component that checks user role before rendering
- Shows "Not permitted" message for non-admin users
- Displays admin tabs: Users, Checklists, Training
- Uses getMyRole() to determine user permissions

WHAT EACH PART DOES:
1. getAuth() - Clerk function to get current user information
2. getMyRole() - Gets user's role from database
3. Role validation - Checks if user has 'admin' role
4. Conditional rendering - Shows admin interface or access denied
5. Tab navigation - Provides access to different admin sections

PSEUDOCODE:
- Get current user from Clerk authentication
- Get user's role from database
- If role is not 'admin', show "Not permitted" message
- If role is 'admin', show admin dashboard with tabs
- Handle loading and error states gracefully
*/

// Import Next.js utilities
import Link from 'next/link'

// Import Clerk's authentication function
import { auth } from '@clerk/nextjs/server'

// Import user role management function
import { getMyRole } from '@/lib/users'

// Import RoleGate component for additional protection
import RoleGate from '@/components/auth/RoleGate'

/**
 * Admin dashboard page - Server component with role-based access
 * Only users with 'admin' role can access this page
 */
export default async function AdminPage() {
  try {
    // Get current user information from Clerk
    // Note: In server components, we use auth() instead of getAuth()
    const { userId } = await auth()
    
    // If no user is logged in, show access denied
    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Access Denied
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                You must be logged in to access the admin panel.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }
    
    // Get user's role from database
    const userRole = await getMyRole(userId)
    
    // If user is not admin, show access denied
    if (userRole !== 'admin') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Not Permitted
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                You need administrator privileges to access this page.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Your current role: <span className="font-medium capitalize">{userRole}</span>
              </p>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }
    
    // User is admin - show admin dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Admin Header */}
          <div className="mb-8">
            {/* Navigation breadcrumb */}
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Safety Dashboard
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage users, checklists, training programs, and risk assessments
            </p>
          </div>
          
          {/* Admin Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <nav className="flex space-x-8 px-6" aria-label="Admin Tabs">
                <Link
                  href="/admin/users"
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  Users
                </Link>
                <Link
                  href="/admin/checklists"
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  Checklists
                </Link>
                <Link
                  href="/admin/training"
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  Training
                </Link>
                <Link
                  href="/admin/risk-assessments"
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  Risk Assessments
                </Link>
              </nav>
            </div>
            
            {/* Admin Content */}
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Welcome to Admin Panel
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Select a tab above to manage different aspects of the system.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Users</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Manage user accounts and roles
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Checklists</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Create and manage inspection checklists
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Training</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Manage training programs and records
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Risk Assessments</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Create and manage risk assessments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Admin page error:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Error Loading Admin Panel
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Something went wrong while loading the admin panel.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
