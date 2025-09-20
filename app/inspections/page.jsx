/*
DESCRIPTION: Main inspections page that lists all completed inspections.
- Fetches and displays all inspections with their status and results
- Shows inspection details like checklist name, inspector, dates
- Provides links to view inspection details and download PDF reports
- Mobile-first responsive design with proper contrast for dark mode

WHAT EACH PART DOES:
1. Server component that fetches inspection data from Supabase
2. Displays inspections in a responsive card layout
3. Shows inspection status, dates, and summary statistics
4. Provides action buttons for viewing details and downloading PDFs

PSEUDOCODE:
- Fetch all inspections with checklist and response data
- Calculate pass/fail statistics for each inspection
- Render inspection cards with status and action buttons
- Handle loading and error states
*/

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import InspectionsList from './InspectionsList'
import DashboardLayout from '@/components/DashboardLayout'

export default async function InspectionsPage() {
  // Check authentication
  const { userId } = await auth()
  
  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please Sign In</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">You need to be signed in to view inspections.</p>
          <Link href="/sign-in" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const supabase = createAdminClient()

  // Fetch all inspections with checklist information
  const { data: inspections, error } = await supabase
    .from('inspections')
    .select(`
      id,
      checklist_id,
      inspector_id,
      started_at,
      submitted_at,
      checklists (
        id,
        name,
        category
      )
    `)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching inspections:', error)
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Error Loading Inspections
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            There was a problem loading the inspections. Please try again later.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Inspections
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              View and manage safety inspections
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link
              href="/inspections/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Inspection
            </Link>
          </div>
        </div>

        {/* Inspections List */}
        <InspectionsList inspections={inspections || []} />
      </div>
    </DashboardLayout>
  )
}
