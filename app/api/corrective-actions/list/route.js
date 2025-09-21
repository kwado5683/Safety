/*
DESCRIPTION: API route to list corrective actions for the dashboard.
- Returns corrective actions with optional status filtering
- Used by Task Management widget
- Provides real data for dashboard metrics
*/

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseServer'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    
    const supabase = createAdminClient()
    
    let query = supabase
      .from('corrective_actions')
      .select(`
        id,
        action_plan,
        responsible_officer,
        target_date,
        status,
        priority,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    // Apply status filter if provided
    if (statusFilter) {
      const statuses = statusFilter.split(',')
      query = query.in('status', statuses)
    }
    
    const { data: correctiveActions, error } = await query
    
    if (error) {
      console.error('Error fetching corrective actions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch corrective actions' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      correctiveActions: correctiveActions || [],
      count: correctiveActions?.length || 0
    })
    
  } catch (error) {
    console.error('Corrective actions list API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
