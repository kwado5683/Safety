/*
DESCRIPTION: Service Worker for handling push notifications and offline functionality.
- Handles push notification events from server
- Manages notification display and user interactions
- Provides offline functionality for the safety app
- Caches critical resources for offline use

WHAT EACH PART DOES:
1. Push Event Handling - Processes incoming push notifications
2. Notification Display - Shows notifications with proper formatting
3. User Interactions - Handles notification clicks and actions
4. Offline Support - Caches resources for offline functionality

PSEUDOCODE:
- Listen for push events from server
- Display notifications with proper formatting
- Handle user clicks and notification actions
- Cache resources for offline functionality
*/

// Service Worker version
const CACHE_NAME = 'safety-app-v1'
const OFFLINE_URL = '/offline.html'

// Resources to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources...')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If offline and request is for a page, show offline page
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL)
            }
          })
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  let notificationData = {
    title: 'Safety Alert',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'safety-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  }

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = {
        ...notificationData,
        ...pushData
      }
    } catch (error) {
      console.error('Error parsing push data:', error)
      // Use text data if JSON parsing fails
      notificationData.body = event.data.text()
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon || '/icon-192x192.png',
      badge: notificationData.badge || '/icon-192x192.png',
      tag: notificationData.tag || 'safety-notification',
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [200, 100, 200],
      data: notificationData.data || {},
      actions: notificationData.actions || [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  )
})

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const notificationData = event.notification.data || {}
  const action = event.action

  if (action === 'dismiss') {
    // Just close the notification
    return
  }

  // Handle view action or default click
  const urlToOpen = notificationData.url || '/'
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate to URL
          client.focus()
          client.postMessage({
            type: 'NAVIGATE',
            url: urlToOpen
          })
          return
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks here
      // For example, sync offline incident reports
      syncOfflineData()
    )
  }
})

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Helper function for background sync
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData()
    
    // Sync each item
    for (const item of offlineData) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        })

        if (response.ok) {
          // Remove from offline storage if sync successful
          await removeOfflineData(item.id)
        }
      } catch (error) {
        console.error('Error syncing offline data:', error)
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error)
  }
}

// Helper function to get offline data (placeholder)
async function getOfflineData() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return []
}

// Helper function to remove offline data (placeholder)
async function removeOfflineData(id) {
  // This would typically remove from IndexedDB
  console.log('Removing offline data:', id)
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason)
})
