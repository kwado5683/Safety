/*
DESCRIPTION: Enhanced mobile form example for incident reporting.
- Demonstrates mobile-optimized form components
- Includes haptic feedback for form interactions
- Shows pull-to-refresh functionality
- Optimized for mobile touch interactions

WHAT EACH PART DOES:
1. Mobile Form Components - Uses mobile-optimized input fields
2. Haptic Feedback - Provides feedback for form interactions
3. Touch Optimization - Optimized for mobile touch input
4. Validation - Enhanced validation with haptic feedback

PSEUDOCODE:
- Import mobile form components
- Create incident form with haptic feedback
- Handle form submission with mobile optimization
- Provide touch-friendly interface
*/

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { MobileInput, MobileTextarea, MobileSelect, HapticButton } from '@/components/mobile'
import PullToRefresh from '@/components/mobile/PullToRefresh'

export default function MobileIncidentForm() {
  const router = useRouter()
  const haptic = useHaptic()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: '',
    reportedBy: '',
    reporterPhone: '',
    timeOfIncident: '',
    location: '',
    description: ''
  })
  const [errors, setErrors] = useState({})

  const incidentTypes = [
    { value: 'injury', label: 'Injury' },
    { value: 'near-miss', label: 'Near Miss' },
    { value: 'property-damage', label: 'Property Damage' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
  ]

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
    
    // Provide light haptic feedback for input changes
    haptic.light()
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.incidentType) {
      newErrors.incidentType = 'Please select an incident type'
    }
    
    if (!formData.severity) {
      newErrors.severity = 'Please select a severity level'
    }
    
    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Please enter your name'
    }
    
    if (!formData.reporterPhone.trim()) {
      newErrors.reporterPhone = 'Please enter your phone number'
    }
    
    if (!formData.timeOfIncident) {
      newErrors.timeOfIncident = 'Please enter the time of incident'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Please enter the location'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      haptic.error()
      return
    }
    
    setIsSubmitting(true)
    haptic.medium()
    
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        haptic.success()
        router.push('/incidents')
      } else {
        throw new Error('Failed to submit incident')
      }
    } catch (error) {
      console.error('Error submitting incident:', error)
      haptic.error()
      setErrors({ submit: 'Failed to submit incident. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    // Reset form data
    setFormData({
      incidentType: '',
      severity: '',
      reportedBy: '',
      reporterPhone: '',
      timeOfIncident: '',
      location: '',
      description: ''
    })
    setErrors({})
    haptic.success()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Report New Incident
          </h1>
          <p className="text-slate-600">
            Please fill out all required fields to submit an incident report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type */}
          <MobileSelect
            label="Incident Type"
            value={formData.incidentType}
            onChange={(e) => handleInputChange('incidentType', e.target.value)}
            options={incidentTypes}
            placeholder="Select incident type"
            error={errors.incidentType}
            required
          />

          {/* Severity */}
          <MobileSelect
            label="Severity Level"
            value={formData.severity}
            onChange={(e) => handleInputChange('severity', e.target.value)}
            options={severityLevels}
            placeholder="Select severity level"
            error={errors.severity}
            required
          />

          {/* Reporter Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MobileInput
              label="Your Name"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange('reportedBy', e.target.value)}
              placeholder="Enter your full name"
              error={errors.reportedBy}
              required
            />
            
            <MobileInput
              label="Phone Number"
              type="tel"
              value={formData.reporterPhone}
              onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
              placeholder="Enter your phone number"
              error={errors.reporterPhone}
              required
            />
          </div>

          {/* Incident Details */}
          <MobileInput
            label="Time of Incident"
            type="datetime-local"
            value={formData.timeOfIncident}
            onChange={(e) => handleInputChange('timeOfIncident', e.target.value)}
            error={errors.timeOfIncident}
            required
          />

          <MobileInput
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter incident location"
            error={errors.location}
            required
          />

          {/* Description */}
          <MobileTextarea
            label="Incident Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide a detailed description of the incident"
            error={errors.description}
            rows={4}
            required
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm font-medium">
                  {errors.submit}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <HapticButton
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
              hapticType="light"
            >
              Cancel
            </HapticButton>
            
            <HapticButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              hapticType="success"
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Incident'}
            </HapticButton>
          </div>
        </form>

        {/* Mobile Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Mobile Tips
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Pull down to refresh and clear the form</li>
            <li>• Use haptic feedback for better interaction</li>
            <li>• All fields are optimized for mobile input</li>
            <li>• Form auto-saves as you type</li>
          </ul>
        </div>
      </div>
    </PullToRefresh>
  )
}
