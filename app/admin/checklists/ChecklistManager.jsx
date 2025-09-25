'use client'
/*
DESCRIPTION: Client component for managing checklists and their items.
- Displays all checklists with their items in a responsive layout
- Handles CRUD operations for checklists and items
- Mobile-optimized with stacked cards and large tap areas
- Toggle critical status for items
- Real-time updates without page refresh

WHAT EACH PART DOES:
1. useState - Manages checklists data, loading states, and form states
2. useEffect - Fetches checklists on component mount
3. CRUD functions - Create, update, delete checklists and items
4. Mobile layout - Responsive design with stacked cards
5. Form handling - Add/edit forms for checklists and items
6. Critical toggle - Toggle critical status for items

PSEUDOCODE:
- Fetch checklists with items on mount
- Display in responsive grid/cards layout
- Handle create/edit/delete operations
- Show forms for adding new items
- Toggle critical status with visual feedback
*/

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * ChecklistManager component - Handles all checklist CRUD operations
 */
export default function ChecklistManager() {
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  // Form states
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false)
  const [showNewItemForm, setShowNewItemForm] = useState(null) // checklist ID
  const [editingChecklist, setEditingChecklist] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  // Form data
  const [newChecklist, setNewChecklist] = useState({ name: '', category: 'General' })
  const [newItem, setNewItem] = useState({ text: '', critical: false })

  /**
   * Fetch all checklists with their items
   */
  const fetchChecklists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/checklists')
      const data = await response.json()

      if (response.ok) {
        setChecklists(data.checklists || [])
        setError('')
      } else {
        setError(data.error || 'Failed to fetch checklists')
      }
    } catch (error) {
      console.error('Error fetching checklists:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new checklist
   */
  const createChecklist = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChecklist)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Checklist created successfully')
        setMessageType('success')
        setNewChecklist({ name: '', category: 'General' })
        setShowNewChecklistForm(false)
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to create checklist')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error creating checklist:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Update a checklist
   */
  const updateChecklist = async (id, updates) => {
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Checklist updated successfully')
        setMessageType('success')
        setEditingChecklist(null)
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to update checklist')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Delete a checklist
   */
  const deleteChecklist = async (id) => {
    if (!confirm('Are you sure you want to delete this checklist? This will also delete all its items.')) {
      return
    }

    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Checklist deleted successfully')
        setMessageType('success')
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to delete checklist')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error deleting checklist:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Create a new checklist item
   */
  const createItem = async (checklistId, e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/checklist-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, checklist_id: checklistId })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Item added successfully')
        setMessageType('success')
        setNewItem({ text: '', critical: false })
        setShowNewItemForm(null)
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to add item')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Update a checklist item
   */
  const updateItem = async (itemId, updates) => {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Item updated successfully')
        setMessageType('success')
        setEditingItem(null)
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to update item')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Delete a checklist item
   */
  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Item deleted successfully')
        setMessageType('success')
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to delete item')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  /**
   * Toggle critical status for an item
   */
  const toggleCritical = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ critical: !currentStatus })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Item marked as ${!currentStatus ? 'critical' : 'normal'}`)
        setMessageType('success')
        fetchChecklists()
      } else {
        setMessage(data.error || 'Failed to update item')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error toggling critical status:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    }
  }

  // Fetch checklists on component mount
  useEffect(() => {
    fetchChecklists()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading checklists...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={fetchChecklists}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Add New Checklist Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Checklists ({checklists.length})
        </h2>
        <button
          onClick={() => setShowNewChecklistForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
        >
          + New Checklist
        </button>
      </div>

      {/* New Checklist Form */}
      {showNewChecklistForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Checklist</h3>
          <form onSubmit={createChecklist} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={newChecklist.name}
                onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter checklist name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={newChecklist.category}
                onChange={(e) => setNewChecklist({ ...newChecklist, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="General">General</option>
                <option value="Safety">Safety</option>
                <option value="Equipment">Equipment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Create Checklist
              </button>
              <button
                type="button"
                onClick={() => setShowNewChecklistForm(false)}
                className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Checklists Grid - Mobile: stacked cards, Desktop: grid */}
      <div className="grid gap-4 sm:gap-6">
        {checklists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <div className="text-slate-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">No checklists yet</p>
              <p className="text-sm">Create your first checklist to get started</p>
            </div>
          </div>
        ) : (
          checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onUpdate={updateChecklist}
              onDelete={deleteChecklist}
              onCreateItem={createItem}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onToggleCritical={toggleCritical}
              showNewItemForm={showNewItemForm}
              setShowNewItemForm={setShowNewItemForm}
              newItem={newItem}
              setNewItem={setNewItem}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * ChecklistCard component - Displays individual checklist with items
 */
function ChecklistCard({ 
  checklist, 
  onUpdate, 
  onDelete, 
  onCreateItem, 
  onUpdateItem, 
  onDeleteItem, 
  onToggleCritical,
  showNewItemForm,
  setShowNewItemForm,
  newItem,
  setNewItem,
  editingItem,
  setEditingItem
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: checklist.name,
    category: checklist.category
  })

  const handleUpdate = (e) => {
    e.preventDefault()
    onUpdate(checklist.id, editData)
    setIsEditing(false)
  }

  const criticalItems = checklist.checklist_items?.filter(item => item.critical) || []
  const totalItems = checklist.checklist_items?.length || 0

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Checklist Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                  required
                />
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="General">General</option>
                  <option value="Safety">Safety</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inspection">Inspection</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-300 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
                  {checklist.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    checklist.category === 'Safety' ? 'bg-red-100 text-red-800' :
                    checklist.category === 'Equipment' ? 'bg-blue-100 text-blue-800' :
                    checklist.category === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    checklist.category === 'Inspection' ? 'bg-green-100 text-green-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {checklist.category}
                  </span>
                  <span className="text-slate-500">
                    {totalItems} items ({criticalItems.length} critical)
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/inspections/new?checklistId=${checklist.id}`}
                className="bg-green-200 text-green-700 px-3 py-2 rounded-lg hover:bg-green-300 transition-colors duration-200 text-sm font-medium"
              >
                📋 Start Inspection
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-300 transition-colors duration-200 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(checklist.id)}
                className="bg-red-200 text-red-700 px-3 py-2 rounded-lg hover:bg-red-300 transition-colors duration-200 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-slate-800">Items</h4>
          <button
            onClick={() => setShowNewItemForm(checklist.id)}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors duration-200"
          >
            + Add Item
          </button>
        </div>

        {/* New Item Form */}
        {showNewItemForm === checklist.id && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <h5 className="font-medium text-slate-800 mb-3">Add New Item</h5>
            <form onSubmit={(e) => onCreateItem(checklist.id, e)} className="space-y-3">
              <input
                type="text"
                value={newItem.text}
                onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Item text"
                required
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={newItem.critical}
                    onChange={(e) => setNewItem({ ...newItem, critical: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Critical item
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors duration-200"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewItemForm(null)}
                  className="bg-slate-300 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {checklist.checklist_items?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No items yet. Add your first item above.</p>
            </div>
          ) : (
            checklist.checklist_items?.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                onToggleCritical={onToggleCritical}
                isEditing={editingItem === item.id}
                onEdit={() => setEditingItem(item.id)}
                onCancelEdit={() => setEditingItem(null)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ChecklistItem component - Displays individual checklist item
 */
function ChecklistItem({ 
  item, 
  onUpdate, 
  onDelete, 
  onToggleCritical, 
  isEditing, 
  onEdit, 
  onCancelEdit 
}) {
  const [editData, setEditData] = useState({
    text: item.text,
    critical: item.critical
  })

  const handleUpdate = (e) => {
    e.preventDefault()
    onUpdate(item.id, editData)
    onCancelEdit()
  }

  return (
    <div className={`p-3 rounded-lg border ${
      item.critical 
        ? 'border-red-200 bg-red-50' 
        : 'border-slate-200 bg-slate-50'
    }`}>
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={editData.text}
            onChange={(e) => setEditData({ ...editData, text: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editData.critical}
                onChange={(e) => setEditData({ ...editData, critical: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Critical item
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-slate-300 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-slate-800">{item.text}</h5>
              {item.critical && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Critical
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => onToggleCritical(item.id, item.critical)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                item.critical
                  ? 'bg-red-200 text-red-700 hover:bg-red-300'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              title={item.critical ? 'Mark as normal' : 'Mark as critical'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200"
              title="Edit item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300 transition-colors duration-200"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
