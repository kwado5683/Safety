/*
DESCRIPTION: Training reminder system for expiring certificates.
- Finds training records expiring within 30 days
- Sends email notifications to users via Resend
- Can be called manually (GET) or via cron job (POST)
- Includes course details and expiry information

WHAT EACH PART DOES:
1. GET method - Manual trigger for testing/administration
2. POST method - Cron job trigger (preferred for automation)
3. Database query - Finds expiring training records
4. Email generation - Creates personalized reminder emails
5. Email sending - Uses Resend service for delivery
6. Response handling - Returns summary of notifications sent

PSEUDOCODE:
- Query database for training records expiring in next 30 days
- Group records by user_id for efficient email sending
- For each user, generate personalized email with expiring courses
- Send email via Resend service
- Return summary of notifications sent and any errors
*/

// Import Next.js utilities
import { NextResponse } from 'next/server'

// Import database functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import email service
import { sendTrainingReminderEmail } from '@/lib/email'

/**
 * GET handler - Manual trigger for testing
 */
export async function GET(request) {
  try {
    console.log('Training reminders triggered manually via GET request')
    
    // Call the reminder function
    const result = await sendTrainingReminders()
    
    return NextResponse.json({
      success: true,
      message: 'Training reminders processed successfully',
      ...result
    })

  } catch (error) {
    console.error('Error in training reminders GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process training reminders',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Cron job trigger
 */
export async function POST(request) {
  try {
    console.log('Training reminders triggered via cron job')
    
    // Verify this is a legitimate cron request (optional security check)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized cron request' },
        { status: 401 }
      )
    }
    
    // Call the reminder function
    const result = await sendTrainingReminders()
    
    return NextResponse.json({
      success: true,
      message: 'Training reminders processed via cron',
      timestamp: new Date().toISOString(),
      ...result
    })

  } catch (error) {
    console.error('Error in training reminders POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process training reminders',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Core function to send training reminders
 * Finds expiring training records and sends email notifications
 */
async function sendTrainingReminders() {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not configured')
    }

    const supabase = createAdminClient()
    
    // Calculate date 30 days from now
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    // Find training records expiring within the next 30 days
    const { data: expiringRecords, error } = await supabase
      .from('training_records')
      .select(`
        id,
        user_id,
        completed_on,
        expires_on,
        training_courses (
          id,
          name,
          validity_months
        )
      `)
      .not('expires_on', 'is', null)
      .lte('expires_on', thirtyDaysFromNow.toISOString().split('T')[0])
      .gt('expires_on', new Date().toISOString().split('T')[0]) // Not already expired
      .order('expires_on', { ascending: true })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!expiringRecords || expiringRecords.length === 0) {
      return {
        notificationsSent: 0,
        totalRecords: 0,
        message: 'No training records expiring in the next 30 days'
      }
    }

    // Group records by user_id
    const userRecords = {}
    expiringRecords.forEach(record => {
      if (!userRecords[record.user_id]) {
        userRecords[record.user_id] = []
      }
      userRecords[record.user_id].push(record)
    })

    // Send email to each user
    let notificationsSent = 0
    const errors = []

    for (const [userId, records] of Object.entries(userRecords)) {
      try {
        // Get user profile for email address
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', userId)
          .single()

        if (profileError || !userProfile) {
          console.warn(`Could not find user profile for userId: ${userId}`)
          continue
        }

        // Send individual emails for each expiring course
        for (const record of records) {
          const course = record.training_courses
          const trainingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/training`
          
          // Send training reminder email using the new function
          const emailResult = await sendTrainingReminderEmail({
            toEmail: userId, // Using Clerk user ID as email for now
            course: course.name,
            expiresOn: record.expires_on,
            link: trainingLink
          })

          if (emailResult.success) {
            console.log(`Training reminder sent to ${userId} for ${course.name}`)
            notificationsSent++
          } else if (emailResult.skipped) {
            console.log(`Email skipped for ${userId} - ${emailResult.reason}`)
          } else {
            console.error(`Failed to send email to ${userId}:`, emailResult.error)
            errors.push({
              userId,
              course: course.name,
              error: emailResult.error
            })
          }
        }

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError)
        errors.push({
          userId,
          error: userError.message
        })
      }
    }

    return {
      notificationsSent,
      totalRecords: expiringRecords.length,
      totalUsers: Object.keys(userRecords).length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${notificationsSent} training reminder notifications`
    }

  } catch (error) {
    console.error('Error in sendTrainingReminders:', error)
    throw error
  }
}

