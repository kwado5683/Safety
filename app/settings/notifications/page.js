/*
DESCRIPTION: Notification settings page for managing push notifications.
- Allows users to configure notification preferences
- Shows notification status and capabilities
- Provides testing functionality
- Integrates with mobile haptic feedback

WHAT EACH PART DOES:
1. Settings Interface - Provides notification configuration options
2. Status Display - Shows current notification status
3. Testing Tools - Allows users to test notifications
4. Integration - Works with mobile and haptic features

PSEUDOCODE:
- Import notification settings component
- Create settings page layout
- Handle notification preferences
- Provide testing and configuration options
*/

import DashboardLayout from '@/components/DashboardLayout'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import { auth } from '@clerk/nextjs/server'

export default async function NotificationSettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
          <p className="text-slate-600 mb-4">You need to be signed in to manage notification settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <NotificationSettings />
      </div>
    </DashboardLayout>
  )
}
