"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Clock } from "lucide-react"

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
]

export default function SimpleClassScheduleView({ schedules = [] }) {
  // Convert TimeSpan từ backend thành string hiển thị
  const formatTime = (timeSpan) => {
    if (!timeSpan) return ""
    if (typeof timeSpan === 'string') {
      return timeSpan.substring(0, 5) // HH:mm
    }
    return ""
  }

  // Group schedules by time range
  const scheduleGroups = []
  const processedSchedules = [...schedules]

  while (processedSchedules.length > 0) {
    const first = processedSchedules[0]
    const sameTimeSchedules = processedSchedules.filter(
      s => s.startTime === first.startTime && s.endTime === first.endTime
    )
    
    const isOff = first.startTime === "00:00:00" && first.endTime === "00:00:00"
    
    scheduleGroups.push({
      startTime: first.startTime,
      endTime: first.endTime,
      days: sameTimeSchedules.map(s => s.dayOfWeek),
      isOff,
    })

    // Remove processed
    sameTimeSchedules.forEach(s => {
      const index = processedSchedules.indexOf(s)
      if (index > -1) processedSchedules.splice(index, 1)
    })
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Card className="!bg-white !border-gray-200 !shadow-sm !rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Lịch học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Chưa có lịch học được thiết lập.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Lịch học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scheduleGroups.map((group, index) => {
          const dayLabels = group.days
            .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
            .filter(Boolean)
            .join(", ")

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                {group.isOff ? (
                  <div className="space-y-1">
                    <div className="font-medium text-red-600">Nghỉ học</div>
                    <div className="text-sm text-gray-600">{dayLabels}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatTime(group.startTime)} - {formatTime(group.endTime)}
                    </div>
                    <div className="text-sm text-gray-600">{dayLabels}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

