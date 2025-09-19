/*
DESCRIPTION: Risk Assessment creation page with 5-step stepper.
- Step 1: Details (title, activity, location, assessor)
- Step 2: Hazards (hazard identification and who might be harmed)
- Step 3: Risk Matrix (likelihood, severity, risk calculation)
- Step 4: Controls (existing and additional controls)
- Step 5: Review (summary and publish)
- Mobile-first design with stepper navigation
- Auto-saves draft on each step
- Risk calculation with color coding

WHAT EACH PART DOES:
1. Stepper component - Navigation between 5 steps
2. Form state management - Tracks all RA data
3. Risk calculation - Computes risk = likelihood * severity
4. Draft saving - Auto-saves to API on each step
5. Publish functionality - Locks the RA version
6. Actions creation - Creates incident actions from additional controls

PSEUDOCODE:
- Initialize form state with empty RA data
- Render stepper with 5 steps
- Handle step navigation and validation
- Auto-save draft on each step change
- Calculate risk scores with color coding
- Submit final RA and create actions if needed
*/

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/**
 * Risk Assessment creation page with 5-step stepper
 */
export default function NewRiskAssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [raId, setRaId] = useState(null)

  // Form state
  const [raData, setRaData] = useState({
    title: '',
    activity: '',
    location: '',
    assessor_id: '',
    hazards: []
  })

  // Step validation
  const [stepValidation, setStepValidation] = useState({
    1: false, // Details
    2: false, // Hazards
    3: false, // Risk Matrix
    4: false, // Controls
    5: false  // Review
  })

  // Validate current step
  const validateStep = (step, data) => {
    switch (step) {
      case 1:
        return data.title && data.activity && data.location && data.assessor_id
      case 2:
        return data.hazards && data.hazards.length > 0 && 
               data.hazards.every(h => h.hazard && h.who_might_be_harmed)
      case 3:
        return data.hazards.every(h => 
          h.likelihood_before && h.severity_before && 
          h.likelihood_after && h.severity_after
        )
      case 4:
        return data.hazards.every(h => h.existing_controls)
      case 5:
        return true // Review step is always valid
      default:
        return false
    }
  }

  // Update form data and validate step
  const updateRaData = (updates) => {
    const newData = { ...raData, ...updates }
    setRaData(newData)
    
    // Validate all steps
    const newValidation = {}
    for (let i = 1; i <= 5; i++) {
      newValidation[i] = validateStep(i, newData)
    }
    setStepValidation(newValidation)
  }

  // Calculate risk score
  const calculateRisk = (likelihood, severity) => {
    return likelihood * severity
  }

  // Get risk color
  const getRiskColor = (risk) => {
    if (risk <= 4) return 'green'
    if (risk <= 9) return 'yellow'
    if (risk <= 16) return 'orange'
    return 'red'
  }

  // Get risk level
  const getRiskLevel = (risk) => {
    if (risk <= 4) return 'Low'
    if (risk <= 9) return 'Medium'
    if (risk <= 16) return 'High'
    return 'Very High'
  }

  // Save draft
  const saveDraft = async () => {
    try {
      const response = await fetch('/api/ra', {
        method: raId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: raId,
          ...raData,
          status: 'draft'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const result = await response.json()
      if (!raId) {
        setRaId(result.id)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('Failed to save draft')
    }
  }

  // Auto-save only on step changes, not on individual field changes
  useEffect(() => {
    // Only auto-save when moving to step 2 or higher and we have basic details
    if (currentStep >= 2 && raData.title && raData.activity && raData.location && raData.assessor_id) {
      const timeoutId = setTimeout(() => {
        saveDraft()
      }, 2000) // Debounce for 2 seconds
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentStep]) // Only depend on currentStep, not individual fields

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 5 && stepValidation[currentStep]) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Publish RA
  const publishRA = async () => {
    if (!raId) {
      setError('No RA ID found. Please save draft first.')
      return
    }

    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch(`/api/ra/${raId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to publish RA')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (error) {
      console.error('Error publishing RA:', error)
      setError(error.message)
    } finally {
      setIsPublishing(false)
    }
  }

  // Create actions from additional controls
  const createActions = async () => {
    if (!raId) {
      setError('No RA ID found. Please save draft first.')
      return
    }

    try {
      const response = await fetch(`/api/ra/${raId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to create actions')
      }

      const result = await response.json()
      alert(`Created ${result.createdActions} actions from additional controls`)
    } catch (error) {
      console.error('Error creating actions:', error)
      setError(error.message)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Risk Assessment Published!
          </h3>
          <p className="text-green-600 dark:text-green-300">
            Redirecting back to admin panel...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">New Risk Assessment</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : step < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Details</span>
            <span>Hazards</span>
            <span>Risk Matrix</span>
            <span>Controls</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Risk Assessment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={raData.title}
                  onChange={(e) => updateRaData({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Enter risk assessment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Activity *
                </label>
                <textarea
                  value={raData.activity}
                  onChange={(e) => updateRaData({ activity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  rows={3}
                  placeholder="Describe the activity being assessed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={raData.location}
                  onChange={(e) => updateRaData({ location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assessor ID *
                </label>
                <input
                  type="text"
                  value={raData.assessor_id}
                  onChange={(e) => updateRaData({ assessor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Enter assessor ID"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Hazards */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Hazards</h2>
              <button
                onClick={() => updateRaData({ 
                  hazards: [...raData.hazards, { 
                    hazard: '', 
                    who_might_be_harmed: '', 
                    existing_controls: '', 
                    likelihood_before: 1, 
                    severity_before: 1, 
                    risk_before: 1, 
                    additional_controls: '', 
                    likelihood_after: 1, 
                    severity_after: 1, 
                    risk_after: 1 
                  }] 
                })}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                + Add Hazard
              </button>
            </div>

            <div className="space-y-4">
              {raData.hazards.map((hazard, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100">Hazard {index + 1}</h3>
                    <button
                      onClick={() => updateRaData({ 
                        hazards: raData.hazards.filter((_, i) => i !== index) 
                      })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Hazard *
                      </label>
                      <input
                        type="text"
                        value={hazard.hazard}
                        onChange={(e) => {
                          const newHazards = [...raData.hazards]
                          newHazards[index].hazard = e.target.value
                          updateRaData({ hazards: newHazards })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                        placeholder="Describe the hazard"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Who might be harmed? *
                      </label>
                      <input
                        type="text"
                        value={hazard.who_might_be_harmed}
                        onChange={(e) => {
                          const newHazards = [...raData.hazards]
                          newHazards[index].who_might_be_harmed = e.target.value
                          updateRaData({ hazards: newHazards })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                        placeholder="Who might be harmed"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {raData.hazards.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hazards added yet. Click "Add Hazard" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Risk Matrix */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Risk Assessment Matrix</h2>
            
            <div className="space-y-6">
              {raData.hazards.map((hazard, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">{hazard.hazard}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Controls */}
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Before Controls</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Likelihood (1-5)
                          </label>
                          <select
                            value={hazard.likelihood_before}
                            onChange={(e) => {
                              const newHazards = [...raData.hazards]
                              newHazards[index].likelihood_before = parseInt(e.target.value)
                              newHazards[index].risk_before = calculateRisk(parseInt(e.target.value), newHazards[index].severity_before)
                              updateRaData({ hazards: newHazards })
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Severity (1-5)
                          </label>
                          <select
                            value={hazard.severity_before}
                            onChange={(e) => {
                              const newHazards = [...raData.hazards]
                              newHazards[index].severity_before = parseInt(e.target.value)
                              newHazards[index].risk_before = calculateRisk(newHazards[index].likelihood_before, parseInt(e.target.value))
                              updateRaData({ hazards: newHazards })
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getRiskColor(hazard.risk_before)}-100 text-${getRiskColor(hazard.risk_before)}-800 dark:bg-${getRiskColor(hazard.risk_before)}-900/40 dark:text-${getRiskColor(hazard.risk_before)}-200`}>
                          Risk: {hazard.risk_before} ({getRiskLevel(hazard.risk_before)})
                        </div>
                      </div>
                    </div>

                    {/* After Controls */}
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">After Controls</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Likelihood (1-5)
                          </label>
                          <select
                            value={hazard.likelihood_after}
                            onChange={(e) => {
                              const newHazards = [...raData.hazards]
                              newHazards[index].likelihood_after = parseInt(e.target.value)
                              newHazards[index].risk_after = calculateRisk(parseInt(e.target.value), newHazards[index].severity_after)
                              updateRaData({ hazards: newHazards })
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Severity (1-5)
                          </label>
                          <select
                            value={hazard.severity_after}
                            onChange={(e) => {
                              const newHazards = [...raData.hazards]
                              newHazards[index].severity_after = parseInt(e.target.value)
                              newHazards[index].risk_after = calculateRisk(newHazards[index].likelihood_after, parseInt(e.target.value))
                              updateRaData({ hazards: newHazards })
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getRiskColor(hazard.risk_after)}-100 text-${getRiskColor(hazard.risk_after)}-800 dark:bg-${getRiskColor(hazard.risk_after)}-900/40 dark:text-${getRiskColor(hazard.risk_after)}-200`}>
                          Risk: {hazard.risk_after} ({getRiskLevel(hazard.risk_after)})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Controls */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Controls</h2>
            
            <div className="space-y-6">
              {raData.hazards.map((hazard, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">{hazard.hazard}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Existing Controls *
                      </label>
                      <textarea
                        value={hazard.existing_controls}
                        onChange={(e) => {
                          const newHazards = [...raData.hazards]
                          newHazards[index].existing_controls = e.target.value
                          updateRaData({ hazards: newHazards })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                        rows={3}
                        placeholder="Describe existing controls"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Additional Controls
                      </label>
                      <textarea
                        value={hazard.additional_controls}
                        onChange={(e) => {
                          const newHazards = [...raData.hazards]
                          newHazards[index].additional_controls = e.target.value
                          updateRaData({ hazards: newHazards })
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                        rows={3}
                        placeholder="Describe additional controls needed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Review & Publish</h2>
            
            <div className="space-y-6">
              {/* RA Details */}
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">Risk Assessment Details</h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Title:</span> {raData.title}</p>
                  <p><span className="font-medium">Activity:</span> {raData.activity}</p>
                  <p><span className="font-medium">Location:</span> {raData.location}</p>
                  <p><span className="font-medium">Assessor:</span> {raData.assessor_id}</p>
                </div>
              </div>

              {/* Hazards Summary */}
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">Hazards Summary</h3>
                <div className="space-y-3">
                  {raData.hazards.map((hazard, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">{hazard.hazard}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span className="font-medium">Who might be harmed:</span> {hazard.who_might_be_harmed}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className={`px-2 py-1 rounded bg-${getRiskColor(hazard.risk_before)}-100 text-${getRiskColor(hazard.risk_before)}-800 dark:bg-${getRiskColor(hazard.risk_before)}-900/40 dark:text-${getRiskColor(hazard.risk_before)}-200`}>
                          Before: {hazard.risk_before} ({getRiskLevel(hazard.risk_before)})
                        </span>
                        <span className={`px-2 py-1 rounded bg-${getRiskColor(hazard.risk_after)}-100 text-${getRiskColor(hazard.risk_after)}-800 dark:bg-${getRiskColor(hazard.risk_after)}-900/40 dark:text-${getRiskColor(hazard.risk_after)}-200`}>
                          After: {hazard.risk_after} ({getRiskLevel(hazard.risk_after)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={publishRA}
                  disabled={isPublishing}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Risk Assessment'}
                </button>
                
                <button
                  onClick={createActions}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Actions from Additional Controls
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === 5 || !stepValidation[currentStep]}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 5 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
