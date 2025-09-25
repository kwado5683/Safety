/*
DESCRIPTION: API route for subscribing to push notifications.
- Stores push notification subscriptions in database
- Validates subscription data
- Associates subscriptions with users
- Handles subscription updates and management

WHAT EACH PART DOES:
1. Request Validation - Validates subscription data from client
2. User Authentication - Gets current user from Clerk
3. Database Storage - Stores subscription in database
4. Response Handling - Returns success or error response

PSEUDOCODE:
- Validate incoming subscription data
- Get current user from Clerk authentication
- Store subscription in database with user association
- Return success response or error
*/

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    // Get current user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const { subscription } = await request.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createAdminClient()

    // Store subscription in database
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys?.p256dh,
        auth_key: subscription.keys?.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.error('Error storing notification subscription:', error)
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      )
    }

    console.log('Notification subscription stored successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription stored successfully'
    })

  } catch (error) {
    console.error('Error in notification subscribe API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
