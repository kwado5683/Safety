/*
DESCRIPTION: Department ranking widget with horizontal bar charts.
- Shows department performance with color-coded bars
- Industry-standard ranking visualization for safety dashboards
- Displays safety scores and performance levels

WHAT EACH PART DOES:
1. Department data - List of departments with safety scores
2. Bar visualization - Horizontal bars showing performance levels
3. Color coding - Green for good, yellow for medium, red for poor
4. Ranking display - Shows department names and scores

PSEUDOCODE:
- Sort departments by safety score
- Create horizontal bars with appropriate colors
- Display department names and scores
- Show performance indicators
*/

'use client'

export default function DepartmentRanking({ title = "Department Safety Ranking", departmentData = [] }) {
  // Use real department data or fallback to sample data
  const departments = departmentData.length > 0 ? departmentData : [
    { name: 'Sales', score: 95, color: 'bg-green-500' },
    { name: 'Engineering', score: 78, color: 'bg-yellow-500' },
    { name: 'HR', score: 65, color: 'bg-orange-500' },
    { name: 'Maintenance', score: 45, color: 'bg-red-500' }
  ]

  // Add color based on score if not provided
  const departmentsWithColors = departments.map(dept => ({
    ...dept,
    color: dept.color || (dept.score >= 90 ? 'bg-green-500' : 
                         dept.score >= 70 ? 'bg-yellow-500' : 
                         dept.score >= 50 ? 'bg-orange-500' : 'bg-red-500')
  }))

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    if (score >= 50) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <div className="rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      
      <div className="space-y-4">
        {departmentsWithColors.map((dept, index) => (
          <div key={dept.name} className="flex items-center gap-3">
            {/* Department Name */}
            <div className="w-20 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {dept.name}
            </div>
            
            {/* Bar Chart */}
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${dept.color}`}
                  style={{ width: `${dept.score}%` }}
                />
              </div>
            </div>
            
            {/* Score */}
            <div className={`w-12 text-right text-sm font-semibold ${getScoreColor(dept.score)}`}>
              {dept.score}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Legend */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span style={{ color: 'var(--muted-foreground)' }}>Excellent (90-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span style={{ color: 'var(--muted-foreground)' }}>Good (70-89)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span style={{ color: 'var(--muted-foreground)' }}>Fair (50-69)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span style={{ color: 'var(--muted-foreground)' }}>Poor (0-49)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
