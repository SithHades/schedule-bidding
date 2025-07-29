export async function api(path: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  const res = await fetch(`${apiUrl}${path}`, {
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
export async function apiWithAuth(path: string, userId: string, options: RequestInit = {}) {
  return api(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${userId}`,
      ...options.headers,
    },
  })
} 