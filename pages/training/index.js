/*
Description: Training management page with grid layout.
- Shows training items and assignments in a grid.
- Allows creating trainings and assigning to users.
- Mark assignments as complete.

Pseudocode:
- Load trainings and assignments on mount
- Display in responsive grid layout
- Show assignment status and due dates
- Provide create/assign/complete actions
*/
import { useEffect, useState } from 'react'
import ClientLayout from '../../components/ClientLayout'

export default function TrainingIndexPage() {
  const [trainings, setTrainings] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('')
  
  // Assignment form state
  const [userId, setUserId] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [trainingsRes, assignmentsRes] = await Promise.all([
      fetch('/api/trainings/list?pageSize=100'),
      fetch('/api/trainings/assignments?pageSize=100')
    ])
    
    if (trainingsRes.ok) {
      const data = await trainingsRes.json()
      setTrainings(data.items || [])
    }
    
    if (assignmentsRes.ok) {
      const data = await assignmentsRes.json()
      setAssignments(data.items || [])
    }
    setLoading(false)
  }

  function openCreateDrawer() {
    resetForm()
    setDrawerOpen(true)
  }

  function openAssignDrawer(training) {
    setSelectedTraining(training)
    setUserId('')
    setDueDate('')
    setAssignDrawerOpen(true)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setContent('')
    setDuration('')
    setCategory('')
  }

  async function handleCreateTraining(e) {
    e.preventDefault()
    if (!title || !description) {
      alert('Please fill in required fields')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/trainings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        content,
        duration,
        category,
      }),
    })

    if (res.ok) {
      setDrawerOpen(false)
      loadData()
    } else {
      alert('Failed to create training')
    }
    setSubmitting(false)
  }

  async function handleAssignTraining(e) {
    e.preventDefault()
    if (!userId || !dueDate) {
      alert('Please fill in required fields')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/trainings/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        training_id: selectedTraining.id,
        user_id: userId,
        due_date: dueDate,
      }),
    })

    if (res.ok) {
      setAssignDrawerOpen(false)
      loadData()
    } else {
      alert('Failed to assign training')
    }
    setSubmitting(false)
  }

  async function handleCompleteAssignment(assignmentId) {
    const res = await fetch('/api/trainings/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment_id: assignmentId }),
    })

    if (res.ok) {
      loadData()
    } else {
      alert('Failed to complete training')
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function isOverdue(dueDate) {
    return new Date(dueDate) < new Date()
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Training Management</h1>
        <button
          onClick={openCreateDrawer}
          className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-500"
        >
          Create Training
        </button>
      </div>

      {/* Training Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-600">Loading...</div>
        ) : trainings.length === 0 ? (
          <div className="col-span-full text-center py-8 text-neutral-600">No trainings found</div>
        ) : (
          trainings.map((training) => {
            const trainingAssignments = assignments.filter(a => a.training_id === training.id)
            const completedCount = trainingAssignments.filter(a => a.status === 'completed').length
            const totalCount = trainingAssignments.length

            return (
              <div key={training.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-neutral-900 mb-1">{training.title}</h3>
                  <p className="text-sm text-neutral-600 line-clamp-2">{training.description}</p>
                  {training.category && (
                    <span className="inline-block mt-1 text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                      {training.category}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="text-sm text-neutral-600">
                    Assignments: {completedCount}/{totalCount} completed
                  </div>
                  {training.duration && (
                    <div className="text-sm text-neutral-600">
                      Duration: {training.duration}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAssignDrawer(training)}
                    className="flex-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                  >
                    Assign
                  </button>
                </div>

                {/* Assignments List */}
                {trainingAssignments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium text-neutral-700 mb-2">Assignments:</div>
                    <div className="space-y-2">
                      {trainingAssignments.map((assignment) => {
                        const status = assignment.status === 'assigned' && isOverdue(assignment.due_date) 
                          ? 'overdue' 
                          : assignment.status
                        
                        return (
                          <div key={assignment.id} className="flex items-center justify-between text-xs">
                            <div className="flex-1">
                              <div className="text-neutral-600">User: {assignment.user_id}</div>
                              <div className="text-neutral-500">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                              {assignment.status === 'assigned' && (
                                <button
                                  onClick={() => handleCompleteAssignment(assignment.id)}
                                  className="text-indigo-600 hover:text-indigo-800 text-xs"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create Training Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create Training</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTraining} className="space-y-4">
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
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 2 hours"
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Training content or instructions..."
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                    {submitting ? 'Creating...' : 'Create Training'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Training Drawer */}
      {assignDrawerOpen && selectedTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assign Training</h2>
                <button
                  onClick={() => setAssignDrawerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-neutral-900">{selectedTraining.title}</h3>
                <p className="text-sm text-neutral-600">{selectedTraining.description}</p>
              </div>

              <form onSubmit={handleAssignTraining} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    User ID *
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    placeholder="Enter user ID or email"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setAssignDrawerOpen(false)}
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? 'Assigning...' : 'Assign Training'}
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
