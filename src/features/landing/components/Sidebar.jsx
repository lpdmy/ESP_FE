import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { useSelector } from "react-redux"
import { SIDEBAR_NAVIGATION, SIDEBAR_DEFAULT_TAB } from "@/common/constants/sidebar"

export default function Sidebar({ activeTab = SIDEBAR_DEFAULT_TAB }) {
  const user = useSelector((state) => state.user.user);
  
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.username || "Người dùng";
  
  const userAvatar = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';
  
  const menuItems = SIDEBAR_NAVIGATION;

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-white/30">
            <AvatarImage src={user?.avatarUrl || null} alt="User Avatar" />
            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
              {userAvatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{userName}</h3>
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
          {menuItems.map((item, index) => {
            const isActive = item.label === activeTab;
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge className="bg-orange-500 text-white text-xs ml-auto">{item.count}</Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </Card>
    </div>
  )
}
