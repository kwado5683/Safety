/*
DESCRIPTION: Mobile settings component for haptic feedback preferences.
- Allows users to toggle haptic feedback on/off
- Shows device capabilities and support status
- Provides mobile-optimized settings interface
- Integrates with haptic feedback system

WHAT EACH PART DOES:
1. Haptic Preferences - Toggle haptic feedback on/off
2. Device Info - Shows device capabilities and support
3. Mobile Optimization - Touch-friendly interface
4. Integration - Works with haptic feedback system

PSEUDOCODE:
- Import haptic feedback utilities
- Create settings interface for mobile preferences
- Handle haptic feedback toggles
- Show device capability information
*/

'use client'

import { useState, useEffect } from 'react'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { isMobileDevice, supportsHaptics, supportsTouch } from '@/lib/mobileUtils'
import MobileCheckbox from './MobileForm'

/**
 * Mobile settings component
 */
export default function MobileSettings() {
  const haptic = useHaptic()
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    supportsHaptics: false,
    supportsTouch: false,
    userAgent: '',
    screenSize: ''
  })

  useEffect(() => {
    // Gather device information
    setDeviceInfo({
      isMobile: isMobileDevice(),
      supportsHaptics: supportsHaptics(),
      supportsTouch: supportsTouch(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    })
  }, [])

  const handleHapticToggle = (enabled) => {
    haptic.setHapticPreference(enabled)
    // Provide feedback for the toggle
    if (enabled) {
      haptic.success()
    } else {
      haptic.light()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Mobile Settings</h2>
        <p className="text-slate-600 mt-1">
          Configure mobile-specific features and preferences
        </p>
      </div>

      {/* Haptic Feedback Settings */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Haptic Feedback
        </h3>
        
        <div className="space-y-4">
          <MobileCheckbox
            label="Enable haptic feedback"
            checked={haptic.isEnabled}
            onChange={(e) => handleHapticToggle(e.target.checked)}
            disabled={!haptic.isSupported}
          />
          
          {!haptic.isSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Haptic feedback not supported
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your device doesn't support haptic feedback. This feature is only available on devices with vibration capabilities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Device Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Device Type</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              deviceInfo.isMobile ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Touch Support</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              deviceInfo.supportsTouch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {deviceInfo.supportsTouch ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Haptic Support</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              deviceInfo.supportsHaptics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {deviceInfo.supportsHaptics ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Screen Size</span>
            <span className="text-sm text-slate-900 font-mono">
              {deviceInfo.screenSize}
            </span>
          </div>
        </div>
      </div>

      {/* Test Haptic Feedback */}
      {haptic.isSupported && haptic.isEnabled && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Test Haptic Feedback
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={haptic.light}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors touch-friendly haptic-feedback"
            >
              Light
            </button>
            <button
              onClick={haptic.medium}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors touch-friendly haptic-feedback"
            >
              Medium
            </button>
            <button
              onClick={haptic.heavy}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors touch-friendly haptic-feedback"
            >
              Heavy
            </button>
            <button
              onClick={haptic.success}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors touch-friendly haptic-feedback"
            >
              Success
            </button>
            <button
              onClick={haptic.warning}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors touch-friendly haptic-feedback"
            >
              Warning
            </button>
            <button
              onClick={haptic.error}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors touch-friendly haptic-feedback"
            >
              Error
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Mobile Tips
        </h3>
        
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Pull down on lists to refresh data</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Swipe left or right on navigation items</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Long press for additional options</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Use haptic feedback for better touch interaction</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
