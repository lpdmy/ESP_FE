"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Checkbox } from "@/common/components/ui/checkbox"
import { Plus, Trash2, Clock } from "lucide-react"
import { toast } from "react-toastify"

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
]

export default function SimpleClassScheduleEditor({ schedules = [], onChange }) {
  const [newSchedule, setNewSchedule] = useState({
    startTime: "07:00",
    endTime: "17:00",
    selectedDays: [],
  })

  // Convert schedules thành format đơn giản (group by time range)
  const scheduleGroups = []
  const processedSchedules = [...schedules]

  // Group schedules by time range
  while (processedSchedules.length > 0) {
    const first = processedSchedules[0]
    const sameTimeSchedules = processedSchedules.filter(
      s => s.startTime === first.startTime && s.endTime === first.endTime
    )
    
    scheduleGroups.push({
      startTime: first.startTime,
      endTime: first.endTime,
      days: sameTimeSchedules.map(s => s.dayOfWeek),
    })

    // Remove processed
    sameTimeSchedules.forEach(s => {
      const index = processedSchedules.indexOf(s)
      if (index > -1) processedSchedules.splice(index, 1)
    })
  }

  const handleAddSchedule = () => {
    if (newSchedule.selectedDays.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ngày")
      return
    }

    if (!newSchedule.startTime || !newSchedule.endTime) {
      toast.error("Vui lòng nhập giờ bắt đầu và kết thúc")
      return
    }

    const start = new Date(`2000-01-01T${newSchedule.startTime}`)
    const end = new Date(`2000-01-01T${newSchedule.endTime}`)
    
    if (end <= start) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu")
      return
    }

    // Format time
    const formatTime = (time) => {
      if (!time) return "07:00:00"
      if (time.split(':').length === 3) return time
      return time + ":00"
    }

    // Tạo schedules cho các ngày đã chọn
    const newSchedules = newSchedule.selectedDays.map(day => ({
      dayOfWeek: day,
      period: 1, // Default period
      startTime: formatTime(newSchedule.startTime),
      endTime: formatTime(newSchedule.endTime),
      subject: null,
    }))

    // Merge với schedules hiện tại (tránh duplicate)
    const updatedSchedules = [...schedules]
    
    newSchedules.forEach(newSched => {
      const existingIndex = updatedSchedules.findIndex(
        s => s.dayOfWeek === newSched.dayOfWeek
      )
      
      if (existingIndex >= 0) {
        // Update existing
        updatedSchedules[existingIndex] = newSched
      } else {
        // Add new
        updatedSchedules.push(newSched)
      }
    })

    onChange?.(updatedSchedules)
    
    // Reset form
    setNewSchedule({
      startTime: "07:00",
      endTime: "17:00",
      selectedDays: [],
    })

  }

  const handleRemoveSchedule = (startTime, endTime) => {
    const updatedSchedules = schedules.filter(
      s => !(s.startTime === startTime && s.endTime === endTime)
    )
    onChange?.(updatedSchedules)
  }

  const handleDayToggle = (day) => {
    setNewSchedule(prev => {
      const selectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
      
      return { ...prev, selectedDays }
    })
  }

  const formatTimeDisplay = (time) => {
    if (!time) return ""
    if (typeof time === 'string') {
      return time.substring(0, 5) // HH:mm
    }
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Lịch học (Giờ bận)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form thêm lịch */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="space-y-2">
            <Label>Chọn các ngày trong tuần *</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <Checkbox
                  key={day.value}
                  id={`day-${day.value}`}
                  checked={newSchedule.selectedDays.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  label={day.label}
                  className="text-sm"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giờ bắt đầu *</Label>
              <Input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => 
                  setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ kết thúc *</Label>
              <Input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => 
                  setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <Button
            onClick={handleAddSchedule}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={newSchedule.selectedDays.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm lịch học
          </Button>
        </div>

        {/* Danh sách lịch đã thêm */}
        {scheduleGroups.length > 0 ? (
          <div className="space-y-2">
            <Label>Lịch học đã thiết lập:</Label>
            {scheduleGroups.map((group, index) => {
              const dayLabels = group.days
                .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
                .filter(Boolean)
                .join(", ")

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div className="flex-1">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatTimeDisplay(group.startTime)} - {formatTimeDisplay(group.endTime)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dayLabels}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSchedule(group.startTime, group.endTime)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Chưa có lịch học. Thêm lịch học ở trên.
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>💡 Hướng dẫn:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Chọn các ngày trong tuần và giờ bận học</li>
            <li>Có thể chọn nhiều ngày cùng lúc (như báo thức)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

