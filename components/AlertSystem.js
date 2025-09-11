/*
DESCRIPTION: Alert system widget for safety notifications and alerts.
- Shows overdue inspections and high-risk hazard reports
- Industry-standard alert system for safety dashboards
- Displays alert priorities and actions

WHAT EACH PART DOES:
1. Alert list - Shows various safety alerts and notifications
2. Priority levels - Color-coded alert priorities
3. Action buttons - Quick actions for each alert
4. Alert types - Different types of safety alerts

PSEUDOCODE:
- Display list of safety alerts and notifications
- Show alert details, priority, and type
- Add action buttons for alert management
- Include alert status and timestamps
*/

'use client'

export default function AlertSystem({ title = "Alerts" }) {
  // Sample alert data
  const alerts = [
    {
      id: 1,
      title: 'Overdue Inspection',
      description: 'Monthly safety inspection for Production Floor is 3 days overdue',
      type: 'inspection',
      priority: 'high',
      timestamp: '2 hours ago',
      action: 'Schedule Inspection'
    },
    {
      id: 2,
      title: 'High-Risk Hazard Report',
      description: 'Unsafe working conditions reported in Warehouse area',
      type: 'hazard',
      priority: 'critical',
      timestamp: '1 hour ago',
      action: 'Review Report'
    },
    {
      id: 3,
      title: 'Training Expiry Warning',
      description: '5 employees have safety training expiring in 7 days',
      type: 'training',
      priority: 'medium',
      timestamp: '4 hours ago',
      action: 'Schedule Training'
    },
    {
      id: 4,
      title: 'Equipment Maintenance Due',
      description: 'Safety equipment maintenance due for 3 machines',
      type: 'maintenance',
      priority: 'medium',
      timestamp: '6 hours ago',
      action: 'Schedule Maintenance'
    }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'inspection': return '🔍'
      case 'hazard': return '⚠️'
      case 'training': return '📚'
      case 'maintenance': return '🔧'
      default: return '📢'
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {alerts.length} active
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            {/* Alert Icon */}
            <div className="text-lg">{getTypeIcon(alert.type)}</div>
            
            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {alert.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                  {alert.priority}
                </span>
              </div>
              
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {alert.description}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {alert.timestamp}
                </span>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  {alert.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            View All Alerts
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
            Mark All Read
          </button>
        </div>
      </div>
    </div>
  )
}
