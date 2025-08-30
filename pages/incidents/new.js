/*
Description: Page to create a new incident using IncidentForm.
- Renders IncidentForm and posts to /api/incidents/create.
- On success, redirects to incidents list.

Pseudocode:
- Render <IncidentForm onSubmit=handleCreate>
- handleCreate: POST to API with form data
- If ok → router.push("/incidents') else show error
*/
import { useRouter } from 'next/navigation'
import IncidentForm from '../../components/IncidentForm'
import ClientLayout from '../../components/ClientLayout'

export default function NewIncidentPage() {
  const router = useRouter()

  async function handleCreate(values) {
    const res = await fetch('/api/incidents/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (res.ok) {
      router.push('/incidents')
    } else {
      alert('Failed to create incident')
    }
  }

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">New Incident</h1>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <IncidentForm onSubmit={handleCreate} />
        </div>
      </div>
    </ClientLayout>
  )
}


