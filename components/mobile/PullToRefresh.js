/*
DESCRIPTION: Pull-to-refresh component for mobile devices.
- Implements pull-to-refresh functionality
- Provides visual feedback during pull
- Integrates with haptic feedback
- Optimized for mobile touch interactions

WHAT EACH PART DOES:
1. Pull Detection - Detects pull gestures and distance
2. Visual Feedback - Shows pull progress and refresh state
3. Haptic Integration - Provides haptic feedback during pull
4. Refresh Handling - Manages refresh state and completion

PSEUDOCODE:
- Import pull-to-refresh utilities
- Create component with pull detection
- Add visual feedback for pull state
- Handle refresh completion
*/

'use client'

import { useEffect, useRef, useState } from 'react'
import { PullToRefresh as PullToRefreshUtil, supportsTouch } from '@/lib/mobileUtils'
import { useHaptic } from '@/lib/hooks/useHaptic'

/**
 * Pull-to-refresh component
 */
export default function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  resistance = 2.5,
  maxPull = 120,
  className = '',
  disabled = false
}) {
  const containerRef = useRef(null)
  const pullToRefreshRef = useRef(null)
  const haptic = useHaptic()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !supportsTouch() || disabled) return

    const container = containerRef.current

    // Initialize pull-to-refresh
    pullToRefreshRef.current = new PullToRefreshUtil(
      container,
      async () => {
        setIsRefreshing(true)
        haptic.success()
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Pull-to-refresh error:', error)
          haptic.error()
        } finally {
          setIsRefreshing(false)
        }
      },
      {
        threshold,
        resistance,
        maxPull
      }
    )

    // Cleanup on unmount
    return () => {
      if (pullToRefreshRef.current) {
        pullToRefreshRef.current.destroy()
      }
    }
  }, [onRefresh, threshold, resistance, maxPull, disabled, haptic])

  // Handle pull distance updates for visual feedback
  useEffect(() => {
    const container = containerRef.current
    if (!container || !supportsTouch()) return

    const handleTouchMove = (e) => {
      if (disabled) return

      const touch = e.touches[0]
      if (!touch) return

      const startY = container.dataset.startY
      if (!startY) return

      const currentY = touch.clientY
      const distance = Math.max(0, currentY - startY)
      setPullDistance(distance)

      // Provide haptic feedback at threshold
      if (distance >= threshold && distance < threshold + 10) {
        haptic.medium()
      }
    }

    const handleTouchStart = (e) => {
      if (disabled) return

      const touch = e.touches[0]
      if (touch && container.scrollTop <= 0) {
        container.dataset.startY = touch.clientY
      }
    }

    const handleTouchEnd = () => {
      container.dataset.startY = ''
      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [disabled, threshold, haptic])

  return (
    <div className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      {supportsTouch() && !disabled && (
        <div 
          className="pull-to-refresh-indicator"
          style={{
            opacity: Math.min(pullDistance / threshold, 1),
            transform: `translateX(-50%) translateY(${-50 + (pullDistance * 0.3)}px)`
          }}
        >
          <div className="pull-to-refresh-content">
            <div className={`pull-to-refresh-spinner ${isRefreshing ? 'spinning' : ''}`} />
            <span className="pull-to-refresh-text">
              {isRefreshing 
                ? 'Refreshing...' 
                : pullDistance >= threshold 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div 
        ref={containerRef}
        className="relative overflow-auto"
        style={{
          transform: isRefreshing ? 'translateY(0)' : undefined,
          transition: isRefreshing ? 'transform 0.3s ease' : undefined
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const haptic = useHaptic()

  const refresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    haptic.success()

    try {
      await onRefresh()
    } catch (error) {
      console.error('Pull-to-refresh error:', error)
      haptic.error()
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    isRefreshing,
    refresh
  }
}
