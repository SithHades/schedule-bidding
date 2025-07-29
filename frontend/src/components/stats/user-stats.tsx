"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Calendar, Target, Award, RefreshCw } from "lucide-react"
import { apiWithAuth } from "@/lib/api"

interface UserStatsData {
  totalPinnedShifts: number
  contractPercentage: number
  simulatedQuota: number
  averageWeight: number
  pinnedShiftsByWeekday: {
    [key: string]: number
  }
  teamAverageWeight: number
  weeklyBreakdown: {
    week: string
    pinnedShifts: number
  }[]
}

export default function UserStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async () => {
    if (!session?.user.id) return

    try {
      setLoading(true)
      setError(null)

      const data = await apiWithAuth(`/user-stats/${session.user.id}`, session.user.id)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [session?.user.id])

  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 py-8">
            <p>Error loading statistics: {error}</p>
            <Button onClick={fetchUserStats} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            No statistics available
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const pinnedShiftsData = weekdayNames.map(day => ({
    day,
    count: stats.pinnedShiftsByWeekday[day.toLowerCase()] || 0
  }))

  const maxCount = Math.max(...pinnedShiftsData.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts Pinned</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPinnedShifts}</div>
            <p className="text-xs text-muted-foreground">
              Active pins this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contractPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Your contract allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulated Quota</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.simulatedQuota}</div>
            <p className="text-xs text-muted-foreground">
              Expected shifts ({stats.contractPercentage}% × 8)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Weight</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWeight.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Your pinned shifts weight
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quota Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Current Pins</span>
                <span>{stats.totalPinnedShifts} / {stats.simulatedQuota}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.totalPinnedShifts / stats.simulatedQuota) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.totalPinnedShifts >= stats.simulatedQuota ? (
                  <span className="text-green-600 font-medium">✓ Quota met!</span>
                ) : (
                  `${stats.simulatedQuota - stats.totalPinnedShifts} more shifts needed`
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Average</span>
                <span className="font-semibold">{stats.averageWeight.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Average</span>
                <span className="font-semibold">{stats.teamAverageWeight.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Difference</span>
                <span className={`font-semibold ${
                  stats.averageWeight > stats.teamAverageWeight 
                    ? 'text-green-600' 
                    : stats.averageWeight < stats.teamAverageWeight 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {stats.averageWeight > stats.teamAverageWeight ? '+' : ''}
                  {(stats.averageWeight - stats.teamAverageWeight).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.averageWeight > stats.teamAverageWeight 
                  ? "Above team average - good shift selection!" 
                  : stats.averageWeight < stats.teamAverageWeight 
                  ? "Below team average - consider higher weight shifts"
                  : "Right at team average"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Shifts by Weekday</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pinnedShiftsData.map((item) => (
                <div key={item.day} className="flex items-center space-x-3">
                  <div className="w-16 text-sm font-medium">{item.day.slice(0, 3)}</div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-blue-600 h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      >
                        {item.count > 0 && (
                          <span className="text-white text-xs font-medium">{item.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pinnedShiftsData.every(d => d.count === 0) && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No shifts pinned yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.weeklyBreakdown.length > 0 ? (
                stats.weeklyBreakdown.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium">{week.week}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{week.pinnedShifts} shifts</span>
                      {index > 0 && (
                        <span className={`text-xs ${
                          week.pinnedShifts > stats.weeklyBreakdown[index - 1].pinnedShifts
                            ? 'text-green-600' 
                            : week.pinnedShifts < stats.weeklyBreakdown[index - 1].pinnedShifts
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {week.pinnedShifts > stats.weeklyBreakdown[index - 1].pinnedShifts ? '↗' : 
                           week.pinnedShifts < stats.weeklyBreakdown[index - 1].pinnedShifts ? '↘' : '→'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No weekly data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchUserStats} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Statistics
        </Button>
      </div>
    </div>
  )
} 