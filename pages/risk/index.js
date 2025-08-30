/*
Description: Risk management page with hazards list and create/edit drawer.
- Lists hazards with risk matrix visualization.
- Opens drawer to create/edit hazards.
- Uses RiskMatrix component for severity/likelihood selection.

Pseudocode:
- Load hazards list on mount
- Show hazards in cards with risk level indicators
- Open drawer for create/edit with RiskMatrix
- Handle form submission to create/update hazards
*/
import { useEffect, useState } from 'react'
import ClientLayout from '../../components/ClientLayout'
import RiskMatrix from '../../components/RiskMatrix'

export default function RiskIndexPage() {
  const [hazards, setHazards] = useState([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingHazard, setEditingHazard] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [controls, setControls] = useState('')
  const [owner, setOwner] = useState('')
  const [severity, setSeverity] = useState(0)
  const [likelihood, setLikelihood] = useState(0)

  useEffect(() => {
    loadHazards()
  }, [])

  async function loadHazards() {
    setLoading(true)
    const res = await fetch('/api/hazards/list?pageSize=100')
    if (res.ok) {
      const data = await res.json()
      setHazards(data.items || [])
    }
    setLoading(false)
  }

  function openCreateDrawer() {
    setEditingHazard(null)
    resetForm()
    setDrawerOpen(true)
  }

  function openEditDrawer(hazard) {
    setEditingHazard(hazard)
    setTitle(hazard.title || '')
    setDescription(hazard.description || '')
    setLocation(hazard.location || '')
    setCategory(hazard.category || '')
    setControls(hazard.controls || '')
    setOwner(hazard.owner || '')
    setSeverity(hazard.severity || 0)
    setLikelihood(hazard.likelihood || 0)
    setDrawerOpen(true)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setLocation('')
    setCategory('')
    setControls('')
    setOwner('')
    setSeverity(0)
    setLikelihood(0)
  }

  function handleRiskMatrixChange(values) {
    setSeverity(values.severity)
    setLikelihood(values.likelihood)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !description || !location || severity === 0 || likelihood === 0) {
      alert('Please fill in all required fields and select risk level')
      return
    }

    setSubmitting(true)
    const payload = {
      title,
      description,
      location,
      category,
      controls,
      owner,
      severity,
      likelihood,
    }

    const url = editingHazard 
      ? `/api/hazards/update?id=${editingHazard.id}`
      : '/api/hazards/create'
    const method = editingHazard ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setDrawerOpen(false)
      loadHazards()
    } else {
      alert('Failed to save hazard')
    }
    setSubmitting(false)
  }

  function getRiskLevel(severity, likelihood) {
    const score = severity * likelihood
    if (score >= 16) return { level: 'High', color: 'bg-red-100 text-red-800' }
    if (score >= 9) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    if (score >= 4) return { level: 'Low', color: 'bg-blue-100 text-blue-800' }
    return { level: 'Very Low', color: 'bg-green-100 text-green-800' }
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Risk Management</h1>
        <button
          onClick={openCreateDrawer}
          className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-500"
        >
          Add Hazard
        </button>
      </div>

      {/* Hazards List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-neutral-600">Loading...</div>
        ) : hazards.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No hazards found</div>
        ) : (
          hazards.map((hazard) => {
            const risk = getRiskLevel(hazard.severity, hazard.likelihood)
            return (
              <div key={hazard.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-neutral-900">{hazard.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${risk.color}`}>
                        {risk.level} Risk
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{hazard.description}</p>
                    <div className="text-sm text-neutral-500">
                      Location: {hazard.location}
                      {hazard.category && ` • Category: ${hazard.category}`}
                      {hazard.owner && ` • Owner: ${hazard.owner}`}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      Severity: {hazard.severity} • Likelihood: {hazard.likelihood} • Score: {hazard.severity * hazard.likelihood}
                    </div>
                  </div>
                  <button
                    onClick={() => openEditDrawer(hazard)}
                    className="ml-4 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingHazard ? 'Edit Hazard' : 'Add Hazard'}
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Owner
                    </label>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Controls
                  </label>
                  <textarea
                    value={controls}
                    onChange={(e) => setControls(e.target.value)}
                    rows={3}
                    placeholder="Describe existing or planned controls..."
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Risk Assessment *
                  </label>
                  <RiskMatrix 
                    value={{ severity, likelihood }}
                    onChange={handleRiskMatrixChange}
                  />
                  {severity > 0 && likelihood > 0 && (
                    <div className="mt-2 text-sm text-neutral-600">
                      Risk Score: {severity * likelihood} ({getRiskLevel(severity, likelihood).level})
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingHazard ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}
