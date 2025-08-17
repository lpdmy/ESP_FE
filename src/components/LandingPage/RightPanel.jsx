"use client"

import { CalendarOutlined, TrophyOutlined, CrownOutlined, RiseOutlined, TeamOutlined } from "@ant-design/icons"
import { Button, Card, Badge, Progress } from "antd"

export default function RightPanel() {
  const upcomingEvents = [
    {
      title: "Workshop AI & Machine Learning",
      date: "15/12/2024 - 14:00 - 17:00",
      location: "Phòng Lab AI - Tầng 3",
      participants: 18,
      maxParticipants: 30,
      buttonText: "Đăng ký"
    },
    {
      title: "Cuộc thi Thiết kế Logo",
      date: "18/12/2024 - 09:00 - 12:00",
      location: "Phòng Mỹ thuật - Tầng 2",
      participants: 32,
      maxParticipants: 50,
      buttonText: "Đăng ký"
    },
    {
      title: "Hội thảo Blockchain",
      date: "20/12/2024 - 15:30 - 18:00",
      location: "Hội trường lớn - Tầng 1",
      participants: 67,
      maxParticipants: 100,
      buttonText: "Đăng ký"
    }
  ]

  const leaderboard = [
    { name: "Nguyễn Thị E", class: "12A1", score: 450 },
    { name: "Trần Văn F", class: "11A2", score: 420 },
    { name: "Lê Thị G", class: "12A3", score: 380 },
    { name: "Phạm Văn H", class: "11A1", score: 350 }
  ]

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <Card title="Sự kiện sắp tới" className="shadow-sm">
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <div className="flex items-center space-x-2">
                  <CalendarOutlined className="text-orange-500" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TeamOutlined className="text-orange-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RiseOutlined className="text-orange-500" />
                  <span>{event.participants}/{event.maxParticipants} người tham gia</span>
                </div>
              </div>
              <Button 
                type="primary" 
                size="small"
                className="bg-orange-500 border-0 hover:bg-orange-600"
              >
                {event.buttonText}
              </Button>
            </div>
          ))}
          <Button 
            type="text" 
            className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            Xem tất cả
          </Button>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card title="Bảng xếp hạng" className="shadow-sm">
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.class}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-600">{user.score}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
