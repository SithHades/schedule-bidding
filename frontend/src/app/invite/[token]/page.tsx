"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

interface InviteData {
  id: string
  email: string
  contractPercent: number
  role: string
  used: boolean
  createdAt: string
  usedAt?: string
}

interface InviteResponse {
  message: string
  invite: InviteData
}

interface SignupResponse {
  message: string
  user: {
    id: string
    name: string
    email: string
    contractPercent: number
    role: string
    createdAt: string
  }
  token: string
}

export default function InviteSignupPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { execute, loading } = useApi()
  
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [inviteLoading, setInviteLoading] = useState(true)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params
        setToken(resolvedParams.token)
      } catch (error) {
        console.error("Error resolving params:", error)
        router.push("/auth/signin")
      }
    }
    
    initializeParams()
  }, [params, router])

  useEffect(() => {
    if (!token) return

    const fetchInvite = async () => {
      try {
        setInviteLoading(true)
        const response: InviteResponse = await api(`/invites/${token}`)
        setInvite(response.invite)
      } catch (error) {
        console.error("Error fetching invite:", error)
        toast.error("Invalid or expired invite link")
        router.push("/auth/signin")
      } finally {
        setInviteLoading(false)
      }
    }

    fetchInvite()
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error("Invalid invite token")
      return
    }
    
    if (!name || !password || !confirmPassword) {
      toast.error("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      const result: SignupResponse = await execute(
        () => api("/invites/signup", {
          method: "POST",
          body: JSON.stringify({
            token,
            name,
            password
          })
        }),
        {
          showSuccessToast: true,
          successMessage: "Account created successfully! Redirecting to login..."
        }
      )

      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error) {
      console.error("Error signing up:", error)
    }
  }

  if (inviteLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Invite</CardTitle>
            <CardDescription className="text-center">
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/auth/signin")} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Registration</CardTitle>
            <CardDescription className="text-center">
              You've been invited to join the schedule bidding system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Display invite details */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Invite Details</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Email:</strong> {invite.email}</p>
                <p><strong>Role:</strong> <Badge variant="outline">{invite.role}</Badge></p>
                <p><strong>Contract %:</strong> {invite.contractPercent}%</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 