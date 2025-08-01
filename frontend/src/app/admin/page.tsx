"use client"

import { useSession } from "next-auth/react"
import AuthGuard from "@/components/auth/auth-guard"
import SidebarLayout from "@/components/layout/sidebar-layout"
import UserManagement from "@/components/admin/user-management"
import ShiftStats from "@/components/admin/shift-stats"
import ShiftWindowCreator from "@/components/admin/shift-window-creator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, BarChart3, CalendarDays, Activity, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Admin() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <AuthGuard requiredRole="admin">
      <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Administrator Access</span>
          </div>
        </div>

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Manage roles & contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shift Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Live</div>
              <p className="text-xs text-muted-foreground">
                Monitor shift popularity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Window Creator</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">
                Create new bidding windows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <UserPlus className="h-5 w-5" />
                User Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">
                Create and manage invite links for new users to join the system
              </p>
              <Button 
                onClick={() => router.push("/admin/invite")}
                className="w-full"
              >
                Manage Invites
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
          {/* User Management Section */}
          <section>
            <UserManagement />
          </section>

          {/* Shift Statistics Section */}
          <section>
            <ShiftStats />
          </section>

          {/* Create Shift Window Section */}
          <section>
            <ShiftWindowCreator />
          </section>
        </div>
      </div>
    </SidebarLayout>
    </AuthGuard>
  )
} 