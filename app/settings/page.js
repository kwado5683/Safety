/*
DESCRIPTION: Main settings page that serves as a dashboard for all user settings.
- Provides navigation to different settings sections
- Shows settings overview and quick access
- Mobile-optimized interface with haptic feedback
- Integrates with existing settings components

WHAT EACH PART DOES:
1. Settings Dashboard - Overview of all available settings
2. Navigation Cards - Quick access to different settings sections
3. Mobile Optimization - Touch-friendly interface with haptic feedback
4. Integration - Works with existing settings components

PSEUDOCODE:
- Import DashboardLayout and mobile components
- Create settings overview page
- Add navigation cards for different settings
- Handle mobile optimization and haptic feedback
*/

import DashboardLayout from '@/components/DashboardLayout'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
          <p className="text-slate-600 mb-4">You need to be signed in to access settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">
            Manage your account preferences, notifications, and app settings
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notifications Settings */}
          <SettingsCard
            title="Push Notifications"
            description="Configure push notifications for real-time safety alerts"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L15 7M4.828 7H3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1.828M4.828 7L7 4.828M15 7l2.172 2.172M15 7v5l5-5" />
              </svg>
            }
            href="/settings/notifications"
            color="blue"
          />

          {/* Mobile Settings */}
          <SettingsCard
            title="Mobile Preferences"
            description="Configure haptic feedback and mobile-specific features"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            href="/settings/mobile"
            color="green"
          />

          {/* Account Settings */}
          <SettingsCard
            title="Account & Profile"
            description="Manage your account information and profile settings"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            href="/settings/account"
            color="purple"
          />

          {/* Privacy Settings */}
          <SettingsCard
            title="Privacy & Security"
            description="Control your privacy settings and data preferences"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            href="/settings/privacy"
            color="red"
          />

          {/* App Preferences */}
          <SettingsCard
            title="App Preferences"
            description="Customize your dashboard and app experience"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            href="/settings/preferences"
            color="indigo"
          />

          {/* Data & Export */}
          <SettingsCard
            title="Data & Export"
            description="Export your data and manage data retention"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            href="/settings/data"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="Test Notifications"
              description="Send a test notification"
              href="/test-notifications"
              icon="🔔"
            />
            <QuickActionButton
              title="View Profile"
              description="Check your user profile"
              href="/profile"
              icon="👤"
            />
            <QuickActionButton
              title="Help & Support"
              description="Get help and support"
              href="/help"
              icon="❓"
            />
            <QuickActionButton
              title="About App"
              description="App information and version"
              href="/about"
              icon="ℹ️"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

/**
 * SettingsCard component for navigation to different settings sections
 */
function SettingsCard({ title, description, icon, href, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
  }

  return (
    <Link 
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md touch-friendly haptic-feedback ${colorClasses[color]}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

/**
 * QuickActionButton component for quick actions
 */
function QuickActionButton({ title, description, href, icon }) {
  return (
    <Link 
      href={href}
      className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 touch-friendly haptic-feedback"
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <h4 className="font-medium text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </Link>
  )
}
