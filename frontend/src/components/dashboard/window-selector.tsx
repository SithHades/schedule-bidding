"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock } from "lucide-react"
import { apiWithAuth } from "@/lib/api"

interface ShiftWindow {
  id: number
  name: string
  startDate: string
  endDate: string
  status: "active" | "upcoming" | "closed"
}

interface WindowSelectorProps {
  onWindowChange: (windowId: number) => void
  selectedWindowId: number | null
}

export default function WindowSelector({ onWindowChange, selectedWindowId }: WindowSelectorProps) {
  const { data: session } = useSession()
  const [windows, setWindows] = useState<ShiftWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWindows = useCallback(async () => {
    if (!session?.user.id) return
    
    try {
      setLoading(true)
      setError(null)

      if (!session?.user.accessToken) {
        throw new Error('No access token available')
      }

      // Backend returns { message, shiftWindows, count }
      const response = await apiWithAuth('/shift-windows', session.user.accessToken)
      const windows = response.shiftWindows || []
      setWindows(windows)
      
      // If no window is currently selected and we have windows, select the first one
      if (!selectedWindowId && windows.length > 0) {
        onWindowChange(windows[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [session?.user.id, session?.user.accessToken, selectedWindowId, onWindowChange])

  useEffect(() => {
    fetchWindows()
  }, [fetchWindows])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'upcoming':
        return 'text-blue-600 bg-blue-50'
      case 'closed':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    return `${start} - ${end}`
  }

  const selectedWindow = windows.find(w => w.id === selectedWindowId)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Shift Window</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Shift Window</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            <p>Error loading windows: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (windows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Shift Window</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No Shift Windows</p>
            <p className="text-sm">No shift windows are available yet. Contact your administrator to create shift windows.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Shift Window</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Bidding Window</label>
          <Select
            value={selectedWindowId?.toString() || ''}
            onValueChange={(value) => onWindowChange(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a shift window" />
            </SelectTrigger>
            <SelectContent>
              {windows.map((window) => (
                <SelectItem key={window.id} value={window.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span>{window.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(window.status)}`}>
                      {window.status}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWindow && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">{selectedWindow.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedWindow.status)}`}>
                {selectedWindow.status}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {formatDateRange(selectedWindow.startDate, selectedWindow.endDate)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 