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

// Import our custom components
import DashboardLayout from '@/components/DashboardLayout'

// Main incidents page component
export default function IncidentsPage() {
  // State variables - these store data that can change
  const [incidents, setIncidents] = useState([])        // List of incidents
  const [loading, setLoading] = useState(true)         // Loading state
  const [statusFilter, setStatusFilter] = useState('')  // Filter by status
  const [categoryFilter, setCategoryFilter] = useState('') // Filter by category

  // useEffect runs when the component first loads
  useEffect(() => {
    // Function to fetch incidents from our API
    async function fetchIncidents() {
      try {
        setLoading(true)
        
        // Build query string with filters
        const params = new URLSearchParams()
        if (statusFilter) params.append('status', statusFilter)
        if (categoryFilter) params.append('category', categoryFilter)
        
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
  }, [statusFilter, categoryFilter]) // Re-run when filters change

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
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Incidents Management</h1>
        <p className="text-slate-600">Track and manage safety incidents across your organization</p>
      </div>

      {/* Filters section */}
      <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status filter */}
          <input
            type="text"
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
          
          {/* Category filter */}
          <input
            type="text"
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Incidents table */}
      <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg">
        <table className="min-w-full text-sm">
          {/* Table header */}
          <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="divide-y divide-slate-200">
            {incidents.length === 0 ? (
              // Show message when no incidents found
              <tr>
                <td className="px-6 py-8 text-center text-slate-500" colSpan={4}>
                  No incidents found
                </td>
              </tr>
            ) : (
              // Show incidents list
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{incident.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{incident.category || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(incident.created_at).toLocaleDateString()}
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
