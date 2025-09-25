/*
DESCRIPTION: Admin training management index page.
- Redirects to training courses management
- Provides overview of training system
- Admin-only access with role validation
*/

// Import Next.js components
import Link from 'next/link'

// Import server-side functions
import { auth } from '@clerk/nextjs/server'
import { getMyRole } from '@/lib/users'

/**
 * Admin Training Management Index Page
 */
export default async function AdminTrainingPage() {
  try {
    // Get current user information from Clerk
    const { userId } = await auth()
    
    // If no user is logged in, show access denied
    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You must be logged in to access the admin panel.
            </p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )
    }

    // Check if user is admin
    const userRole = await getMyRole(userId)
    if (userRole !== 'admin') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You need admin privileges to access the training management panel.
            </p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )
    }

    // Admin training management page
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Navigation breadcrumb */}
            <div className="mb-4">
              <Link href="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Admin Panel
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Training Management
            </h1>
            <p className="text-slate-600">
              Manage training courses and track employee training records
            </p>
          </div>

          {/* Training Management Options */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Training Courses Card */}
                <Link 
                  href="/admin/training/courses"
                  className="group block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      Training Courses
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Create, edit, and manage training courses. Set course names and validity periods.
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Manage Courses
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>

                {/* Training Records Overview Card */}
                <div className="group block p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Training Records
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    View and manage employee training completion records and certificates.
                  </p>
                  <div className="text-green-600 text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Training System Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-800">Courses</div>
                    <div className="text-sm text-slate-600">Manage training courses</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-800">Records</div>
                    <div className="text-sm text-slate-600">Track completions</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-800">Certificates</div>
                    <div className="text-sm text-slate-600">Upload & manage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

  } catch (error) {
    console.error('Error in AdminTrainingPage:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">
            An unexpected error occurred while loading the training management panel.
          </p>
          <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }
}
