/*
DESCRIPTION: Custom hook for managing date filter state with persistence.
- Persists selected filter to localStorage
- Prevents parent component from resetting the filter
- Provides stable state management for DateFilter component
*/

import { useState, useEffect, useCallback } from 'react'

export function useDateFilter(initialFilter = 'today') {
  const [selectedFilter, setSelectedFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dateFilter') || initialFilter
    }
    return initialFilter
  })

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dateFilter', selectedFilter)
    }
  }, [selectedFilter])

  const updateFilter = useCallback((filterKey) => {
    console.log('useDateFilter: Updating filter to:', filterKey)
    setSelectedFilter(filterKey)
  }, [])

  return {
    selectedFilter,
    updateFilter
  }
}
