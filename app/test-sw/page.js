/*
DESCRIPTION: Test page for Service Worker and push notification functionality.
- Tests Service Worker registration
- Tests push notification subscription
- Provides debugging information
- Mobile-optimized interface

WHAT EACH PART DOES:
1. Service Worker Test - Verifies SW registration and status
2. Push Notification Test - Tests subscription and sending
3. Debug Information - Shows current status and errors
4. Mobile Optimization - Touch-friendly interface

PSEUDOCODE:
- Import necessary components and hooks
- Create test interface for SW and notifications
- Handle Service Worker registration testing
- Provide push notification testing functionality
*/

'use client'

import { useState, useEffect } from 'react'
import { registerServiceWorker, subscribeToPushNotifications, testNotification } from '@/lib/notifications'
import { useNotifications } from '@/lib/hooks/useNotifications'
import HapticButton from '@/components/mobile/HapticButton'

export default function TestServiceWorkerPage() {
  const [swStatus, setSwStatus] = useState('Checking...')
  const [swRegistration, setSwRegistration] = useState(null)
  const [testResults, setTestResults] = useState([])
  const notifications = useNotifications()

  useEffect(() => {
    checkServiceWorkerStatus()
  }, [])

  const checkServiceWorkerStatus = async () => {
    try {
      if (typeof window === 'undefined') {
        setSwStatus('Running on server side')
        return
      }

      if (!('serviceWorker' in navigator)) {
        setSwStatus('Service Worker not supported')
        return
      }

      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        setSwStatus('Service Worker is registered and active')
        setSwRegistration(registration)
      } else {
        setSwStatus('Service Worker not registered')
      }
    } catch (error) {
      setSwStatus(`Error: ${error.message}`)
    }
  }

  const testServiceWorkerRegistration = async () => {
    try {
      addTestResult('Testing Service Worker registration...')
      const registration = await registerServiceWorker()
      addTestResult('✅ Service Worker registered successfully')
      setSwRegistration(registration)
      setSwStatus('Service Worker is registered and active')
    } catch (error) {
      addTestResult(`❌ Service Worker registration failed: ${error.message}`)
    }
  }

  const testPushSubscription = async () => {
    try {
      addTestResult('Testing push notification subscription...')
      
      if (!swRegistration) {
        addTestResult('❌ No Service Worker registration found')
        return
      }

      // Get VAPID public key (you would normally get this from environment)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'test-key'
      
      const subscription = await subscribeToPushNotifications(vapidPublicKey)
      addTestResult('✅ Push notification subscription successful')
      addTestResult(`Subscription endpoint: ${subscription.endpoint?.substring(0, 50)}...`)
    } catch (error) {
      addTestResult(`❌ Push subscription failed: ${error.message}`)
    }
  }

  const testSendNotification = async () => {
    try {
      addTestResult('Testing notification sending...')
      await testNotification()
      addTestResult('✅ Test notification sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send notification: ${error.message}`)
    }
  }

  const addTestResult = (message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Worker & Push Notifications Test</h1>
          <p className="text-slate-600">
            Test Service Worker registration and push notification functionality
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Service Worker Status */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Service Worker Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  swStatus.includes('registered and active') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {swStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Support</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  typeof window !== 'undefined' && 'serviceWorker' in navigator 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Push Manager</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  typeof window !== 'undefined' && 'PushManager' in window 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {typeof window !== 'undefined' && 'PushManager' in window ? 'Supported' : 'Not Supported'}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Status */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Notification Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Permission</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  notifications.permission === 'granted' 
                    ? 'bg-green-100 text-green-800' 
                    : notifications.permission === 'denied'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notifications.permission}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Supported</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  notifications.isSupported 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {notifications.isSupported ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Subscribed</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  notifications.isSubscribed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notifications.isSubscribed ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Test Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HapticButton
              onClick={testServiceWorkerRegistration}
              variant="primary"
              hapticType="medium"
              className="w-full"
            >
              Test SW Registration
            </HapticButton>
            
            <HapticButton
              onClick={testPushSubscription}
              variant="secondary"
              hapticType="light"
              className="w-full"
              disabled={!swRegistration}
            >
              Test Push Subscription
            </HapticButton>
            
            <HapticButton
              onClick={testSendNotification}
              variant="success"
              hapticType="success"
              className="w-full"
              disabled={!notifications.isSubscribed}
            >
              Send Test Notification
            </HapticButton>
            
            <HapticButton
              onClick={clearResults}
              variant="danger"
              hapticType="warning"
              className="w-full"
            >
              Clear Results
            </HapticButton>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Test Results</h2>
            <span className="text-sm text-slate-500">
              {testResults.length} result{testResults.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {testResults.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No test results yet. Run some tests above.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 mt-1">{result.timestamp}</span>
                  <span className="text-sm text-slate-900 flex-1">{result.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
