// src/components/AdminPage/AdminSidebar.jsx

import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Users2, MessageSquare, ChevronLeft, Trophy } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/common/constants/routes"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "User Management",
    href: ROUTES.ADMIN.USER_MANAGEMENT,
    icon: Users,
  },
  {
    name: "Activities & Contests",
    href: "/admin/activities",
    icon: Trophy,
  },
  {
    name: "Clubs & Classes",
    href: "/admin/clubs",
    icon: Users2,
  },
  {
    name: "Posts & Comments",
    href: "/admin/posts",
    icon: MessageSquare,
  },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {/* Overlay cho mobile */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 shadow-sm",
          isOpen ? "w-64" : "w-16",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href} // react-router-dom dùng "to" thay cho "href"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Collapse button */}
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
  )
}
