/*
DESCRIPTION: API route for unsubscribing from push notifications.
- Removes push notification subscriptions from database
- Validates subscription data
- Handles subscription cleanup and management

WHAT EACH PART DOES:
1. Request Validation - Validates subscription data from client
2. User Authentication - Gets current user from Clerk
3. Database Cleanup - Removes subscription from database
4. Response Handling - Returns success or error response

PSEUDOCODE:
- Validate incoming subscription data
- Get current user from Clerk authentication
- Remove subscription from database
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

    // Remove subscription from database
    const { error } = await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', subscription.endpoint)

    if (error) {
      console.error('Error removing notification subscription:', error)
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      )
    }

    console.log('Notification subscription removed successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    })

  } catch (error) {
    console.error('Error in notification unsubscribe API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
