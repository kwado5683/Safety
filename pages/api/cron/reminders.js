/*
Description: Cron job API route for sending automated reminders.
- Finds corrective actions due today/overdue and sends emails.
- Finds training assignments due in 7 days and sends emails.
- Creates notification records for each email sent.
- Protected with token check for security.

Pseudocode:
- Verify cron secret token
- Query corrective_actions due today/overdue
- Query training_assignments due in 7 days
- Send emails via mailer utility
- Insert notifications for each email
- Return summary of actions taken
*/
import { supabaseServer } from '@/lib/supabaseServer'
import { sendEmail } from '@/lib/mailer'

export default async function handler(req, res) {
  // Verify cron secret token
  const { secret } = req.query
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const results = {
      correctiveActions: { found: 0, emailed: 0, notifications: 0 },
      trainingAssignments: { found: 0, emailed: 0, notifications: 0 }
    }

    // Find corrective actions due today or overdue
    const { data: correctiveActions, error: caError } = await supabaseServer
      .from('corrective_actions')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .lte('due_date', today)

    if (caError) {
      return res.status(500).json({ error: 'Failed to fetch corrective actions' })
    }

    results.correctiveActions.found = correctiveActions?.length || 0

    // Send emails for corrective actions
    for (const action of correctiveActions || []) {
      try {
        const isOverdue = new Date(action.due_date) < new Date(today)
        const subject = isOverdue 
          ? `URGENT: Overdue Corrective Action - ${action.title}`
          : `Reminder: Corrective Action Due Today - ${action.title}`
        
        const html = `
          <h2>${subject}</h2>
          <p><strong>Action:</strong> ${action.title}</p>
          <p><strong>Description:</strong> ${action.description || 'No description provided'}</p>
          <p><strong>Due Date:</strong> ${new Date(action.due_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${action.status}</p>
          ${isOverdue ? '<p style="color: red; font-weight: bold;">This action is OVERDUE!</p>' : ''}
          <p>Please complete this action as soon as possible.</p>
        `

        const emailResult = await sendEmail(action.assigned_to, subject, html)
        
        if (!emailResult.skipped) {
          results.correctiveActions.emailed++
          
          // Create notification record
          await supabaseServer
            .from('notifications')
            .insert({
              type: 'corrective_action_reminder',
              user_id: action.assigned_to,
              title: subject,
              message: `Reminder for corrective action: ${action.title}`,
              related_id: action.id,
              related_type: 'corrective_action',
              sent_via: 'email',
              sent_at: new Date().toISOString()
            })
          
          results.correctiveActions.notifications++
        }
      } catch (error) {
        console.error('Failed to send corrective action reminder:', error)
      }
    }

    // Find training assignments due in 7 days
    const { data: trainingAssignments, error: taError } = await supabaseServer
      .from('training_assignments')
      .select(`
        *,
        trainings(title, description)
      `)
      .eq('status', 'assigned')
      .eq('due_date', sevenDaysFromNow)

    if (taError) {
      return res.status(500).json({ error: 'Failed to fetch training assignments' })
    }

    results.trainingAssignments.found = trainingAssignments?.length || 0

    // Send emails for training assignments
    for (const assignment of trainingAssignments || []) {
      try {
        const subject = `Reminder: Training Due in 7 Days - ${assignment.trainings?.title || 'Training'}`
        
        const html = `
          <h2>${subject}</h2>
          <p><strong>Training:</strong> ${assignment.trainings?.title || 'Training'}</p>
          <p><strong>Description:</strong> ${assignment.trainings?.description || 'No description provided'}</p>
          <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
          <p>Please complete this training within the next 7 days.</p>
        `

        const emailResult = await sendEmail(assignment.user_id, subject, html)
        
        if (!emailResult.skipped) {
          results.trainingAssignments.emailed++
          
          // Create notification record
          await supabaseServer
            .from('notifications')
            .insert({
              type: 'training_reminder',
              user_id: assignment.user_id,
              title: subject,
              message: `Reminder for training: ${assignment.trainings?.title || 'Training'}`,
              related_id: assignment.id,
              related_type: 'training_assignment',
              sent_via: 'email',
              sent_at: new Date().toISOString()
            })
          
          results.trainingAssignments.notifications++
        }
      } catch (error) {
        console.error('Failed to send training reminder:', error)
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
