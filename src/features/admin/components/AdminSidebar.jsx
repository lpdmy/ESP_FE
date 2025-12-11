// src/components/AdminPage/AdminSidebar.jsx

import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Users2, MessageSquare, ChevronLeft, Trophy, GraduationCap,
  Star,
  UserCog,
  Bell,
  Shield } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/common/constants/routes"
import { useSelector } from "react-redux";
import { useEffect } from "react"
const navigation = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: [0],
  },
  {
    name: "Quản lý người dùng",
    href: ROUTES.ADMIN.USER_MANAGEMENT,
    icon: Users,
    requiredPermissions: ["MANAGE_USER"],
  },
  {
    name: "Hoạt động & Cuộc thi",
    href: "/admin/activities",
    icon: Trophy,
    requiredPermissions: ["MANAGE_EVENTS"],
  },
  {
    name: "Câu lạc bộ",
    href: "/admin/clubs",
    icon: Users2,
    requiredPermissions: ["MANAGE_CLUBS"],
  },
  {
    name: "Lớp học",
    href: "/admin/classes",
    icon: GraduationCap,
    requiredPermissions: ["MANAGE_CLASSES"],
  },
  {
    name: "Bài viết & Bình luận",
    href: "/admin/posts",
    icon: MessageSquare,
    requiredPermissions: ["MANAGE_POSTS"],
  },
  {
    name: "Điểm thưởng và Phần thưởng",
    href: "/admin/rewards",
    icon: Star,
    requiredPermissions: ["MANAGE_REWARDS"],
  },
  {
    name: "Quản lý nhân sự",
    href: "/admin/staff",
    icon: UserCog,
    requiredPermissions: ["MANAGE_STAFF"],
  },
  {
    name: "Thông báo",
    href: "/admin/system-news-and-notices",
    icon: Bell,
    requiredPermissions: ["MANAGE_ANNOUNCEMENTS"],
  },
  {
    name: "Trung tâm kiểm duyệt",
    href: "/admin/moderation",
    icon: Shield,
    requiredPermissions: ["MODERATE_CONTENT"],
  },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const pathname = location.pathname;
  const user = useSelector((state) => state.user.user);
  const {permissions} = user  
  const visibleNavigation = navigation.filter((item) => {
    if (item.allowedRoles && item.allowedRoles.length > 0) {
    return item.allowedRoles.includes(user?.role);
  }
    if (user?.role === 0) return true;
    if (user?.role === 1) {
      if (!item.requiredPermissions?.length) return true;
      return item.requiredPermissions.some((perm) =>
        permissions?.includes(perm)
      );
    }
    return false;
  });
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 shadow-sm",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-3 py-6 space-y-2">
            {visibleNavigation.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full justify-start text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              {isOpen && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
