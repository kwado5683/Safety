/*
DESCRIPTION: Test page for push notification functionality.
- Allows testing of push notification features
- Shows notification status and capabilities
- Provides buttons to test different notification types
- Useful for development and debugging

WHAT EACH PART DOES:
1. Test Interface - Provides buttons to test notifications
2. Status Display - Shows current notification status
3. Debug Information - Displays notification capabilities
4. Integration Testing - Tests the complete notification flow

PSEUDOCODE:
- Import notification hooks and components
- Create test interface with various notification types
- Display current notification status and capabilities
- Provide debugging information for troubleshooting
*/

'use client'

import { useState, useEffect } from 'react'
import { useNotifications, useNotificationTemplates } from '@/lib/hooks/useNotifications'
import { isNotificationSupported, getNotificationPermission, hasNotificationPermission } from '@/lib/notifications'
import HapticButton from '@/components/mobile/HapticButton'

export default function TestNotificationsPage() {
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

  const {
    showIncidentNotification,
    showActionNotification,
    showInspectionNotification,
    showTrainingNotification,
    showSystemNotification
  } = useNotificationTemplates()

  const [testResults, setTestResults] = useState([])

  const addTestResult = (type, success, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const handleTestIncident = () => {
    try {
      const result = showIncidentNotification({
        id: 'test-123',
        type: 'Test Incident',
        location: 'Test Location',
        severity: 'medium'
      })
      addTestResult('incident', !!result, result ? 'Incident notification sent' : 'Failed to send incident notification')
    } catch (error) {
      addTestResult('incident', false, `Error: ${error.message}`)
    }
  }

  const handleTestAction = () => {
    try {
      const result = showActionNotification({
        id: 'test-456',
        title: 'Test Corrective Action',
        incidentId: 'test-123',
        priority: 'medium'
      })
      addTestResult('action', !!result, result ? 'Action notification sent' : 'Failed to send action notification')
    } catch (error) {
      addTestResult('action', false, `Error: ${error.message}`)
    }
  }

  const handleTestInspection = () => {
    try {
      const result = showInspectionNotification({
        id: 'test-789',
        criticalFails: 2
      })
      addTestResult('inspection', !!result, result ? 'Inspection notification sent' : 'Failed to send inspection notification')
    } catch (error) {
      addTestResult('inspection', false, `Error: ${error.message}`)
    }
  }

  const handleTestTraining = () => {
    try {
      const result = showTrainingNotification({
        id: 'test-101',
        courseName: 'Test Safety Course',
        expiresOn: '2024-12-31'
      })
      addTestResult('training', !!result, result ? 'Training notification sent' : 'Failed to send training notification')
    } catch (error) {
      addTestResult('training', false, `Error: ${error.message}`)
    }
  }

  const handleTestSystem = () => {
    try {
      const result = showSystemNotification({
        id: 'test-202',
        message: 'This is a test system notification',
        urgent: false,
        url: '/admin'
      })
      addTestResult('system', !!result, result ? 'System notification sent' : 'Failed to send system notification')
    } catch (error) {
      addTestResult('system', false, `Error: ${error.message}`)
    }
  }

  const handleSubscribe = async () => {
    try {
      const success = await subscribe(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      addTestResult('subscription', success, success ? 'Successfully subscribed to push notifications' : 'Failed to subscribe')
    } catch (error) {
      addTestResult('subscription', false, `Error: ${error.message}`)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      const success = await unsubscribe()
      addTestResult('subscription', success, success ? 'Successfully unsubscribed from push notifications' : 'Failed to unsubscribe')
    } catch (error) {
      addTestResult('subscription', false, `Error: ${error.message}`)
    }
  }

  const handleRequestPermission = async () => {
    try {
      const success = await requestPermission()
      addTestResult('permission', success, success ? 'Permission granted' : 'Permission denied')
    } catch (error) {
      addTestResult('permission', false, `Error: ${error.message}`)
    }
  }

  const handleTestNotification = () => {
    try {
      const success = test()
      addTestResult('test', success, success ? 'Test notification sent' : 'Failed to send test notification')
    } catch (error) {
      addTestResult('test', false, `Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Push Notification Test Center</h1>
          <p className="text-slate-600">
            Test and debug push notification functionality for your safety management system.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Notification Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Browser Support</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  isSupported ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {isSupported ? 'Supported' : 'Not Supported'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Permission</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  permission === 'granted' ? 'text-green-600 bg-green-100' :
                  permission === 'denied' ? 'text-red-600 bg-red-100' :
                  'text-yellow-600 bg-yellow-100'
                }`}>
                  {permission}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Subscription</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  isSubscribed ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Loading</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  isLoading ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {isLoading ? 'Loading...' : 'Ready'}
                </span>
              </div>
            </div>

            {/* VAPID Key Display */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-sm font-medium text-slate-900 mb-2">VAPID Public Key</h4>
              <p className="text-xs text-slate-600 font-mono break-all">
                {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'Not configured'}
              </p>
            </div>

            {/* Subscription Details */}
            {subscription && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Subscription Details</h4>
                <p className="text-xs text-slate-600 font-mono break-all">
                  Endpoint: {subscription.endpoint?.substring(0, 50)}...
                </p>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Controls</h2>
            
            <div className="space-y-4">
              {/* Permission Controls */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Permission</h3>
                <div className="space-y-2">
                  {canRequest && (
                    <HapticButton
                      onClick={handleRequestPermission}
                      disabled={isLoading}
                      className="w-full"
                      hapticType="medium"
                    >
                      Request Permission
                    </HapticButton>
                  )}
                </div>
              </div>

              {/* Subscription Controls */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Subscription</h3>
                <div className="space-y-2">
                  {canSubscribe && (
                    <HapticButton
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className="w-full"
                      variant="success"
                      hapticType="success"
                    >
                      Subscribe to Push
                    </HapticButton>
                  )}
                  {canUnsubscribe && (
                    <HapticButton
                      onClick={handleUnsubscribe}
                      disabled={isLoading}
                      className="w-full"
                      variant="danger"
                      hapticType="warning"
                    >
                      Unsubscribe
                    </HapticButton>
                  )}
                </div>
              </div>

              {/* Test Controls */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Test Notifications</h3>
                <div className="space-y-2">
                  {canTest && (
                    <HapticButton
                      onClick={handleTestNotification}
                      className="w-full"
                      variant="primary"
                      hapticType="light"
                    >
                      Send Test Notification
                    </HapticButton>
                  )}
                </div>
              </div>

              {/* Template Tests */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Template Tests</h3>
                <div className="grid grid-cols-1 gap-2">
                  <HapticButton
                    onClick={handleTestIncident}
                    disabled={!hasNotificationPermission()}
                    className="w-full"
                    variant="danger"
                    hapticType="medium"
                  >
                    Test Incident
                  </HapticButton>
                  <HapticButton
                    onClick={handleTestAction}
                    disabled={!hasNotificationPermission()}
                    className="w-full"
                    variant="warning"
                    hapticType="medium"
                  >
                    Test Action
                  </HapticButton>
                  <HapticButton
                    onClick={handleTestInspection}
                    disabled={!hasNotificationPermission()}
                    className="w-full"
                    variant="warning"
                    hapticType="medium"
                  >
                    Test Inspection
                  </HapticButton>
                  <HapticButton
                    onClick={handleTestTraining}
                    disabled={!hasNotificationPermission()}
                    className="w-full"
                    variant="secondary"
                    hapticType="light"
                  >
                    Test Training
                  </HapticButton>
                  <HapticButton
                    onClick={handleTestSystem}
                    disabled={!hasNotificationPermission()}
                    className="w-full"
                    variant="secondary"
                    hapticType="light"
                  >
                    Test System
                  </HapticButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Test Results</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.slice().reverse().map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.type}</span>
                    <span className="text-sm opacity-75">{result.timestamp}</span>
                  </div>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              ))}
            </div>
            {testResults.length > 10 && (
              <button
                onClick={() => setTestResults([])}
                className="mt-4 text-sm text-slate-600 hover:text-slate-800"
              >
                Clear Results
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
