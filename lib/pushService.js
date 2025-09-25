/*
DESCRIPTION: Push notification service for sending notifications to users.
- Sends push notifications to subscribed users
- Handles notification payload formatting
- Manages VAPID authentication
- Provides notification templates and utilities

WHAT EACH PART DOES:
1. VAPID Configuration - Manages VAPID keys for authentication
2. Notification Sending - Sends push notifications to users
3. Payload Formatting - Formats notification data for delivery
4. Error Handling - Handles notification delivery errors

PSEUDOCODE:
- Configure VAPID keys for push notification authentication
- Send notifications to specific users or all users
- Format notification payloads with proper data
- Handle delivery errors and retry logic
*/

import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabaseServer'

// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
}

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@safety-app.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

/**
 * Send push notification to a specific user
 */
export async function sendNotificationToUser(userId, notificationData) {
  try {
    const supabase = createAdminClient()
    
    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      console.log(`No subscription found for user ${userId}`)
      return { success: false, error: 'No subscription found' }
    }

    // Send notification
    const result = await sendPushNotification(subscription, notificationData)
    return result

  } catch (error) {
    console.error('Error sending notification to user:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send push notification to all subscribed users
 */
export async function sendNotificationToAll(notificationData) {
  try {
    const supabase = createAdminClient()
    
    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('*')

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return { success: false, error: error.message }
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found')
      return { success: true, sent: 0, message: 'No subscriptions found' }
    }

    // Send notifications to all subscribers
    const results = await Promise.allSettled(
      subscriptions.map(subscription => 
        sendPushNotification(subscription, notificationData)
      )
    )

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    const failed = results.length - successful

    return {
      success: true,
      sent: successful,
      failed,
      total: results.length
    }

  } catch (error) {
    console.error('Error sending notification to all users:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send push notification to users with specific roles
 */
export async function sendNotificationToRole(role, notificationData) {
  try {
    const supabase = createAdminClient()
    
    // Get users with specific role and their subscriptions
    const { data: userSubscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select(`
        *,
        user_profiles!inner(role)
      `)
      .eq('user_profiles.role', role)

    if (error) {
      console.error('Error fetching role subscriptions:', error)
      return { success: false, error: error.message }
    }

    if (!userSubscriptions || userSubscriptions.length === 0) {
      console.log(`No subscriptions found for role: ${role}`)
      return { success: true, sent: 0, message: `No subscriptions found for role: ${role}` }
    }

    // Send notifications to role subscribers
    const results = await Promise.allSettled(
      userSubscriptions.map(subscription => 
        sendPushNotification(subscription, notificationData)
      )
    )

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    const failed = results.length - successful

    return {
      success: true,
      sent: successful,
      failed,
      total: results.length,
      role
    }

  } catch (error) {
    console.error('Error sending notification to role:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send push notification using web-push
 */
async function sendPushNotification(subscription, notificationData) {
  try {
    const payload = JSON.stringify(notificationData)

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
      }
    }

    const options = {
      TTL: 24 * 60 * 60, // 24 hours
      urgency: notificationData.urgent ? 'high' : 'normal'
    }

    await webpush.sendNotification(pushSubscription, payload, options)
    
    console.log('Push notification sent successfully to:', subscription.user_id)
    return { success: true }

  } catch (error) {
    console.error('Error sending push notification:', error)
    
    // Handle specific web-push errors
    if (error.statusCode === 410) {
      // Subscription is no longer valid, remove it
      await removeInvalidSubscription(subscription)
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Remove invalid subscription from database
 */
async function removeInvalidSubscription(subscription) {
  try {
    const supabase = createAdminClient()
    
    await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('user_id', subscription.user_id)
      .eq('endpoint', subscription.endpoint)

    console.log('Removed invalid subscription for user:', subscription.user_id)
  } catch (error) {
    console.error('Error removing invalid subscription:', error)
  }
}

/**
 * Notification templates for different events
 */
export const notificationTemplates = {
  incident: (incidentData) => ({
    title: 'New Incident Reported',
    body: `New ${incidentData.type} incident reported at ${incidentData.location}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'incident',
    requireInteraction: incidentData.severity === 'critical',
    urgent: incidentData.severity === 'critical',
    data: {
      type: 'incident',
      incidentId: incidentData.id,
      url: `/incidents/${incidentData.id}`
    }
  }),

  action: (actionData) => ({
    title: 'Action Assigned',
    body: `Action assigned: ${actionData.title}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'action',
    requireInteraction: actionData.priority === 'high',
    urgent: actionData.priority === 'high',
    data: {
      type: 'action',
      actionId: actionData.id,
      incidentId: actionData.incident_id,
      url: `/incidents/${actionData.incident_id}`
    }
  }),

  inspection: (inspectionData) => ({
    title: 'Inspection Failed',
    body: `Inspection failed with ${inspectionData.criticalFails} critical issues`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'inspection',
    requireInteraction: true,
    urgent: true,
    data: {
      type: 'inspection',
      inspectionId: inspectionData.id,
      url: `/inspections/${inspectionData.id}`
    }
  }),

  training: (trainingData) => ({
    title: 'Training Reminder',
    body: `${trainingData.courseName} expires on ${trainingData.expiresOn}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'training',
    requireInteraction: false,
    urgent: false,
    data: {
      type: 'training',
      trainingId: trainingData.id,
      url: '/training'
    }
  }),

  system: (systemData) => ({
    title: 'System Alert',
    body: systemData.message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'system',
    requireInteraction: systemData.urgent || false,
    urgent: systemData.urgent || false,
    data: {
      type: 'system',
      systemId: systemData.id,
      url: systemData.url || '/admin'
    }
  })
}

/**
 * Send notification using template
 */
export async function sendTemplateNotification(templateName, data, target = 'all') {
  const template = notificationTemplates[templateName]
  if (!template) {
    throw new Error(`Notification template '${templateName}' not found`)
  }

  const notificationData = template(data)

  switch (target) {
    case 'all':
      return await sendNotificationToAll(notificationData)
    case 'role':
      return await sendNotificationToRole(data.role, notificationData)
    case 'user':
      return await sendNotificationToUser(data.userId, notificationData)
    default:
      throw new Error(`Invalid target: ${target}`)
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats() {
  try {
    const supabase = createAdminClient()
    
    // Get total subscriptions
    const { count: totalSubscriptions } = await supabase
      .from('notification_subscriptions')
      .select('*', { count: 'exact', head: true })

    // Get subscriptions by role
    const { data: roleStats } = await supabase
      .from('notification_subscriptions')
      .select(`
        user_profiles!inner(role)
      `)

    const roleCounts = roleStats?.reduce((acc, item) => {
      const role = item.user_profiles.role
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {}) || {}

    return {
      totalSubscriptions: totalSubscriptions || 0,
      roleCounts
    }

  } catch (error) {
    console.error('Error getting notification stats:', error)
    return {
      totalSubscriptions: 0,
      roleCounts: {}
    }
  }
}
