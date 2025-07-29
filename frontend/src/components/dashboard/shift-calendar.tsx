"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Pin, Users, TrendingUp } from "lucide-react"
import { apiWithAuth } from "@/lib/api"

interface Shift {
  id: number
  date: string
  type: "early" | "late"
  startTime: string
  endTime: string
  pinCount: number
  isPinnedByUser: boolean
}

interface ShiftCalendarProps {
  activeWindowId?: number
}

export default function ShiftCalendar({ activeWindowId = 1 }: ShiftCalendarProps) {
  const { data: session } = useSession()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pinnedCount, setPinnedCount] = useState(0)

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  // Calculate estimated quota based on contract percentage
  const estimatedQuota = Math.round((session?.user.contractPercentage || 100) / 100 * 5) // 5 days per week

  const fetchShifts = useCallback(async () => {
    if (!session?.user.id) return
    
    try {
      setLoading(true)
      setError(null)

      const data = await apiWithAuth(`/shifts?windowId=${activeWindowId}`, session.user.id)
      setShifts(data)
      
      // Count pinned shifts
      const pinned = data.filter((shift: Shift) => shift.isPinnedByUser).length
      setPinnedCount(pinned)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [activeWindowId, session?.user.id])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const handlePinToggle = async (shift: Shift) => {
    if (!session?.user.id) return

    try {
      if (shift.isPinnedByUser) {
        // Unpin shift
        await apiWithAuth(`/pins/${shift.id}`, session.user.id, {
          method: 'DELETE',
        })
      } else {
        // Pin shift
        await apiWithAuth('/pins', session.user.id, {
          method: 'POST',
          body: JSON.stringify({
            userId: session.user.id,
            shiftId: shift.id,
          }),
        })
      }

      // Refresh shifts after pin/unpin
      await fetchShifts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const getShiftForDayAndType = (dayIndex: number, type: "early" | "late") => {
    // This is a simplified approach - you might need to adjust based on your actual date format
    return shifts.find(shift => {
      const shiftDate = new Date(shift.date)
      const dayOfWeek = shiftDate.getDay()
      // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      return adjustedDay === dayIndex && shift.type === type
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Shift Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
            <Calendar className="h-5 w-5" />
            <span>Shift Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Error loading shifts: {error}</p>
            <Button onClick={fetchShifts} className="mt-4">
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
          <Calendar className="h-5 w-5" />
          <span>Shift Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Pin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">You pinned {pinnedCount} shifts</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Estimated shift quota: {estimatedQuota}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[600px]">
            {/* Header */}
            <div className="font-medium text-sm text-gray-600 p-2">Shift Type</div>
            {weekDays.map((day) => (
              <div key={day} className="font-medium text-sm text-gray-600 p-2 text-center">
                {day}
              </div>
            ))}

            {/* Early Shifts Row */}
            <div className="font-medium text-sm p-2 bg-yellow-50 rounded">
              Early
            </div>
            {weekDays.map((_, dayIndex) => {
              const shift = getShiftForDayAndType(dayIndex, "early")
              return (
                <div key={`early-${dayIndex}`} className="p-2">
                  {shift ? (
                    <ShiftCard shift={shift} onPinToggle={handlePinToggle} />
                  ) : (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      No shift
                    </div>
                  )}
                </div>
              )
            })}

            {/* Late Shifts Row */}
            <div className="font-medium text-sm p-2 bg-blue-50 rounded">
              Late
            </div>
            {weekDays.map((_, dayIndex) => {
              const shift = getShiftForDayAndType(dayIndex, "late")
              return (
                <div key={`late-${dayIndex}`} className="p-2">
                  {shift ? (
                    <ShiftCard shift={shift} onPinToggle={handlePinToggle} />
                  ) : (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      No shift
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ShiftCardProps {
  shift: Shift
  onPinToggle: (shift: Shift) => void
}

function ShiftCard({ shift, onPinToggle }: ShiftCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={`
        h-24 border-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md
        ${shift.isPinnedByUser 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={() => onPinToggle(shift)}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="text-xs font-medium text-gray-900">
            {formatDate(shift.date)}
          </div>
          <div className="text-xs text-gray-600">
            {shift.startTime} - {shift.endTime}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">{shift.pinCount}</span>
          </div>
          
          {shift.isPinnedByUser && (
            <Badge variant="secondary" className="text-xs">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
} 