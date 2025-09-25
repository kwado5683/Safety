/*
DESCRIPTION: Mobile-optimized form components with haptic feedback.
- Provides haptic feedback for form interactions
- Optimized for mobile touch input
- Includes visual feedback for form states
- Enhanced accessibility for mobile devices

WHAT EACH PART DOES:
1. Haptic Integration - Provides haptic feedback for form interactions
2. Touch Optimization - Optimized input fields for mobile
3. Visual Feedback - Visual feedback for form states
4. Validation - Enhanced validation with haptic feedback

PSEUDOCODE:
- Import haptic feedback utilities
- Create mobile-optimized form components
- Add haptic feedback to form interactions
- Handle form validation with feedback
*/

'use client'

import { useState, useCallback } from 'react'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { isMobileDevice } from '@/lib/mobileUtils'

/**
 * Mobile-optimized input component
 */
export function MobileInput({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const haptic = useHaptic()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    haptic.light()
  }, [haptic])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }, [onBlur])

  const handleChange = useCallback((e) => {
    if (onChange) onChange(e)
  }, [onChange])

  const handleInvalid = useCallback(() => {
    haptic.error()
  }, [haptic])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInvalid={handleInvalid}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 text-base
            border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-150 ease-in-out
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${isFocused ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
            touch-friendly
          `.trim()}
          style={{
            minHeight: isMobileDevice() ? '48px' : '40px',
            fontSize: isMobileDevice() ? '16px' : '14px' // Prevents zoom on iOS
          }}
          {...props}
        />
        
        {isFocused && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-500 pointer-events-none" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Mobile-optimized textarea component
 */
export function MobileTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  const haptic = useHaptic()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    haptic.light()
  }, [haptic])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }, [onBlur])

  const handleChange = useCallback((e) => {
    if (onChange) onChange(e)
  }, [onChange])

  const handleInvalid = useCallback(() => {
    haptic.error()
  }, [haptic])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInvalid={handleInvalid}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`
            w-full px-4 py-3 text-base
            border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-150 ease-in-out
            resize-vertical
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${isFocused ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
            touch-friendly
          `.trim()}
          style={{
            minHeight: isMobileDevice() ? '120px' : '100px',
            fontSize: isMobileDevice() ? '16px' : '14px' // Prevents zoom on iOS
          }}
          {...props}
        />
        
        {isFocused && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-500 pointer-events-none" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Mobile-optimized select component
 */
export function MobileSelect({
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const haptic = useHaptic()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    haptic.light()
  }, [haptic])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }, [onBlur])

  const handleChange = useCallback((e) => {
    haptic.medium()
    if (onChange) onChange(e)
  }, [onChange, haptic])

  const handleInvalid = useCallback(() => {
    haptic.error()
  }, [haptic])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInvalid={handleInvalid}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 text-base
            border border-slate-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-150 ease-in-out
            appearance-none bg-white
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${isFocused ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
            touch-friendly
          `.trim()}
          style={{
            minHeight: isMobileDevice() ? '48px' : '40px',
            fontSize: isMobileDevice() ? '16px' : '14px' // Prevents zoom on iOS
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {isFocused && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-500 pointer-events-none" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Mobile-optimized checkbox component
 */
export function MobileCheckbox({
  label,
  checked,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const haptic = useHaptic()

  const handleChange = useCallback((e) => {
    haptic.medium()
    if (onChange) onChange(e)
  }, [onChange, haptic])

  const handleFocus = useCallback(() => {
    haptic.light()
  }, [haptic])

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-start space-x-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={onBlur}
            disabled={disabled}
            className={`
              w-5 h-5 rounded border-2 border-slate-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150 ease-in-out
              touch-friendly
              ${error ? 'border-red-500' : ''}
            `.trim()}
            {...props}
          />
          {checked && (
            <svg className="absolute inset-0 w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {label && (
          <span className="text-sm text-slate-700 select-none">
            {label}
          </span>
        )}
      </label>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center ml-8">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
