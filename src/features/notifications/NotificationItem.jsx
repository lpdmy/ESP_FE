import { motion } from "framer-motion"
import { MessageCircle, Heart, UserPlus, Trophy, Calendar, Check, X, Server, Bell, Star } from "lucide-react"
import { Avatar, AvatarImage } from "@/common/components/ui/avatar"
import { Button } from "@/common/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function NotificationItem({ notification, index = 0, compact = false, markAsRead }) {
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [actionDone, setActionDone] = useState(false)
    const [actionText, setActionText] = useState("")

    const getIcon = (type) => {
        switch (type) {
            case "message":
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case "like":
                return <Heart className="h-4 w-4 text-pink-500" />;
            case "friend":
                return <UserPlus className="h-4 w-4 text-green-500" />;
            case "achievement":
                return <Trophy className="h-4 w-4 text-yellow-500" />;
            case "event":
                return <Calendar className="h-4 w-4 text-purple-500" />;
            case "system":
                return <Server className="h-4 w-4 text-gray-500" />;
            case "starpoint":
                return <Star className="h-4 w-4 text-yellow-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-400" />;
        }
    };

    const handleNotificationClick = async () => {
        if (notification.link) {
            navigate(notification.link);
        }

        if (!notification.read) {
            try {
                setIsProcessing(true);
                await markAsRead(notification.id); // Gọi API
                setIsProcessing(false);
                notification.read = true; // update trực tiếp để UI refresh
            } catch (err) {
                console.error("Mark as read failed:", err);
                setIsProcessing(false);
            }
        }
    };


    // thêm hàm tiện ích
    const formatTimeAgo = (timestamp) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diff = Math.floor((now - time) / 1000) // giây
        if (diff < 60) return `${diff}s trước`
        const mins = Math.floor(diff / 60)
        if (mins < 60) return `${mins} phút trước`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours} giờ trước`
        const days = Math.floor(hours / 24)
        return `${days} ngày trước`
    }

    const handleAction = async (action) => {
        setIsProcessing(true)
        await action.onClick() // vẫn giữ logic async gốc nếu có
        setIsProcessing(false)

        // Sau khi xử lý xong → đổi giao diện
        if (action.type === "confirm") {
            setActionText("Đã xác nhận")
        } else if (action.type === "reject") {
            setActionText("Đã từ chối")
        } else {
            setActionText("Đã xử lý")
        }
        setActionDone(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
                handleNotificationClick();
            }}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
        ${notification.link ? "cursor-pointer" : "cursor-default"}
        ${!notification.read ? "bg-orange-50/30" : ""}
        ${actionDone ? "opacity-60" : ""}`}
        >
            <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                    {notification?.avatar ? (
                    <Avatar className="h-12 w-12 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold flex items-center justify-center">
                            <AvatarImage src={notification.avatar} alt="Avatar" />
                        </Avatar>
                    ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                                src="https://image2url.com/images/1764759513753-4a01ffc6-ebe9-4b17-8840-17c2162dba94.jpg" 
                                alt="EduSphere Logo" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <div className="text-orange-600">{getIcon(notification.type)}</div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p
                        className={`text-sm text-gray-800 ${!notification.read ? "font-semibold" : "font-medium"
                            }`}
                    >
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>

                    {actionDone ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm mt-3 text-gray-500 italic"
                        >
                            {actionText}
                        </motion.p>
                    ) : (
                        notification.actions &&
                        notification.actions.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                {notification.actions.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={action.variant || "default"}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAction(action)
                                        }}
                                        disabled={isProcessing}
                                        className={
                                            action.type === "confirm"
                                                ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                                                : action.type === "reject"
                                                    ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                                                    : ""
                                        }
                                    >
                                        {action.type === "confirm" && <Check className="h-3 w-3 mr-1" />}
                                        {action.type === "reject" && <X className="h-3 w-3 mr-1" />}
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        )
                    )}

                </div>

                {!notification.read && (
                    <div className="h-2 w-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                )}
            </div>
        </motion.div>
    )
}
