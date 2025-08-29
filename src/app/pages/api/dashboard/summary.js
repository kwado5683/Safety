/*
Description: API route that returns dashboard summary metrics.
- Requires an authenticated session via Clerk.
- Queries Supabase for counts; falls back to demo data if env is missing.

Pseudocode:
- Check auth; if no userId → 401
- If Supabase configured → query tables for metrics
- Else → return demo metrics and chart data
*/
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/app/lib/supabaseServer'

function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function getMetricsFromSupabase() {
  // NOTE: Adjust table/column names to match your schema.
  // Assumptions:
  // - incidents(status, created_at)
  // - corrective_actions(status)
  // - trainings(assigned, completed)
  // - inspections(date, status)

  const openIncidentsPromise = supabaseServer
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'closed')

  const openActionsPromise = supabaseServer
    .from('corrective_actions')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'done')

  const trainingsAssignedPromise = supabaseServer
    .from('trainings')
    .select('*', { count: 'exact', head: true })

  const trainingsCompletedPromise = supabaseServer
    .from('trainings')
    .select('*', { count: 'exact', head: true })
    .eq('completed', true)

  const upcomingInspectionsPromise = supabaseServer
    .from('inspections')
    .select('*', { count: 'exact', head: true })
    .gte('date', new Date().toISOString().slice(0, 10))

  const incidentsByMonthPromise = supabaseServer
    .rpc('incidents_by_month')
    // Alternatively, pull rows and aggregate here if no RPC exists

  const incidentsByStatusPromise = supabaseServer
    .from('incidents')
    .select('status')

  const [openIncidents, openActions, assigned, completed, upcoming, byMonth, byStatus] = await Promise.all([
    openIncidentsPromise,
    openActionsPromise,
    trainingsAssignedPromise,
    trainingsCompletedPromise,
    upcomingInspectionsPromise,
    incidentsByMonthPromise,
    incidentsByStatusPromise,
  ])

  const trainingAssigned = assigned.count || 0
  const trainingCompleted = completed.count || 0
  const trainingCompliance = trainingAssigned
    ? Math.round((trainingCompleted / trainingAssigned) * 100)
    : 0

  // Build charts
  const bar = (() => {
    if (byMonth?.data && Array.isArray(byMonth.data)) {
      const labels = byMonth.data.map((r) => r.month_label || r.month)
      const values = byMonth.data.map((r) => r.count)
      return {
        labels,
        datasets: [
          {
            label: 'Incidents',
            data: values,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
          },
        ],
      }
    }
    return null
  })()

  const pie = (() => {
    if (byStatus?.data && Array.isArray(byStatus.data)) {
      const counts = byStatus.data.reduce((acc, row) => {
        const key = row.status || 'unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      const labels = Object.keys(counts)
      const values = Object.values(counts)
      return {
        labels,
        datasets: [
          {
            label: 'By Status',
            data: values,
            backgroundColor: [
              'rgba(99, 102, 241, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(244, 63, 94, 0.6)',
              'rgba(250, 204, 21, 0.6)',
            ],
          },
        ],
      }
    }
    return null
  })()

  return {
    demo: false,
    kpis: {
      openIncidents: openIncidents.count || 0,
      openActions: openActions.count || 0,
      trainingCompliance,
      upcomingInspections: upcoming.count || 0,
    },
    charts: { bar, pie },
  }
}

function getDemoMetrics() {
  // Demo dataset to keep UI working without DB
  const kpis = {
    openIncidents: 7,
    openActions: 4,
    trainingCompliance: 86,
    upcomingInspections: 3,
  }
  const charts = {
    bar: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Incidents',
          data: [3, 5, 2, 6, 4, 5],
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
        },
      ],
    },
    pie: {
      labels: ['open', 'in_progress', 'closed'],
      datasets: [
        {
          label: 'By Status',
          data: [8, 5, 12],
          backgroundColor: [
            'rgba(99, 102, 241, 0.6)',
            'rgba(250, 204, 21, 0.6)',
            'rgba(16, 185, 129, 0.6)',
          ],
        },
      ],
    },
  }
  return { demo: true, kpis, charts }
}

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = isSupabaseConfigured()
      ? await getMetricsFromSupabase()
      : getDemoMetrics()
    return NextResponse.json(payload)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 })
  }
}


