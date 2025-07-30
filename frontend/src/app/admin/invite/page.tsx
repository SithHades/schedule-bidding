"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/hooks/use-api"
import { apiWithAuth } from "@/lib/api"
import AuthGuard from "@/components/auth/auth-guard"
import toast from "react-hot-toast"

interface InviteResponse {
  message: string
  invite: {
    id: string
    email: string
    token: string
    contractPercent: number
    role: string
    createdAt: string
  }
  inviteUrl: string
}

export default function AdminInvitePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { execute, loading } = useApi()
  
  const [email, setEmail] = useState("")
  const [contractPercent, setContractPercent] = useState("")
  const [role, setRole] = useState("")
  const [inviteUrl, setInviteUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !contractPercent || !role) {
      toast.error("All fields are required")
      return
    }

    if (!session?.user.accessToken) {
      toast.error("User not authenticated")
      return
    }

    try {
      const result: InviteResponse = await execute(
        () => apiWithAuth("/invites", session.user.accessToken, {
          method: "POST",
          body: JSON.stringify({
            email,
            contractPercent: parseInt(contractPercent),
            role
          })
        }),
        {
          showSuccessToast: true,
          successMessage: "Invite created successfully!"
        }
      )

      setInviteUrl(result.inviteUrl)
      
      // Reset form
      setEmail("")
      setContractPercent("")
      setRole("")
    } catch (error) {
      console.error("Error creating invite:", error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Invite URL copied to clipboard!")
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create User Invite</CardTitle>
              <CardDescription>
                Generate an invite link for a new user to join the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractPercent">Contract Percentage</Label>
                  <Input
                    id="contractPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={contractPercent}
                    onChange={(e) => setContractPercent(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating Invite..." : "Create Invite"}
                </Button>
              </form>

              {inviteUrl && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    Invite Created Successfully!
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input
                      value={inviteUrl}
                      readOnly
                      className="flex-1 bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="shrink-0"
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Share this URL with the user to complete their registration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
} 