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
    const errorText = await res.text().catch(() => 'Unknown error')
    throw new Error(`API error: ${res.status} ${res.statusText} - ${errorText}`)
  }

  return res.json()
}

// Helper for authenticated requests
export async function apiWithAuth(path: string, token: string, options: RequestInit = {}) {
  return api(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
} 