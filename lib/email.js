/*
DESCRIPTION: Email utility using Resend service for safety management system.
- Exports configured Resend client
- Provides specific email templates for safety system notifications
- Handles action assignment and training reminder emails
- Graceful error handling and logging

WHAT EACH PART DOES:
1. Resend client - Configured with API key from environment
2. sendActionAssignedEmail - Sends email when corrective action is assigned
3. sendTrainingReminderEmail - Sends email for training certificate expiry
4. Error handling - Logs errors and returns consistent responses
5. Email templates - Professional HTML and text versions

PSEUDOCODE:
- Import Resend and create client with API key
- Create email template functions with parameters
- Generate HTML and text content for each email type
- Send emails via Resend API
- Return success/error responses with logging
*/

// Import Resend for email sending
import { Resend } from 'resend'

// Create Resend client with API key from environment
export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send email when a corrective action is assigned to a user
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.title - Action title/description
 * @param {string} params.dueDate - Due date for the action
 * @param {string} params.incidentRef - Incident reference number
 * @param {string} params.link - Link to view the action in the system
 * @returns {Promise<Object>} Email sending result
 */
export async function sendActionAssignedEmail({ toEmail, title, dueDate, incidentRef, link }) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    // Generate email content
    const emailContent = generateActionAssignedEmail({
      title,
      dueDate,
      incidentRef,
      link,
      companyName
    })

    // Send email via Resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Corrective Action Assigned - ${title}`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Action assignment email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending action assignment email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email when an incident is reported
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.incidentType - Type of incident
 * @param {string} params.location - Location of incident
 * @param {string} params.reportedBy - Who reported the incident
 * @param {string} params.incidentRef - Incident reference number
 * @param {string} params.link - Link to view incident details
 * @returns {Promise<Object>} Email sending result
 */
