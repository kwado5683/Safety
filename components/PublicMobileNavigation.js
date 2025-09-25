/*
DESCRIPTION: Mobile navigation component for public (unauthenticated) pages.
- Provides mobile-friendly navigation for visitors
- Includes links to sign-in and sign-up
- Simple overlay design for public pages

WHAT EACH PART DOES:
1. Hamburger menu button - Toggles sidebar visibility
2. Overlay sidebar - Mobile navigation with auth links
3. Touch gestures - Swipe to open/close sidebar
4. Backdrop - Click outside to close sidebar

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

export default function PublicMobileNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const pathname = usePathname()

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
      setSidebarOpen(false)
    }
    
    // Swipe right to open sidebar (only from left edge)
    if (isRightSwipe && !sidebarOpen && touchStart < 50) {
      setSidebarOpen(true)
    }
  }

  // Close sidebar when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSidebarOpen(false)
    }
  }

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                Safety Dashboard
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link href="/" className="flex items-center p-4 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-base font-medium">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </Link>
              
              <div className="border-t border-slate-200 my-4"></div>
              
              <Link href="/sign-in" className="flex items-center p-4 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-base font-medium">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
              
              <Link href="/sign-up" className="flex items-center p-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-base font-medium">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Get Started
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
