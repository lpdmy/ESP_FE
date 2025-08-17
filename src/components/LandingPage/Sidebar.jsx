"use client"

import { UserOutlined, HomeOutlined, CalendarOutlined, TrophyOutlined, CrownOutlined, SettingOutlined, LogoutOutlined, TeamOutlined, FileTextOutlined, BarChartOutlined } from "@ant-design/icons"
import { Button, Card, Avatar, Badge } from "antd"

export default function Sidebar({ activeTab, onTabChange }) {
  const navigationItems = [
    { id: "home", label: "Trang chủ", icon: HomeOutlined, count: null },
    { id: "friends", label: "Bạn bè", icon: TeamOutlined, count: 24 },
    { id: "events", label: "Sự kiện", icon: CalendarOutlined, count: 5 },
    { id: "contests", label: "Cuộc thi", icon: TrophyOutlined, count: 3 },
    { id: "works", label: "Tác phẩm của tôi", icon: FileTextOutlined, count: null },
    { id: "achievements", label: "Thành tích", icon: CrownOutlined, count: null },
    { id: "activity", label: "Hoạt động", icon: BarChartOutlined, count: null },
    { id: "settings", label: "Cài đặt", icon: SettingOutlined, count: null },
  ]

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <div>
            <h3 className="font-semibold">Nguyễn Văn A</h3>
            <p className="text-sm opacity-90">Lớp 12A1 - FPT School</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-bold text-lg">15</div>
            <div className="text-xs opacity-90">Sự kiện</div>
          </div>
          <div>
            <div className="font-bold text-lg">8</div>
            <div className="text-xs opacity-90">Giải thưởng</div>
          </div>
          <div>
            <div className="font-bold text-lg">342</div>
            <div className="text-xs opacity-90">Điểm</div>
          </div>
        </div>
      </Card>

      {/* Navigation Menu */}
      <Card className="p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Button
                key={item.id}
                type={activeTab === item.id ? "primary" : "text"}
                className={`w-full justify-start ${
                  activeTab === item.id
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
                icon={<IconComponent className="h-5 w-5 mr-3" />}
                onClick={() => onTabChange(item.id)}
              >
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge count={item.count} className="bg-orange-500 text-white text-xs" />
                )}
              </Button>
            )
          })}
        </nav>
      </Card>
    </div>
  )
}