export async function sendIncidentReportedEmail({ toEmail, incidentType, location, reportedBy, incidentRef, link }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    const emailContent = generateIncidentReportedEmail({
      incidentType,
      location,
      reportedBy,
      incidentRef,
      link,
      companyName
    })

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Incident Reported - ${incidentType} at ${location}`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Incident reported email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending incident reported email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email when an incident status is updated
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.incidentType - Type of incident
 * @param {string} params.newStatus - New status of incident
 * @param {string} params.incidentRef - Incident reference number
 * @param {string} params.link - Link to view incident details
 * @returns {Promise<Object>} Email sending result
 */
export async function sendIncidentUpdatedEmail({ toEmail, incidentType, newStatus, incidentRef, link }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    const emailContent = generateIncidentUpdatedEmail({
      incidentType,
      newStatus,
      incidentRef,
      link,
      companyName
    })

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Incident Status Updated - ${incidentType} (${newStatus})`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Incident updated email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending incident updated email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email when an inspection has critical failures
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.checklistName - Name of checklist
 * @param {number} params.criticalFails - Number of critical failures
 * @param {string} params.inspectionRef - Inspection reference number
 * @param {string} params.link - Link to view inspection details
 * @returns {Promise<Object>} Email sending result
 */
export async function sendInspectionFailedEmail({ toEmail, checklistName, criticalFails, inspectionRef, link }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    const emailContent = generateInspectionFailedEmail({
      checklistName,
      criticalFails,
      inspectionRef,
      link,
      companyName
    })

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `URGENT: Inspection Failed - ${criticalFails} Critical Issues Found`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Inspection failed email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending inspection failed email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email when a risk assessment is published
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.raTitle - Risk assessment title
 * @param {string} params.assessorName - Name of assessor
 * @param {string} params.raRef - Risk assessment reference number
 * @param {string} params.link - Link to view risk assessment
 * @returns {Promise<Object>} Email sending result
 */
export async function sendRiskAssessmentPublishedEmail({ toEmail, raTitle, assessorName, raRef, link }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    const emailContent = generateRiskAssessmentPublishedEmail({
      raTitle,
      assessorName,
      raRef,
      link,
      companyName
    })

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Risk Assessment Published - ${raTitle}`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Risk assessment published email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending risk assessment published email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email for training certificate expiry reminder
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.course - Training course name
 * @param {string} params.expiresOn - Certificate expiry date
 * @param {string} params.link - Link to training records
 * @returns {Promise<Object>} Email sending result
 */
export async function sendTrainingReminderEmail({ toEmail, course, expiresOn, link }) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { skipped: true, reason: 'API key not configured' }
    }

    const companyName = process.env.COMPANY_NAME || 'Safety Management System'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Safety System <noreply@yourdomain.com>'

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((new Date(expiresOn) - new Date()) / (1000 * 60 * 60 * 24))

    // Generate email content
    const emailContent = generateTrainingReminderEmail({
      course,
      expiresOn,
      daysUntilExpiry,
      link,
      companyName
    })

    // Send email via Resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Training Certificate Expiry Reminder - ${course}`,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`Training reminder email sent to ${toEmail}`)
    return { success: true, result }

  } catch (error) {
    console.error('Error sending training reminder email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate HTML and text content for action assignment email
 */
function generateActionAssignedEmail({ title, dueDate, incidentRef, link, companyName }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Corrective Action Assigned</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            New Corrective Action Assigned
          </h1>
          <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Action Required
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            A new corrective action has been assigned to you and requires your immediate attention.
          </p>
          
          <!-- Action Details -->
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Action Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Action:</td>
                <td style="padding: 8px 0; color: #1f2937;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Due Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date(dueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Incident Ref:</td>
                <td style="padding: 8px 0; color: #1f2937;">${incidentRef}</td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Action Details
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Next Steps
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Review the action details by clicking the button above</li>
              <li>Complete the corrective action by the due date</li>
              <li>Update the action status in the safety system</li>
              <li>Contact your supervisor if you need assistance</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your safety coordinator.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
NEW CORRECTIVE ACTION ASSIGNED
${companyName}

ACTION REQUIRED

A new corrective action has been assigned to you and requires your immediate attention.

ACTION DETAILS:
Action: ${title}
Due Date: ${new Date(dueDate).toLocaleDateString()}
Incident Ref: ${incidentRef}

View Action Details: ${link}

NEXT STEPS:
- Review the action details using the link above
- Complete the corrective action by the due date
- Update the action status in the safety system
- Contact your supervisor if you need assistance

This is an automated notification from the ${companyName} safety management system.
If you have any questions, please contact your safety coordinator.
  `

  return { html, text }
}

/**
 * Generate HTML and text content for training reminder email
 */
function generateTrainingReminderEmail({ course, expiresOn, daysUntilExpiry, link, companyName }) {
  const urgencyColor = daysUntilExpiry <= 7 ? '#dc2626' : daysUntilExpiry <= 14 ? '#f59e0b' : '#3b82f6'
  const urgencyBg = daysUntilExpiry <= 7 ? '#fef2f2' : daysUntilExpiry <= 14 ? '#fef3c7' : '#eff6ff'
  const urgencyText = daysUntilExpiry <= 7 ? 'URGENT' : daysUntilExpiry <= 14 ? 'SOON' : 'REMINDER'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Training Certificate Expiry Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Training Certificate Reminder
          </h1>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Certificate Expiry Notice
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Your training certificate is expiring soon and requires renewal to maintain compliance.
          </p>
          
          <!-- Certificate Details -->
          <div style="background-color: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: ${urgencyColor}; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Certificate Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Course:</td>
                <td style="padding: 8px 0; color: #1f2937;">${course}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Expires On:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date(expiresOn).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Days Remaining:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  <span style="background-color: ${urgencyColor}; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 500;">
                    ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Training Records
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Next Steps
            </h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Schedule renewal training as soon as possible</li>
              <li>Contact your training coordinator if needed</li>
              <li>Complete the training before the expiry date</li>
              <li>Upload the new certificate to the system</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated reminder from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your training coordinator.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
TRAINING CERTIFICATE EXPIRY REMINDER
${companyName}

CERTIFICATE EXPIRY NOTICE

Your training certificate is expiring soon and requires renewal to maintain compliance.

CERTIFICATE DETAILS:
Course: ${course}
Expires On: ${new Date(expiresOn).toLocaleDateString()}
Days Remaining: ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}

View Training Records: ${link}

NEXT STEPS:
- Schedule renewal training as soon as possible
- Contact your training coordinator if needed
- Complete the training before the expiry date
- Upload the new certificate to the system

This is an automated reminder from the ${companyName} safety management system.
If you have any questions, please contact your training coordinator.
  `

  return { html, text }
}

/**
 * Generate HTML and text content for incident reported email
 */
function generateIncidentReportedEmail({ incidentType, location, reportedBy, incidentRef, link, companyName }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Incident Reported</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            New Incident Reported
          </h1>
          <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Incident Notification
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            A new incident has been reported and requires immediate attention.
          </p>
          
          <!-- Incident Details -->
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Incident Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${incidentType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Reported By:</td>
                <td style="padding: 8px 0; color: #1f2937;">${reportedBy}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937;">${incidentRef}</td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Incident Details
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Next Steps
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Review the incident details using the link above</li>
              <li>Investigate the incident promptly</li>
              <li>Update the incident status in the system</li>
              <li>Assign corrective actions if needed</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your safety coordinator.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
NEW INCIDENT REPORTED
${companyName}

INCIDENT NOTIFICATION

A new incident has been reported and requires immediate attention.

INCIDENT DETAILS:
Type: ${incidentType}
Location: ${location}
Reported By: ${reportedBy}
Reference: ${incidentRef}

View Incident Details: ${link}

NEXT STEPS:
- Review the incident details using the link above
- Investigate the incident promptly
- Update the incident status in the system
- Assign corrective actions if needed

This is an automated notification from the ${companyName} safety management system.
If you have any questions, please contact your safety coordinator.
  `

  return { html, text }
}

/**
 * Generate HTML and text content for incident updated email
 */
function generateIncidentUpdatedEmail({ incidentType, newStatus, incidentRef, link, companyName }) {
  const statusColor = newStatus.toLowerCase() === 'closed' ? '#059669' : newStatus.toLowerCase() === 'investigating' ? '#f59e0b' : '#3b82f6'
  const statusBg = newStatus.toLowerCase() === 'closed' ? '#ecfdf5' : newStatus.toLowerCase() === 'investigating' ? '#fef3c7' : '#eff6ff'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Incident Status Updated</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Incident Status Updated
          </h1>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Status Update Notification
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            The status of an incident has been updated and requires your attention.
          </p>
          
          <!-- Incident Details -->
          <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: ${statusColor}; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Incident Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${incidentType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">New Status:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  <span style="background-color: ${statusColor}; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 500;">
                    ${newStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937;">${incidentRef}</td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Incident Details
            </a>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your safety coordinator.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
INCIDENT STATUS UPDATED
${companyName}

STATUS UPDATE NOTIFICATION

The status of an incident has been updated and requires your attention.

INCIDENT DETAILS:
Type: ${incidentType}
New Status: ${newStatus.toUpperCase()}
Reference: ${incidentRef}

View Incident Details: ${link}

This is an automated notification from the ${companyName} safety management system.
If you have any questions, please contact your safety coordinator.
  `

  return { html, text }
}

/**
 * Generate HTML and text content for inspection failed email
 */
function generateInspectionFailedEmail({ checklistName, criticalFails, inspectionRef, link, companyName }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inspection Failed - Critical Issues Found</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            URGENT: Inspection Failed
          </h1>
          <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Critical Issues Found
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            An inspection has failed with critical safety issues that require immediate attention.
          </p>
          
          <!-- Inspection Details -->
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Inspection Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Checklist:</td>
                <td style="padding: 8px 0; color: #1f2937;">${checklistName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Critical Failures:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  <span style="background-color: #dc2626; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 500;">
                    ${criticalFails} Issue${criticalFails !== 1 ? 's' : ''}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937;">${inspectionRef}</td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Inspection Details
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Immediate Action Required
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Review the failed inspection details immediately</li>
              <li>Address all critical safety issues</li>
              <li>Implement corrective actions</li>
              <li>Schedule a follow-up inspection</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your safety coordinator immediately.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
URGENT: INSPECTION FAILED
${companyName}

CRITICAL ISSUES FOUND

An inspection has failed with critical safety issues that require immediate attention.

INSPECTION DETAILS:
Checklist: ${checklistName}
Critical Failures: ${criticalFails} Issue${criticalFails !== 1 ? 's' : ''}
Reference: ${inspectionRef}

View Inspection Details: ${link}

IMMEDIATE ACTION REQUIRED:
- Review the failed inspection details immediately
- Address all critical safety issues
- Implement corrective actions
- Schedule a follow-up inspection

This is an automated notification from the ${companyName} safety management system.
If you have any questions, please contact your safety coordinator immediately.
  `

  return { html, text }
}

/**
 * Generate HTML and text content for risk assessment published email
 */
function generateRiskAssessmentPublishedEmail({ raTitle, assessorName, raRef, link, companyName }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Risk Assessment Published</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
            Risk Assessment Published
          </h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">
            ${companyName}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            New Risk Assessment Available
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            A new risk assessment has been published and is ready for review.
          </p>
          
          <!-- RA Details -->
          <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #059669; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
              Risk Assessment Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 30%;">Title:</td>
                <td style="padding: 8px 0; color: #1f2937;">${raTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Assessor:</td>
                <td style="padding: 8px 0; color: #1f2937;">${assessorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Reference:</td>
                <td style="padding: 8px 0; color: #1f2937;">${raRef}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #374151;">Status:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  <span style="background-color: #059669; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 500;">
                    PUBLISHED
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Risk Assessment
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              Next Steps
            </h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Review the risk assessment thoroughly</li>
              <li>Implement recommended controls</li>
              <li>Share with relevant team members</li>
              <li>Schedule regular reviews as needed</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from the ${companyName} safety management system.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
              If you have any questions, please contact your safety coordinator.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
RISK ASSESSMENT PUBLISHED
${companyName}

NEW RISK ASSESSMENT AVAILABLE

A new risk assessment has been published and is ready for review.

RISK ASSESSMENT DETAILS:
Title: ${raTitle}
Assessor: ${assessorName}
Reference: ${raRef}
Status: PUBLISHED

View Risk Assessment: ${link}

NEXT STEPS:
- Review the risk assessment thoroughly
- Implement recommended controls
- Share with relevant team members
- Schedule regular reviews as needed

This is an automated notification from the ${companyName} safety management system.
If you have any questions, please contact your safety coordinator.
  `

  return { html, text }
}
