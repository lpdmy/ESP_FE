import { Bell, Search, User, Menu, Calendar, Trophy, Star, LogOut, Settings } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Badge } from "@/common/components/ui/badge"
import { Input } from "@/common/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { clearUser } from "@/store/user/userSlice";
import { ROUTES } from "@/common/constants/routes";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate(ROUTES.LOGIN);
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">EduSphere</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bạn bè, sự kiện, cuộc thi..."
              className="pl-10 h-10 text-base"
            />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50">
            <Calendar className="h-4 w-4" />
            <span>Sự kiện</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50">
            <Trophy className="h-4 w-4" />
            <span>Cuộc thi</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50">
            <Star className="h-4 w-4" />
            <span>Xếp hạng</span>
          </Button>

          <Badge className="bg-red-500 text-white">
            <Button variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Button>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="../../../../public/icon/avatar-default-svgrepo-com.svg" />
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.username || "Guest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Trang cá nhân
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
