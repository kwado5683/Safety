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
    // Get current user information from Clerk (optional for public dashboard)
    const { userId } = await getAuth(request)
    
    // If user is logged in, bootstrap their profile (ensure 'worker' role exists)
    if (userId) {
      const bootstrapResult = await bootstrapUserProfile(request)
      
      // Log bootstrap result in development (silent in production)
      if (process.env.NODE_ENV === 'development' && bootstrapResult.isNew) {
        console.log(`New user profile created for user: ${userId}`)
      }
    }
    
    // Note: We allow both authenticated and unauthenticated access to the dashboard
    // This allows visitors to see demo data while authenticated users see real data
    
    // Mock dashboard data - in a real app, this would come from your database
    const dashboardData = {
      // Key Performance Indicators
      kpis: {
        openIncidents: 12,           // Number of open incidents
        openActions: 8,              // Number of open corrective actions
        trainingCompliance: 85,      // Training compliance percentage
        upcomingInspections: 5,      // Number of upcoming inspections
      },
      
      // Chart data for visualizations
      charts: {
        // Bar chart data - incidents by month
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
        
        // Pie chart data - incidents by status
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
