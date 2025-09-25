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

import { useState, useEffect, useCallback } from 'react'
import { useHaptic } from '@/lib/hooks/useHaptic'
import { useDateFilter } from '@/lib/hooks/useDateFilter'

export default function DateFilter({ onChange, initialFilter = 'today' }) {
  // Use custom hook for stable state management
  const { selectedFilter, updateFilter } = useDateFilter(initialFilter)
  
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  
  // Add haptic feedback for mobile interactions
  const haptic = useHaptic()

  // Debug logging to track state changes
  useEffect(() => {
    console.log('DateFilter selectedFilter changed to:', selectedFilter)
  }, [selectedFilter])

  // Trigger onChange on mount with the persisted filter
  useEffect(() => {
    const dateRange = getDateRange(selectedFilter)
    onChange?.(dateRange, selectedFilter)
  }, []) // Only run on mount

  // Handle filter clicks with stable state management
  const handleFilterClick = useCallback((filterKey) => {
    console.log('DateFilter: Clicking filter:', filterKey, 'Current selected:', selectedFilter)
    updateFilter(filterKey)
    const dateRange = getDateRange(filterKey)
    console.log('DateFilter: Sending date range to parent:', dateRange, 'Filter type:', filterKey)
    onChange?.(dateRange, filterKey)
  }, [onChange, selectedFilter, updateFilter])

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

  // Don't call onChange on mount - let the parent handle initial state

  // Notify parent component when custom dates change
  useEffect(() => {
    if (selectedFilter === 'custom') {
      const dateRange = getDateRange(selectedFilter)
      onChange?.(dateRange, selectedFilter)
    }
  }, [customDates, selectedFilter, onChange])

  const filters = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'custom', label: 'Custom' }
  ]

  return (
    <div className="flex items-center gap-2" data-testid="date-filter-container">
      {filters.map((filter) => {
        const isActive = selectedFilter === filter.key
        console.log(`Filter ${filter.key}: isActive=${isActive}, selectedFilter=${selectedFilter}`)
        return (
          <button
            key={filter.key}
            data-testid={`date-filter-${filter.key}`}
            onClick={() => {
              haptic.light() // Add haptic feedback for mobile
              handleFilterClick(filter.key)
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform touch-friendly cursor-pointer ${
              isActive
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-105 ring-2 ring-orange-300'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-200 hover:scale-110 active:bg-orange-700 active:scale-95'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
      
      {selectedFilter === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={customDates.start}
            onChange={(e) => {
              haptic.light() // Add haptic feedback for mobile
              setCustomDates(prev => ({ ...prev, start: e.target.value }))
            }}
            className="px-3 py-2 text-sm border rounded-lg transition-all duration-200 ease-in-out hover:shadow-md hover:border-orange-300 focus:shadow-lg focus:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 touch-friendly cursor-pointer"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>to</span>
          <input
            type="date"
            value={customDates.end}
            onChange={(e) => {
              haptic.light() // Add haptic feedback for mobile
              setCustomDates(prev => ({ ...prev, end: e.target.value }))
            }}
            className="px-3 py-2 text-sm border rounded-lg transition-all duration-200 ease-in-out hover:shadow-md hover:border-orange-300 focus:shadow-lg focus:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 touch-friendly cursor-pointer"
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
