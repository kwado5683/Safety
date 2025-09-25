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
import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import RoleGate from './auth/RoleGate'
import MobileNavigation from './MobileNavigation'
import { initMobileEnhancements, isMobileDevice } from '@/lib/mobileUtils'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { useNotifications } from '@/lib/hooks/useNotifications'

// DashboardLayout component - wraps all dashboard pages
export default function DashboardLayout({ children }) {
  // Get current user information from Clerk
  const { user, isLoaded } = useUser()
  
  // Get Clerk functions like signOut
  const { signOut } = useClerk()
  
  // Get current pathname for active link highlighting
  const pathname = usePathname()
  
  // Local state for mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Initialize mobile enhancements
  const haptic = useHaptic()
  
  // Initialize notifications
  const notifications = useNotifications()
  
  // Initialize mobile enhancements and notifications on mount
  useEffect(() => {
    initMobileEnhancements()
    
    // Initialize notifications for authenticated users
    if (user && notifications.isSupported && notifications.permission === 'default') {
      // Auto-request permission for authenticated users
      notifications.requestPermission()
    }
  }, [user, notifications.isSupported, notifications.permission, notifications.requestPermission])

  // Function to handle user sign out
  const handleSignOut = async () => {
    try {
      haptic.medium() // Provide haptic feedback
      await signOut({ redirectUrl: '/sign-in' })
    } catch (error) {
      console.error('Sign out error:', error)
      haptic.error() // Error feedback
    }
  }

  // Helper function to get link classes based on active state
  const getLinkClasses = (href, baseClasses = '') => {
    const isActive = pathname === href
    const activeClasses = 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-600'
    const inactiveClasses = 'text-slate-700 hover:bg-slate-100'
    
    return `${baseClasses} block px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:shadow-sm touch-friendly haptic-feedback ${
      isActive ? activeClasses : inactiveClasses
    }`
  }

  // Handle navigation with haptic feedback
  const handleNavigation = (e) => {
    haptic.light()
  }

  // Show loading state while Clerk is loading user data
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user is logged in, redirect to sign-in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
          <p className="text-slate-600 mb-4">You need to be signed in to view this page.</p>
          <Link href="/sign-in" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Main layout structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header - contains app title and user actions - STICKY */}
      <header className="sticky top-0 z-50 h-16 backdrop-blur-sm border-b border-slate-200 bg-white/80 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        {/* App title with gradient text */}
        <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Safety Dashboard
        </div>
        
        {/* User actions - settings and sign out */}
        <div className="flex items-center gap-3">
          {/* Mobile navigation button */}
          <MobileNavigation />
          
          {/* Desktop user actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/settings" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          {/* Mobile user actions */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={handleSignOut}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar and page content */}
      <div className="flex relative">
        {/* Sidebar navigation - hidden on mobile, visible on desktop - STICKY */}
        <aside className="hidden md:block w-64 shrink-0 backdrop-blur-sm border-r border-slate-200 bg-white/80 h-[calc(100vh-4rem)] p-4 shadow-sm fixed left-0 top-16 z-40 overflow-y-auto">
          {/* Navigation menu */}
          <nav className="space-y-2">
            {/* Dashboard link */}
            <Link href="/" className={getLinkClasses('/')} onClick={handleNavigation}>
              Dashboard
            </Link>
            
            {/* Incidents link */}
            <Link href="/incidents" className={getLinkClasses('/incidents')} onClick={handleNavigation}>
              Incidents
            </Link>
            
            {/* Inspections link */}
            <Link href="/inspections" className={getLinkClasses('/inspections')} onClick={handleNavigation}>
              Inspections
            </Link>
            
            {/* Training link */}
            <Link href="/training" className={getLinkClasses('/training')} onClick={handleNavigation}>
              Training
            </Link>
            
            {/* Documents link */}
            <Link href="/documents" className={getLinkClasses('/documents')} onClick={handleNavigation}>
              Documents
            </Link>
            
            {/* Risk Management link - shown to all users for now */}
            <Link href="/risk" className={getLinkClasses('/risk')} onClick={handleNavigation}>
              Risk Management
            </Link>
            
            {/* Admin link - only visible to admin users */}
            <AdminLink onNavigation={handleNavigation} />
            
            {/* Settings link */}
            <Link href="/settings" className={getLinkClasses('/settings')} onClick={handleNavigation}>
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
function AdminLink({ onNavigation }) {
  const pathname = usePathname()
  
  const getLinkClasses = (href) => {
    const isActive = pathname === href
    const activeClasses = 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-600'
    const inactiveClasses = 'text-slate-700 hover:bg-slate-100'
    
    return `block px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:shadow-sm touch-friendly haptic-feedback ${
      isActive ? activeClasses : inactiveClasses
    }`
  }
  
  return (
    <RoleGate roles={['admin']} fallbackMessage="">
      <Link href="/admin" className={getLinkClasses('/admin')} onClick={onNavigation}>
        Admin Panel
      </Link>
    </RoleGate>
  )
}
