'use client'
/*
DESCRIPTION: Client component for viewing Risk Assessment details.
- Displays complete RA information with all hazards
- Shows risk scores with color coding
- Mobile-first responsive design
- Edit link for draft RAs
- Risk level indicators

WHAT EACH PART DOES:
1. Risk display - Shows risk matrix with color coding
2. Status indicators - Shows draft/published status
3. Edit functionality - Link to edit draft RAs
4. Responsive layout - Mobile-first design
5. Risk calculation - Displays risk levels and colors

PSEUDOCODE:
- Display RA details and status
- Show all hazards with risk scores
- Color-code risk levels (Low/Medium/High/Very High)
- Provide edit link for draft RAs
- Format dates and risk scores
*/

import Link from 'next/link'

/**
 * RiskAssessmentView component - Displays risk assessment details
 */
export default function RiskAssessmentView({ ra, hazards }) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
    }
  }

  // Get risk color
  const getRiskColor = (risk) => {
    if (risk <= 4) return 'green'
    if (risk <= 9) return 'yellow'
    if (risk <= 16) return 'orange'
    return 'red'
  }

  // Get risk level
  const getRiskLevel = (risk) => {
    if (risk <= 4) return 'Low'
    if (risk <= 9) return 'Medium'
    if (risk <= 16) return 'High'
    return 'Very High'
  }

  return (
    <div className="p-4 space-y-6">
      {/* Risk Assessment Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {ra.title}
              </h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ra.status)}`}>
                {ra.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-medium">Activity:</span> {ra.activity}
              </div>
              <div>
                <span className="font-medium">Location:</span> {ra.location}
              </div>
              <div>
                <span className="font-medium">Assessor:</span> {ra.assessor_id}
              </div>
              <div>
                <span className="font-medium">Version:</span> {ra.version}
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium">Created:</span> {formatDate(ra.created_at)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {ra.status === 'draft' && (
              <Link
                href={`/ra/new?id=${ra.id}`}
                className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-sm font-medium text-center"
              >
                Continue Editing
              </Link>
            )}
            
            <Link
              href="/admin/risk-assessments"
              className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors text-sm font-medium text-center"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>

      {/* Hazards Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
          Risk Assessment Summary
        </h2>
        
        {hazards.length > 0 ? (
          <div className="space-y-4">
            {hazards.map((hazard, index) => (
              <div key={hazard.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
                  Hazard {index + 1}: {hazard.hazard}
                </h3>
                
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Who might be harmed:</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">{hazard.who_might_be_harmed}</span>
                  </p>
                  
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Existing controls:</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">{hazard.existing_controls}</span>
                  </p>
                  
                  {hazard.additional_controls && (
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Additional controls:</span>
                      <span className="text-slate-600 dark:text-slate-400 ml-2">{hazard.additional_controls}</span>
                    </p>
                  )}
                </div>
                
                {/* Risk Scores */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">Before Controls</h4>
                    <div className="text-sm space-y-1">
                      <div>Likelihood: {hazard.likelihood_before}/5</div>
                      <div>Severity: {hazard.severity_before}/5</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getRiskColor(hazard.risk_before)}-100 text-${getRiskColor(hazard.risk_before)}-800 dark:bg-${getRiskColor(hazard.risk_before)}-900/40 dark:text-${getRiskColor(hazard.risk_before)}-200`}>
                        Risk: {hazard.risk_before} ({getRiskLevel(hazard.risk_before)})
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">After Controls</h4>
                    <div className="text-sm space-y-1">
                      <div>Likelihood: {hazard.likelihood_after}/5</div>
                      <div>Severity: {hazard.severity_after}/5</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getRiskColor(hazard.risk_after)}-100 text-${getRiskColor(hazard.risk_after)}-800 dark:bg-${getRiskColor(hazard.risk_after)}-900/40 dark:text-${getRiskColor(hazard.risk_after)}-200`}>
                        Risk: {hazard.risk_after} ({getRiskLevel(hazard.risk_after)})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No hazards have been identified for this risk assessment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
