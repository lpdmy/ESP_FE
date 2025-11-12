import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"
import { Checkbox } from "@/common/components/ui/checkbox"
import { ArrowLeft, Sparkles, Calendar, Clock, MapPin, Wand2, Download, Share2 } from "lucide-react"
import { toast } from "react-toastify"
import { ROUTES } from "@/common/constants/routes"

export default function AISchedule() {
  const params = useParams()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)

  const [formData, setFormData] = useState({
    eventName: "Hội thao Liên trường 2024",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    sports: ["football", "volleyball", "athletics", "basketball"],
    teams: "11A3, 11A4, 12A1, 12A2, 12A3",
    venues: "Sân bóng A, Sân bóng chuyền, Đường chạy 1, Sân bóng rổ",
    constraints:
      "- Mỗi đội nghỉ ít nhất 2 giờ giữa các trận\n- Không thi đấu vào giờ nghỉ trưa (11h-13h)\n- Ưu tiên các trận chung kết vào buổi chiều",
  })

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockSchedule = {
      days: [
        {
          date: "2024-03-15",
          events: [
            { time: "08:00", sport: "Lễ khai mạc", venue: "Sân vận động chính", teams: "Tất cả" },
            { time: "09:00", sport: "Bóng đá", venue: "Sân bóng A", teams: "11A3 vs 11A4" },
            { time: "11:00", sport: "Bóng chuyền", venue: "Sân bóng chuyền", teams: "12A1 vs 12A2" },
            { time: "14:00", sport: "Điền kinh", venue: "Đường chạy 1", teams: "Chạy 100m - Vòng loại" },
            { time: "16:00", sport: "Bóng rổ", venue: "Sân bóng rổ", teams: "12A3 vs 11A3" },
          ],
        },
        {
          date: "2024-03-16",
          events: [
            { time: "08:00", sport: "Bóng đá", venue: "Sân bóng A", teams: "12A1 vs 12A3" },
            { time: "10:00", sport: "Điền kinh", venue: "Đường chạy 1", teams: "Chạy 400m" },
            { time: "14:00", sport: "Bóng chuyền", venue: "Sân bóng chuyền", teams: "Bán kết" },
            { time: "16:00", sport: "Bóng đá", venue: "Sân bóng A", teams: "Bán kết" },
          ],
        },
        {
          date: "2024-03-17",
          events: [
            { time: "08:00", sport: "Chung kết", venue: "Sân vận động chính", teams: "Các môn" },
            { time: "14:00", sport: "Lễ bế mạc", venue: "Sân vận động chính", teams: "Tất cả" },
          ],
        },
      ],
      stats: {
        totalEvents: 11,
        totalDays: 3,
        averageEventsPerDay: 3.7,
        conflictsResolved: 5,
      },
    }

    setGeneratedSchedule(mockSchedule)
    setIsGenerating(false)

    toast.success("AI đã tạo lịch thi đấu tối ưu cho bạn")
  }

  const handleApplySchedule = () => {
    toast.success("Lịch thi đấu đã được áp dụng")
    navigate(`/activities/${params.id}`)
  }

  const handleSportToggle = (sportId) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter((s) => s !== sportId)
        : [...prev.sports, sportId],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link to={ROUTES.ADMIN.ACTIVITIES}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Tạo lịch thi đấu</h1>
          </div>
          <p className="text-gray-600 mt-1">Sử dụng AI để tự động tạo lịch thi đấu tối ưu</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Thông tin sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventName">Tên sự kiện</Label>
                <Input
                  id="eventName"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Môn thể thao</Label>
                <div className="space-y-2">
                  {[
                    { id: "football", label: "Bóng đá" },
                    { id: "volleyball", label: "Bóng chuyền" },
                    { id: "athletics", label: "Điền kinh" },
                    { id: "basketball", label: "Bóng rổ" },
                  ].map((sport) => (
                    <div key={sport.id} className="flex items-center gap-2">
                      <Checkbox
                        id={sport.id}
                        checked={formData.sports.includes(sport.id)}
                        onCheckedChange={() => handleSportToggle(sport.id)}
                      />
                      <Label htmlFor={sport.id} className="cursor-pointer">
                        {sport.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="teams">Danh sách đội (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="teams"
                  value={formData.teams}
                  onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="venues">Địa điểm (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="venues"
                  value={formData.venues}
                  onChange={(e) => setFormData({ ...formData, venues: e.target.value })}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="constraints">Ràng buộc & Yêu cầu đặc biệt</Label>
                <Textarea
                  id="constraints"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  rows={4}
                  placeholder="Nhập các ràng buộc về thời gian, địa điểm, đội..."
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo lịch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo lịch với AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Schedule */}
        <div className="space-y-6">
          {!generatedSchedule ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Chưa có lịch thi đấu</h3>
                <p className="text-gray-600 text-sm">Điền thông tin bên trái và nhấn "Tạo lịch với AI" để bắt đầu</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">Tổng sự kiện</p>
                    <p className="text-2xl font-bold text-blue-600">{generatedSchedule.stats.totalEvents}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">Xung đột đã giải quyết</p>
                    <p className="text-2xl font-bold text-green-600">{generatedSchedule.stats.conflictsResolved}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lịch thi đấu đã tạo</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedSchedule.days.map((day, dayIdx) => (
                    <div key={dayIdx}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600 text-white">Ngày {dayIdx + 1}</Badge>
                        <span className="font-semibold">{day.date}</span>
                      </div>
                      <div className="space-y-2">
                        {day.events.map((event, eventIdx) => (
                          <div key={eventIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-blue-600 text-white rounded px-2 py-1 text-sm font-semibold min-w-[60px] text-center">
                              {event.time}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{event.sport}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.venue}
                                </span>
                                <span>{event.teams}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleApplySchedule}>
                  Áp dụng lịch này
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                  Tạo lại
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
