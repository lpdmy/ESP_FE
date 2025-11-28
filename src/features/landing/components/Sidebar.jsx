import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { useSelector } from "react-redux";
import {
  SIDEBAR_NAVIGATION,
  SIDEBAR_DEFAULT_TAB,
} from "@/common/constants/sidebar";
import { useClubApi } from "../club/hooks/useClubApi";
import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [joinedClubs, setJoinedClubs] = useState([]);
  const { getClubByUser } = useClubApi();
  const location = useLocation();

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || "Người dùng";
  const userAvatar =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.username
      ? user.username[0].toUpperCase()
      : "U";
  const menuItems = SIDEBAR_NAVIGATION.filter(item => {
  if (item.label === "Giám Khảo") {
    return user?.role === 2;
  }
  return true;
});
  const handleNavigation = (item) => {
    // Special handling for "Lớp học của tôi" - redirect to user's specific class
    if (item.key === "my-class" && user?.classGroupId) {
      navigate(`/my-classes/${user.classGroupId}`)
      return
    }
    
    // Handle navigation with paths array
    const paths = Array.isArray(item.paths) ? item.paths : [item.href];
    if (paths[0]) {
      navigate(paths[0])
    }
  }

  
  const handleClubByUser = useCallback(async () => {
    try {
      const respsone = await getClubByUser();
      const data = respsone.data.data;
      setJoinedClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  }, [getClubByUser]);
  
  const handleChangeRole = (vaitro) => {
    const mapping = {
      President: "Chủ nhiệm",
      Member: "Thành viên",
      Mentor: "Cố vấn",
    };
    return mapping[vaitro] || "Không rõ vai trò";
  };
  
  useEffect(() => {
    handleClubByUser();
  }, [handleClubByUser]);
  return (
    <div className="space-y-4">
      {/* Hồ sơ người dùng */}
      {/* <Card className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
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
      </Card> */}

      {/* Navigation Menu */}
      <Card className="p-2">
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            // Get paths array for navigation
            const paths = Array.isArray(item.paths) ? item.paths : [item.href];
            
            // Check if current path matches the item's paths
            // Special handling for "Lớp học của tôi" to match both /my-classes and /my-classes/:id
            const isMyClassActive = item.key === "my-class" && location.pathname.startsWith("/my-classes");
            const isActive = isMyClassActive 
              ? true
              : paths.some((p) =>
                  p === "/"
                    ? location.pathname === "/" // chỉ đúng trang chủ
                    : location.pathname.startsWith(p)
                );

            return (
              <Button
                key={index}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                onClick={() => handleNavigation(item)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge className="bg-orange-500 text-white text-xs ml-auto">
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">CLB đã tham gia</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-700 p-0 h-auto"
            onClick={() => navigate("/club/list-club")}
          >
            Xem tất cả
          </Button>
        </div>
        {joinedClubs.length > 0 ? (
          <div className="space-y-2">
            {joinedClubs.map((club) => (
              <div
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                key={club.id}
                onClick={() => navigate(`/club/${club.clubId}`)}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800">
                    {club.clubName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {club.categoryName} • {handleChangeRole(club.role)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {club.clubName.charAt(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-3">
              Bạn chưa tham gia câu lạc bộ nào
            </p>
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              onClick={() => navigate("/club/list-club")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tham gia câu lạc bộ
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
