/*
DESCRIPTION: Risk Management landing page.
- Provides overview of risk management features
- Links to create new risk assessments
- Links to view existing risk assessments
- Mobile-first responsive design
- Uses DashboardLayout for consistency

WHAT EACH PART DOES:
1. Server component - Renders on server with authentication check
2. Navigation - Links to create and view risk assessments
3. Overview cards - Shows key risk management features
4. Mobile optimization - Responsive layout for all devices

PSEUDOCODE:
- Check if user is authenticated
- Render risk management overview page
- Provide links to create and view risk assessments
- Show key features and benefits
*/

// Import Next.js components
import Link from 'next/link'

// Import Clerk's authentication function
import { auth } from '@clerk/nextjs/server'

// Import DashboardLayout for consistency
import DashboardLayout from '@/components/DashboardLayout'

/**
 * Risk Management landing page
 */
export default async function RiskManagementPage() {
  // Check authentication
  const { userId } = await auth()

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please Sign In</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">You need to be signed in to access risk management.</p>
          <Link href="/sign-in" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Risk Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Identify, assess, and manage workplace risks to ensure a safe and compliant environment.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Create New Risk Assessment */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Create New Assessment</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Start a new risk assessment to identify and evaluate workplace hazards.
            </p>
            <Link
              href="/ra/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Risk Assessment
            </Link>
          </div>

          {/* View Existing Assessments */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">View Assessments</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Review existing risk assessments and track their status.
            </p>
            <Link
              href="/admin/risk-assessments"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All Assessments
            </Link>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Risk Assessment Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Identify Hazards</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Document potential workplace hazards and who might be affected.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Assess Risk</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Evaluate likelihood and severity using our risk matrix system.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Control Risks</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Implement controls and create corrective actions to minimize risk.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">5-Step</div>
            <div className="text-slate-600 dark:text-slate-300">Assessment Process</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Auto</div>
            <div className="text-slate-600 dark:text-slate-300">Risk Calculation</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">PDF</div>
            <div className="text-slate-600 dark:text-slate-300">Export Reports</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
