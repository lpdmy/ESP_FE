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
import { disconnectChatHub } from "@/common/signalr/chatHub";
import { setNotifications } from "@/store/notification/notificationSlice";
import { useNotificationApi } from "@/features/notifications/hooks/useNotificationApi";
import NotificationModal from "@/features/notifications/NotificationModal";

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const user = useSelector((state) => state.user.user);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationCount = useSelector(state => state.notifications.count);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getByUser } = useNotificationApi();

  // Fetch số thông báo chưa đọc khi load trang
  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        try {
          const notifications = await getByUser();
          if (notifications && Array.isArray(notifications)) {
            dispatch(setNotifications(notifications));
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [user?.id, dispatch, getByUser]);

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
            <h1 className="text-xl font-semibold text-gray-900">EduSphere Quản trị</h1>
          </div>
        </div>

        {/* Right side - Notifications and User Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative text-gray-600 hover:text-gray-900"
            onClick={async () => {
              setIsNotificationOpen(true);
              // Refresh notifications khi mở modal
              try {
                const notifications = await getByUser();
                if (notifications && Array.isArray(notifications)) {
                  dispatch(setNotifications(notifications));
                }
              } catch (error) {
                console.error("Error fetching notifications:", error);
              }
            }}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger onClick={toggleDropdown}>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100" data-dropdown-trigger="true">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || "/admin-avatar.png"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 
                     user?.lastName?.charAt(0)?.toUpperCase() || 
                     user?.fullName?.charAt(0)?.toUpperCase() || 
                     user?.username?.charAt(0)?.toUpperCase() || 
                     'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName || 
                   (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                   user?.username || 
                   "Guest"}
                </span>
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
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </header>
  )
}
