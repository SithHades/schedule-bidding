"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut,
  User
} from "lucide-react"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) {
    return null
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true
    },
    {
      name: "My Stats",
      href: "/dashboard/stats",
      icon: BarChart3,
      show: true
    },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Settings,
      show: session.user.role === "admin"
    }
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {getInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {session.user.contractPercentage}% Contract
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              if (!item.show) return null
              
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"}
                    `}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <Separator />

          {/* User Info & Logout */}
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-4 w-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Role: {session.user.role}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 