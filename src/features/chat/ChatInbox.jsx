import React, { useState, useEffect } from "react"
import { Search, MessageCircle, Phone, Video, Plus } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Card } from "@/common/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useChatApi } from "./hooks/useChatApi"
import { useChatStore } from "@/store/chat/useChatStore"
import { LoadingCard, LoadingOverlay } from "@/common/components/ui/loading"
import { useToast } from "@/common/hooks/useToast"

export default function ChatInbox() {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { roomsLoading, getUserRooms, error } = useChatApi()
  const { rooms, setRooms, setLoading, setError } = useChatStore()
  const { showError } = useToast()
  const [activeTab, setActiveTab] = useState("personal") // 'personal' | 'group'

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading("rooms", true);
        const response = await getUserRooms();
        if (response) {
          const userId = Number(localStorage.getItem("userId")); // hoặc lấy từ context/store

          const mappedRooms = response.map((r) => {
            const index = r.participantIds.findIndex((id) => id !== userId);
            const isGroup = r.roomType === "class" || r.roomType === "club";

            const displayName = isGroup
              ? r.name || (r.roomType === "class" ? "Nhóm lớp" : "Nhóm CLB")
              : index !== -1
                ? r.participantNames[index]
                : r.participantNames?.[0] || "Unknown";

            const subtitle = isGroup
              ? r.roomType === "class"
                ? "Nhóm lớp"
                : "Nhóm CLB"
              : r.roomType || "Chat";

            return {
              id: r.id,
              name: displayName,
              avatar: isGroup
                ? "/logo.svg"
                : r.participantAvatars?.[index] || "/placeholder.svg",
              lastMessage: r.lastMessage || "Chưa có tin nhắn",
              timestamp: r.updatedAt
                ? new Date(r.updatedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "—",
              unreadCount: r.unreadCount || 0,
              roomType: r.roomType,
              subtitle,
            };
          });

          setRooms(mappedRooms);
        } else {
          showError("Không thể tải danh sách cuộc trò chuyện");
          setError("Failed to load rooms");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        showError("Có lỗi xảy ra khi tải danh sách cuộc trò chuyện");
        setError(err.message);
      } finally {
        setLoading("rooms", false);
      }
    };

    fetchRooms();
  }, []);


  const personalRooms = rooms.filter(
    (chat) => chat.roomType !== "class" && chat.roomType !== "club"
  )
  const groupRooms = rooms.filter(
    (chat) => chat.roomType === "class" || chat.roomType === "club"
  )

  const baseRooms = activeTab === "group" ? groupRooms : personalRooms

  const filteredChats = baseRooms.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 glass ">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Hộp thư</h1>
              <p className="text-gray-600">Trò chuyện với bạn bè, lớp học và CLB</p>
            </div>
          </div>

          {/* Tabs: Cá nhân / Nhóm */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                activeTab === "personal"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("group")}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                activeTab === "group"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Nhóm (Lớp & CLB)
            </button>
          </div>

          {/* Search */}
          {/* <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div> */}
          <LoadingCard className="bg-white" isLoading={roomsLoading}>
            {/* Chats List */}
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Không tìm thấy cuộc trò chuyện
                </h3>
                <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="group flex items-center p-4 rounded-lg hover:bg-orange-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-orange-200">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name || "User"} />
                      <AvatarFallback className="bg-gradient-orange text-white">
                        {(chat.name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 truncate">{chat.name || "Unknown User"}</h3>
                        <p className="text-sm text-gray-500">
                          {chat.subtitle || "Chat"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{chat.timestamp || chat.lastMessageTime || "Unknown"}</p>
                        {chat.unreadCount > 0 && (
                          <div className="mt-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage || "No messages yet"}</p>
                  </div>
                </div>
              ))
            )}
          </LoadingCard>
        </Card>
      </div>
    </div>
  )
}
