/*
DESCRIPTION: Client-side dashboard component that handles data fetching and state management.
- Fetches dashboard data from API
- Handles loading and error states
- Provides data to dashboard components
- Separates client-side logic from server components
*/

'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export default function DashboardClient({ children }) {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/summary')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchDashboardData()
    }
  }, [isLoaded])

  // Pass data and states to children
  return children({
    data,
    loading,
    error,
    user,
    isLoaded
  })
}
