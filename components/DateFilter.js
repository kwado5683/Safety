/*
DESCRIPTION: Date filter component for dashboard data filtering.
- Provides Today, Week, Month, and Custom date range options
- Updates parent component with selected date range
- Industry-standard filtering for safety dashboards

WHAT EACH PART DOES:
1. useState - Manages selected filter state
2. Date calculations - Computes date ranges for each filter
3. Custom date picker - Allows users to select specific date ranges
4. Callback function - Notifies parent component of filter changes

PSEUDOCODE:
- Track selected filter type (today, week, month, custom)
- Calculate date ranges based on selection
- Show custom date picker when custom is selected
- Call onChange callback with date range
*/

'use client'

import { useState, useEffect } from 'react'

export default function DateFilter({ onChange, initialFilter = 'today' }) {
  const [selectedFilter, setSelectedFilter] = useState(initialFilter)
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Calculate date ranges
  const getDateRange = (filter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return { start: weekStart, end: weekEnd }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        return { start: monthStart, end: monthEnd }
      case 'custom':
        return {
          start: new Date(customDates.start),
          end: new Date(customDates.end + 'T23:59:59.999Z')
        }
      default:
        return { start: today, end: today }
    }
  }

  // Notify parent component when filter changes
  useEffect(() => {
    const dateRange = getDateRange(selectedFilter)
    onChange?.(dateRange, selectedFilter)
  }, [selectedFilter, customDates])

  const filters = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'custom', label: 'Custom' }
  ]

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => setSelectedFilter(filter.key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            selectedFilter === filter.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{
            backgroundColor: selectedFilter === filter.key ? 'var(--primary)' : 'var(--muted)',
            color: selectedFilter === filter.key ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
          }}
        >
          {filter.label}
        </button>
      ))}
      
      {selectedFilter === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={customDates.start}
            onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
            className="px-2 py-1 text-sm border rounded"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          />
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>to</span>
          <input
            type="date"
            value={customDates.end}
            onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
            className="px-2 py-1 text-sm border rounded"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          />
        </div>
      )}
    </div>
  )
}
