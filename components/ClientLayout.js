/*
Description: Client-side wrapper for Layout component.
- Handles authentication state and role-based navigation.
- Wraps the main Layout component to avoid server/client conflicts.

Pseudocode:
- Use useAuth hook to get user state
- Pass user data to Layout component
- Handle loading states
*/
'use client'

import { useAuth } from '../lib/hooks/useAuth'
import Layout from './Layout'

export default function ClientLayout({ children, headerRight, sidebar }) {
  const { user, loading, isManager, isOfficer } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    )
  }

  return (
    <Layout 
      headerRight={headerRight} 
      sidebar={sidebar}
      user={user}
      isManager={isManager}
      isOfficer={isOfficer}
    >
      {children}
    </Layout>
  )
}
