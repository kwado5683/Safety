/*
DESCRIPTION: This is the main dashboard page that users see when they first visit the app.
- It shows key performance indicators (KPIs) and charts
- Uses client-side rendering to fetch data from our API
- Displays safety metrics in an easy-to-understand format

WHAT EACH PART DOES:
1. 'use client' - Tells Next.js this component runs in the browser (not server)
2. useState - Stores data that can change (like loading state, dashboard data)
3. useEffect - Runs code when the page loads (like fetching data from API)
4. Conditional rendering - Shows different content based on data state

PSEUDOCODE:
- When page loads, fetch dashboard data from API
- Show loading message while fetching
- If error, show error message
- If success, display KPIs and charts
- Use demo data if API is not available
*/

'use client' // This tells Next.js to run this component in the browser, not on the server

// Import React hooks for managing component state and side effects
import { useEffect, useState } from 'react'

// Import our custom components
import DashboardLayout from '@/components/DashboardLayout'
import KPI from '@/components/KPI'
import { BarChart, PieChart } from '@/components/Chart'

// Main dashboard component
export default function Dashboard() {
  // State variables - these store data that can change
  const [data, setData] = useState(null)        // Stores the dashboard data from API
  const [loading, setLoading] = useState(true)  // Tracks if we're still loading data

  // useEffect runs when the component first loads (like when you visit the page)
  useEffect(() => {
    // This function fetches data from our API
    async function getSummary() {
      try {
        // Try to fetch data from our dashboard API
        const res = await fetch('/api/dashboard/summary')
        
        if (!res.ok) {
          // If API returns an error, store the error status
          setData({ error: res.status })
        } else {
          // If API is successful, store the data
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        // If something goes wrong (like network error), store error 500
        console.error('Failed to fetch dashboard data:', error)
        setData({ error: 500 })
      } finally {
        // Always set loading to false when we're done (success or error)
        setLoading(false)
      }
    }

    // Call the function to fetch data
    getSummary()
  }, []) // Empty array means this only runs once when page loads

  // Demo data - this shows charts even when not logged in
  const demoCharts = {
    bar: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Incidents',
        data: [12, 19, 8, 15, 22, 18],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    pie: {
      labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
      datasets: [{
        label: 'By Status',
        data: [8, 12, 15, 20],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red for open
          'rgba(245, 158, 11, 0.8)',  // Orange for in progress
          'rgba(34, 197, 94, 0.8)',   // Green for resolved
          'rgba(107, 114, 128, 0.8)', // Gray for closed
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 2,
      }]
    }
  }

  // Show loading message while fetching data
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show sign-in prompt if user is not authenticated
  if (data?.error === 401) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">You must sign in to view the dashboard.</p>
          <a href="/sign-in" className="text-indigo-600 underline">Sign in</a>
        </div>
      </DashboardLayout>
    )
  }

  // Show error message if something went wrong
  if (data?.error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-700">Error loading dashboard: {data.error}</p>
        </div>
      </DashboardLayout>
    )
  }

  // Extract KPI and chart data from API response, or use empty objects if not available
  const { kpis = {}, charts = {} } = data || {}

  // Main dashboard content
  return (
    <DashboardLayout>
      {/* Welcome header section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Safety Dashboard</h1>
            <p className="text-slate-600">Monitor and manage your safety operations in real-time</p>
          </div>
          {/* System status indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Online
          </div>
        </div>
      </div>

      {/* KPI cards grid - shows key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPI label="Open Incidents" value={kpis.openIncidents ?? 0} color="red" icon="🚨" />
        <KPI label="Open Actions" value={kpis.openActions ?? 0} color="yellow" icon="⚡" />
        <KPI label="Training Compliance" value={`${kpis.trainingCompliance ?? 0}%`} color="green" icon="📚" />
        <KPI label="Upcoming Inspections" value={kpis.upcomingInspections ?? 0} color="purple" icon="🔍" />
      </div>

      {/* Charts section - shows data visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - shows incidents by month */}
        {(charts.bar || demoCharts.bar) && (
          <BarChart 
            labels={(charts.bar || demoCharts.bar).labels} 
            datasets={(charts.bar || demoCharts.bar).datasets} 
          />
        )}
        {/* Pie chart - shows incidents by status */}
        {(charts.pie || demoCharts.pie) && (
          <PieChart 
            labels={(charts.pie || demoCharts.pie).labels} 
            datasets={(charts.pie || demoCharts.pie).datasets} 
          />
        )}
      </div>
    </DashboardLayout>
  )
}
