/*
DESCRIPTION: This is a theme toggle component that allows users to switch between light and dark modes.
- Provides a beautiful toggle button with sun/moon icons
- Uses the theme context to manage state
- Includes proper accessibility attributes
- Smooth animations and transitions

WHAT EACH PART DOES:
1. useTheme - Gets theme state and toggle function from context
2. useState - Manages local animation state
3. useEffect - Handles click animations
4. Accessibility - Proper ARIA labels and keyboard support
5. Icons - Sun and moon icons that rotate based on theme

PSEUDOCODE:
- Get current theme from context
- Show sun icon for light mode, moon icon for dark mode
- Handle click to toggle theme
- Add smooth rotation animation
- Include proper accessibility labels
*/

'use client' // This tells Next.js to run this component in the browser

// Import React hooks and theme context
import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

// Theme toggle component
export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle theme toggle with animation
  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative p-2 rounded-lg transition-all duration-300 ease-in-out
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon for light mode */}
      <svg
        className={`
          w-5 h-5 transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}
          absolute inset-0 m-auto
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Moon icon for dark mode */}
      <svg
        className={`
          w-5 h-5 transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}
          absolute inset-0 m-auto
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
