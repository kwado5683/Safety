/*
DESCRIPTION: User training records page.
- Lists user's training records and certificates
- Allows adding new training records
- Upload certificates to documents storage
- Mobile-first responsive design
- Shows training completion status

WHAT EACH PART DOES:
1. Server component - Fetches user's training records and available courses
2. Client component - Handles form interactions and file uploads
3. Certificate upload - Integrates with documents storage
4. Mobile optimization - Responsive layout for all screen sizes
5. Status tracking - Shows completion and expiration dates

PSEUDOCODE:
- Fetch user's training records from database
- Fetch available training courses
- Display records in responsive cards
- Provide form to add new training records
- Handle certificate file uploads
- Show completion status and dates
*/

// Import Next.js components
import Link from 'next/link'

// Import server-side functions
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import TrainingRecords from './TrainingRecords'
import DashboardLayout from '@/components/DashboardLayout'

/**
 * Server component to fetch training data
 */
async function TrainingData() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You must be logged in to view training records.
            </p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )
    }

    const supabase = createAdminClient()
    
    // Fetch user's training records
    const { data: trainingRecords, error: recordsError } = await supabase
      .from('training_records')
      .select(`
        id,
        course_id,
        user_id,
        completed_on,
        expires_on,
        certificate_url,
        training_courses (
          id,
          name,
          validity_months
        )
      `)
      .eq('user_id', userId)
      .order('completed_on', { ascending: false })

    if (recordsError) {
      console.error('Error fetching training records:', recordsError)
    }

    // Fetch available training courses
    const { data: courses, error: coursesError } = await supabase
      .from('training_courses')
      .select(`
        id,
        name,
        validity_months
      `)
      .order('name', { ascending: true })

    if (coursesError) {
      console.error('Error fetching training courses:', coursesError)
    }

    return (
      <TrainingRecords 
        trainingRecords={trainingRecords || []} 
        availableCourses={courses || []}
        userId={userId}
      />
    )
  } catch (error) {
    console.error('Error in TrainingData:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            An unexpected error occurred while loading training data.
          </p>
          <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }
}

/**
 * Main Training page
 */
export default async function TrainingPage() {
  return (
    <DashboardLayout>
      <TrainingData />
    </DashboardLayout>
  )
}
