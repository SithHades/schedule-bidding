"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Copy, Mail, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { apiWithAuth } from "@/lib/api"
import toast from "react-hot-toast"

interface InviteData {
  id: string
  email: string
  token: string
  contractPercent: number
  role: string
  used: boolean
  createdAt: string
  usedAt?: string
}

interface InvitesResponse {
  message: string
  invites: InviteData[]
  count: number
}

export default function InviteManagement() {
  const { data: session } = useSession()
  const { execute, loading } = useApi()
  
  const [invites, setInvites] = useState<InviteData[]>([])
  const [filteredInvites, setFilteredInvites] = useState<InviteData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "used">("all")

  const fetchInvites = async () => {
    if (!session?.user.accessToken) {
      toast.error("User not authenticated")
      return
    }

    try {
      const result: InvitesResponse = await execute(
        () => apiWithAuth("/invites", session.user.accessToken, {
          method: "GET"
        }),
        {
          showSuccessToast: false
        }
      )

      setInvites(result.invites)
    } catch (error) {
      console.error("Error fetching invites:", error)
      toast.error("Failed to fetch invites")
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [session?.user.accessToken])

  useEffect(() => {
    let filtered = invites

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(invite => 
        invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invite.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invite => 
        statusFilter === "used" ? invite.used : !invite.used
      )
    }

    setFilteredInvites(filtered)
  }, [invites, searchQuery, statusFilter])

  const copyInviteUrl = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Invite URL copied to clipboard!")
  }

  const getStatusBadge = (invite: InviteData) => {
    if (invite.used) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Used
        </Badge>
      )
    }

    const createdDate = new Date(invite.createdAt)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

    if (daysDiff > 7) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "ADMIN" ? "default" : "outline"}>
        {role}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invite Management</CardTitle>
            <CardDescription>
              View and manage all user invitations. Track invite status and copy invite links.
            </CardDescription>
          </div>
          <Button
            onClick={fetchInvites}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All ({invites.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({invites.filter(i => !i.used).length})
            </Button>
            <Button
              variant={statusFilter === "used" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("used")}
            >
              Used ({invites.filter(i => i.used).length})
            </Button>
          </div>
        </div>

        {/* Invites Table */}
        {filteredInvites.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {invites.length === 0 
                ? "No invites have been created yet." 
                : "No invites match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contract %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(invite.role)}
                    </TableCell>
                    <TableCell>
                      {invite.contractPercent}%
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invite)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(invite.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {invite.usedAt ? formatDate(invite.usedAt) : "-"}
                    </TableCell>
                    <TableCell>
                      {!invite.used && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteUrl(invite.token)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}