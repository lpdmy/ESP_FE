import { Link } from "react-router-dom"
import { Bell, User, Menu, Calendar, Trophy, Star, LogOut, Settings } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Badge } from "@/common/components/ui/badge"
import { ROUTES } from "@/common/constants/routes"
import { ROLE } from "@/common/constants/roles"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, useDropdownMenu } from "@/common/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { GlobalSearch } from "@/common/components/search/GlobalSearch"

import { clearUser } from "@/store/user/userSlice";
import { useState } from "react"
import NotificationModal from "@/features/notifications/NotificationModal"
import { disconnectNotificationHub } from "@/features/notifications/services/signalr/notificationHub"
import { clearNotifications } from "@/store/notification/notificationSlice"
import { disconnectChatHub } from "@/common/signalr/chatHub"

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const roleValue = typeof user?.role === "string" ? user.role.toUpperCase() : user?.role;
  const isTeacher = roleValue === ROLE.TEACHER || roleValue === "TEACHER";
  const { isOpen, openMenu, closeMenu, toggleMenu } = useDropdownMenu(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationCount = useSelector(state => state.notifications.count);
  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    disconnectNotificationHub();
    disconnectChatHub();
    navigate(ROUTES.LOGIN);
  };

  const getProfileRoute = () => {
    if (isTeacher) {
      return ROUTES.USER_PROFILE.TEACHER_PROFILE;
    }
    return ROUTES.USER_PROFILE.PROFILE;
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="lg:hidden hover:bg-orange-50">
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <Link to={ROUTES.LANDING.HOME} className="flex items-center space-x-3 group">
              <img src="https://image2url.com/images/1764759513753-4a01ffc6-ebe9-4b17-8840-17c2162dba94.jpg" className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
              </img>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                EduSphere
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <GlobalSearch
              placeholder="Tìm kiếm bạn bè, bài viết, sự kiện, cuộc thi..."
              variant="default"
              onResultClick={(result, type) => {
                console.log('Search result clicked:', { result, type });
              }}
            />
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Sự kiện</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Cuộc thi</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Star className="h-4 w-4" />
                <span className="font-medium">Xếp hạng</span>
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost"
              className="relative p-3 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl"
              onClick={() => {
                setIsNotificationOpen(true);        // mở modal
                dispatch(clearNotifications());     // reset count + clear list
              }}>
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-all duration-200"
                  onClick={toggleMenu}
                  data-dropdown-trigger
                >
                  <Avatar className="h-9 w-9 ring-2 ring-orange-200 hover:ring-orange-300 transition-all">
                    <AvatarImage src={user?.avatarUrl || null} alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white font-semibold">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : user?.username ? user.username[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-800">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || "Guest"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role === ROLE.TEACHER ? "Giáo viên" : "Học sinh"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-xl rounded-xl"
                isOpen={isOpen}
                onClose={closeMenu}
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || "Guest"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || "Chưa cập nhật email"}
                  </div>
                </div>
                <DropdownMenuItem
                  className="rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <Link
                    to={getProfileRoute()}
                    className="inline-flex items-center w-full px-3 py-2"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-medium">Trang cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <Link
                    to={ROUTES.AUTH.CHANGEPASSWORD}
                    className="inline-flex items-center w-full px-3 py-2"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="font-medium">Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <div className="border-t border-gray-100 my-1"></div>
                <DropdownMenuItem
                  className="rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  )
}
