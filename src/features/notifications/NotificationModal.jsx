import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import NotificationItem from "./NotificationItem"
import { useNotificationApi } from "@/features/notifications/hooks/useNotificationApi"
import { useSelector } from "react-redux"

export default function NotificationModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { getByUser } = useNotificationApi()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const user = useSelector((state) => state.user.user)
  const { markAsRead } = useNotificationApi();
  // ⚙️ Load thông báo khi mở modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
        ; (async () => {
          const data = await getByUser()
          if (data) setNotifications(data)
          setLoading(false)
        })()
    }
  }, [isOpen])

  // // 🔔 Lắng nghe SignalR realtime
  // useEffect(() => {
  //   if (!user) return
  //   const connection = connectNotificationHub(user.id, (newNotification) => {
  //     setNotifications((prev) => {
  //       // tránh trùng id nếu SignalR gửi lại thông báo cũ
  //       const exists = prev.some((n) => n.id === newNotification.id)
  //       if (exists) return prev
  //       return [newNotification, ...prev]
  //     })
  //   })

  //   return () => connection?.stop()
  // }, [user])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  const handleViewAll = () => {
    navigate("/notifications")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 right-4 z-[70] w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Thông báo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang tải thông báo...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Không có thông báo nào</div>
              ) : (
                // Chỉ lấy 4 thông báo mới nhất
                notifications.slice(0, 4).map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    index={index}
                    markAsRead={markAsRead}
                    compact
                  />
                ))
              )}
            </div>


            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleViewAll}
                className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium"
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
