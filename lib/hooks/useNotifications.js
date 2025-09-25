/*
DESCRIPTION: React hook for push notification functionality.
- Manages notification permissions and subscriptions
- Provides easy-to-use notification functions
- Handles notification state and preferences
- Integrates with mobile utilities for haptic feedback

WHAT EACH PART DOES:
1. Permission Management - Handles notification permission requests
2. Subscription Management - Manages push notification subscriptions
3. Notification Display - Shows notifications with proper formatting
4. State Management - Tracks notification preferences and status

PSEUDOCODE:
- Check notification support and permissions
- Manage subscription state and preferences
- Provide notification functions for different events
- Handle permission changes and subscription updates
*/

import { useState, useEffect, useCallback } from 'react'
import { 
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  showTemplateNotification,
  hasNotificationPermission,
  getSubscriptionStatus,
  testNotification
} from '@/lib/notifications'
import { useHaptic } from '@/lib/hooks/useHaptic'

/**
 * Custom hook for push notification functionality
 */
export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [error, setError] = useState(null)
  
  const haptic = useHaptic()

  // Initialize notification system
  useEffect(() => {
    const initializeNotifications = async () => {
      setIsSupported(isNotificationSupported())
      setPermission(getNotificationPermission())
      
      if (isNotificationSupported()) {
        try {
          const currentSubscription = await getSubscriptionStatus()
          setSubscription(currentSubscription)
          setIsSubscribed(!!currentSubscription)
        } catch (error) {
          console.error('Error getting subscription status:', error)
        }
      }
    }

    initializeNotifications()
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notifications not supported in this browser')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)
      
      if (newPermission === 'granted') {
        haptic.success()
        return true
      } else {
        haptic.warning()
        setError('Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setError(error.message)
      haptic.error()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, haptic])

  // Subscribe to push notifications
  const subscribe = useCallback(async (vapidPublicKey) => {
    if (!isSupported) {
      setError('Push notifications not supported')
      return false
    }

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const newSubscription = await subscribeToPushNotifications(vapidPublicKey)
      setSubscription(newSubscription.toJSON())
      setIsSubscribed(true)
      haptic.success()
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setError(error.message)
      haptic.error()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, permission, requestPermission, haptic])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await unsubscribeFromPushNotifications()
      setSubscription(null)
      setIsSubscribed(false)
      haptic.success()
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setError(error.message)
      haptic.error()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [haptic])

  // Show notification using template
  const showNotification = useCallback((templateName, customData = {}) => {
    if (!hasNotificationPermission()) {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      return showTemplateNotification(templateName, customData)
    } catch (error) {
      console.error('Error showing notification:', error)
      setError(error.message)
      return null
    }
  }, [])

  // Test notification
  const test = useCallback(() => {
    if (!hasNotificationPermission()) {
      setError('Please grant notification permission first')
      return false
    }

    try {
      testNotification()
      haptic.light()
      return true
    } catch (error) {
      console.error('Error testing notification:', error)
      setError(error.message)
      haptic.error()
      return false
    }
  }, [haptic])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscription,
    error,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    test,
    clearError,
    
    // Computed
    canRequest: isSupported && permission === 'default',
    canSubscribe: isSupported && permission === 'granted' && !isSubscribed,
    canUnsubscribe: isSupported && isSubscribed,
    canTest: isSupported && permission === 'granted'
  }
}

/**
 * Hook for notification templates
 */
export const useNotificationTemplates = () => {
  const { showNotification } = useNotifications()

  const showIncidentNotification = useCallback(async (incidentData) => {
    return await showNotification('incident', {
      options: {
        body: `New ${incidentData.type} incident reported at ${incidentData.location}`,
        requireInteraction: incidentData.severity === 'critical'
      },
      data: {
        incidentId: incidentData.id,
        url: `/incidents/${incidentData.id}`
      }
    })
  }, [showNotification])

  const showActionNotification = useCallback(async (actionData) => {
    return await showNotification('action', {
      options: {
        body: `Action assigned: ${actionData.title}`,
        requireInteraction: actionData.priority === 'high'
      },
      data: {
        actionId: actionData.id,
        url: `/incidents/${actionData.incidentId}`
      }
    })
  }, [showNotification])

  const showInspectionNotification = useCallback(async (inspectionData) => {
    return await showNotification('inspection', {
      options: {
        body: `Inspection failed with ${inspectionData.criticalFails} critical issues`,
        requireInteraction: true
      },
      data: {
        inspectionId: inspectionData.id,
        url: `/inspections/${inspectionData.id}`
      }
    })
  }, [showNotification])

  const showTrainingNotification = useCallback(async (trainingData) => {
    return await showNotification('training', {
      options: {
        body: `${trainingData.courseName} expires on ${trainingData.expiresOn}`,
        requireInteraction: false
      },
      data: {
        trainingId: trainingData.id,
        url: '/training'
      }
    })
  }, [showNotification])

  const showSystemNotification = useCallback(async (systemData) => {
    return await showNotification('system', {
      options: {
        body: systemData.message,
        requireInteraction: systemData.urgent || false
      },
      data: {
        systemId: systemData.id,
        url: systemData.url || '/admin'
      }
    })
  }, [showNotification])

  return {
    showIncidentNotification,
    showActionNotification,
    showInspectionNotification,
    showTrainingNotification,
    showSystemNotification
  }
}
