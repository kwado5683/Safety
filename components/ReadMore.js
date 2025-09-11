/*
DESCRIPTION: This is a component that shows truncated text with a "Read More" / "Read Less" toggle.
- Displays text with a character limit
- Shows "Read More" button when text is truncated
- Shows "Read Less" button when text is expanded
- Mobile-optimized with touch-friendly buttons

WHAT EACH PART DOES:
1. useState - Manages expanded/collapsed state
2. useEffect - Calculates if text needs truncation
3. Conditional rendering - Shows truncated or full text
4. Button toggle - Handles expand/collapse functionality

PSEUDOCODE:
- Check if text length exceeds character limit
- Show truncated text with "Read More" button if needed
- Show full text with "Read Less" button when expanded
- Handle button clicks to toggle state
*/

'use client'

import { useState, useEffect } from 'react'

export default function ReadMore({ 
  text, 
  maxLength = 100, 
  className = '',
  buttonClassName = '',
  showButton = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)

  // Check if text needs truncation
  useEffect(() => {
    if (text && text.length > maxLength) {
      setNeedsTruncation(true)
    } else {
      setNeedsTruncation(false)
    }
  }, [text, maxLength])

  // Don't render if no text
  if (!text) {
    return null
  }

  // Don't truncate if text is short enough
  if (!needsTruncation) {
    return (
      <p className={`text-slate-600 text-sm ${className}`}>
        {text}
      </p>
    )
  }

  // Show truncated or full text based on state
  const displayText = isExpanded ? text : text.substring(0, maxLength) + '...'

  return (
    <div className={className}>
      <p className="text-slate-600 text-sm">
        {displayText}
      </p>
      {showButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors touch-manipulation ${buttonClassName}`}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  )
}
