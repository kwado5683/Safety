/*
DESCRIPTION: React hook for haptic feedback functionality.
- Provides easy-to-use haptic feedback functions
- Handles device capability detection
- Manages haptic feedback preferences
- Integrates with mobile utilities

WHAT EACH PART DOES:
1. Device Detection - Checks if device supports haptic feedback
2. Feedback Functions - Provides different types of haptic feedback
3. Preference Management - Handles user preferences for haptic feedback
4. Integration - Easy integration with React components

PSEUDOCODE:
- Check device haptic support
- Provide haptic feedback functions
- Manage user preferences
- Return easy-to-use interface
*/

import { useState, useEffect, useCallback } from 'react'
import { 
  supportsHaptics, 
  hapticLight, 
  hapticMedium, 
  hapticHeavy, 
  hapticSuccess, 
  hapticError, 
  hapticWarning 
} from '@/lib/mobileUtils'

/**
 * Custom hook for haptic feedback functionality
 */
export const useHaptic = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Check if device supports haptic feedback
    const supported = supportsHaptics()
    setIsSupported(supported)

    // Check user preference from localStorage
    const savedPreference = localStorage.getItem('haptic-feedback-enabled')
    if (savedPreference !== null) {
      setIsEnabled(JSON.parse(savedPreference))
    } else {
      // Default to enabled if supported
      setIsEnabled(supported)
    }
  }, [])

  // Save preference to localStorage
  const setHapticPreference = useCallback((enabled) => {
    setIsEnabled(enabled)
    localStorage.setItem('haptic-feedback-enabled', JSON.stringify(enabled))
  }, [])

  // Haptic feedback functions with preference checking
  const light = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticLight()
    }
  }, [isSupported, isEnabled])

  const medium = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticMedium()
    }
  }, [isSupported, isEnabled])

  const heavy = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticHeavy()
    }
  }, [isSupported, isEnabled])

  const success = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticSuccess()
    }
  }, [isSupported, isEnabled])

  const error = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticError()
    }
  }, [isSupported, isEnabled])

  const warning = useCallback(() => {
    if (isSupported && isEnabled) {
      hapticWarning()
    }
  }, [isSupported, isEnabled])

  return {
    isSupported,
    isEnabled,
    setHapticPreference,
    light,
    medium,
    heavy,
    success,
    error,
    warning
  }
}

/**
 * Higher-order component for adding haptic feedback to buttons
 */
export const withHaptic = (Component, hapticType = 'medium') => {
  return function HapticComponent(props) {
    const haptic = useHaptic()
    
    const handleClick = useCallback((e) => {
      // Trigger haptic feedback
      haptic[hapticType]()
      
      // Call original onClick if it exists
      if (props.onClick) {
        props.onClick(e)
      }
    }, [haptic, hapticType, props.onClick])

    return (
      <Component
        {...props}
        onClick={handleClick}
        className={`${props.className || ''} haptic-feedback`}
      />
    )
  }
}

/**
 * Hook for pull-to-refresh functionality
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } catch (error) {
      console.error('Pull-to-refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing])

  return {
    isRefreshing,
    pullDistance,
    handleRefresh
  }
}
