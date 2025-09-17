/*
DESCRIPTION: Admin page for managing Risk Assessments.
- Lists all risk assessments with their status
- Provides link to create new RA
- Shows basic RA information and status
- Mobile-responsive design

WHAT EACH PART DOES:
1. Server component - Fetches RAs server-side
2. Client component - Handles interactions and state
3. List display - Shows all RAs with status indicators
4. Create button - Links to new RA creation page
5. Mobile optimization - Responsive layout

PSEUDOCODE:
- Fetch all risk assessments from database
- Display in responsive cards layout
- Show status indicators (draft/published)
- Provide create new RA button
- Handle loading and error states
*/

// Import Next.js components
import Link from 'next/link'

// Import server-side functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import RiskAssessmentManager from './RiskAssessmentManager'

/**
 * Server component to fetch risk assessments data
 */
async function RiskAssessmentData() {
  try {
    const supabase = createAdminClient()
    
    // Fetch all risk assessments
    const { data: riskAssessments, error } = await supabase
      .from('risk_assessments')
      .select(`
        id,
        title,
        activity,
        location,
        assessor_id,
        version,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching risk assessments:', error)
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Failed to load risk assessments. Please try again.
            </p>
            <Link href="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Admin
            </Link>
          </div>
        </div>
      )
    }

    return <RiskAssessmentManager riskAssessments={riskAssessments || []} />
  } catch (error) {
    console.error('Error in RiskAssessmentData:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            An unexpected error occurred while loading risk assessments.
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
 * Main Risk Assessments admin page
 */
export default function RiskAssessmentsAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Risk Assessments</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <RiskAssessmentData />
    </div>
  )
}
