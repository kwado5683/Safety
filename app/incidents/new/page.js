/*
DESCRIPTION: This is the new incident creation page where users can report new safety incidents.
- Uses the IncidentForm component to collect incident data
- Handles form submission and API calls
- Redirects to incidents list after successful submission
- Protected by authentication (requires login)

WHAT EACH PART DOES:
1. 'use client' - Tells Next.js this component runs in the browser
2. useState - Manages component state (loading, success, error)
3. useRouter - Next.js hook for navigation
4. IncidentForm - Form component for collecting incident data
5. DashboardLayout - Wraps the page with navigation and styling

PSEUDOCODE:
- When form is submitted, send data to API
- Show loading state during submission
- Handle success/error responses
- Redirect to incidents list on success
*/

'use client' // This tells Next.js to run this component in the browser

// Import React hooks for managing component state and navigation
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Import our custom components
import DashboardLayout from '@/components/DashboardLayout'
import IncidentForm from '@/components/IncidentForm'

// Main new incident page component
export default function NewIncidentPage() {
  // State variables - these store data that can change
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // Next.js router for navigation
  const router = useRouter()

  // Function to handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Send data to API endpoint
      const response = await fetch('/api/incidents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit incident')
      }
      
      // Success - show success message
      setSuccess(true)
      
      // Redirect to incidents list after 2 seconds
      setTimeout(() => {
        router.push('/incidents')
      }, 2000)
      
    } catch (err) {
      console.error('Error submitting incident:', err)
      setError(err.message || 'Failed to submit incident. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show success message
  if (success) {
    return (
      <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Incident Submitted Successfully!</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4">Your incident report has been recorded and will be reviewed.</p>
          <p className="text-xs sm:text-sm text-slate-500">Redirecting to incidents list...</p>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  // Main new incident page content
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Report New Incident</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600">Fill out the form below to report a new safety incident</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Incident form */}
      <div className="max-w-4xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-lg p-4 sm:p-6">
          <IncidentForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
}
