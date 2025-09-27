import { Heart, MessageCircle, Share2, MoreHorizontal, Shield, ChevronLeft, ChevronRight, Lock, Users, Globe, Image as ImageIcon, Edit, Trash2 } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu"
import { useState } from "react"

export default function PostCard({
  author,
  class: className,
  time,
  content,
  image, // Có thể là string hoặc array
  images, // Array of images
  gif, // Single GIF
  video, // Single video
  videos, // Array of videos
  hashtags = [], // Array of hashtags
  album, // Album name
  privacy = 'public', // 'public', 'friends', 'private'
  likes,
  comments,
  shares,
  isVerified = false,
  contestEntry = false,
  createdBy, // ID của người tạo bài đăng
  currentUserId, // ID của người dùng hiện tại
  onEdit, // Function to handle edit
  onDelete, // Function to handle delete
}) {
  // Xử lý images - ưu tiên images array, fallback về image string
  const imageList = images || (image ? [image] : [])
  // Xử lý gifs - chỉ lấy 1 gif
  const gifItem = gif || null
  // Xử lý videos - ưu tiên videos array, fallback về video string
  const videoList = videos || (video ? [video] : [])
  // Kết hợp tất cả media (images + gif + videos)
  const mediaList = [...imageList, ...(gifItem ? [gifItem] : []), ...videoList]
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Hàm chuyển media (ảnh/gif)
  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)
  }

  // Kiểm tra xem media hiện tại có phải là GIF không
  const isCurrentMediaGif = (index) => {
    const currentMedia = mediaList[index]
    if (!currentMedia) return false
    return currentMedia.toLowerCase().includes('.gif') || 
           currentMedia.includes('giphy') || 
           currentMedia.includes('tenor')
  }

  // Kiểm tra xem media hiện tại có phải là Video không
  const isCurrentMediaVideo = (index) => {
    const currentMedia = mediaList[index]
    if (!currentMedia) return false
    return currentMedia.toLowerCase().includes('.mp4') || 
           currentMedia.toLowerCase().includes('.webm') || 
           currentMedia.toLowerCase().includes('.mov') ||
           currentMedia.includes('youtube') ||
           currentMedia.includes('vimeo')
  }

  // Hàm render privacy icon
  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'private':
        return <Lock className="h-3 w-3" />
      case 'friends':
        return <Users className="h-3 w-3" />
      case 'public':
      default:
        return <Globe className="h-3 w-3" />
    }
  }

  // Hàm render privacy text
  const getPrivacyText = () => {
    switch (privacy) {
      case 'private':
        return 'Chỉ mình tôi'
      case 'friends':
        return 'Bạn bè'
      case 'public':
      default:
        return 'Công khai'
    }
  }

  const isOwner = createdBy && currentUserId && createdBy === currentUserId
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <Card className="p-4 hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{author ? author.charAt(0) : "?"}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{author || "Ẩn danh"}</h4>
              {isVerified && (
                <Badge className="bg-blue-500 text-white text-xs" icon={<Shield className="h-3 w-3" />}>
                  Blockchain
                </Badge>
              )}
              {contestEntry && (
                <Badge className="bg-purple-500 text-white text-xs">Cuộc thi</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{className}</span>
              <span>•</span>
              <span>{time}</span>
              {album && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span className="text-blue-600 font-medium">{album}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {getPrivacyIcon()}
                <span>{getPrivacyText()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                data-dropdown-trigger
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48"
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
            >
              {isOwner && (
                <>
                  <DropdownMenuItem 
                    onClick={() => {
                      onEdit();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa bài đăng</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      onDelete();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa bài đăng</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Chia sẻ</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Báo cáo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-800 leading-relaxed">{content}</p>
        
        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media (Images, GIFs & Videos) */}
      {mediaList.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 relative group">
          {isCurrentMediaVideo(currentMediaIndex) ? (
            <video 
              src={mediaList[currentMediaIndex]} 
              controls
              className="w-full h-auto object-cover"
              style={{ maxHeight: '400px' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : isCurrentMediaGif(currentMediaIndex) ? (
            <img 
              src={mediaList[currentMediaIndex] || "/placeholder.svg"} 
              alt="Post GIF" 
              className="w-full h-auto object-cover"
              style={{ maxHeight: '400px' }}
            />
          ) : (
            <img 
              src={mediaList[currentMediaIndex] || "/placeholder.svg"} 
              alt="Post content" 
              className="w-full h-auto object-cover" 
            />
          )}
          
          {/* Media Type Badges */}
          {isCurrentMediaGif(currentMediaIndex) && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>GIF</span>
            </div>
          )}
          
          {isCurrentMediaVideo(currentMediaIndex) && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>VIDEO</span>
            </div>
          )}
          
          {/* Navigation buttons - chỉ hiện khi có nhiều hơn 1 media */}
          {mediaList.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevMedia}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextMedia}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Media indicators */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {mediaList.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentMediaIndex(index)}
                />
              ))}
            </div>
          )}
          
          {/* Media counter */}
          {mediaList.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentMediaIndex + 1}/{mediaList.length}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Heart className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{shares}</span>
          </Button>
        </div>
        {contestEntry && (
          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            Bình chọn
          </Button>
        )}
      </div>
    </Card>
  )
}
