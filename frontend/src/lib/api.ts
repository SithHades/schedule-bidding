export async function api(path: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  // Ensure path starts with /api unless it already does
  const fullPath = path.startsWith('/api') ? path : `/api${path}`
  
  const res = await fetch(`${apiUrl}${fullPath}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    let errorMessage = `API error: ${res.status}`
    try {
      const errorResponse = await res.text()
      const parsedError = JSON.parse(errorResponse)
      if (parsedError.error) {
        errorMessage = parsedError.error
      } else {
        errorMessage += ` - ${errorResponse}`
      }
    } catch {
      errorMessage += ` - ${res.statusText}`
    }
    throw new Error(errorMessage)
  }

  return res.json()
}

// Helper for authenticated requests
export async function apiWithAuth(path: string, token: string, options: RequestInit = {}) {
  if (!token) {
    throw new Error('No authentication token provided')
  }
  
  return api(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
} 