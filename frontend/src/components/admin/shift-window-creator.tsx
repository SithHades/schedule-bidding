"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Plus, Loader2 } from "lucide-react"

export default function ShiftWindowCreator() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const generateWindowName = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return ""
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    if (startMonth === endMonth) {
      return `${startMonth} Bidding Window`
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} Bidding Window`
    }
  }

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) {
      setError("Please select both start and end dates")
      return false
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      setError("Start date cannot be in the past")
      return false
    }

    if (endDate <= startDate) {
      setError("End date must be after start date")
      return false
    }

    // Check if window is too long (optional validation)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 90) {
      setError("Window duration cannot exceed 90 days")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const windowName = formData.name || generateWindowName(formData.startDate, formData.endDate)

      const response = await fetch("http://localhost:3001/shift-windows", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: windowName,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create shift window')
      }

      const result = await response.json()
      
      setSuccess(`Successfully created "${windowName}" with ${result.shiftsCreated || 'multiple'} shifts`)
      setFormData({ name: "", startDate: "", endDate: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the shift window')
    } finally {
      setLoading(false)
    }
  }

  const suggestedName = generateWindowName(formData.startDate, formData.endDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Create New Shift Window</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Window Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={suggestedName || "Enter a custom name or leave blank for auto-generation"}
            />
            {suggestedName && !formData.name && (
              <p className="text-sm text-gray-500">
                Suggested: {suggestedName}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">What happens when you create a window:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• A new bidding window will be created with the specified dates</li>
              <li>• Early shifts (8:00 AM - 4:00 PM) will be auto-generated for Monday-Friday</li>
              <li>• Late shifts (4:00 PM - 12:00 AM) will be auto-generated for Monday-Friday</li>
              <li>• Users will be able to pin shifts within this window</li>
              <li>• Default shift weights will be set to 1.0</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.startDate || !formData.endDate}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Window...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Shift Window
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 