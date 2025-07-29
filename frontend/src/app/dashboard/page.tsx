"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import AuthGuard from "@/components/auth/auth-guard"
import SidebarLayout from "@/components/layout/sidebar-layout"
import ShiftCalendar from "@/components/dashboard/shift-calendar"
import WindowSelector from "@/components/dashboard/window-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const { data: session } = useSession()
  const [selectedWindowId, setSelectedWindowId] = useState(1)

  const handleWindowChange = (windowId: number) => {
    setSelectedWindowId(windowId)
  }

  return (
    <AuthGuard>
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session!.user.name}!
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session!.user.name}</div>
              <p className="text-xs text-muted-foreground">
                {session!.user.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contract %</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session!.user.contractPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                Current contract percentage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{session!.user.role}</div>
              <p className="text-xs text-muted-foreground">
                Your access level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Window Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WindowSelector 
              selectedWindowId={selectedWindowId}
              onWindowChange={handleWindowChange}
            />
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">View My Stats</h3>
                    <p className="text-sm text-gray-600">Check your performance metrics</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Schedule Settings</h3>
                    <p className="text-sm text-gray-600">Manage your availability</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shift Calendar Component */}
        <ShiftCalendar activeWindowId={selectedWindowId} />
      </div>
    </SidebarLayout>
    </AuthGuard>
  )
} 