"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
  fallbackUrl?: string
}

export default function AuthGuard({ 
  children, 
  requiredRole,
  fallbackUrl = "/auth/signin" 
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    // Not authenticated
    if (status === "unauthenticated") {
      router.push(fallbackUrl)
      return
    }

    // Authenticated but insufficient role
    if (requiredRole && session?.user.role !== requiredRole) {
      // If user is not admin but admin is required, redirect to dashboard
      if (requiredRole === "admin" && session?.user.role !== "admin") {
        router.push("/dashboard")
        return
      }
    }
  }, [session, status, router, requiredRole, fallbackUrl])

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  // Don't render children if insufficient role
  if (requiredRole && session?.user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
} 