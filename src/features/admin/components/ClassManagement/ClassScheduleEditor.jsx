"use client"

import { useState, useEffect } from "react"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { SimpleSelect } from "@/common/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
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

const PERIODS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tiết ${i + 1}`
}))

export default function ClassScheduleEditor({ schedules = [], onChange, useEditableView = false }) {
  const [localSchedules, setLocalSchedules] = useState(schedules || [])

  // Sync với schedules từ props
  useEffect(() => {
    setLocalSchedules(schedules || [])
  }, [schedules])

  const handleAddSchedule = () => {
    const newSchedule = {
      dayOfWeek: 1,
      period: 1,
      startTime: "07:00",
      endTime: "07:45",
      subject: ""
    }
    const updated = [...localSchedules, newSchedule]
    setLocalSchedules(updated)
    onChange?.(updated)
  }

  const handleRemoveSchedule = (index) => {
    const updated = localSchedules.filter((_, i) => i !== index)
    setLocalSchedules(updated)
    onChange?.(updated)
  }

  const handleUpdateSchedule = (index, field, value) => {
    const updated = localSchedules.map((schedule, i) => {
      if (i === index) {
        return { ...schedule, [field]: value }
      }
      return schedule
    })
    setLocalSchedules(updated)
    onChange?.(updated)
  }

  const validateSchedule = (schedule, index) => {
    if (!schedule.startTime || !schedule.endTime) {
      return "Vui lòng nhập giờ bắt đầu và kết thúc"
    }
    
    const start = new Date(`2000-01-01T${schedule.startTime}`)
    const end = new Date(`2000-01-01T${schedule.endTime}`)
    
    if (end <= start) {
      return "Giờ kết thúc phải sau giờ bắt đầu"
    }

    // Check duplicate (same day + period)
    const duplicate = localSchedules.find((s, i) => 
      i !== index && 
      s.dayOfWeek === schedule.dayOfWeek && 
      s.period === schedule.period
    )
    
    if (duplicate) {
      return "Đã có lịch học cho thứ này và tiết này"
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lịch học (Tùy chọn)</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSchedule}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm tiết học
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {localSchedules.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Chưa có lịch học. Nhấn "Thêm tiết học" để thêm.
          </p>
        ) : (
          localSchedules.map((schedule, index) => {
            const error = validateSchedule(schedule, index)
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Tiết học #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thứ trong tuần *</Label>
                    <SimpleSelect
                      value={schedule.dayOfWeek.toString()}
                      onValueChange={(value) => handleUpdateSchedule(index, "dayOfWeek", parseInt(value))}
                      options={DAYS_OF_WEEK}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tiết học *</Label>
                    <SimpleSelect
                      value={schedule.period.toString()}
                      onValueChange={(value) => handleUpdateSchedule(index, "period", parseInt(value))}
                      options={PERIODS}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Giờ bắt đầu *</Label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleUpdateSchedule(index, "startTime", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Giờ kết thúc *</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleUpdateSchedule(index, "endTime", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label>Môn học (Tùy chọn)</Label>
                    <Input
                      placeholder="Ví dụ: Toán, Văn, Anh..."
                      value={schedule.subject || ""}
                      onChange={(e) => handleUpdateSchedule(index, "subject", e.target.value)}
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

