import React, { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Smile, Paperclip, MoreVertical, Phone, Video, Users, X } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu"
import { useNavigate, useParams } from "react-router-dom"
import { useChatApi } from "./hooks/useChatApi"
import { useChatStore } from "@/store/chat/useChatStore"
import { LoadingCard, LoadingOverlay } from "@/common/components/ui/loading"
import { useToast } from "@/common/hooks/useToast"
import { ensureChatConnected, joinChatRoom, leaveChatRoom, sendChatMessage } from "@/common/signalr/chatHub"
import { useSelector } from "react-redux"
import { getUserId } from "@/common/utils/userUtils"
import { ROUTES } from "@/common/constants/routes"

export default function ChatDetail() {
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [chatUser, setChatUser] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isGroup, setIsGroup] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const { isOpen: isMenuOpen, toggleMenu, closeMenu } = useDropdownMenu()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { messagesLoading, sendLoading, getRoomMessages, sendMessage, markAsRead } = useChatApi()
  const {
    messages,
    loading,
    setMessages,
    addChatMessage,
    setCurrentRoom,
    setLoading,
    setError,
  } = useChatStore()
  const { showError } = useToast()
  const user = useSelector(state => state.user.user)
  const userId = getUserId(user);
  const emojis = ["😀", "😂", "😍", "🥰", "😊", "😎", "🤔", "😅", "👍", "❤️", "🔥", "✨", "🎉", "📚", "✏️", "🎨"]

  // Load messages when component mounts or roomId changes
  useEffect(() => {
    if (roomId) {
      const fetchMessages = async () => {
        try {
          setLoading('messages', true)
          setCurrentRoom(roomId)

          const response = await getRoomMessages(roomId)
          if (response) {
            const room = response;

            // Map id -> name for sender display
            const nameDict = {};
            if (room.participantIds && room.participantNames) {
              room.participantIds.forEach((id, idx) => {
                nameDict[id] = room.participantNames[idx];
              });
            }

            // Lưu danh sách thành viên nhóm
            const participantsList = (room.participantIds || []).map((id, idx) => ({
              id,
              name: room.participantNames?.[idx] || "Unknown",
              avatar: room.participantAvatars?.[idx] || "/placeholder.svg",
            }));
            setParticipants(participantsList);

            // ✅ Lưu tin nhắn vào store
            setMessages(roomId, (room.messages || []).reverse());

            // ✅ Thiết lập thông tin phòng
            const currentUserId = getUserId(user)
            const group = room.roomType === "class" || room.roomType === "club";
            setIsGroup(group);

            if (group) {
              setChatUser({
                id: null,
                name: room.name || (room.roomType === "class" ? "Nhóm lớp" : "Nhóm CLB"),
                avatar: "/logo.svg",
                isOnline: false,
                nameDict,
              })
            } else {
              const otherIndex = room.participantIds.findIndex(id => id !== currentUserId)
              if (otherIndex !== -1) {
                setChatUser({
                  id: room.participantIds[otherIndex],
                  name: room.participantNames[otherIndex],
                  avatar: room.participantAvatars[otherIndex] || "/placeholder.svg",
                  isOnline: false,
                  nameDict,
                  avatarDict: participantsList.reduce((acc, p) => {
                    acc[p.id] = p.avatar;
                    return acc;
                  }, {}),
                })
              }
            }
          } else {
            showError('Không thể tải tin nhắn')
            setError('Failed to load messages')
          }
        } catch (err) {
          console.error('Error fetching messages:', err)
          showError('Có lỗi xảy ra khi tải tin nhắn')
          setError(err.message)
        } finally {
          setLoading('messages', false)
        }
      }

      fetchMessages();
      markAsRead(roomId);
    }
  }, [])

  useEffect(() => {
    if (messages[roomId]?.length) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages[roomId]]);

  useEffect(() => {
    if (!roomId || !userId) return; 

    let isMounted = true;

    const setupRoomConnection = async () => {
      try {
        const conn = await ensureChatConnected(userId, (msg) => {
          // callback khi nhận message realtime
          if (isMounted && msg.roomId === roomId) {
            addChatMessage(msg);
          }
        });

        if (conn && conn.state === "Connected") {
          await joinChatRoom(roomId);
        } else {
          console.warn("⚠️ Connection not ready, retrying...");
        }
      } catch (err) {
        console.error("❌ Error connecting/joining room:", err);
      }
    };

    setupRoomConnection();

    return () => {
      isMounted = false;
      if (roomId) {
        leaveChatRoom(roomId);
      }
    };
  }, [roomId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    const userId = getUserId(user);

    if (!newMessage.trim()) return;
    if (!roomId || !userId) {
      showError("Thiếu thông tin người dùng hoặc phòng chat");
      return;
    }

    try {
      setLoading("sending", true);
      setError(null);

      // Đảm bảo connection đã sẵn sàng (nếu mất kết nối tự reconnect)
      const conn = await ensureChatConnected(userId, (msg) => addChatMessage(msg));

      if (conn?.state !== "Connected") {
        showError("Không thể gửi tin nhắn (chưa kết nối máy chủ)");
        return;
      }

      // --- 1️⃣ Gửi realtime qua SignalR ---
      await sendChatMessage(roomId, userId, newMessage, "text");

      // --- 2️⃣ Gửi API để lưu DB (nếu backend không tự lưu SignalR) ---
      const messageData = {
        content: newMessage,
        type: "text",
      };

      const response = await sendMessage(roomId, messageData);

      // --- 3️⃣ Cập nhật UI ngay lập tức ---
      const newMsg = {
        id: response?.data?.id || Date.now().toString(),
        content: newMessage,
        type: "text",
        sender: "me",
        timestamp: new Date(),
        roomId,
        senderId: userId,
      };

      setNewMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
      showError("Có lỗi xảy ra khi gửi tin nhắn");
      setError(err.message || "Send failed");
    } finally {
      setLoading("sending", false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      const message = {
        id: Date.now().toString(),
        content: file.name,
        type: "image",
        sender: "me",
        timestamp: new Date(),
        imageUrl,
      }
      setMessages([...messages, message])
    }
  }

  const formatTime = (date) => {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
    <LoadingCard isLoading={messagesLoading}>

      <div className="min-h-[100%] bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-orange-100 p-4 flex items-center justify-between sticky top-0 z-10 relative">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hover:bg-orange-100" onClick={() => navigate(ROUTES.CHAT.INBOX)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10 ring-2 ring-orange-200">
                <AvatarImage src={chatUser?.avatar || "/placeholder.svg"} alt={chatUser?.name || "User"} />
                <AvatarFallback className="bg-gradient-orange text-white">{(chatUser?.name || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-800">{chatUser?.name || "Unknown User"}</h2>

              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={toggleMenu}
                  data-dropdown-trigger
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-orange-100"
                  >
                <MoreVertical className="w-5 h-5" />
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  isOpen={isMenuOpen}
                  onClose={closeMenu}
                >
                  {isGroup && (
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        setIsMembersOpen(true)
                        closeMenu()
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Xem thành viên nhóm
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(messages[roomId] || []).map((message, index) => {
              const prevMsg = (messages[roomId] || [])[index - 1];
              const nextMsg = (messages[roomId] || [])[index + 1];
              const isMine = message.senderId === userId;

              // --- kiểm tra cùng người gửi và gần nhau ---
              const sameSenderAsPrev = prevMsg && prevMsg.senderId === message.senderId;
              const sameSenderAsNext = nextMsg && nextMsg.senderId === message.senderId;

              const timeDiffPrev =
                prevMsg && Math.abs(new Date(message.timestamp) - new Date(prevMsg.timestamp)) / 60000; // phút
              const timeDiffNext =
                nextMsg && Math.abs(new Date(nextMsg.timestamp) - new Date(message.timestamp)) / 60000;

              const isCloseToPrev = timeDiffPrev < 5;
              const isCloseToNext = timeDiffNext < 5;

              // --- chỉ hiển thị time nếu là tin cuối của cụm ---
              const showTime = !sameSenderAsNext || !isCloseToNext;

              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMine ? "order-2" : "order-1"}`}>
                    {/* 🧍 Hiển thị avatar nếu là đầu cụm mới */}
                    {!sameSenderAsPrev || !isCloseToPrev ? (
                      <div className="flex items-center gap-2 mb-1">
                        {!isMine && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={
                                chatUser?.avatarDict?.[message.senderId] ||
                                chatUser?.avatar ||
                                "/placeholder.svg"
                              }
                              alt={chatUser?.nameDict?.[message.senderId] || "User"}
                            />
                            <AvatarFallback className="bg-gradient-orange text-white text-xs">
                              {(chatUser?.nameDict?.[message.senderId] || "U").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isMine && (
                          <span className="text-xs text-gray-500">
                            {chatUser?.nameDict?.[message.senderId] || "Unknown User"}
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* 💬 Nội dung tin nhắn */}
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${isMine ? "bg-gradient-orange text-white ml-auto" : "bg-white border border-orange-100"
                        }`}
                    >
                      {message.type === "image" ? (
                        <div className="space-y-2">
                          <img
                            src={message.imageUrl || "/placeholder.svg"}
                            alt="Shared"
                            className="rounded-lg max-w-full h-auto"
                          />
                          {message.content !== message.imageUrl && <p className="text-sm">{message.content}</p>}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* ⏰ Chỉ hiển thị thời gian cho tin cuối trong cụm */}
                    {showTime && (
                      <div
                        className={`text-xs text-gray-400 mt-1 ${isMine ? "text-right" : "text-left"
                          }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-white border border-orange-200 rounded-lg p-3 mx-4 mb-2 shadow-lg">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-xl hover:bg-orange-50 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-md border-t border-orange-100 p-4 sticky bottom-0 z-10">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="pr-20 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-full"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="hover:bg-orange-100 rounded-full w-8 h-8 p-0"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendLoading || loading.sending}
                className="btn-primary rounded-full w-10 h-10 p-0 hover-lift"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    </LoadingCard>

      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Thành viên nhóm</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => setIsMembersOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={p.avatar || "/placeholder.svg"} alt={p.name} />
                  <AvatarFallback className="bg-gradient-orange text-white text-xs">
                    {(p.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có thành viên nào trong nhóm.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
