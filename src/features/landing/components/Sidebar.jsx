import { Home, Users, Calendar, Trophy, Crown, Settings, BookOpen, Camera } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/common/constants/routes";
export default function Sidebar() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: Home, label: "Trang chủ", active: true },
    { icon: Users, label: "Bạn bè", count: 24 },
    { icon: Calendar, label: "Sự kiện", count: 5,path: ROUTES.ACTIVITY.LIST_ACTIVITY },
    { icon: Camera, label: "Tác phẩm của tôi" },
    { icon: Crown, label: "Thành tích" },
    { icon: BookOpen, label: "Hoạt động" },
    { icon: Settings, label: "Cài đặt" },
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
          {menuItems.map((item, index) => (
            <Button
              onClick={() => navigate(item.path)}
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${item.active ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <Badge className="bg-orange-500 text-white text-xs ml-auto">{item.count}</Badge>
              )}
            </Button>
          ))}
        </nav>
      </Card>
    </div>
  )
}
