/*
DESCRIPTION: Monthly cron job to identify and alert about expiring training.
- Runs monthly to identify training expiring in next 30 days
- Sends alerts to users and managers
- Helps prevent training compliance issues
- Maintains proactive training management

WHAT EACH PART DOES:
1. Authentication - Verifies cron job authorization
2. Data Collection - Finds training records expiring soon
3. Analysis - Categorizes by urgency and user
4. Alert Generation - Creates targeted alerts
5. Email Distribution - Sends to users and managers

PSEUDOCODE:
- Authenticate cron job request
- Query training records expiring in next 30 days
- Group by user and urgency level
- Generate alert emails for users
- Send summary to managers
- Log execution results
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import email functions
import { resend } from '@/lib/email'

/**
 * Generate training expiry alert email content for users
 */
function generateTrainingExpiryAlertEmail({ 
  userName,
  expiringTraining,
  daysUntilExpiry,
  companyName 
}) {
  const urgencyColor = daysUntilExpiry <= 7 ? '#dc2626' : daysUntilExpiry <= 14 ? '#f59e0b' : '#3b82f6'
  const urgencyBg = daysUntilExpiry <= 7 ? '#fef2f2' : daysUntilExpiry <= 14 ? '#fef3c7' : '#eff6ff'
  const urgencyText = daysUntilExpiry <= 7 ? 'URGENT' : daysUntilExpiry <= 14 ? 'HIGH PRIORITY' : 'REMINDER'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Training Expiry Alert - ${urgencyText}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Training Expiry Alert
          </h1>
          <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Training Renewal Required
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Hi ${userName}, your training certification(s) are expiring soon and require renewal.
          </p>
          
          <!-- Urgency Alert -->
          <div style="background-color: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: ${urgencyColor}; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
              ${urgencyText}
            </h3>
            <p style="color: ${urgencyColor}; margin: 0; font-size: 14px; font-weight: 500;">
              ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining
            </p>
          </div>

          <!-- Expiring Training List -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Expiring Training</h3>
            <div style="space-y: 12px;">
              ${expiringTraining.map(training => `
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4 style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 600;">${training.courseName}</h4>
                    <span style="background-color: ${urgencyColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                      ${training.daysUntilExpiry} day${training.daysUntilExpiry !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    Expires: ${new Date(training.expiresOn).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Action Steps -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Immediate Action Required
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Schedule renewal training as soon as possible</li>
              <li>Contact your training coordinator to arrange sessions</li>
              <li>Complete training before the expiry date</li>
              <li>Upload new certificates to the system</li>
              ${daysUntilExpiry <= 7 ? '<li style="color: #dc2626; font-weight: 600;">⚠️ URGENT: Less than 7 days remaining!</li>' : ''}
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Need Help?
            </h4>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              Contact your training coordinator or HR department for assistance with training renewal.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated training reminder from the ${companyName} safety management system.
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
TRAINING EXPIRY ALERT - ${urgencyText}
${companyName}

Hi ${userName}, your training certification(s) are expiring soon and require renewal.

${urgencyText} - ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining

EXPIRING TRAINING:
${expiringTraining.map(training => `
- ${training.courseName}
  Expires: ${new Date(training.expiresOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
  Days remaining: ${training.daysUntilExpiry}
`).join('')}

IMMEDIATE ACTION REQUIRED:
- Schedule renewal training as soon as possible
- Contact your training coordinator to arrange sessions
- Complete training before the expiry date
- Upload new certificates to the system
${daysUntilExpiry <= 7 ? '- ⚠️ URGENT: Less than 7 days remaining!' : ''}

Need Help?
Contact your training coordinator or HR department for assistance with training renewal.

This is an automated training reminder from the ${companyName} safety management system.
Generated on ${new Date().toLocaleString()}
  `

  return { html, text }
}

/**
 * Generate manager summary email for expiring training
 */
function generateManagerTrainingSummaryEmail({ 
  managerName,
  expiringSummary,
  companyName 
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monthly Training Expiry Summary</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Monthly Training Expiry Summary
          </h1>
          <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Training Compliance Overview
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Hi ${managerName}, here's a summary of training certifications expiring in the next 30 days.
          </p>
          
          <!-- Summary Statistics -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 24px 0;">
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Urgent</h3>
              <p style="color: #991b1b; margin: 0; font-size: 24px; font-weight: bold;">${expiringSummary.urgent}</p>
              <p style="color: #991b1b; margin: 0; font-size: 12px;">≤ 7 days</p>
            </div>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">High Priority</h3>
              <p style="color: #92400e; margin: 0; font-size: 24px; font-weight: bold;">${expiringSummary.highPriority}</p>
              <p style="color: #92400e; margin: 0; font-size: 12px;">8-14 days</p>
            </div>
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Reminder</h3>
              <p style="color: #1e40af; margin: 0; font-size: 24px; font-weight: bold;">${expiringSummary.reminder}</p>
              <p style="color: #1e40af; margin: 0; font-size: 12px;">15-30 days</p>
            </div>
          </div>

          <!-- Detailed Breakdown -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Training Expiry Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Employee</th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Training</th>
                  <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #374151;">Expires</th>
                  <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #374151;">Days Left</th>
                </tr>
              </thead>
              <tbody>
                ${expiringSummary.details.map(item => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 8px; font-size: 14px; color: #1f2937;">${item.employeeName}</td>
                    <td style="padding: 12px 8px; font-size: 14px; color: #1f2937;">${item.courseName}</td>
                    <td style="padding: 12px 8px; font-size: 14px; color: #1f2937; text-align: center;">
                      ${new Date(item.expiresOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style="padding: 12px 8px; font-size: 14px; text-align: center;">
                      <span style="background-color: ${item.daysUntilExpiry <= 7 ? '#dc2626' : item.daysUntilExpiry <= 14 ? '#f59e0b' : '#3b82f6'}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
                        ${item.daysUntilExpiry}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Action Items -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Manager Action Items
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${expiringSummary.urgent > 0 ? '<li>URGENT: Address training expiring within 7 days immediately</li>' : ''}
              <li>Schedule training sessions for expiring certifications</li>
              <li>Follow up with employees on training completion</li>
              <li>Ensure certificates are uploaded to the system</li>
              <li>Plan ahead for future training requirements</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated monthly training summary from the ${companyName} safety management system.
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
MONTHLY TRAINING EXPIRY SUMMARY
${companyName}

Hi ${managerName}, here's a summary of training certifications expiring in the next 30 days.

SUMMARY STATISTICS:
- Urgent (≤ 7 days): ${expiringSummary.urgent}
- High Priority (8-14 days): ${expiringSummary.highPriority}
- Reminder (15-30 days): ${expiringSummary.reminder}

TRAINING EXPIRY BREAKDOWN:
${expiringSummary.details.map(item => `
- ${item.employeeName}: ${item.courseName}
  Expires: ${new Date(item.expiresOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
  Days Left: ${item.daysUntilExpiry}
`).join('')}

MANAGER ACTION ITEMS:
${expiringSummary.urgent > 0 ? '- URGENT: Address training expiring within 7 days immediately\n' : ''}- Schedule training sessions for expiring certifications
- Follow up with employees on training completion
- Ensure certificates are uploaded to the system
- Plan ahead for future training requirements

This is an automated monthly training summary from the ${companyName} safety management system.
Generated on ${new Date().toLocaleString()}
  `

  return { html, text }
}

/**
 * POST handler - Monthly training expiry cron job
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
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    // Get training records expiring in next 30 days
    const { data: expiringTraining, error: trainingError } = await supabase
      .from('training_records')
      .select(`
        *,
        training_courses (
          name
        ),
        user_profiles (
          full_name
        )
      `)
      .gte('expires_on', today.toISOString())
      .lte('expires_on', thirtyDaysFromNow.toISOString())
      .order('expires_on', { ascending: true })

    if (trainingError) {
      console.error('Error fetching expiring training:', trainingError)
      return NextResponse.json(
        { error: 'Failed to fetch training data' },
        { status: 500 }
      )
    }

    if (!expiringTraining || expiringTraining.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No training expiring in next 30 days',
        summary: {
          urgent: 0,
          highPriority: 0,
          reminder: 0,
          total: 0
        }
      })
    }

    // Group training by user
    const userTrainingMap = new Map()
    expiringTraining.forEach(record => {
      const userId = record.user_id
      if (!userTrainingMap.has(userId)) {
        userTrainingMap.set(userId, {
          userName: record.user_profiles?.full_name || 'Unknown User',
          training: []
        })
      }

      const daysUntilExpiry = Math.ceil((new Date(record.expires_on) - today) / (1000 * 60 * 60 * 24))
      userTrainingMap.get(userId).training.push({
        courseName: record.training_courses?.name || 'Unknown Course',
        expiresOn: record.expires_on,
        daysUntilExpiry
      })
    })

    // Send individual emails to users
    let emailsSent = 0
    for (const [userId, userData] of userTrainingMap) {
      const userEmail = `${userId}@example.com` // Replace with actual email lookup
      
      // Find the most urgent training for this user
      const mostUrgent = userData.training.reduce((prev, current) => 
        current.daysUntilExpiry < prev.daysUntilExpiry ? current : prev
      )

      const { html, text } = generateTrainingExpiryAlertEmail({
        userName: userData.userName,
        expiringTraining: userData.training,
        daysUntilExpiry: mostUrgent.daysUntilExpiry,
        companyName: process.env.COMPANY_NAME || 'Safety Management System'
      })

      try {
        await resend.emails.send({
          from: 'Training System <noreply@training-system.com>',
          to: [userEmail],
          subject: `Training Expiry Alert - ${mostUrgent.daysUntilExpiry} days remaining`,
          html,
          text
        })
        emailsSent++
      } catch (emailError) {
        console.error(`Error sending training alert to ${userEmail}:`, emailError)
      }
    }

    // Prepare summary data for managers
    const expiringSummary = {
      urgent: expiringTraining.filter(record => {
        const daysUntilExpiry = Math.ceil((new Date(record.expires_on) - today) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7
      }).length,
      highPriority: expiringTraining.filter(record => {
        const daysUntilExpiry = Math.ceil((new Date(record.expires_on) - today) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry > 7 && daysUntilExpiry <= 14
      }).length,
      reminder: expiringTraining.filter(record => {
        const daysUntilExpiry = Math.ceil((new Date(record.expires_on) - today) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry > 14
      }).length,
      details: expiringTraining.map(record => ({
        employeeName: record.user_profiles?.full_name || 'Unknown User',
        courseName: record.training_courses?.name || 'Unknown Course',
        expiresOn: record.expires_on,
        daysUntilExpiry: Math.ceil((new Date(record.expires_on) - today) / (1000 * 60 * 60 * 24))
      }))
    }

    // Send summary to managers
    const { data: managers, error: managersError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('role', ['admin', 'owner', 'manager'])

    if (managers && !managersError) {
      for (const manager of managers) {
        const managerEmail = `${manager.user_id}@example.com` // Replace with actual email lookup
        
        const { html, text } = generateManagerTrainingSummaryEmail({
          managerName: manager.full_name,
          expiringSummary,
          companyName: process.env.COMPANY_NAME || 'Safety Management System'
        })

        try {
          await resend.emails.send({
            from: 'Training System <noreply@training-system.com>',
            to: [managerEmail],
            subject: 'Monthly Training Expiry Summary',
            html,
            text
          })
        } catch (emailError) {
          console.error(`Error sending training summary to ${managerEmail}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly training expiry alerts sent successfully',
      summary: {
        ...expiringSummary,
        userEmailsSent: emailsSent,
        managerEmailsSent: managers?.length || 0,
        totalRecords: expiringTraining.length
      }
    })

  } catch (error) {
    console.error('Monthly training expiry cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
