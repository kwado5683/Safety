/*
Description: Incident details page with corrective actions CRUD.
- Loads incident via /api/incidents/get?id=...
- Lists actions via /api/incidents/actions?incidentId=...
- Allows create/update/delete of actions.

Pseudocode:
- On mount: fetch incident + actions
- Render incident fields
- Render actions list with edit/delete
- Provide form to add new action
*/
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ClientLayout from '../../components/ClientLayout'

export default function IncidentDetailsPage() {
  const params = useParams()
  const id = params?.id
  const [incident, setIncident] = useState(null)
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)

  // new action form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  async function load() {
    setLoading(true)
    const [incRes, actRes] = await Promise.all([
      fetch(`/api/incidents/get?id=${id}`),
      fetch(`/api/incidents/actions?incidentId=${id}`),
    ])
    if (incRes.ok) {
      const inc = await incRes.json()
      setIncident(inc.incident || null)
    }
    if (actRes.ok) {
      const data = await actRes.json()
      setActions(data.items || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function createAction() {
    const res = await fetch('/api/incidents/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: id, title, description, due_date: dueDate }),
    })
    if (res.ok) {
      setTitle(''); setDescription(''); setDueDate('');
      load()
    } else {
      alert('Failed to create action')
    }
  }

  async function updateAction(idToUpdate, payload) {
    const res = await fetch(`/api/incidents/actions?id=${idToUpdate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) load()
  }

  async function deleteAction(idToDelete) {
    const res = await fetch(`/api/incidents/actions?id=${idToDelete}`, {
      method: 'DELETE',
    })
    if (res.ok) load()
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="p-6">Loading...</div>
      </ClientLayout>
    )
  }

  if (!incident) {
    return (
      <ClientLayout>
        <div className="p-6">Incident not found</div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h1 className="text-xl font-semibold">{incident.title}</h1>
          <div className="mt-2 text-sm text-neutral-700">{incident.description}</div>
          <div className="mt-2 text-sm">Status: {incident.status}</div>
          <div className="mt-1 text-sm">Severity: {incident.severity} | Likelihood: {incident.likelihood}</div>
          <div className="mt-1 text-sm">Created: {new Date(incident.created_at).toLocaleString()}</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Corrective Actions</h2>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="rounded-md border px-3 py-2 text-sm" />
            <input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="rounded-md border px-3 py-2 text-sm" />
            <input value={dueDate} onChange={(e)=>setDueDate(e.target.value)} type="date" className="rounded-md border px-3 py-2 text-sm" />
            <button onClick={createAction} className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2">Add</button>
          </div>

          <div className="mt-4 divide-y">
            {actions.length === 0 ? (
              <div className="py-3 text-sm text-neutral-600">No actions</div>
            ) : (
              actions.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-neutral-600">{a.description || '-'}</div>
                    <div className="text-xs text-neutral-500">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={a.status} onChange={(e)=>updateAction(a.id,{ status: e.target.value })} className="rounded-md border px-2 py-1 text-xs">
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="done">done</option>
                    </select>
                    <button onClick={()=>deleteAction(a.id)} className="rounded-full border px-3 py-1 text-xs">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}


