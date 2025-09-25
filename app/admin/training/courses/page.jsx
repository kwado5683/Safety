/*
DESCRIPTION: Admin page for managing training courses.
- CRUD operations for training courses
- Admin-only access with role validation
- Mobile-responsive design
- Course creation, editing, and deletion

WHAT EACH PART DOES:
1. Server component - Fetches courses server-side with admin validation
2. Client component - Handles CRUD operations and interactions
3. Course management - Create, edit, delete courses
4. Mobile optimization - Responsive layout for all screen sizes
5. Role validation - Ensures only admins can access

PSEUDOCODE:
- Check user role (admin only)
- Fetch all training courses
- Display courses in responsive cards
- Provide create/edit/delete functionality
- Handle loading and error states
*/

// Import Next.js components
import Link from 'next/link'

// Import server-side functions
import { auth } from '@clerk/nextjs/server'
import { getMyRole } from '@/lib/users'
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import CourseManager from './CourseManager'

/**
 * Server component to fetch training courses data
 */
async function TrainingCoursesData() {
  try {
    const supabase = createAdminClient()
    
    // Fetch all training courses
    const { data: courses, error } = await supabase
      .from('training_courses')
      .select(`
        id,
        name,
        validity_months
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching training courses:', error)
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Error</h2>
            <p className="text-slate-600 mb-6">
              Failed to load training courses. Please try again.
            </p>
            <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Admin
            </Link>
          </div>
        </div>
      )
    }

    return <CourseManager courses={courses || []} />
  } catch (error) {
    console.error('Error in TrainingCoursesData:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">
            An unexpected error occurred while loading training courses.
          </p>
          <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }
}

/**
 * Main Training Courses admin page
 */
export default async function TrainingCoursesAdminPage() {
  try {
    // Get current user information from Clerk
    const { userId } = await auth()
    
    // If no user is logged in, show access denied
    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Access Denied
              </h1>
              <p className="text-slate-600 mb-6">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Not Permitted
              </h1>
              <p className="text-slate-600 mb-2">
                You need administrator privileges to access this page.
              </p>
              <p className="text-sm text-slate-500 mb-6">
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
    
    // User is admin - show training courses admin page
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold text-slate-800">Training Courses</h1>
              <div className="w-6"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <TrainingCoursesData />
      </div>
    )
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Training courses admin page error:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Error Loading Page
            </h1>
            <p className="text-slate-600 mb-6">
              Something went wrong while loading the training courses page.
            </p>
            <Link 
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
