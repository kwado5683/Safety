/*
DESCRIPTION: Browser push notification utilities for real-time safety alerts.
- Handles push notification registration and subscription
- Manages notification permissions and preferences
- Provides notification templates for different safety events
- Integrates with service worker for background notifications

WHAT EACH PART DOES:
1. Permission Management - Request and manage notification permissions
2. Subscription - Register and manage push notification subscriptions
3. Notification Templates - Pre-defined templates for safety events
4. Service Worker Integration - Works with service worker for background notifications

PSEUDOCODE:
- Check notification support and permissions
- Register service worker for push notifications
- Create notification subscription and send to server
- Handle notification display and user interactions
*/

/**
 * Browser push notification utilities
 */

// Check if browser supports notifications
export const isNotificationSupported = () => {
  if (typeof window === 'undefined') return false
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Get current notification permission status
export const getNotificationPermission = () => {
  if (typeof window === 'undefined') return 'denied'
  return Notification.permission
}

// Request notification permission from user
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported in this browser')
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    throw error
  }
}

// Register service worker for push notifications
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported')
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered successfully:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    throw error
  }
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async (vapidPublicKey) => {
  try {
    // Register service worker first
    const registration = await registerServiceWorker()
    
    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })
    }

    // Send subscription to server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send subscription to server')
    }

    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    // Unsubscribe from push manager
    await subscription.unsubscribe()

    // Notify server to remove subscription
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      }),
    })

    console.log('Successfully unsubscribed from push notifications')
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    throw error
  }
}

// Show local notification
export const showNotification = (title, options = {}) => {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    console.warn('Notifications not supported or permission denied')
    return
  }

  const defaultOptions = {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'safety-notification',
    requireInteraction: false,
    silent: false,
    ...options
  }

  try {
    const notification = new Notification(title, defaultOptions)
    
    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Navigate to relevant page if URL provided
      if (options.url) {
        window.location.href = options.url
      }
    }

    // Auto-close notification after 5 seconds unless it requires interaction
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }

    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

// Notification templates for different safety events
export const notificationTemplates = {
  incident: {
    title: 'New Incident Reported',
    options: {
      body: 'A new incident has been reported and requires immediate attention.',
      icon: '/icons/incident.png',
      badge: '/icons/incident-badge.png',
      tag: 'incident',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: 'incident', url: '/incidents' }
    }
  },
  
  action: {
    title: 'Action Assigned',
    options: {
      body: 'A new corrective action has been assigned to you.',
      icon: '/icons/action.png',
      badge: '/icons/action-badge.png',
      tag: 'action',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Action' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: 'action', url: '/incidents' }
    }
  },
  
  inspection: {
    title: 'Inspection Failed',
    options: {
      body: 'An inspection has failed with critical safety issues.',
      icon: '/icons/inspection.png',
      badge: '/icons/inspection-badge.png',
      tag: 'inspection',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: 'inspection', url: '/inspections' }
    }
  },
  
  training: {
    title: 'Training Reminder',
    options: {
      body: 'Your training certification is expiring soon.',
      icon: '/icons/training.png',
      badge: '/icons/training-badge.png',
      tag: 'training',
      requireInteraction: false,
      actions: [
        { action: 'view', title: 'View Training' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: 'training', url: '/training' }
    }
  },
  
  system: {
    title: 'System Alert',
    options: {
      body: 'A system alert requires your attention.',
      icon: '/icons/system.png',
      badge: '/icons/system-badge.png',
      tag: 'system',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Alert' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: 'system', url: '/admin' }
    }
  }
}

// Show notification using template
export const showTemplateNotification = (templateName, customData = {}) => {
  const template = notificationTemplates[templateName]
  if (!template) {
    console.error(`Notification template '${templateName}' not found`)
    return
  }

  const options = {
    ...template.options,
    ...customData.options
  }

  // Merge data
  if (customData.data) {
    options.data = {
      ...template.options.data,
      ...customData.data
    }
  }

  return showNotification(template.title, options)
}

// Handle notification actions
export const handleNotificationAction = (action, notificationData) => {
  switch (action) {
    case 'view':
      if (notificationData.url) {
        window.location.href = notificationData.url
      }
      break
    case 'dismiss':
      // Notification will auto-close
      break
    default:
      console.log('Unknown notification action:', action)
  }
}

// Check if user has granted notification permission
export const hasNotificationPermission = () => {
  return getNotificationPermission() === 'granted'
}

// Get notification subscription status
export const getSubscriptionStatus = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return null

    const subscription = await registration.pushManager.getSubscription()
    return subscription ? subscription.toJSON() : null
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return null
  }
}

// Initialize notification system
export const initializeNotifications = async (vapidPublicKey) => {
  try {
    // Check if notifications are supported
    if (!isNotificationSupported()) {
      console.warn('Push notifications not supported in this browser')
      return { supported: false }
    }

    // Register service worker
    const registration = await registerServiceWorker()
    
    // Get current permission status
    const permission = getNotificationPermission()
    
    let subscription = null
    if (permission === 'granted') {
      // Subscribe to push notifications if permission is granted
      subscription = await subscribeToPushNotifications(vapidPublicKey)
    }

    return {
      supported: true,
      permission,
      subscription,
      registration
    }
  } catch (error) {
    console.error('Error initializing notifications:', error)
    return { supported: false, error: error.message }
  }
}

// Test notification function
export const testNotification = () => {
  return showTemplateNotification('system', {
    options: {
      body: 'This is a test notification to verify your notification settings are working correctly.',
      tag: 'test'
    }
  })
}
