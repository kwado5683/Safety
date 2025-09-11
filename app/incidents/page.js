/*
DESCRIPTION: This is the incidents page where users can view and manage safety incidents.
- Shows a list of all incidents in a table format
- Allows filtering and searching incidents
- Uses client-side rendering to fetch data from API
- Protected by authentication (requires login)

WHAT EACH PART DOES:
1. 'use client' - Tells Next.js this component runs in the browser
2. useState - Manages component state (incidents list, loading, filters)
3. useEffect - Fetches data when the page loads
4. Conditional rendering - Shows different content based on data state
5. DashboardLayout - Wraps the page with navigation and styling

PSEUDOCODE:
- When page loads, fetch incidents from API
- Show loading message while fetching
- Display incidents in a table format
- Allow filtering by status and category
- Show pagination for large lists
*/

'use client' // This tells Next.js to run this component in the browser

// Import React hooks for managing component state
import { useEffect, useState } from 'react'
import Link from 'next/link'  // Add this import

// Import our custom components
import DashboardLayout from '@/components/DashboardLayout'

// Main incidents page component
export default function IncidentsPage() {
  // State variables - these store data that can change
  const [incidents, setIncidents] = useState([])        // List of incidents
  const [loading, setLoading] = useState(true)         // Loading state
  const [statusFilter, setStatusFilter] = useState('')  // Filter by incident type
  const [categoryFilter, setCategoryFilter] = useState('') // Filter by severity
  const [locationFilter, setLocationFilter] = useState('') // Filter by location

  // useEffect runs when the component first loads
  useEffect(() => {
    // Function to fetch incidents from our API
    async function fetchIncidents() {
      try {
        setLoading(true)
        
        // Build query string with filters
        const params = new URLSearchParams()
        if (statusFilter) params.append('incidentType', statusFilter)
        if (categoryFilter) params.append('severity', categoryFilter)
        if (locationFilter) params.append('location', locationFilter)
        
        // Fetch incidents from API
        const response = await fetch(`/api/incidents/list?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          setIncidents(data.items || [])
        } else {
          console.error('Failed to fetch incidents')
          setIncidents([])
        }
      } catch (error) {
        console.error('Error fetching incidents:', error)
        setIncidents([])
      } finally {
        setLoading(false)
      }
    }

    // Call the function to fetch incidents
    fetchIncidents()
  }, [statusFilter, categoryFilter, locationFilter]) // Re-run when filters change

  // Show loading message while fetching data
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading incidents...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Main incidents page content
  return (
    <DashboardLayout>
      {/* Page header with action button */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Incidents Management</h1>
            <p className="text-sm sm:text-base text-slate-600">Track and manage safety incidents across your organization</p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/incidents/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report New Incident
            </Link>
          </div>
        </div>
      </div>

      {/* Filters section */}
      <div className="mb-6 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Incident Type filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Incident Types</option>
            <option value="Nearmiss">Nearmiss</option>
            <option value="Accident">Accident</option>
            <option value="Dangerous occurence">Dangerous occurence</option>
          </select>
          
          {/* Severity filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Severity Levels</option>
            <option value="1">Severity 1 (Low)</option>
            <option value="2">Severity 2 (Low-Medium)</option>
            <option value="3">Severity 3 (Medium)</option>
            <option value="4">Severity 4 (High)</option>
            <option value="5">Severity 5 (Critical)</option>
          </select>
          
          {/* Location filter */}
          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Incidents table */}
      <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg">
        <table className="min-w-full text-sm">
          {/* Table header */}
          <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
            <tr>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Image</th>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Severity</th>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Reported By</th>
              <th className="text-left px-3 sm:px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="divide-y divide-slate-200">
            {incidents.length === 0 ? (
              // Show message when no incidents found
              <tr>
                <td className="px-3 sm:px-6 py-8 text-center text-slate-500" colSpan={6}>
                  No incidents found
                </td>
              </tr>
            ) : (
              // Show incidents list
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50 transition-colors duration-150">
                  {/* Image Preview Column */}
                  <td className="px-3 sm:px-6 py-4">
                    {incident.hasImage ? (
                      <div className="relative">
                        <img
                          src={incident.imagePreview.url}
                          alt={incident.imagePreview.alt}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  
                  {/* Incident Type Column */}
                  <td className="px-3 sm:px-6 py-4">
                    <span className="font-medium text-slate-900 text-sm sm:text-base">
                      {incident.incidentType}
                    </span>
                  </td>
                  
                  {/* Severity Column */}
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      incident.severity === '5' ? 'bg-red-100 text-red-800' :
                      incident.severity === '4' ? 'bg-orange-100 text-orange-800' :
                      incident.severity === '3' ? 'bg-yellow-100 text-yellow-800' :
                      incident.severity === '2' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  
                  {/* Location Column */}
                  <td className="px-3 sm:px-6 py-4">
                    <span className="text-slate-600 text-sm sm:text-base">
                      {incident.location}
                    </span>
                  </td>
                  
                  {/* Reported By Column */}
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900 text-sm sm:text-base">
                        {incident.reportedBy}
                      </div>
                      {incident.reporterPhone && (
                        <div className="text-xs text-slate-500">
                          {incident.reporterPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Date Column */}
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="text-slate-900 text-sm sm:text-base">
                        {new Date(incident.timeOfIncident).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(incident.timeOfIncident).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary information */}
      <div className="mt-4 text-sm text-slate-600">
        Showing {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
      </div>
    </DashboardLayout>
  )
}
