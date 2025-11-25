"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Upload, Download, X } from "lucide-react"
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

// Giờ cố định cho từng tiết (có thể tùy chỉnh)
const PERIOD_TIMES = [
  { period: 1, startTime: "07:00", endTime: "07:45" },
  { period: 2, startTime: "07:50", endTime: "08:35" },
  { period: 3, startTime: "08:40", endTime: "09:25" },
  { period: 4, startTime: "09:45", endTime: "10:30" },
  { period: 5, startTime: "10:35", endTime: "11:20" },
  { period: 6, startTime: "11:25", endTime: "12:10" },
  { period: 7, startTime: "13:00", endTime: "13:45" },
  { period: 8, startTime: "13:50", endTime: "14:35" },
  { period: 9, startTime: "14:40", endTime: "15:25" },
  { period: 10, startTime: "15:30", endTime: "16:15" },
  { period: 11, startTime: "16:20", endTime: "17:05" },
  { period: 12, startTime: "17:10", endTime: "17:55" },
]

const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1)

// Danh sách môn học phổ biến (có thể mở rộng)
const COMMON_SUBJECTS = [
  "Toán", "Văn", "Anh", "Lý", "Hóa", "Sinh", "Sử", "Địa", 
  "GDCD", "Thể dục", "Tin học", "Công nghệ", "Mỹ thuật", "Âm nhạc"
]

