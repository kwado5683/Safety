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

export default function TaskManagement({ title = "Tasks" }) {
  // Sample task data
  const tasks = [
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
    },
    {
      id: 3,
      title: 'Conduct monthly safety inspection',
      assignee: 'Mike Johnson',
      dueDate: 'March 20',
      priority: 'high',
      status: 'open'
    },
    {
      id: 4,
      title: 'Review incident report procedures',
      assignee: 'Sarah Wilson',
      dueDate: 'March 25',
      priority: 'low',
      status: 'open'
    }
  ]

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

  return (
    <div className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Open corrective actions
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            {/* Priority Indicator */}
            <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityDot(task.priority)}`} />
            
            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {task.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>{task.assignee}</span>
                <span>•</span>
                <span>{task.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            View All Tasks
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}
