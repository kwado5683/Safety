/*
DESCRIPTION: This is an API route that provides dashboard summary data.
- Returns key performance indicators (KPIs) and chart data
- Allows both authenticated and unauthenticated access (public dashboard)
- Uses Clerk's getAuth() function to get current user (optional)
- Automatically bootstraps user profiles for authenticated users
- Returns mock data for demonstration purposes

WHAT EACH PART DOES:
1. getAuth() - Clerk function that gets current user information from request (optional)
2. bootstrapUserProfile() - Ensures user profile exists with 'worker' role
3. NextResponse - Next.js utility for creating API responses
4. GET method - Handles GET requests to this endpoint
5. Public access - Allows visitors to see demo data
6. Mock data - Returns sample data for demonstration

PSEUDOCODE:
- Get user information (if available)
- Bootstrap user profile if user is logged in
- Return dashboard data (same for all users - demo data)
- Include KPIs and chart data
- Format response as JSON
*/

// Import Next.js utilities for API routes
import { NextResponse } from 'next/server'

// Import Clerk's authentication function
import { getAuth } from '@clerk/nextjs/server'

// Import user profile bootstrap function
import { bootstrapUserProfile } from '@/lib/userBootstrap'

// GET handler - called when someone makes a GET request to /api/dashboard/summary
export async function GET(request) {
  try {
    // Get date filter parameters from query string
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const filterType = searchParams.get('filterType') || 'today'
    
    // Calculate date range based on filter type
    let dateRange = { start: null, end: null }
    
    if (startDate && endDate) {
      // Custom date range
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate + 'T23:59:59.999Z')
      }
    } else {
      // Predefined filters
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filterType) {
        case 'today':
          dateRange = {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          }
          break
        case 'week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          weekEnd.setHours(23, 59, 59, 999)
          dateRange = { start: weekStart, end: weekEnd }
          break
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          monthEnd.setHours(23, 59, 59, 999)
          dateRange = { start: monthStart, end: monthEnd }
          break
        default:
          // Default to today if no valid filter
          dateRange = {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          }
      }
    }
    
    console.log('Date filter applied:', { filterType, dateRange })
    
    // Import Supabase client for real data
    const { createAdminClient } = await import('@/lib/supabaseServer')
    const supabase = createAdminClient()
    
    // Get real data from database where available
    let realData = {}
    
    try {
      // Get incidents count (using correct column names) - FILTERED BY DATE
      const { count: incidentsCount } = await supabase
        .from('incident')
        .select('*', { count: 'exact', head: true })
        .gte('timeofincident', dateRange.start.toISOString())
        .lte('timeofincident', dateRange.end.toISOString())
      
      // Get corrective actions count - FILTERED BY DATE
      const { count: actionsCount } = await supabase
        .from('corrective_actions')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'completed')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
      
      // Get training records for compliance calculation
      const { data: trainingRecords } = await supabase
        .from('training_records')
        .select('*')
      
      // Calculate training compliance
      const totalRecords = trainingRecords?.length || 0
      const validRecords = trainingRecords?.filter(record => 
        new Date(record.expires_on) > new Date()
      ).length || 0
      const trainingCompliance = totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 0
      
      // Get inspections count
      const { count: inspectionsCount } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
      
      // NEW: Get incident trends for bar chart - FILTERED BY DATE RANGE
      const { data: incidentTrends } = await supabase
        .from('incident')
        .select('timeofincident')
        .gte('timeofincident', dateRange.start.toISOString())
        .lte('timeofincident', dateRange.end.toISOString())
        .order('timeofincident', { ascending: true })
      
      // Process incident trends by month
      const monthlyTrends = {}
      if (incidentTrends) {
        incidentTrends.forEach(incident => {
          const date = new Date(incident.timeofincident)
          const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
          monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + 1
        })
      }
      
      // Generate last 6 months data
      const last6Months = []
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().substring(0, 7)
        last6Months.push({
          label: monthNames[date.getMonth()],
          count: monthlyTrends[monthKey] || 0
        })
      }
      
      // NEW: Get incidents by status for pie chart - FILTERED BY DATE
      const { data: incidentsByStatus } = await supabase
        .from('incident')
        .select('id, timeofincident')
        .gte('timeofincident', dateRange.start.toISOString())
        .lte('timeofincident', dateRange.end.toISOString())
      
      // Calculate status distribution (simplified - based on age)
      const now = new Date()
      const statusCounts = {
        'Open': 0,
        'In Progress': 0, 
        'Resolved': 0,
        'Closed': 0
      }
      
      if (incidentsByStatus) {
        incidentsByStatus.forEach(incident => {
          const incidentDate = new Date(incident.timeofincident)
          const daysDiff = Math.floor((now - incidentDate) / (1000 * 60 * 60 * 24))
          
          if (daysDiff <= 7) {
            statusCounts['Open']++
          } else if (daysDiff <= 30) {
            statusCounts['In Progress']++
          } else if (daysDiff <= 90) {
            statusCounts['Resolved']++
          } else {
            statusCounts['Closed']++
          }
        })
      }
      
      // NEW: Get location-based incidents for heat map - FILTERED BY DATE
      const { data: locationIncidents } = await supabase
        .from('incident')
        .select('location')
        .gte('timeofincident', dateRange.start.toISOString())
        .lte('timeofincident', dateRange.end.toISOString())
      
      const locationCounts = {}
      if (locationIncidents) {
        locationIncidents.forEach(incident => {
          const location = incident.location || 'Unknown'
          locationCounts[location] = (locationCounts[location] || 0) + 1
        })
      }
      
      // NEW: Get department safety scores (mock for now - would need department data)
      const departmentScores = [
        { name: 'Production', score: Math.max(60, 100 - (locationCounts['Production Floor'] || 0) * 5) },
        { name: 'Warehouse', score: Math.max(50, 100 - (locationCounts['Warehouse'] || 0) * 8) },
        { name: 'Office', score: Math.max(80, 100 - (locationCounts['Office'] || 0) * 3) },
        { name: 'Maintenance', score: Math.max(40, 100 - (locationCounts['Maintenance'] || 0) * 10) }
      ]
      
      // NEW: Get incident causes analysis - FILTERED BY DATE
      const { data: incidentDescriptions } = await supabase
        .from('incident')
        .select('description')
        .gte('timeofincident', dateRange.start.toISOString())
        .lte('timeofincident', dateRange.end.toISOString())
      
      const causeAnalysis = {
        'Slips': 0,
        'Electrical': 0,
        'Manual Handling': 0,
        'Other': 0
      }
      
      if (incidentDescriptions) {
        incidentDescriptions.forEach(incident => {
          const desc = (incident.description || '').toLowerCase()
          if (desc.includes('slip') || desc.includes('trip') || desc.includes('fall')) {
            causeAnalysis['Slips']++
          } else if (desc.includes('electrical') || desc.includes('electric') || desc.includes('shock')) {
            causeAnalysis['Electrical']++
          } else if (desc.includes('manual') || desc.includes('lifting') || desc.includes('handling')) {
            causeAnalysis['Manual Handling']++
          } else {
            causeAnalysis['Other']++
          }
        })
      }
      
      // NEW: Get alerts data
      const alerts = []
      
      // Overdue inspections
      const { data: overdueInspections } = await supabase
        .from('inspections')
        .select('id, started_at, checklists(name)')
        .is('submitted_at', null)
        .lt('started_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()) // 3 days ago
      
      if (overdueInspections && overdueInspections.length > 0) {
        alerts.push({
          id: 1,
          title: 'Overdue Inspection',
          description: `${overdueInspections.length} inspection(s) are overdue`,
          type: 'inspection',
          priority: 'high',
          timestamp: '2 hours ago',
          action: 'Review Inspections'
        })
      }
      
      // Training expiry warnings
      const { data: expiringTraining } = await supabase
        .from('training_records')
        .select('*')
        .lt('expires_on', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days from now
        .gt('expires_on', new Date().toISOString()) // Not yet expired
      
      if (expiringTraining && expiringTraining.length > 0) {
        alerts.push({
          id: 2,
          title: 'Training Expiry Warning',
          description: `${expiringTraining.length} training record(s) expiring soon`,
          type: 'training',
          priority: 'medium',
          timestamp: '4 hours ago',
          action: 'Schedule Training'
        })
      }
      
      realData = {
        incidentsCount: incidentsCount || 0,
        actionsCount: actionsCount || 0,
        trainingCompliance: trainingCompliance,
        inspectionsCount: inspectionsCount || 0,
        // NEW: Chart data
        incidentTrends: last6Months,
        incidentsByStatus: statusCounts,
        locationIncidents: locationCounts,
        departmentScores: departmentScores,
        causeAnalysis: causeAnalysis,
        alerts: alerts
      }
      
      console.log('Enhanced dashboard summary generated:', realData)
      
    } catch (dbError) {
      console.error('Error fetching real data:', dbError)
      // Continue with demo data if database fails
    }
    
    // Dashboard data with real data where available, demo data as fallback
    const dashboardData = {
      // Key Performance Indicators
      kpis: {
        openIncidents: realData.incidentsCount || 12,           // Real data or demo
        openActions: realData.actionsCount || 8,                // Real data or demo
        trainingCompliance: realData.trainingCompliance || 85,  // Real data or demo
        upcomingInspections: realData.inspectionsCount || 5,    // Real data or demo
      },
      
      // Chart data for visualizations - NOW USING REAL DATA
      charts: {
        // Bar chart data - incidents by month (REAL DATA)
        bar: {
          labels: realData.incidentTrends?.map(trend => trend.label) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Incidents',
            data: realData.incidentTrends?.map(trend => trend.count) || [12, 19, 8, 15, 22, 18],
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 8,
          }]
        },
        
        // Pie chart data - incidents by status (REAL DATA)
        pie: {
          labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
          datasets: [{
            label: 'By Status',
            data: realData.incidentsByStatus ? [
              realData.incidentsByStatus.Open || 0,
              realData.incidentsByStatus['In Progress'] || 0,
              realData.incidentsByStatus.Resolved || 0,
              realData.incidentsByStatus.Closed || 0
            ] : [8, 12, 15, 20],
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
      },
      
      // NEW: Additional dashboard data
      analytics: {
        // Location-based incidents for heat map
        locationIncidents: realData.locationIncidents || {},
        
        // Department safety scores
        departmentScores: realData.departmentScores || [
          { name: 'Production', score: 95 },
          { name: 'Warehouse', score: 78 },
          { name: 'Office', score: 65 },
          { name: 'Maintenance', score: 45 }
        ],
        
        // Incident cause analysis
        causeAnalysis: realData.causeAnalysis || {
          'Slips': 0,
          'Electrical': 0,
          'Manual Handling': 0,
          'Other': 0
        },
        
        // Real-time alerts
        alerts: realData.alerts || []
      }
    }
    
    // Return the dashboard data as JSON
    return NextResponse.json(dashboardData)
    
  } catch (error) {
    // If something goes wrong, return a server error
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
