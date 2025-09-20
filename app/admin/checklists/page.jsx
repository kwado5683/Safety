/*
DESCRIPTION: Admin checklists management page - Server component with role-based access.
- Displays a list of all checklists with their items
- Allows admin users to create, edit, and delete checklists and items
- Mobile-responsive design with stacked cards and large tap areas
- Only accessible to users with 'admin' or 'owner' roles

WHAT EACH PART DOES:
1. Server component - Renders on server, checks permissions
2. Checklist list display - Shows all checklists with their items
3. CRUD operations - Create, edit, delete checklists and items
4. Mobile optimization - Stacked cards, large tap areas
5. Client components - Interactive forms and modals

PSEUDOCODE:
- Check if current user has admin role
- Fetch all checklists with items from database
- Display checklists in responsive layout
- Handle CRUD operations via client components
- Show success/error feedback
*/

// Import Next.js components and utilities
import Link from 'next/link'

// Import Clerk's authentication function
import { auth } from '@clerk/nextjs/server'

// Import user management functions
import { getMyRole } from '@/lib/users'

// Import client components for checklist management
import ChecklistManager from './ChecklistManager'
import DashboardLayout from '@/components/DashboardLayout'

/**
 * Admin checklists management page - Server component with role-based access
 * Only users with 'admin' or 'owner' role can access this page
 */
export default async function AdminChecklistsPage() {
  try {
    // Get current user information from Clerk
    const { userId } = await auth()
    
    // If no user is logged in, show access denied
    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Access Denied</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                You must be logged in to access the admin panel.
              </p>
              <Link href="/sign-in" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Get the user's role from the database
    const myRole = await getMyRole(userId)

    if (!myRole) {
      console.error('Admin checklists page error fetching role: No role returned')
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Failed to retrieve your user role. Please try again.
              </p>
              <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Check if the user has 'admin' or 'owner' role
    const isAdmin = ['admin', 'owner'].includes(myRole)

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Permission Denied</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                You do not have the necessary permissions to access the admin panel. Your current role is <span className="font-semibold capitalize">{myRole}</span>.
              </p>
              <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Render the admin checklists management interface
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 min-h-[calc(100vh-4rem)]">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors text-sm sm:text-base">
              ← Back to Admin
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Checklist Management</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Create and manage safety checklists with items. Toggle critical items and organize by category.
          </p>
        </div>

        {/* Checklist management component */}
        <ChecklistManager />
      </div>
    )

  } catch (error) {
    console.error('Admin checklists page error:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              An unexpected error occurred. Please try again later.
            </p>
            <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
