/*
DESCRIPTION: This is a theme context that manages dark and light mode for the entire application.
- Provides theme state and toggle functionality
- Stores theme preference in localStorage for persistence
- Ensures proper contrast ratios for accessibility
- Works across all components in the app

WHAT EACH PART DOES:
1. createContext - Creates a React context for theme state
2. useState - Manages current theme state (light/dark)
3. useEffect - Loads saved theme from localStorage on mount
4. ThemeProvider - Wraps the app and provides theme context
5. useTheme - Custom hook to access theme context

PSEUDOCODE:
- Create theme context with light/dark state
- Load saved theme from localStorage
- Provide toggle function to switch themes
- Save theme preference when changed
- Apply theme classes to document body
*/

'use client' // This tells Next.js to run this component in the browser

// Import React hooks for context and state management
import { createContext, useContext, useState, useEffect } from 'react'

// Create theme context
const ThemeContext = createContext()

// Theme provider component
export function ThemeProvider({ children }) {
  // State for current theme (light or dark)
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage when component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to light mode instead of system preference
      setTheme('light')
    }
    setMounted(true)
  }, [])

  // Apply initial theme on mount - only after hydration is complete
  useEffect(() => {
    if (mounted) {
      // Small delay to ensure hydration is complete
      const timer = setTimeout(() => {
        const savedTheme = localStorage.getItem('theme')
        const initialTheme = savedTheme || 'light'
        
        if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }, 0)
      
      return () => clearTimeout(timer)
    }
  }, [mounted])

  // Apply theme to document body when theme changes
  useEffect(() => {
    if (mounted) {
      // Use Tailwind's dark mode class strategy
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Function to set specific theme
  const setThemeMode = (newTheme) => {
    setTheme(newTheme)
  }

  // Provide default theme during SSR to prevent hydration mismatch
  const contextValue = mounted ? {
    theme, 
    toggleTheme, 
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  } : {
    theme: 'light', // Default theme for SSR
    toggleTheme: () => {}, // No-op during SSR
    setThemeMode: () => {}, // No-op during SSR
    isDark: false,
    isLight: true
  }

  // Provide theme context to all children
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
