/*
DESCRIPTION: This is the main layout component that wraps all dashboard pages.
- Provides the header, sidebar navigation, and main content area
- Handles user authentication state and role-based navigation
- Uses Clerk hooks to get current user information
- Applies beautiful styling with gradients and glassmorphism effects

WHAT EACH PART DOES:
1. useUser - Clerk hook that gives us information about the current logged-in user
2. useClerk - Clerk hook that gives us functions like signOut
3. useState - Manages local state like sidebar open/close
4. Conditional rendering - Shows different navigation based on user role
5. Responsive design - Adapts to different screen sizes

PSEUDOCODE:
- Get current user from Clerk
- Show header with app title and user actions
- Show sidebar with navigation links (different based on user role)
- Show main content area where page content goes
- Handle mobile responsiveness
*/

'use client' // This tells Next.js to run this component in the browser

// Import React hooks and Clerk hooks
import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import RoleGate from './auth/RoleGate'

// DashboardLayout component - wraps all dashboard pages
export default function DashboardLayout({ children }) {
  // Get current user information from Clerk
  const { user, isLoaded } = useUser()
  
  // Get Clerk functions like signOut
  const { signOut } = useClerk()
  
  // Local state for mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Function to handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/sign-in' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Show loading state while Clerk is loading user data
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user is logged in, redirect to sign-in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please Sign In</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">You need to be signed in to view this page.</p>
          <Link href="/sign-in" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Main layout structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300">
      {/* Header - contains app title and user actions - STICKY */}
      <header className="sticky top-0 z-50 h-16 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-300">
        {/* App title with gradient text */}
        <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Safety Dashboard
        </div>
        
        {/* User actions - theme toggle, settings and sign out */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/settings" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Settings
          </Link>
          <button 
            onClick={handleSignOut}
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content area with sidebar and page content */}
      <div className="flex relative">
        {/* Sidebar navigation - hidden on mobile, visible on desktop - STICKY */}
        <aside className="hidden md:block w-64 shrink-0 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 h-[calc(100vh-4rem)] p-4 shadow-sm transition-colors duration-300 fixed left-0 top-16 z-40 overflow-y-auto">
          {/* Navigation menu */}
          <nav className="space-y-2">
            {/* Dashboard link */}
            <Link href="/" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg transition-all duration-200 hover:shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700">
              Dashboard
            </Link>
            
            {/* Incidents link */}
            <Link href="/incidents" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Incidents
            </Link>
            
            {/* Inspections link */}
            <Link href="/inspections" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Inspections
            </Link>
            
            {/* Training link */}
            <Link href="/training" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Training
            </Link>
            
            {/* Documents link */}
            <Link href="/documents" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Documents
            </Link>
            
            {/* Risk Management link - shown to all users for now */}
            <Link href="/risk" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Risk Management
            </Link>
            
            {/* Admin link - only visible to admin users */}
            <AdminLink />
            
            {/* Settings link */}
            <Link href="/settings" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/20 dark:hover:to-gray-800/20 rounded-lg transition-all duration-200 hover:shadow-sm">
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content area - where page content goes */}
        <main className="flex-1 p-4 sm:p-6 pt-6 md:ml-64">
          {/* Content container with max width for better readability */}
          <div className="mx-auto max-w-7xl">
            {/* children represents the actual page content (like dashboard, incidents, etc.) */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * AdminLink component - Only shows admin link to admin users
 * Uses RoleGate to conditionally render the admin navigation link
 */
function AdminLink() {
  return (
    <RoleGate roles={['admin']} fallbackMessage="">
      <Link href="/admin" className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 rounded-lg transition-all duration-200 hover:shadow-sm">
        Admin Panel
      </Link>
    </RoleGate>
  )
}
