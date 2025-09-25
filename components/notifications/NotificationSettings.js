/*
DESCRIPTION: Notification settings component for managing push notifications.
- Allows users to enable/disable push notifications
- Shows notification permission status and subscription state
- Provides test notification functionality
- Integrates with haptic feedback for mobile users

WHAT EACH PART DOES:
1. Permission Management - Request and display notification permissions
2. Subscription Control - Enable/disable push notification subscriptions
3. Testing Interface - Test notification functionality
4. Status Display - Show current notification status and capabilities

PSEUDOCODE:
- Import notification hooks and utilities
- Create settings interface for notification preferences
- Handle permission requests and subscription management
- Provide testing and status information
*/

'use client'

import { useState } from 'react'
import { useNotifications, useNotificationTemplates } from '@/lib/hooks/useNotifications'
import { MobileCheckbox } from '@/components/mobile/MobileForm'
import HapticButton from '@/components/mobile/HapticButton'

/**
 * Notification settings component
 */
export default function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscription,
    error,
    canRequest,
    canSubscribe,
    canUnsubscribe,
    canTest,
    requestPermission,
    subscribe,
    unsubscribe,
    test,
    clearError
  } = useNotifications()

  const [showTestNotifications, setShowTestNotifications] = useState(false)

  const handleSubscribe = async () => {
    // You would typically get this from environment variables
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured')
      return
    }

    await subscribe(vapidPublicKey)
  }

  const handleTestNotification = () => {
    test()
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted', color: 'text-green-600', bg: 'bg-green-100' }
      case 'denied':
        return { text: 'Denied', color: 'text-red-600', bg: 'bg-red-100' }
      case 'default':
        return { text: 'Not Requested', color: 'text-yellow-600', bg: 'bg-yellow-100' }
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getSubscriptionStatus = () => {
    if (isSubscribed) {
      return { text: 'Subscribed', color: 'text-green-600', bg: 'bg-green-100' }
    } else if (permission === 'granted') {
      return { text: 'Not Subscribed', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    } else {
      return { text: 'Cannot Subscribe', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const permissionStatus = getPermissionStatus()
  const subscriptionStatus = getSubscriptionStatus()

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Notifications Not Supported
            </h3>
            <p className="text-yellow-700">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Push Notifications</h2>
        <p className="text-slate-600 mt-1">
          Configure push notifications for real-time safety alerts
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Permission Status */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Notification Permission
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${permissionStatus.color} ${permissionStatus.bg}`}>
            {permissionStatus.text}
          </span>
        </div>

        {canRequest && (
          <HapticButton
            onClick={requestPermission}
            disabled={isLoading}
            variant="primary"
            hapticType="medium"
            className="w-full"
          >
            {isLoading ? 'Requesting...' : 'Request Permission'}
          </HapticButton>
        )}

        {permission === 'denied' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Notification permission was denied. To enable notifications, please:
            </p>
            <ol className="text-sm text-yellow-700 mt-2 list-decimal list-inside space-y-1">
              <li>Click the notification icon in your browser's address bar</li>
              <li>Select "Allow" for notifications</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>

      {/* Subscription Status */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Push Subscription
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${subscriptionStatus.color} ${subscriptionStatus.bg}`}>
            {subscriptionStatus.text}
          </span>
        </div>

        {canSubscribe && (
          <HapticButton
            onClick={handleSubscribe}
            disabled={isLoading}
            variant="primary"
            hapticType="success"
            className="w-full mb-3"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Push Notifications'}
          </HapticButton>
        )}

        {canUnsubscribe && (
          <HapticButton
            onClick={unsubscribe}
            disabled={isLoading}
            variant="danger"
            hapticType="warning"
            className="w-full"
          >
            {isLoading ? 'Unsubscribing...' : 'Unsubscribe from Push Notifications'}
          </HapticButton>
        )}

        {subscription && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Subscription Details</h4>
            <div className="text-xs text-slate-600 font-mono break-all">
              <p><strong>Endpoint:</strong> {subscription.endpoint?.substring(0, 50)}...</p>
              <p><strong>Keys:</strong> {subscription.keys ? 'Present' : 'Not Available'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Test Notifications */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Test Notifications
        </h3>
        
        {canTest ? (
          <div className="space-y-4">
            <HapticButton
              onClick={handleTestNotification}
              variant="secondary"
              hapticType="light"
              className="w-full"
            >
              Send Test Notification
            </HapticButton>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Test notifications help verify that your notification settings are working correctly. 
                You should receive a notification when you click the button above.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Please grant notification permission and subscribe to push notifications to test notifications.
            </p>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Notification Types
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Incident Reports</h4>
              <p className="text-sm text-slate-600">New incidents and updates</p>
            </div>
            <MobileCheckbox checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Corrective Actions</h4>
              <p className="text-sm text-slate-600">Assigned actions and reminders</p>
            </div>
            <MobileCheckbox checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Inspection Alerts</h4>
              <p className="text-sm text-slate-600">Failed inspections and critical issues</p>
            </div>
            <MobileCheckbox checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Training Reminders</h4>
              <p className="text-sm text-slate-600">Expiring certifications</p>
            </div>
            <MobileCheckbox checked={false} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">System Alerts</h4>
              <p className="text-sm text-slate-600">System notifications and updates</p>
            </div>
            <MobileCheckbox checked={false} disabled />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Individual notification type preferences will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
