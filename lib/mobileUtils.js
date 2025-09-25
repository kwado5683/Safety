/*
DESCRIPTION: Mobile utilities library for enhanced mobile user experience.
- Provides haptic feedback for touch interactions
- Handles pull-to-refresh functionality
- Manages touch gesture recognition
- Optimizes mobile performance and interactions

WHAT EACH PART DOES:
1. Haptic Feedback - Provides vibration feedback for user interactions
2. Pull-to-Refresh - Implements swipe-down refresh functionality
3. Touch Gestures - Handles swipe and touch gesture recognition
4. Mobile Detection - Identifies mobile devices and capabilities
5. Performance Optimization - Optimizes mobile performance

PSEUDOCODE:
- Detect mobile device capabilities
- Provide haptic feedback functions
- Implement pull-to-refresh logic
- Handle touch gesture recognition
- Optimize for mobile performance
*/

/**
 * Mobile utilities for enhanced user experience
 */

// Check if device supports haptic feedback
export const supportsHaptics = () => {
  if (typeof window === 'undefined') return false
  return 'vibrate' in navigator || 'vibrate' in navigator.plugins
}

// Check if device is mobile
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768
}

// Check if device supports touch
export const supportsTouch = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Haptic Feedback Functions
 */

// Light haptic feedback for subtle interactions
export const hapticLight = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate(10)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

// Medium haptic feedback for button presses
export const hapticMedium = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate(25)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

// Heavy haptic feedback for important actions
export const hapticHeavy = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate([50, 30, 50])
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

// Success haptic feedback pattern
export const hapticSuccess = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate([30, 20, 30])
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

// Error haptic feedback pattern
export const hapticError = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate([100, 50, 100])
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

// Warning haptic feedback pattern
export const hapticWarning = () => {
  if (supportsHaptics()) {
    try {
      navigator.vibrate([200, 100, 200])
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }
}

/**
 * Pull-to-Refresh Implementation
 */

export class PullToRefresh {
  constructor(container, onRefresh, options = {}) {
    this.container = container
    this.onRefresh = onRefresh
    this.options = {
      threshold: 80,
      resistance: 2.5,
      maxPull: 120,
      ...options
    }
    
    this.startY = 0
    this.currentY = 0
    this.isPulling = false
    this.isRefreshing = false
    this.pullDistance = 0
    
    this.init()
  }

  init() {
    if (!supportsTouch()) return

    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
  }

  handleTouchStart(e) {
    // Only start pull-to-refresh if at the top of the container
    if (this.container.scrollTop <= 0) {
      this.startY = e.touches[0].clientY
      this.isPulling = true
    }
  }

  handleTouchMove(e) {
    if (!this.isPulling || this.isRefreshing) return

    this.currentY = e.touches[0].clientY
    this.pullDistance = Math.max(0, this.currentY - this.startY)

    if (this.pullDistance > 0) {
      e.preventDefault()
      
      // Apply resistance to the pull
      const resistance = this.pullDistance / this.options.resistance
      const maxPull = this.options.maxPull
      
      if (resistance <= maxPull) {
        this.container.style.transform = `translateY(${resistance}px)`
        this.updateRefreshIndicator(resistance)
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.isPulling) return

    this.isPulling = false
    this.container.style.transform = ''
    
    if (this.pullDistance >= this.options.threshold && !this.isRefreshing) {
      this.triggerRefresh()
    } else {
      this.hideRefreshIndicator()
    }
    
    this.pullDistance = 0
  }

  updateRefreshIndicator(distance) {
    // Create or update refresh indicator
    let indicator = this.container.querySelector('.pull-to-refresh-indicator')
    
    if (!indicator) {
      indicator = document.createElement('div')
      indicator.className = 'pull-to-refresh-indicator'
      indicator.innerHTML = `
        <div class="pull-to-refresh-content">
          <div class="pull-to-refresh-spinner"></div>
          <span class="pull-to-refresh-text">Pull to refresh</span>
        </div>
      `
      this.container.insertBefore(indicator, this.container.firstChild)
    }

    const progress = Math.min(distance / this.options.threshold, 1)
    indicator.style.opacity = progress
    indicator.style.transform = `translateY(${-50 + (distance * 0.3)}px)`

    if (distance >= this.options.threshold) {
      indicator.querySelector('.pull-to-refresh-text').textContent = 'Release to refresh'
      hapticMedium()
    } else {
      indicator.querySelector('.pull-to-refresh-text').textContent = 'Pull to refresh'
    }
  }

  hideRefreshIndicator() {
    const indicator = this.container.querySelector('.pull-to-refresh-indicator')
    if (indicator) {
      indicator.style.opacity = '0'
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator)
        }
      }, 200)
    }
  }

  triggerRefresh() {
    this.isRefreshing = true
    hapticSuccess()
    
    const indicator = this.container.querySelector('.pull-to-refresh-indicator')
    if (indicator) {
      indicator.querySelector('.pull-to-refresh-text').textContent = 'Refreshing...'
      indicator.querySelector('.pull-to-refresh-spinner').classList.add('spinning')
    }

    // Call the refresh function
    this.onRefresh().finally(() => {
      this.isRefreshing = false
      this.hideRefreshIndicator()
    })
  }

  destroy() {
    this.container.removeEventListener('touchstart', this.handleTouchStart)
    this.container.removeEventListener('touchmove', this.handleTouchMove)
    this.container.removeEventListener('touchend', this.handleTouchEnd)
  }
}

