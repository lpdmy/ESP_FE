"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
]

const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function ClassScheduleView({ schedules = [] }) {
  // Convert TimeSpan từ backend thành string hiển thị
  const formatTime = (timeSpan) => {
    if (!timeSpan) return "";
    if (typeof timeSpan === 'string') {
      // Nếu là "HH:mm:ss", lấy "HH:mm"
      return timeSpan.substring(0, 5);
    }
    return "";
  };

  // Tạo bảng thời khóa biểu
  // Rows: Tiết (1-12)
  // Cols: Thứ (2-7, CN)
  const timetable = Array.from({ length: 12 }, () => Array(7).fill(null));

  // Điền dữ liệu vào bảng
  schedules.forEach(schedule => {
    const periodIndex = schedule.period - 1; // Period 1-12 -> index 0-11
    const dayIndex = schedule.dayOfWeek - 1; // DayOfWeek 1-7 -> index 0-6
    
    if (periodIndex >= 0 && periodIndex < 12 && dayIndex >= 0 && dayIndex < 7) {
      timetable[periodIndex][dayIndex] = {
        subject: schedule.subject || "",
        startTime: formatTime(schedule.startTime),
        endTime: formatTime(schedule.endTime),
      };
    }
  });

  // Luôn hiển thị component, kể cả khi không có schedules
  // if (!schedules || schedules.length === 0) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="text-lg">Thời khóa biểu</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <p className="text-sm text-gray-500 text-center py-8">
  //           Chưa có lịch học được thiết lập.
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thời khóa biểu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left min-w-[80px]">
                  Tiết
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th
                    key={day.value}
                    className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-center min-w-[120px]"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, periodIndex) => (
                <tr key={period}>
                  <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-medium text-center">
                    {period}
                  </td>
                  {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const cell = timetable[periodIndex][dayIndex];
                    return (
                      <td
                        key={day.value}
                        className="border border-gray-300 px-2 py-2 text-center align-top"
                      >
                        {cell ? (
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className="w-full justify-center text-xs font-normal"
                            >
                              {cell.subject || "Chưa có môn"}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {cell.startTime} - {cell.endTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

