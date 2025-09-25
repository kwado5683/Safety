/*
DESCRIPTION: Client-side dashboard component that handles data fetching and state management.
- Fetches dashboard data from API
- Handles loading and error states
- Provides data to dashboard components
- Separates client-side logic from server components
*/

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'

export default function DashboardClient({ children, dateFilter = null }) {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Memoize the dateFilter to prevent unnecessary re-renders
  const memoizedDateFilter = useMemo(() => dateFilter, [
    dateFilter?.filterType,
    dateFilter?.startDate,
    dateFilter?.endDate
  ])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // Build query parameters for date filtering
        let url = '/api/dashboard/summary'
        if (memoizedDateFilter) {
          const params = new URLSearchParams()
          params.append('filterType', memoizedDateFilter.filterType)
          if (memoizedDateFilter.startDate) {
            params.append('startDate', memoizedDateFilter.startDate)
          }
          if (memoizedDateFilter.endDate) {
            params.append('endDate', memoizedDateFilter.endDate)
          }
          url += `?${params.toString()}`
        }
        
        console.log('DashboardClient: Fetching data from:', url)
        console.log('DashboardClient: Date filter params:', memoizedDateFilter)
        
        const response = await fetch(url)
        
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
  }, [isLoaded, memoizedDateFilter])

  // Pass data and states to children
  return children({
    data,
    loading,
    error,
    user,
    isLoaded
  })
}
