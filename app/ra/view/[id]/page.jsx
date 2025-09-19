/*
DESCRIPTION: Risk Assessment view page to display published or draft RAs.
- Displays complete RA information with all hazards
- Shows risk scores with color coding
- Mobile-first responsive design
- Read-only view for published RAs
- Edit link for draft RAs

WHAT EACH PART DOES:
1. Server component - Fetches RA data server-side
2. Client component - Handles interactions and state
3. Risk display - Shows risk matrix with color coding
4. Mobile optimization - Responsive layout
5. Navigation - Back links and edit options

PSEUDOCODE:
- Fetch RA and hazards from database
- Display RA details and all hazards
- Show risk scores with color indicators
- Provide edit link for draft RAs
- Handle loading and error states
*/

// Import Next.js components
import Link from 'next/link'

// Import server-side functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import RiskAssessmentView from './RiskAssessmentView'

/**
 * Server component to fetch risk assessment data
 */
async function RiskAssessmentData({ raId }) {
  try {
    const supabase = createAdminClient()
    
    // Fetch Risk Assessment with all hazards
    const { data: ra, error: raError } = await supabase
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
      .eq('id', raId)
      .single()

    if (raError || !ra) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Risk Assessment Not Found</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The requested risk assessment could not be found.
            </p>
            <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Risk Assessments
            </Link>
          </div>
        </div>
      )
    }

    // Fetch all hazards for this RA
    const { data: hazards, error: hazardsError } = await supabase
      .from('risk_hazards')
      .select(`
        id,
        hazard,
        who_might_be_harmed,
        existing_controls,
        likelihood_before,
        severity_before,
        risk_before,
        additional_controls,
        likelihood_after,
        severity_after,
        risk_after
      `)
      .eq('ra_id', raId)
      .order('id', { ascending: true })

    if (hazardsError) {
      console.error('Error fetching hazards:', hazardsError)
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error Loading Hazards</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Failed to load risk assessment hazards. Please try again.
            </p>
            <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Risk Assessments
            </Link>
          </div>
        </div>
      )
    }

    return <RiskAssessmentView ra={ra} hazards={hazards || []} />
  } catch (error) {
    console.error('Error in RiskAssessmentData:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            An unexpected error occurred while loading the risk assessment.
          </p>
          <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Risk Assessments
          </Link>
        </div>
      </div>
    )
  }
}

/**
 * Main Risk Assessment view page
 */
export default async function ViewRiskAssessmentPage({ params }) {
  const { id: raId } = await params
  
  if (!raId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Invalid Risk Assessment ID</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            The risk assessment ID is missing or invalid.
          </p>
          <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Risk Assessments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/risk-assessments" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Risk Assessment</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <RiskAssessmentData raId={raId} />
    </div>
  )
}
