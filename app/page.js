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
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// Import our custom components
import DashboardClient from './DashboardClient'
import DashboardLayout from '@/components/DashboardLayout'
import PublicLayout from '@/components/PublicLayout'
import EnhancedHeader from '@/components/EnhancedHeader'
import KPI from '@/components/KPI'
import GaugeChart from '@/components/GaugeChart'
import HeatMapWidget from '@/components/HeatMapWidget'
import DepartmentRanking from '@/components/DepartmentRanking'
import TaskManagement from '@/components/TaskManagement'
import AlertSystem from '@/components/AlertSystem'
import { BarChart, PieChart } from '@/components/Chart'
import PullToRefresh from '@/components/mobile/PullToRefresh'

// Main dashboard component
export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState(null)

  // Handle date filter changes with useCallback to prevent infinite loops
  const handleDateFilterChange = useCallback((dateRange, filterType) => {
    console.log('Dashboard: Date filter changed:', filterType, dateRange)
    
    // Convert date range to filter object
    const filter = {
      filterType,
      startDate: dateRange.start.toISOString().split('T')[0],
      endDate: dateRange.end.toISOString().split('T')[0]
    }
    
    console.log('Dashboard: Setting dateFilter to:', filter)
    setDateFilter(filter)
  }, [])

  // Initialize with today filter on mount - but don't reset if already set
  useEffect(() => {
    if (!dateFilter) {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
      
      const initialFilter = {
        filterType: 'today',
        startDate: todayStart.toISOString().split('T')[0],
        endDate: todayEnd.toISOString().split('T')[0]
      }
      
      setDateFilter(initialFilter)
    }
  }, []) // Remove dateFilter dependency to prevent resets

  return (
    <DashboardClient dateFilter={dateFilter}>
      {({ data, loading, error, user, isLoaded }) => {
        // Demo data for charts (will be replaced with real data later)
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


        // Choose the appropriate layout based on authentication status
        const Layout = user ? DashboardLayout : PublicLayout

        // Show loading message while fetching data
        if (loading || !isLoaded) {
          return (
            <Layout>
              <div className="p-6 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-slate-600">Loading dashboard...</span>
                </div>
              </div>
            </Layout>
          )
        }

        // Show error message if something went wrong
        if (error) {
          return (
            <Layout>
              <div className="p-6 bg-white rounded-xl border border-slate-200">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Error Loading Dashboard
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {error}
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </Layout>
          )
        }

        // Extract KPI, chart, and analytics data from API response, or use empty objects if not available
        const { kpis = {}, charts = {}, analytics = {} } = data || {}

        // Main dashboard content
        return (
          <Layout>
            {/* Main content container */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
              {/* Enhanced Header with Date Filters */}
              <EnhancedHeader 
                onDateFilterChange={handleDateFilterChange}
                notificationCount={4}
              />

              {/* Main content wrapper with pull-to-refresh */}
              <PullToRefresh 
                onRefresh={async () => {
                  // Refresh dashboard data
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
              >
                <div className="p-6">
                {/* Welcome section for visitors */}
            {!user && (
              <div className="mb-8 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm mb-2 text-slate-700">
                  <strong>👋 Welcome, visitor!</strong> You&apos;re viewing our demo dashboard. 
                  Sign up to access the full safety management system.
                </p>
                <div className="flex gap-3">
                  <Link 
                    href="/sign-up" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    href="/sign-in" 
                    className="text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium border border-indigo-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Enhanced KPI cards with real data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6">
              <KPI 
                label="Incidents Reported" 
                value={kpis.openIncidents ?? 12} 
                subtitle="(This Month)"
                trend="down"
                delta={-5}
                color="red" 
                icon="🚨" 
              />
              <KPI 
                label="Corrective Actions" 
                value={kpis.openActions ?? 8} 
                trend="up"
                delta={2}
                color="yellow" 
                icon="⚠️" 
              />
              <KPI 
                label="Training Compliance" 
                value={kpis.trainingCompliance ?? 88} 
                percentage={true}
                trend="up"
                delta={3}
                color="green" 
                icon="📚" 
              />
              <KPI 
                label="Inspections" 
                value={kpis.upcomingInspections ?? 5} 
                trend="stable"
                color="purple" 
                icon="🔍" 
              />
            </div>

            {/* Advanced Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* Incident Trend Chart */}
              <div className="lg:col-span-2">
                {(charts.bar || demoCharts.bar) && (
                  <BarChart 
                    labels={(charts.bar || demoCharts.bar).labels} 
                    datasets={(charts.bar || demoCharts.bar).datasets} 
                  />
                )}
              </div>

            {/* Gauge Chart for Compliance */}
            <div className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-slate-200">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">
                Safety Compliance
              </h3>
              <div className="flex justify-center">
                <GaugeChart 
                  value={kpis.trainingCompliance ?? 88} 
                  max={100} 
                  size={140}
                  label="Overall"
                />
              </div>
            </div>
            </div>

            {/* Second Row - Heat Map and Department Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <HeatMapWidget 
                title="Incident Heat Map" 
                locationData={analytics.locationIncidents || {}}
              />
              <DepartmentRanking 
                title="Department Safety Ranking" 
                departmentData={analytics.departmentScores || []}
              />
            </div>

            {/* Third Row - Task Management and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TaskManagement title="Tasks" />
              <AlertSystem 
                title="Alerts" 
                alertsData={analytics.alerts || []}
              />
            </div>

            {/* Bottom Row - Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie chart - shows incidents by status */}
              {(charts.pie || demoCharts.pie) && (
                <PieChart 
                  labels={(charts.pie || demoCharts.pie).labels} 
                  datasets={(charts.pie || demoCharts.pie).datasets} 
                />
              )}

              {/* Top Causes Chart - NOW USING REAL DATA */}
              <div className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-slate-200">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">
                  Top Causes of Incidents
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const causeData = analytics.causeAnalysis || {
                      'Slips': 0,
                      'Electrical': 0,
                      'Manual Handling': 0,
                      'Other': 0
                    }
                    
                    // Calculate total incidents for percentage calculation
                    const totalIncidents = Object.values(causeData).reduce((sum, count) => sum + count, 0)
                    
                    // Convert to percentage and sort by count
                    const causeItems = Object.entries(causeData)
                      .map(([cause, count]) => ({
                        cause,
                        count,
                        percentage: totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4) // Top 4 causes
                    
                    // Fallback to demo data if no real data
                    const fallbackData = [
                      { cause: 'Slips', percentage: 85, color: 'bg-gray-600' },
                      { cause: 'Electrical', percentage: 60, color: 'bg-gray-500' },
                      { cause: 'Manual Handling', percentage: 55, color: 'bg-gray-400' },
                      { cause: 'Other', percentage: 30, color: 'bg-gray-300' }
                    ]
                    
                    const displayData = causeItems.length > 0 ? causeItems : fallbackData
                    const colors = ['bg-gray-600', 'bg-gray-500', 'bg-gray-400', 'bg-gray-300']
                    
                    return displayData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium text-slate-900">
                          {item.cause}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-1000 ${item.color || colors[index]}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-slate-600">
                          {item.percentage}%
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
            
                </div>
              </PullToRefresh>
            </div>
          </Layout>
        )
      }}
    </DashboardClient>
  )
}