/**
 * Touch Gesture Recognition
 */

export class TouchGestures {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      swipeThreshold: 50,
      swipeTimeout: 300,
      ...options
    }
    
    this.startX = 0
    this.startY = 0
    this.startTime = 0
    this.callbacks = {}
    
    this.init()
  }

  init() {
    if (!supportsTouch()) return

    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  handleTouchStart(e) {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startTime = Date.now()
  }

  handleTouchEnd(e) {
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()
    
    const deltaX = endX - this.startX
    const deltaY = endY - this.startY
    const deltaTime = endTime - this.startTime
    
    if (deltaTime > this.options.swipeTimeout) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > this.options.swipeThreshold && absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.triggerCallback('swipeRight', { deltaX, deltaY, deltaTime })
      } else {
        this.triggerCallback('swipeLeft', { deltaX, deltaY, deltaTime })
      }
    } else if (absY > this.options.swipeThreshold && absY > absX) {
      // Vertical swipe
      if (deltaY > 0) {
        this.triggerCallback('swipeDown', { deltaX, deltaY, deltaTime })
      } else {
        this.triggerCallback('swipeUp', { deltaX, deltaY, deltaTime })
      }
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback)
    }
  }

  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in touch gesture callback:', error)
        }
      })
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
    this.callbacks = {}
  }
}

/**
 * Mobile Performance Optimization
 */

// Debounce function for mobile performance
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for mobile performance
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Optimize images for mobile
export const optimizeImageForMobile = (imageUrl, width = 400) => {
  // This would integrate with your image optimization service
  // For now, return the original URL
  return imageUrl
}

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get device pixel ratio for high-DPI displays
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * Mobile-specific CSS utilities
 */

export const getMobileCSS = () => `
  .pull-to-refresh-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }

  .pull-to-refresh-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .pull-to-refresh-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  .pull-to-refresh-spinner.spinning {
    animation: spin 1s linear infinite;
  }

  .pull-to-refresh-text {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Touch-friendly button styles */
  .touch-friendly {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }

  /* Mobile-optimized transitions */
  @media (prefers-reduced-motion: no-preference) {
    .mobile-smooth {
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
  }

  /* Haptic feedback visual indicators */
  .haptic-feedback:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  /* Mobile-specific hover states */
  @media (hover: none) and (pointer: coarse) {
    .mobile-hover:hover {
      background-color: inherit;
    }
  }
`

/**
 * Initialize mobile enhancements
 */
export const initMobileEnhancements = () => {
  // Add mobile CSS to the document
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = getMobileCSS()
    document.head.appendChild(style)
  }
}