export default function EditableClassScheduleView({ schedules = [], onChange }) {
  const [editingCell, setEditingCell] = useState(null)
  const [subjectInput, setSubjectInput] = useState("")
  const [draggedSubject, setDraggedSubject] = useState(null)

  // Tạo bảng thời khóa biểu
  const timetable = Array.from({ length: 12 }, () => Array(7).fill(null))

  // Điền dữ liệu vào bảng
  schedules.forEach(schedule => {
    const periodIndex = schedule.period - 1
    const dayIndex = schedule.dayOfWeek - 1
    
    if (periodIndex >= 0 && periodIndex < 12 && dayIndex >= 0 && dayIndex < 7) {
      timetable[periodIndex][dayIndex] = {
        subject: schedule.subject || "",
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      }
    }
  })

  // Lấy giờ cho tiết
  const getPeriodTime = (period) => {
    const periodTime = PERIOD_TIMES.find(p => p.period === period)
    return periodTime || { startTime: "07:00", endTime: "07:45" }
  }

  // Xử lý click cell để edit
  const handleCellClick = (period, dayOfWeek) => {
    const cell = timetable[period - 1][dayOfWeek - 1]
    setEditingCell({ period, dayOfWeek })
    setSubjectInput(cell?.subject || "")
  }

  // Lưu môn học vào cell
  const handleSaveCell = () => {
    if (!editingCell) return

    const { period, dayOfWeek } = editingCell
    const periodTime = getPeriodTime(period)
    
    // Format time từ "HH:mm" thành "HH:mm:ss"
    const formatTime = (time) => {
      if (!time) return "07:00:00"
      if (time.split(':').length === 3) return time
      return time + ":00"
    }

    const newSchedule = {
      dayOfWeek,
      period,
      startTime: formatTime(periodTime.startTime),
      endTime: formatTime(periodTime.endTime),
      subject: subjectInput.trim() || null,
    }

    // Tìm schedule cũ (nếu có)
    const existingIndex = schedules.findIndex(
      s => s.dayOfWeek === dayOfWeek && s.period === period
    )

    let updatedSchedules
    if (subjectInput.trim()) {
      // Có môn học - thêm hoặc cập nhật
      if (existingIndex >= 0) {
        updatedSchedules = [...schedules]
        updatedSchedules[existingIndex] = newSchedule
      } else {
        updatedSchedules = [...schedules, newSchedule]
      }
    } else {
      // Xóa môn học
      if (existingIndex >= 0) {
        updatedSchedules = schedules.filter((_, i) => i !== existingIndex)
      } else {
        updatedSchedules = schedules
      }
    }

    onChange?.(updatedSchedules)
    setEditingCell(null)
    setSubjectInput("")
  }

  // Xóa môn học
  const handleDeleteCell = (period, dayOfWeek) => {
    const updatedSchedules = schedules.filter(
      s => !(s.dayOfWeek === dayOfWeek && s.period === period)
    )
    onChange?.(updatedSchedules)
  }

  // Drag & Drop handlers
  const handleDragStart = (subject) => {
    setDraggedSubject(subject)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (period, dayOfWeek) => {
    if (!draggedSubject) return

    const periodTime = getPeriodTime(period)
    const formatTime = (time) => {
      if (time.split(':').length === 3) return time
      return time + ":00"
    }

    const newSchedule = {
      dayOfWeek,
      period,
      startTime: formatTime(periodTime.startTime),
      endTime: formatTime(periodTime.endTime),
      subject: draggedSubject,
    }

    const existingIndex = schedules.findIndex(
      s => s.dayOfWeek === dayOfWeek && s.period === period
    )

    let updatedSchedules
    if (existingIndex >= 0) {
      updatedSchedules = [...schedules]
      updatedSchedules[existingIndex] = newSchedule
    } else {
      updatedSchedules = [...schedules, newSchedule]
    }

    onChange?.(updatedSchedules)
    setDraggedSubject(null)
  }

  // Import từ file
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        // Format: DayOfWeek,Period,Subject
        // Ví dụ: 1,1,Toán
        const importedSchedules = []
        
        lines.forEach((line, index) => {
          if (index === 0 && line.includes('DayOfWeek')) return // Skip header
          
          const parts = line.split(',').map(p => p.trim())
          if (parts.length >= 3) {
            const dayOfWeek = parseInt(parts[0])
            const period = parseInt(parts[1])
            const subject = parts[2]
            
            if (dayOfWeek >= 1 && dayOfWeek <= 7 && period >= 1 && period <= 12) {
              const periodTime = getPeriodTime(period)
              const formatTime = (time) => {
                if (time.split(':').length === 3) return time
                return time + ":00"
              }
              
              importedSchedules.push({
                dayOfWeek,
                period,
                startTime: formatTime(periodTime.startTime),
                endTime: formatTime(periodTime.endTime),
                subject,
              })
            }
          }
        })

        if (importedSchedules.length > 0) {
          onChange?.(importedSchedules)
          toast.success(`Đã import ${importedSchedules.length} tiết học!`)
        } else {
          toast.error("Không tìm thấy dữ liệu hợp lệ trong file")
        }
      } catch (error) {
        console.error("Error importing schedule:", error)
        toast.error("Lỗi khi import file. Vui lòng kiểm tra định dạng.")
      }
    }

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file)
    } else {
      toast.error("Chỉ hỗ trợ file CSV hoặc TXT")
    }

    // Reset input
    e.target.value = ''
  }

  // Export ra file
  const handleExport = () => {
    if (schedules.length === 0) {
      toast.error("Không có dữ liệu để export")
      return
    }

    // Header
    let csv = "DayOfWeek,Period,Subject,StartTime,EndTime\n"
    
    // Data
    schedules.forEach(schedule => {
      const formatTime = (time) => {
        if (!time) return ""
        if (typeof time === 'string') {
          return time.substring(0, 5) // HH:mm
        }
        return ""
      }
      
      csv += `${schedule.dayOfWeek},${schedule.period},"${schedule.subject || ''}",${formatTime(schedule.startTime)},${formatTime(schedule.endTime)}\n`
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'thoi-khoa-bieu.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Đã export thời khóa biểu!")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Thời khóa biểu</CardTitle>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Danh sách môn học để kéo thả */}
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium w-full">Kéo thả môn học vào ô:</Label>
          {COMMON_SUBJECTS.map(subject => (
            <Badge
              key={subject}
              variant="outline"
              className="cursor-move hover:bg-blue-50"
              draggable
              onDragStart={() => handleDragStart(subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>

        {/* Bảng thời khóa biểu */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left min-w-[100px]">
                  Tiết
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th
                    key={day.value}
                    className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-center min-w-[140px]"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => {
                const periodTime = getPeriodTime(period)
                return (
                  <tr key={period}>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-medium text-center">
                      <div className="font-semibold">{period}</div>
                      <div className="text-xs text-gray-500">
                        {periodTime.startTime} - {periodTime.endTime}
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const cell = timetable[period - 1][day.value - 1]
                      const isEditing = editingCell?.period === period && editingCell?.dayOfWeek === day.value
                      
                      return (
                        <td
                          key={day.value}
                          className="border border-gray-300 px-2 py-2 text-center align-top min-h-[60px] relative"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(period, day.value)}
                          onClick={() => handleCellClick(period, day.value)}
                          style={{ cursor: 'pointer' }}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                type="text"
                                value={subjectInput}
                                onChange={(e) => setSubjectInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveCell()
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setSubjectInput("")
                                  }
                                }}
                                placeholder="Nhập môn học"
                                className="text-xs h-8"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSaveCell()
                                  }}
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingCell(null)
                                    setSubjectInput("")
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          ) : cell ? (
                            <div className="space-y-1 group">
                              <Badge
                                variant="outline"
                                className="w-full justify-center text-xs font-normal cursor-pointer hover:bg-blue-50"
                              >
                                {cell.subject || "Chưa có môn"}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {typeof cell.startTime === 'string' 
                                  ? cell.startTime.substring(0, 5) 
                                  : ""} - {typeof cell.endTime === 'string' 
                                  ? cell.endTime.substring(0, 5) 
                                  : ""}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 absolute top-1 right-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCell(period, day.value)
                                }}
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">Click để thêm</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>💡 Hướng dẫn:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click vào ô để nhập môn học</li>
            <li>Kéo thả môn học từ danh sách trên vào ô</li>
            <li>Nhấn Enter để lưu, Esc để hủy</li>
            <li>Hover vào ô có môn học để xóa</li>
            <li>Import/Export file CSV để quản lý nhanh</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

