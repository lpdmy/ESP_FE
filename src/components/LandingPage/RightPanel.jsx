import { Calendar, Trophy, Award, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import EventRegistrationModal from "./EventRegistrationModal"

export default function RightPanel() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  const upcomingEvents = [
    {
      title: "Workshop AI & Machine Learning",
      description:
        "Khám phá thế giới trí tuệ nhân tạo và machine learning với các chuyên gia hàng đầu. Học sinh sẽ được thực hành với các công cụ AI hiện đại.",
      date: "15/12/2024",
      time: "14:00 - 17:00",
      location: "Phòng Lab AI - Tầng 3",
      maxParticipants: 30,
      currentParticipants: 18,
      category: "Công nghệ",
      color: "orange",
    },
    {
      title: "Cuộc thi Thiết kế Logo",
      description:
        "Cuộc thi sáng tạo logo cho các câu lạc bộ trong trường. Cơ hội thể hiện tài năng thiết kế và nhận giải thưởng hấp dẫn.",
      date: "18/12/2024",
      time: "09:00 - 12:00",
      location: "Phòng Mỹ thuật - Tầng 2",
      maxParticipants: 50,
      currentParticipants: 32,
      category: "Nghệ thuật",
      color: "yellow",
    },
    {
      title: "Hội thảo Blockchain",
      description:
        "Tìm hiểu về công nghệ blockchain và ứng dụng trong giáo dục. Được hướng dẫn bởi các kỹ sư từ các công ty công nghệ hàng đầu.",
      date: "20/12/2024",
      time: "15:30 - 18:00",
      location: "Hội trường lớn - Tầng 1",
      maxParticipants: 100,
      currentParticipants: 67,
      category: "Công nghệ",
      color: "green",
    },
  ]

  const handleEventRegistration = (event) => {
    setSelectedEvent(event)
    setShowRegistrationModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Upcoming Events */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Sự kiện sắp tới</h3>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 bg-${event.color}-500 rounded-full mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {event.date} - {event.time}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{event.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {event.currentParticipants}/{event.maxParticipants} người tham gia
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2 border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                      onClick={() => handleEventRegistration(event)}
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
        >
          Xem tất cả
        </Button>
      </Card>

      {/* Leaderboard */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Bảng xếp hạng</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: "Nguyễn Thị E", class: "12A1", points: 450, rank: 1 },
            { name: "Trần Văn F", class: "11A2", points: 420, rank: 2 },
            { name: "Lê Thị G", class: "12A3", points: 380, rank: 3 },
            { name: "Phạm Văn H", class: "11A1", points: 350, rank: 4 },
          ].map((student, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  student.rank === 1
                    ? "bg-yellow-500 text-white"
                    : student.rank === 2
                      ? "bg-gray-400 text-white"
                      : student.rank === 3
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-600"
                }`}
              >
                {student.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.class}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {student.points}
              </Badge>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Xem bảng xếp hạng
        </Button>
      </Card>

      {/* Active Contests */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Cuộc thi đang diễn ra</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900">Cuộc thi Nhiếp ảnh</h4>
            <p className="text-xs text-gray-600 mt-1">Còn 5 ngày để nộp bài</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">24 tham gia</span>
              </div>
              <Badge className="bg-purple-500 text-white text-xs">Đang diễn ra</Badge>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900">Hackathon 2024</h4>
            <p className="text-xs text-gray-600 mt-1">Còn 12 ngày để đăng ký</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">8 đội tham gia</span>
              </div>
              <Badge className="bg-blue-500 text-white text-xs">Sắp diễn ra</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Event Registration Modal */}
      {selectedEvent && (
        <EventRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
        />
      )}
    </div>
  )
}
