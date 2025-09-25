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
import { Suspense } from 'react'

// Import server-side functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import RiskAssessmentView from './RiskAssessmentView'
import DashboardLayout from '@/components/DashboardLayout'

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
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Risk Assessment Not Found</h2>
            <p className="text-slate-600 mb-6">
              The requested risk assessment could not be found.
            </p>
            <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Risk Assessments
            </Link>
          </div>
        </DashboardLayout>
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
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Error Loading Hazards</h2>
            <p className="text-slate-600 mb-6">
              Failed to load risk assessment hazards. Please try again.
            </p>
            <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Risk Assessments
            </Link>
          </div>
        </DashboardLayout>
      )
    }

    return <RiskAssessmentView ra={ra} hazards={hazards || []} />
  } catch (error) {
    console.error('Error in RiskAssessmentData:', error)
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">
            An unexpected error occurred while loading the risk assessment.
          </p>
          <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Risk Assessments
          </Link>
        </div>
      </DashboardLayout>
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
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Invalid Risk Assessment ID</h2>
          <p className="text-slate-600 mb-6">
            The risk assessment ID is missing or invalid.
          </p>
          <Link href="/admin/risk-assessments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Risk Assessments
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/risk-assessments"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Risk Assessments
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Risk Assessment</h1>

        {/* Content */}
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 bg-slate-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded mb-4 w-1/2"></div>
          </div>
        }>
          <RiskAssessmentData raId={raId} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
