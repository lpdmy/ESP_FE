import { Menu, Bell, Settings, LogOut, User } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clearUser } from "@/store/user/userSlice";
import { ROUTES } from "@/common/constants/routes";
import { disconnectNotificationHub } from "@/features/notifications/services/signalr/notificationHub";

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const user = useSelector((state) => state.user.user);
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    dispatch(clearUser());

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    disconnectNotificationHub();
    disconnectChatHub();
    navigate(ROUTES.LOGIN);
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">EduSphere Quản trị</h1>
          </div>
        </div>

        {/* Right side - Notifications and User Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger onClick={toggleDropdown}>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100" data-dropdown-trigger="true">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-avatar.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">{user.firstName.charAt(0)||'A'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user ? user.fullName : "Guest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 mt-2"
              isOpen={isDropdownOpen}
              onClose={() => setDropdownOpen(false)}
              sideOffset={8}
            >
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
