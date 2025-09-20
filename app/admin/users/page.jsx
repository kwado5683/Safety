/*
DESCRIPTION: Admin users management page - Server component with role-based access.
- Displays a list of all users in the system with their current roles
- Allows admin users to update user roles via dropdown selectors
- Uses client-side JavaScript for role updates without page refresh
- Only accessible to users with 'admin' or 'owner' roles

WHAT EACH PART DOES:
1. Server component - Renders on server, checks permissions
2. User list display - Shows all users with their roles
3. Role selector - Dropdown to change user roles
4. Client-side updates - Handles role changes via API calls
5. Error handling - Shows success/error messages for updates

PSEUDOCODE:
- Check if current user has admin role
- Fetch all users from database
- Display users in a table with role selectors
- Handle role changes via PATCH API calls
- Show success/error feedback
*/

// Import Next.js components and utilities
import Link from 'next/link'

// Import Clerk's authentication function
import { auth } from '@clerk/nextjs/server'

// Import user management functions
import { getMyRole, getAllUsers } from '@/lib/users'

// Import client component for role management
import UserRoleManager from './UserRoleManager'
import DashboardLayout from '@/components/DashboardLayout'

/**
 * Admin users management page - Server component with role-based access
 * Only users with 'admin' or 'owner' role can access this page
 */
export default async function AdminUsersPage() {
  try {
    // Get current user information from Clerk
    const { userId } = await auth()
    
    // If no user is logged in, show access denied
    if (!userId) {
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You must be logged in to access the admin panel.
            </p>
            <Link href="/sign-in" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Sign In
            </Link>
          </div>
        </DashboardLayout>
      )
    }

    // Get the user's role from the database
    const myRole = await getMyRole(userId)

    if (!myRole) {
      console.error('Admin users page error fetching role: No role returned')
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Failed to retrieve your user role. Please try again.
            </p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
            </Link>
          </div>
        </DashboardLayout>
      )
    }

    // Check if the user has 'admin' or 'owner' role
    const isAdmin = ['admin', 'owner'].includes(myRole)

    if (!isAdmin) {
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Permission Denied</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You do not have the necessary permissions to access the admin panel. Your current role is <span className="font-semibold capitalize">{myRole}</span>.
            </p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
            </Link>
          </div>
        </DashboardLayout>
      )
    }

    // Fetch all users from the database
    const { success: usersSuccess, users, error: usersError } = await getAllUsers()

    if (!usersSuccess || usersError) {
      console.error('Error fetching users:', usersError)
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Failed to load users. Please try again.
            </p>
            <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Admin
            </Link>
          </div>
        </DashboardLayout>
      )
    }

    // Render the admin users management interface
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                ← Back to Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">User Management</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage user roles and permissions. You can update user roles using the dropdown selectors below.
            </p>
          </div>

        {/* Users table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              All Users ({users.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-mono">
                      {user.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <UserRoleManager 
                        userId={user.user_id} 
                        currentRole={user.role}
                        isCurrentUser={user.user_id === userId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Role Descriptions:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><strong>Worker:</strong> Basic access to view and report incidents</li>
            <li><strong>Manager:</strong> Can manage incidents and view reports</li>
            <li><strong>Admin:</strong> Full access to user management and system settings</li>
            <li><strong>Owner:</strong> Highest level access with all permissions</li>
          </ul>
        </div>
      </div>
    )

  } catch (error) {
    console.error('Admin users page error:', error)
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
      </DashboardLayout>
    )
  }
}
