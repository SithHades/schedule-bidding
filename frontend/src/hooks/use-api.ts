import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { api, apiWithAuth } from "@/lib/api"

interface UseApiOptions {
  showSuccessToast?: boolean
  successMessage?: string
  showErrorToast?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    apiCall: () => Promise<any>,
    options: UseApiOptions = {}
  ) => {
    const {
      showSuccessToast = false,
      successMessage = "Operation completed successfully",
      showErrorToast = true,
      onSuccess,
      onError
    } = options

    try {
      setLoading(true)
      setError(null)
      
      const result = await apiCall()
      
      if (showSuccessToast) {
        toast.success(successMessage)
      }
      
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      if (showErrorToast) {
        toast.error(errorMessage)
      }
      
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error }
}

export function useAuthenticatedApi() {
  const { data: session } = useSession()
  const { execute, loading, error } = useApi()

  const executeWithAuth = useCallback(async (
    path: string,
    options: RequestInit = {},
    apiOptions: UseApiOptions = {}
  ) => {
    if (!session?.user.id) {
      throw new Error("User not authenticated")
    }

    return execute(
      () => apiWithAuth(path, session.user.id, options),
      apiOptions
    )
  }, [session?.user.id, execute])

  return { executeWithAuth, loading, error }
}

// Specific hooks for common operations
export function useTogglePin() {
  const { executeWithAuth, loading } = useAuthenticatedApi()

  const togglePin = useCallback(async (shift: { id: number, isPinnedByUser: boolean }) => {
    const path = shift.isPinnedByUser ? `/pins/${shift.id}` : '/pins'
    const method = shift.isPinnedByUser ? 'DELETE' : 'POST'
    const body = shift.isPinnedByUser ? undefined : JSON.stringify({
      shiftId: shift.id,
    })

    return executeWithAuth(path, { method, body }, {
      showSuccessToast: true,
      successMessage: shift.isPinnedByUser ? "Shift unpinned" : "Shift pinned"
    })
  }, [executeWithAuth])

  return { togglePin, loading }
}

export function useUpdateUser() {
  const { executeWithAuth, loading } = useAuthenticatedApi()

  const updateUser = useCallback(async (
    userId: number, 
    data: { role?: string; contractPercentage?: number }
  ) => {
    return executeWithAuth(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, {
      showSuccessToast: true,
      successMessage: "User updated successfully"
    })
  }, [executeWithAuth])

  return { updateUser, loading }
} 