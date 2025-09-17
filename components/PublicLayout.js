/*
DESCRIPTION: This is a public layout component for unauthenticated users.
- Provides a simple header with sign-in/sign-up options
- Shows the dashboard content without requiring authentication
- Uses the same styling as the main layout but without sidebar navigation
- Allows visitors to see what the project is about

WHAT EACH PART DOES:
1. Simple header with app title and authentication buttons
2. Main content area without sidebar navigation
3. Call-to-action buttons for sign-in and sign-up
4. Same beautiful styling as the main layout

PSEUDOCODE:
- Show header with app title and sign-in/sign-up buttons
- Show main content area where dashboard content goes
- No sidebar navigation (simplified for public access)
- Responsive design that works on all devices
*/

'use client' // This tells Next.js to run this component in the browser

// Import Next.js Link component for navigation
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

// PublicLayout component - for unauthenticated users
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300">
      {/* Header - contains app title and authentication buttons - STICKY */}
      <header className="sticky top-0 z-50 h-16 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-300">
        {/* App title with gradient text */}
        <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Safety Dashboard
        </div>
        
        {/* Authentication buttons and theme toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link 
            href="/sign-in" 
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-3 py-1 rounded-md"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main content area - where page content goes */}
      <main className="p-4 sm:p-6 pt-6">
        {/* Content container with max width for better readability */}
        <div className="mx-auto max-w-7xl">
          {/* children represents the actual page content (dashboard) */}
          {children}
        </div>
      </main>
    </div>
  )
}
