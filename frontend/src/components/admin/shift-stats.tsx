"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Edit, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { apiWithAuth } from "@/lib/api"

interface ShiftStat {
  id: number
  date: string
  type: "early" | "late"
  startTime: string
  endTime: string
  pinCount: number
  weight: number
}

type SortField = 'date' | 'type' | 'pinCount' | 'weight'
type SortDirection = 'asc' | 'desc'

export default function ShiftStats() {
  const { data: session } = useSession()
  const [shifts, setShifts] = useState<ShiftStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingShift, setEditingShift] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState("")
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const fetchShiftStats = useCallback(async () => {
    if (!session?.user.id) return
    
    try {
      setLoading(true)
      setError(null)

      const data = await apiWithAuth("/shift-stats", session.user.id)
      setShifts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [session?.user.id])

  useEffect(() => {
    fetchShiftStats()
  }, [fetchShiftStats])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedShifts = [...shifts].sort((a, b) => {
    let aValue: string | number = a[sortField]
    let bValue: string | number = b[sortField]

    if (sortField === 'date') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const startEditing = (shift: ShiftStat) => {
    setEditingShift(shift.id)
    setEditWeight(shift.weight.toString())
  }

  const cancelEditing = () => {
    setEditingShift(null)
    setEditWeight("")
  }

  const saveWeight = async (shiftId: number) => {
    if (!session?.user.id) return
    
    try {
      await apiWithAuth(`/shifts/${shiftId}/weight`, session.user.id, {
        method: 'PATCH',
        body: JSON.stringify({
          weight: parseFloat(editWeight)
        }),
      })

      // Refresh shift stats
      await fetchShiftStats()
      setEditingShift(null)
      setEditWeight("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift weight')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    return type === "early" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
  }

  const getPinCountColor = (pinCount: number) => {
    if (pinCount >= 8) return "text-red-600 font-semibold"
    if (pinCount >= 5) return "text-orange-600 font-medium"
    if (pinCount >= 2) return "text-green-600"
    return "text-gray-600"
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Shift Popularity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
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
            <BarChart3 className="h-5 w-5" />
            <span>Shift Popularity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Error loading shift statistics: {error}</p>
            <Button onClick={fetchShiftStats} className="mt-4">
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
          <BarChart3 className="h-5 w-5" />
          <span>Shift Popularity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-semibold"
                  >
                    Date
                    {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="h-auto p-0 font-semibold"
                  >
                    Type
                    {getSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead>Time</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('pinCount')}
                    className="h-auto p-0 font-semibold"
                  >
                    Pin Count
                    {getSortIcon('pinCount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('weight')}
                    className="h-auto p-0 font-semibold"
                  >
                    Weight
                    {getSortIcon('weight')}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {formatDate(shift.date)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(shift.type)}>
                      {shift.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {shift.startTime} - {shift.endTime}
                  </TableCell>
                  <TableCell>
                    <span className={getPinCountColor(shift.pinCount)}>
                      {shift.pinCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingShift === shift.id ? (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="w-20"
                      />
                    ) : (
                      shift.weight.toFixed(1)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingShift === shift.id ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => saveWeight(shift.id)}
                          disabled={!editWeight}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(shift)}
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
        
        {shifts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No shift statistics found
          </div>
        )}
      </CardContent>
    </Card>
  )
} 