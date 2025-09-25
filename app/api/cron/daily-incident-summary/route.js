/*
DESCRIPTION: Daily cron job to generate and send incident summary reports.
- Runs daily to summarize incident activity
- Sends email reports to admin users
- Includes metrics, trends, and action items
- Helps with daily safety oversight

WHAT EACH PART DOES:
1. Authentication - Verifies cron job authorization
2. Data Collection - Gathers incident data from last 24 hours
3. Report Generation - Creates comprehensive summary
4. Email Distribution - Sends reports to admin users
5. Logging - Records execution for monitoring

PSEUDOCODE:
- Authenticate cron job request
- Query incidents from last 24 hours
- Calculate summary statistics
- Generate report content
- Send email to admin users
- Log execution results
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import email functions
import { resend } from '@/lib/email'

/**
 * Generate daily incident summary email content
 */
function generateDailyIncidentSummaryEmail({ 
  date, 
  totalIncidents, 
  newIncidents, 
  resolvedIncidents, 
  openActions, 
  criticalIncidents,
  incidentBreakdown,
  companyName 
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Incident Summary - ${date}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Daily Incident Summary
          </h1>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName} - ${date}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Safety Activity Overview
          </h2>
          
          <!-- Key Metrics -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">New Incidents</h3>
              <p style="color: #92400e; margin: 0; font-size: 24px; font-weight: bold;">${newIncidents}</p>
            </div>
            <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Resolved</h3>
              <p style="color: #065f46; margin: 0; font-size: 24px; font-weight: bold;">${resolvedIncidents}</p>
            </div>
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Critical</h3>
              <p style="color: #991b1b; margin: 0; font-size: 24px; font-weight: bold;">${criticalIncidents}</p>
            </div>
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Open Actions</h3>
              <p style="color: #1e40af; margin: 0; font-size: 24px; font-weight: bold;">${openActions}</p>
            </div>
          </div>
          
          <!-- Incident Breakdown -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Incident Breakdown by Type</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${incidentBreakdown.map(item => `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 60%;">${item.type}</td>
                  <td style="padding: 8px 0; color: #1f2937; width: 20%; text-align: center;">${item.count}</td>
                  <td style="padding: 8px 0; color: #6b7280; width: 20%; text-align: center;">${item.percentage}%</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <!-- Action Items -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Today's Action Items
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Review ${newIncidents} new incidents reported today</li>
              <li>Follow up on ${openActions} open corrective actions</li>
              ${criticalIncidents > 0 ? `<li>URGENT: Address ${criticalIncidents} critical incidents immediately</li>` : ''}
              <li>Update incident statuses as investigations progress</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated daily report from the ${companyName} safety management system.
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
DAILY INCIDENT SUMMARY
${companyName} - ${date}

SAFETY ACTIVITY OVERVIEW

New Incidents: ${newIncidents}
Resolved: ${resolvedIncidents}
Critical: ${criticalIncidents}
Open Actions: ${openActions}

INCIDENT BREAKDOWN BY TYPE:
${incidentBreakdown.map(item => `${item.type}: ${item.count} (${item.percentage}%)`).join('\n')}

TODAY'S ACTION ITEMS:
- Review ${newIncidents} new incidents reported today
- Follow up on ${openActions} open corrective actions
${criticalIncidents > 0 ? `- URGENT: Address ${criticalIncidents} critical incidents immediately\n` : ''}- Update incident statuses as investigations progress

This is an automated daily report from the ${companyName} safety management system.
Generated on ${new Date().toLocaleString()}
  `

  return { html, text }
}

/**
 * POST handler - Daily incident summary cron job
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
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get incident data from last 24 hours
    const { data: recentIncidents, error: incidentsError } = await supabase
      .from('incident')
      .select('*')
      .gte('reporttimestamp', yesterday.toISOString())
      .order('reporttimestamp', { ascending: false })

    if (incidentsError) {
      console.error('Error fetching recent incidents:', incidentsError)
      return NextResponse.json(
        { error: 'Failed to fetch incident data' },
        { status: 500 }
      )
    }

    // Get open corrective actions count
    const { data: openActions, error: actionsError } = await supabase
      .from('corrective_actions')
      .select('id')
      .in('status', ['pending', 'in_progress'])

    if (actionsError) {
      console.error('Error fetching open actions:', actionsError)
    }

    // Calculate summary statistics
    const totalIncidents = recentIncidents?.length || 0
    const newIncidents = totalIncidents
    const resolvedIncidents = 0 // Would need status tracking for accurate count
    const criticalIncidents = recentIncidents?.filter(incident => 
      incident.severity === 'Critical' || incident.severity === 'High'
    ).length || 0
    const openActionsCount = openActions?.length || 0

    // Calculate incident breakdown by type
    const incidentTypes = {}
    recentIncidents?.forEach(incident => {
      const type = incident.incidenttype || 'Unknown'
      incidentTypes[type] = (incidentTypes[type] || 0) + 1
    })

    const incidentBreakdown = Object.entries(incidentTypes).map(([type, count]) => ({
      type,
      count,
      percentage: totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0
    }))

    // Get admin users to send report to
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('role', ['admin', 'owner', 'manager'])

    if (adminUsers && !adminError) {
      const dateStr = yesterday.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const { html, text } = generateDailyIncidentSummaryEmail({
        date: dateStr,
        totalIncidents,
        newIncidents,
        resolvedIncidents,
        openActions: openActionsCount,
        criticalIncidents,
        incidentBreakdown,
        companyName: process.env.COMPANY_NAME || 'Safety Management System'
      })

      // Send email to each admin user
      for (const admin of adminUsers) {
        const adminEmail = `${admin.user_id}@example.com` // Replace with actual email lookup
        
        try {
          await resend.emails.send({
            from: 'Safety System <noreply@safety-system.com>',
            to: [adminEmail],
            subject: `Daily Incident Summary - ${dateStr}`,
            html,
            text
          })
        } catch (emailError) {
          console.error(`Error sending daily summary to ${adminEmail}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily incident summary sent successfully',
      summary: {
        date: yesterday.toISOString().split('T')[0],
        totalIncidents,
        newIncidents,
        criticalIncidents,
        openActions: openActionsCount,
        recipients: adminUsers?.length || 0
      }
    })

  } catch (error) {
    console.error('Daily incident summary cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
