/*
DESCRIPTION: Mobile navigation component with hamburger menu and overlay sidebar.
- Provides mobile-friendly navigation with hamburger menu
- Includes touch gestures for opening/closing sidebar
- Responsive overlay that works on all screen sizes
- Smooth animations and transitions

WHAT EACH PART DOES:
1. Hamburger menu button - Toggles sidebar visibility
2. Overlay sidebar - Mobile navigation with touch support
3. Touch gestures - Swipe to open/close sidebar
4. Backdrop - Click outside to close sidebar
5. Active link highlighting - Shows current page

PSEUDOCODE:
- Create hamburger menu button in header
- Add overlay sidebar with navigation links
- Implement touch gestures for mobile interaction
- Add backdrop click to close sidebar
- Handle responsive behavior and animations
*/

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import RoleGate from './auth/RoleGate'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { TouchGestures } from '@/lib/mobileUtils'

export default function MobileNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const pathname = usePathname()
  const haptic = useHaptic()

  // Handle touch gestures for mobile sidebar
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    // Swipe left to close sidebar
    if (isLeftSwipe && sidebarOpen) {
      haptic.light()
      setSidebarOpen(false)
    }
    
    // Swipe right to open sidebar (only from left edge)
    if (isRightSwipe && !sidebarOpen && touchStart < 50) {
      haptic.light()
      setSidebarOpen(true)
    }
  }

  // Close sidebar when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      haptic.light()
      setSidebarOpen(false)
    }
  }

  // Handle navigation with haptic feedback
  const handleNavigation = () => {
    haptic.medium()
    setSidebarOpen(false)
  }

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Get link classes for active state
  const getLinkClasses = (path) => {
    const isActive = pathname === path
    return `flex items-center p-4 rounded-lg transition-colors text-base font-medium touch-friendly haptic-feedback ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 border-r-4 border-indigo-600'
        : 'text-slate-700 hover:bg-slate-100'
    }`
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => {
          haptic.medium()
          setSidebarOpen(true)
        }}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors touch-friendly haptic-feedback"
        aria-label="Open navigation menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleBackdropClick}
          />
          
          {/* Sidebar */}
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl transform transition-transform"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="font-bold text-lg text-slate-900">
                Navigation
              </div>
              <button
                onClick={() => {
                  haptic.light()
                  setSidebarOpen(false)
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors touch-friendly haptic-feedback"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link href="/" className={getLinkClasses('/')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </Link>
              
              <Link href="/incidents" className={getLinkClasses('/incidents')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Incidents
              </Link>
              
              <Link href="/inspections" className={getLinkClasses('/inspections')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Inspections
              </Link>
              
              <Link href="/training" className={getLinkClasses('/training')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Training
              </Link>
              
              <Link href="/documents" className={getLinkClasses('/documents')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </Link>
              
              <Link href="/risk" className={getLinkClasses('/risk')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Risk Management
              </Link>
              
              {/* Admin link - only visible to admin users */}
              <RoleGate roles={['admin', 'owner']}>
                <Link href="/admin" className={getLinkClasses('/admin')} onClick={handleNavigation}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </Link>
              </RoleGate>
              
              <Link href="/settings" className={getLinkClasses('/settings')} onClick={handleNavigation}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 text-center">
                Swipe left to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
