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
import DashboardLayout from '@/components/DashboardLayout'

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
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Error Loading Risk Assessments
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Failed to load risk assessments. Please try again.
          </p>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Admin Dashboard
          </Link>
        </div>
      )
    }

    return <RiskAssessmentManager riskAssessments={riskAssessments || []} />
  } catch (error) {
    console.error('Error in RiskAssessmentData:', error)
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Unexpected Error
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          An unexpected error occurred while loading risk assessments.
        </p>
        <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Back to Admin Dashboard
        </Link>
      </div>
    )
  }
}

/**
 * Main Risk Assessments admin page
 */
export default function RiskAssessmentsAdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Risk Assessments
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage and create risk assessments for safety activities.
        </p>

        {/* Content */}
        <RiskAssessmentData />
      </div>
    </DashboardLayout>
  )
}
