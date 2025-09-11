/*
DESCRIPTION: Enhanced header component with professional styling and functionality.
- Includes shield icon, date filters, notifications, and user profile
- Industry-standard header design for safety dashboards
- Mobile-responsive with proper touch targets

WHAT EACH PART DOES:
1. Shield icon - Professional safety industry branding
2. DateFilter - Allows users to filter dashboard data by time period
3. NotificationBell - Shows alerts and notifications
4. UserProfile - User avatar and profile access
5. Responsive design - Adapts to mobile and desktop screens

PSEUDOCODE:
- Display shield icon and app title
- Include date filter component
- Show notification bell with badge
- Display user profile with avatar
- Handle mobile responsiveness
*/

'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import DateFilter from './DateFilter'

// Shield Icon Component
const ShieldIcon = ({ className }) => (
  <svg 
    className={className}
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
)

// Notification Bell Component
const NotificationBell = ({ count = 0 }) => (
  <div className="relative">
    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </button>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
)

// User Profile Component
const UserProfile = ({ user }) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
      <span className="text-white text-sm font-medium">
        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
      </span>
    </div>
    <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--foreground)' }}>
      {user?.firstName || 'User'}
    </span>
  </div>
)

export default function EnhancedHeader({ onDateFilterChange, notificationCount = 3 }) {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b backdrop-blur-sm" style={{ 
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)' 
    }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-3">
            <ShieldIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Safety Dashboard
            </h1>
          </div>

          {/* Center - Date Filter (hidden on mobile) */}
          <div className="hidden md:block">
            <DateFilter onChange={onDateFilterChange} />
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-4">
            <NotificationBell count={notificationCount} />
            {user ? (
              <UserProfile user={user} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm">?</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Date Filter */}
        <div className="md:hidden pb-4">
          <DateFilter onChange={onDateFilterChange} />
        </div>
      </div>
    </header>
  )
}
