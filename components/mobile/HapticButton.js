/*
DESCRIPTION: Enhanced button component with haptic feedback.
- Provides haptic feedback on touch interactions
- Optimized for mobile devices
- Includes visual feedback for touch states
- Accessible and touch-friendly

WHAT EACH PART DOES:
1. Haptic Integration - Integrates haptic feedback with button interactions
2. Touch Optimization - Optimized touch targets and interactions
3. Visual Feedback - Provides visual feedback for touch states
4. Accessibility - Maintains accessibility standards

PSEUDOCODE:
- Import haptic feedback hook
- Create button component with haptic feedback
- Add touch-friendly styling
- Handle touch interactions with feedback
*/

'use client'

import { useHaptic } from '@/lib/hooks/useHaptic'
import { isMobileDevice } from '@/lib/mobileUtils'

/**
 * Enhanced button component with haptic feedback
 */
export default function HapticButton({
  children,
  onClick,
  hapticType = 'medium',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const haptic = useHaptic()
  const isMobile = isMobileDevice()

  const handleClick = (e) => {
    if (disabled) return

    // Trigger haptic feedback
    haptic[hapticType]()

    // Call original onClick
    if (onClick) {
      onClick(e)
    }
  }

  const handleTouchStart = () => {
    if (disabled || !isMobile) return
    haptic.light()
  }

  // Button variants
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
      case 'secondary':
        return 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400'
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'
      case 'ghost':
        return 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 border border-slate-300'
      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
    }
  }

  // Button sizes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm min-h-[36px]'
      case 'md':
        return 'px-4 py-2 text-base min-h-[44px]'
      case 'lg':
        return 'px-6 py-3 text-lg min-h-[52px]'
      case 'xl':
        return 'px-8 py-4 text-xl min-h-[60px]'
      default:
        return 'px-4 py-2 text-base min-h-[44px]'
    }
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-friendly haptic-feedback
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `.trim()

  const focusClasses = {
    primary: 'focus:ring-indigo-500',
    secondary: 'focus:ring-slate-500',
    success: 'focus:ring-green-500',
    danger: 'focus:ring-red-500',
    warning: 'focus:ring-yellow-500',
    ghost: 'focus:ring-slate-500'
  }

  return (
    <button
      className={`${baseClasses} ${focusClasses[variant] || focusClasses.primary}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Icon button with haptic feedback
 */
export function HapticIconButton({
  icon,
  onClick,
  hapticType = 'light',
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const haptic = useHaptic()
  const isMobile = isMobileDevice()

  const handleClick = (e) => {
    if (disabled) return

    haptic[hapticType]()
    if (onClick) onClick(e)
  }

  const handleTouchStart = () => {
    if (disabled || !isMobile) return
    haptic.light()
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm'
      case 'md':
        return 'w-10 h-10 text-base'
      case 'lg':
        return 'w-12 h-12 text-lg'
      default:
        return 'w-10 h-10 text-base'
    }
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-lg transition-all duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-friendly haptic-feedback
        ${variant === 'ghost' ? 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200' : ''}
        ${getSizeClasses()}
        ${className}
      `.trim()}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  )
}
