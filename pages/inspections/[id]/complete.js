/*
Description: Mobile-friendly inspection completion page.
- Shows checklist items with pass/fail buttons.
- Allows notes and optional photo for each item.
- Saves progress and completes inspection.

Pseudocode:
- Load inspection by ID
- Render checklist items as mobile-friendly cards
- Each item: pass/fail buttons + notes + photo upload
- Auto-save progress, complete when done
*/
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ClientLayout from '../../components/ClientLayout'

export default function CompleteInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id
  
  const [inspection, setInspection] = useState(null)
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (id) loadInspection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadInspection() {
    setLoading(true)
    const res = await fetch(`/api/inspections/get?id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setInspection(data.inspection)
      // Initialize findings from existing or checklist
      if (data.inspection.findings && Array.isArray(data.inspection.findings)) {
        setFindings(data.inspection.findings)
      } else if (data.inspection.checklist_items && Array.isArray(data.inspection.checklist_items)) {
        setFindings(data.inspection.checklist_items.map(item => ({
          id: item.id,
          label: item.label,
          required: item.required || false,
          options: item.options || null,
          status: 'pending',
          notes: '',
          photo: null
        })))
      }
    }
    setLoading(false)
  }

  function updateFinding(index, updates) {
    const newFindings = [...findings]
    newFindings[index] = { ...newFindings[index], ...updates }
    setFindings(newFindings)
  }

  async function saveProgress() {
    setSaving(true)
    const res = await fetch(`/api/inspections/update?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findings, status: 'in_progress' }),
    })
    setSaving(false)
    if (res.ok) {
      // Show brief success indicator
    }
  }

  async function completeInspection() {
    const requiredItems = findings.filter(f => f.required)
    const incompleteRequired = requiredItems.some(f => f.status === 'pending')
    
    if (incompleteRequired) {
      alert('Please complete all required checklist items before finishing')
      return
    }

    setCompleting(true)
    const res = await fetch('/api/inspections/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, findings }),
    })
    
    if (res.ok) {
      router.push("/inspections')
    } else {
      alert('Failed to complete inspection')
    }
    setCompleting(false)
  }

  async function uploadPhoto(index, file) {
    if (!file) return

    const formData = new FormData()
    formData.append('incidentId', id)
    formData.append('file', file)

    const res = await fetch('/api/incidents/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      if (data.uploaded && data.uploaded[0]) {
        updateFinding(index, { photo: data.uploaded[0] })
      }
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">Loading inspection...</div>
      </ClientLayout>
    )
  }

  if (!inspection) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">Inspection not found</div>
      </ClientLayout>
    )
  }

  const completedCount = findings.filter(f => f.status !== 'pending').length
  const totalCount = findings.length
  const requiredItems = findings.filter(f => f.required)
  const incompleteRequired = requiredItems.some(f => f.status === 'pending')

  return (
    <ClientLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Complete Inspection</h1>
            <div className="text-sm text-neutral-600">
              {inspection.location || 'No location'} • {new Date(inspection.scheduled_date).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{completedCount}/{totalCount}</div>
            <div className="text-xs text-neutral-600">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {findings.map((finding, index) => (
            <div key={finding.id || index} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-neutral-900">{finding.label}</div>
                  {finding.required && (
                    <span className="text-xs text-red-600 font-medium">Required</span>
                  )}
                </div>
              </div>

              {/* Pass/Fail buttons or Options */}
              <div className="flex gap-2 mb-3">
                {finding.options && Array.isArray(finding.options) ? (
                  // Custom options
                  finding.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => updateFinding(index, { status: option })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        finding.status === option
                          ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-indigo-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  // Default pass/fail
                  <>
                    <button
                      onClick={() => updateFinding(index, { status: 'passed' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        finding.status === 'passed'
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-green-50'
                      }`}
                    >
                      ✓ Pass
                    </button>
                    <button
                      onClick={() => updateFinding(index, { status: 'failed' })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        finding.status === 'failed'
                          ? 'bg-red-100 text-red-800 border-2 border-red-300'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-red-50'
                      }`}
                    >
                      ✗ Fail
                    </button>
                  </>
                )}
              </div>

              {/* Notes */}
              <div className="mb-3">
                <textarea
                  value={finding.notes || ''}
                  onChange={(e) => updateFinding(index, { notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Photo upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => uploadPhoto(index, e.target.files[0])}
                  className="hidden"
                  id={`photo-${index}`}
                />
                <label
                  htmlFor={`photo-${index}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  📷 {finding.photo ? 'Change Photo' : 'Add Photo'}
                </label>
                {finding.photo && (
                  <div className="mt-2">
                    <img 
                      src={finding.photo.url} 
                      alt="Finding photo" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            onClick={completeInspection}
            disabled={completing || (requiredItems.length > 0 && incompleteRequired)}
            className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {completing ? 'Completing...' : 'Complete Inspection'}
          </button>
        </div>
      </div>
    </ClientLayout>
  )
}
