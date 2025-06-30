const CACHE_NAME = 'nelson-gpt-v1.0.0'
const STATIC_CACHE_NAME = 'nelson-gpt-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'nelson-gpt-dynamic-v1.0.0'

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/functions/v1/chat-completion',
  '/functions/v1/medical-tools'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Error caching static files:', error)
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
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (request.url.includes('/functions/v1/')) {
    // API requests - Network First strategy
    event.respondWith(handleApiRequest(request))
  } else if (request.destination === 'document') {
    // HTML documents - Network First with fallback
    event.respondWith(handleDocumentRequest(request))
  } else if (request.destination === 'image' || 
             request.destination === 'style' || 
             request.destination === 'script') {
    // Static assets - Cache First strategy
    event.respondWith(handleStaticRequest(request))
  } else {
    // Other requests - Network First
    event.respondWith(handleNetworkFirst(request))
  }
})

// Network First strategy for API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // If successful and cacheable, cache the response
    if (networkResponse.ok && shouldCacheApi(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for API request, trying cache:', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for medical tools
    if (request.url.includes('/medical-tools')) {
      return new Response(JSON.stringify({
        error: 'Offline mode',
        message: 'Medical tools require internet connection for accurate calculations'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Return offline response for chat
    if (request.url.includes('/chat-completion')) {
      return new Response(JSON.stringify({
        error: 'Offline mode',
        message: 'Chat functionality requires internet connection. Please check your connection and try again.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Network First strategy for documents
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for document, trying cache:', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/index.html')
  }
}

// Cache First strategy for static assets
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url)
    throw error
  }
}

// Network First strategy for other requests
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Check if API should be cached
function shouldCacheApi(url) {
  return CACHEABLE_APIS.some(api => url.includes(api))
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'chat-sync') {
    event.waitUntil(syncOfflineChats())
  }
})

// Sync offline chats when connection is restored
async function syncOfflineChats() {
  try {
    // Get offline chats from IndexedDB or localStorage
    // This would integrate with the app's offline storage
    console.log('Syncing offline chats...')
    
    // Implementation would depend on how offline data is stored
    // For now, just log that sync is available
  } catch (error) {
    console.error('Error syncing offline chats:', error)
  }
}

// Handle push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'nelson-gpt-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

