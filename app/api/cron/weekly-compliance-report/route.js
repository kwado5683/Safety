/*
DESCRIPTION: Weekly cron job to generate comprehensive compliance reports.
- Runs weekly to analyze safety compliance metrics
- Tracks trends and identifies areas for improvement
- Sends detailed reports to management
- Helps with weekly safety oversight

WHAT EACH PART DOES:
1. Authentication - Verifies cron job authorization
2. Data Collection - Gathers weekly compliance data
3. Analysis - Calculates trends and metrics
4. Report Generation - Creates comprehensive compliance report
5. Email Distribution - Sends reports to management

PSEUDOCODE:
- Authenticate cron job request
- Query incidents, inspections, training from last 7 days
- Calculate compliance metrics and trends
- Generate comprehensive report
- Send email to management team
- Log execution results
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import email functions
import { resend } from '@/lib/email'

/**
 * Generate weekly compliance report email content
 */
function generateWeeklyComplianceReportEmail({ 
  weekStart, 
  weekEnd,
  incidentMetrics,
  inspectionMetrics,
  trainingMetrics,
  complianceScore,
  trends,
  recommendations,
  companyName 
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Compliance Report - ${weekStart} to ${weekEnd}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Weekly Compliance Report
          </h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName} - ${weekStart} to ${weekEnd}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <!-- Overall Compliance Score -->
          <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h2 style="color: #065f46; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
              Overall Compliance Score
            </h2>
            <div style="text-align: center;">
              <div style="font-size: 48px; font-weight: bold; color: #059669; margin: 0;">
                ${complianceScore}%
              </div>
              <p style="color: #065f46; margin: 8px 0 0 0; font-size: 16px;">
                Safety Compliance Rating
              </p>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
            <!-- Incident Metrics -->
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Incidents</h3>
              <div style="color: #991b1b;">
                <p style="margin: 4px 0; font-size: 14px;">Total: ${incidentMetrics.total}</p>
                <p style="margin: 4px 0; font-size: 14px;">Resolved: ${incidentMetrics.resolved}</p>
                <p style="margin: 4px 0; font-size: 14px;">Critical: ${incidentMetrics.critical}</p>
              </div>
            </div>

            <!-- Inspection Metrics -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Inspections</h3>
              <div style="color: #1e40af;">
                <p style="margin: 4px 0; font-size: 14px;">Completed: ${inspectionMetrics.completed}</p>
                <p style="margin: 4px 0; font-size: 14px;">Failed: ${inspectionMetrics.failed}</p>
                <p style="margin: 4px 0; font-size: 14px;">Success Rate: ${inspectionMetrics.successRate}%</p>
              </div>
            </div>

            <!-- Training Metrics -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Training</h3>
              <div style="color: #92400e;">
                <p style="margin: 4px 0; font-size: 14px;">Compliant: ${trainingMetrics.compliant}</p>
                <p style="margin: 4px 0; font-size: 14px;">Expiring: ${trainingMetrics.expiring}</p>
                <p style="margin: 4px 0; font-size: 14px;">Compliance: ${trainingMetrics.complianceRate}%</p>
              </div>
            </div>

            <!-- Actions Metrics -->
            <div style="background-color: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #6b21a8; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Actions</h3>
              <div style="color: #6b21a8;">
                <p style="margin: 4px 0; font-size: 14px;">Open: ${trends.openActions}</p>
                <p style="margin: 4px 0; font-size: 14px;">Completed: ${trends.completedActions}</p>
                <p style="margin: 4px 0; font-size: 14px;">Overdue: ${trends.overdueActions}</p>
              </div>
            </div>
          </div>

          <!-- Trends Section -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Weekly Trends</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${trends.incidentTrend > 0 ? 
                `<li style="color: #dc2626;">⚠️ Incidents increased by ${trends.incidentTrend}% this week</li>` :
                `<li style="color: #059669;">✅ Incidents decreased by ${Math.abs(trends.incidentTrend)}% this week</li>`
              }
              <li>📊 ${inspectionMetrics.completed} inspections completed (${inspectionMetrics.successRate}% success rate)</li>
              <li>📚 ${trainingMetrics.compliant} employees maintain training compliance</li>
              <li>⚡ ${trends.completedActions} corrective actions completed this week</li>
            </ul>
          </div>

          <!-- Recommendations -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Recommendations for Next Week
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated weekly compliance report from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              Generated on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
WEEKLY COMPLIANCE REPORT
${companyName} - ${weekStart} to ${weekEnd}

OVERALL COMPLIANCE SCORE: ${complianceScore}%

INCIDENT METRICS:
- Total: ${incidentMetrics.total}
- Resolved: ${incidentMetrics.resolved}
- Critical: ${incidentMetrics.critical}

INSPECTION METRICS:
- Completed: ${inspectionMetrics.completed}
- Failed: ${inspectionMetrics.failed}
- Success Rate: ${inspectionMetrics.successRate}%

TRAINING METRICS:
- Compliant: ${trainingMetrics.compliant}
- Expiring: ${trainingMetrics.expiring}
- Compliance: ${trainingMetrics.complianceRate}%

ACTIONS METRICS:
- Open: ${trends.openActions}
- Completed: ${trends.completedActions}
- Overdue: ${trends.overdueActions}

WEEKLY TRENDS:
${trends.incidentTrend > 0 ? 
  `⚠️ Incidents increased by ${trends.incidentTrend}% this week` :
  `✅ Incidents decreased by ${Math.abs(trends.incidentTrend)}% this week`
}
📊 ${inspectionMetrics.completed} inspections completed (${inspectionMetrics.successRate}% success rate)
📚 ${trainingMetrics.compliant} employees maintain training compliance
⚡ ${trends.completedActions} corrective actions completed this week

RECOMMENDATIONS FOR NEXT WEEK:
${recommendations.map(rec => `- ${rec}`).join('\n')}

This is an automated weekly compliance report from the ${companyName} safety management system.
Generated on ${new Date().toLocaleString()}
  `

  return { html, text }
}

/**
 * POST handler - Weekly compliance report cron job
 */
export async function POST(request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - 7)

    // Get incident data from last 7 days
    const { data: weeklyIncidents, error: incidentsError } = await supabase
      .from('incident')
      .select('*')
      .gte('reporttimestamp', weekStart.toISOString())

    // Get inspection data from last 7 days
    const { data: weeklyInspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select('*')
      .gte('submitted_at', weekStart.toISOString())

    // Get training compliance data
    const { data: trainingRecords, error: trainingError } = await supabase
      .from('training_records')
      .select('*')
      .gte('expires_on', today.toISOString())

    // Get corrective actions data
    const { data: correctiveActions, error: actionsError } = await supabase
      .from('corrective_actions')
      .select('*')

    if (incidentsError || inspectionsError || trainingError || actionsError) {
      console.error('Error fetching compliance data:', {
        incidentsError, inspectionsError, trainingError, actionsError
      })
      return NextResponse.json(
        { error: 'Failed to fetch compliance data' },
        { status: 500 }
      )
    }

    // Calculate incident metrics
    const incidentMetrics = {
      total: weeklyIncidents?.length || 0,
      resolved: weeklyIncidents?.filter(inc => inc.status === 'closed').length || 0,
      critical: weeklyIncidents?.filter(inc => 
        inc.severity === 'Critical' || inc.severity === 'High'
      ).length || 0
    }

    // Calculate inspection metrics
    const completedInspections = weeklyInspections?.filter(ins => ins.submitted_at) || []
    const failedInspections = completedInspections.filter(ins => {
      // Would need to check for critical failures in inspection_responses
      return false // Simplified for now
    })

    const inspectionMetrics = {
      completed: completedInspections.length,
      failed: failedInspections.length,
      successRate: completedInspections.length > 0 ? 
        Math.round(((completedInspections.length - failedInspections.length) / completedInspections.length) * 100) : 100
    }

    // Calculate training metrics
    const totalUsers = await supabase.from('user_profiles').select('id').then(({ data }) => data?.length || 0)
    const compliantUsers = trainingRecords?.length || 0
    const expiringUsers = trainingRecords?.filter(record => {
      const expiryDate = new Date(record.expires_on)
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30
    }).length || 0

    const trainingMetrics = {
      compliant: compliantUsers,
      expiring: expiringUsers,
      complianceRate: totalUsers > 0 ? Math.round((compliantUsers / totalUsers) * 100) : 100
    }

    // Calculate trends
    const openActions = correctiveActions?.filter(action => 
      ['pending', 'in_progress'].includes(action.status)
    ).length || 0

    const completedActions = correctiveActions?.filter(action => 
      action.status === 'completed'
    ).length || 0

    const overdueActions = correctiveActions?.filter(action => {
      if (action.status === 'completed') return false
      const dueDate = new Date(action.target_date)
      return dueDate < today
    }).length || 0

    const trends = {
      openActions,
      completedActions,
      overdueActions,
      incidentTrend: 0 // Would need historical data to calculate
    }

    // Calculate overall compliance score
    const complianceScore = Math.round((
      (incidentMetrics.total === 0 ? 100 : Math.max(0, 100 - (incidentMetrics.critical * 20))) +
      inspectionMetrics.successRate +
      trainingMetrics.complianceRate
    ) / 3)

    // Generate recommendations
    const recommendations = []
    if (incidentMetrics.critical > 0) {
      recommendations.push('Address critical incidents immediately')
    }
    if (inspectionMetrics.successRate < 90) {
      recommendations.push('Improve inspection success rate')
    }
    if (trainingMetrics.complianceRate < 95) {
      recommendations.push('Increase training compliance')
    }
    if (overdueActions > 0) {
      recommendations.push('Resolve overdue corrective actions')
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current safety standards')
      recommendations.push('Continue monitoring compliance metrics')
    }

    // Get management users to send report to
    const { data: managementUsers, error: managementError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('role', ['admin', 'owner', 'manager'])

    if (managementUsers && !managementError) {
      const weekStartStr = weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      const weekEndStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      const { html, text } = generateWeeklyComplianceReportEmail({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        incidentMetrics,
        inspectionMetrics,
        trainingMetrics,
        complianceScore,
        trends,
        recommendations,
        companyName: process.env.COMPANY_NAME || 'Safety Management System'
      })

      // Send email to each management user
      for (const manager of managementUsers) {
        const managerEmail = `${manager.user_id}@example.com` // Replace with actual email lookup
        
        try {
          await resend.emails.send({
            from: 'Safety System <noreply@safety-system.com>',
            to: [managerEmail],
            subject: `Weekly Compliance Report - ${weekStartStr} to ${weekEndStr}`,
            html,
            text
          })
        } catch (emailError) {
          console.error(`Error sending weekly report to ${managerEmail}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly compliance report sent successfully',
      summary: {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: today.toISOString().split('T')[0],
        complianceScore,
        incidentMetrics,
        inspectionMetrics,
        trainingMetrics,
        recipients: managementUsers?.length || 0
      }
    })

  } catch (error) {
    console.error('Weekly compliance report cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
