/*
DESCRIPTION: Task management widget for corrective actions and safety tasks.
- Shows open corrective actions with due dates and assignments
- Industry-standard task management for safety dashboards
- Displays task priorities and status

WHAT EACH PART DOES:
1. Task list - Shows open corrective actions
2. Due dates - Displays when tasks are due
3. Assignments - Shows who is responsible for each task
4. Priority indicators - Color-coded priority levels

PSEUDOCODE:
- Display list of open corrective actions
- Show task details, assignee, and due date
- Add priority indicators and status
- Include action buttons for task management
*/

'use client'

import { useState, useEffect } from 'react'

export default function TaskManagement({ title = "Tasks" }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true)
        // Fetch corrective actions that are not completed
        const response = await fetch('/api/corrective-actions/list?status=pending,in_progress')
        
        if (response.ok) {
          const data = await response.json()
          setTasks(data.correctiveActions || [])
        } else {
          // Fallback to sample data if API fails
          setTasks([
            {
              id: 1,
              title: 'Fix broken safety guard on Machine A',
              assignee: 'John Doe',
              dueDate: 'March 15',
              priority: 'high',
              status: 'open'
            },
            {
              id: 2,
              title: 'Update safety training materials',
              assignee: 'Jane Smith',
              dueDate: 'March 15',
              priority: 'medium',
              status: 'open'
            }
          ])
        }
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setError(err.message)
        // Use sample data as fallback
        setTasks([
          {
            id: 1,
            title: 'Fix broken safety guard on Machine A',
            assignee: 'John Doe',
            dueDate: 'March 15',
            priority: 'high',
            status: 'open'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-6 shadow-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-slate-600 dark:text-slate-300">Loading tasks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border p-6 shadow-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error loading tasks: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-6 shadow-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {tasks.length} active
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                  {task.action_plan || task.title}
                </h4>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'medium'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.status)}`}>
                    {task.status || 'pending'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Assigned to: {task.responsible_officer || task.assignee || 'Unassigned'}</span>
                <span>Due: {task.target_date ? new Date(task.target_date).toLocaleDateString() : task.dueDate}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-300">No active tasks</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">All caught up!</p>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
          <button className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            View All Tasks →
          </button>
        </div>
      )}
    </div>
  )
}

