/*
DESCRIPTION: Circular gauge chart component for displaying percentages and metrics.
- Shows circular progress with percentage display
- Industry-standard gauge visualization for safety dashboards
- Supports different colors and sizes

WHAT EACH PART DOES:
1. SVG circle - Creates the circular progress indicator
2. Percentage calculation - Converts value to percentage of max
3. Color coding - Different colors for different performance levels
4. Text display - Shows the percentage value in the center

PSEUDOCODE:
- Calculate percentage based on value and max
- Create SVG circle with stroke-dasharray for progress
- Display percentage text in center
- Apply color based on performance level
*/

'use client'

export default function GaugeChart({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  label,
  color = 'blue'
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = (percentage) => {
    if (percentage >= 90) return '#10b981' // green
    if (percentage >= 70) return '#f59e0b' // yellow
    if (percentage >= 50) return '#f97316' // orange
    return '#ef4444' // red
  }

  const strokeColor = getColor(percentage)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {Math.round(percentage)}%
            </div>
            {label && (
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
