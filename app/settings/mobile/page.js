/*
DESCRIPTION: Mobile settings page for managing mobile-specific preferences.
- Allows users to configure haptic feedback and mobile features
- Shows device capabilities and mobile optimization settings
- Integrates with mobile utilities and haptic feedback system
- Mobile-optimized interface with touch-friendly controls

WHAT EACH PART DOES:
1. Mobile Settings Interface - Configuration for mobile-specific features
2. Haptic Feedback Control - Toggle and test haptic feedback
3. Device Information - Display device capabilities and support
4. Mobile Optimization - Touch-friendly interface and mobile tips

PSEUDOCODE:
- Import DashboardLayout and MobileSettings component
- Create mobile settings page layout
- Handle mobile-specific settings and preferences
- Provide device information and mobile tips
*/

import DashboardLayout from '@/components/DashboardLayout'
import MobileSettings from '@/components/mobile/MobileSettings'
import { auth } from '@clerk/nextjs/server'

export default async function MobileSettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
          <p className="text-slate-600 mb-4">You need to be signed in to manage mobile settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <MobileSettings />
      </div>
    </DashboardLayout>
  )
}
