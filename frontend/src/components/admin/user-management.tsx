"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner, { LoadingButton } from "@/components/ui/loading-spinner"
import { Users, Edit, Save, X } from "lucide-react"
import { useAuthenticatedApi, useUpdateUser } from "@/hooks/use-api"

interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
  contractPercentage: number
}

export default function UserManagement() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ role: "", contractPercentage: "" })
  const { executeWithAuth, loading, error } = useAuthenticatedApi()
  const { updateUser, loading: updateLoading } = useUpdateUser()

  const fetchUsers = useCallback(async () => {
    if (!session?.user.id) return
    
    try {
      await executeWithAuth("/users", {}, {
        showErrorToast: true,
        onSuccess: (data) => setUsers(data)
      })
    } catch (err) {
      // Error handling is done by the hook
    }
  }, [executeWithAuth, session?.user.id])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const startEditing = (user: User) => {
    setEditingUser(user.id)
    setEditForm({
      role: user.role,
      contractPercentage: user.contractPercentage.toString()
    })
  }

  const cancelEditing = () => {
    setEditingUser(null)
    setEditForm({ role: "", contractPercentage: "" })
  }

  const saveUser = async (userId: number) => {
    try {
      await updateUser(userId.toString(), {
        role: editForm.role,
        contractPercentage: parseInt(editForm.contractPercentage)
      })

      // Refresh users list
      await fetchUsers()
      setEditingUser(null)
      setEditForm({ role: "", contractPercentage: "" })
    } catch (err) {
      // Error handling is done by the hook
    }
  }

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Error loading users: {error}</p>
            <Button onClick={fetchUsers} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>User Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contract %</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Select
                        value={editForm.role}
                        onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.contractPercentage}
                        onChange={(e) => setEditForm({ ...editForm, contractPercentage: e.target.value })}
                        className="w-20"
                      />
                    ) : (
                      `${user.contractPercentage}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <div className="flex space-x-2">
                        <LoadingButton
                          size="sm"
                          onClick={() => saveUser(user.id)}
                          disabled={!editForm.role || !editForm.contractPercentage}
                          loading={updateLoading}
                          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                          <Save className="h-4 w-4" />
                        </LoadingButton>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          disabled={updateLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(user)}
                        disabled={user.id.toString() === session?.user.id} // Don't allow editing self
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  )
} 