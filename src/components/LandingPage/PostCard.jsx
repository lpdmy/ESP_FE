import { Heart, MessageCircle, Share2, MoreHorizontal, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PostCard({
  author,
  class: className,
  time,
  content,
  image,
  likes,
  comments,
  shares,
  isVerified = false,
  contestEntry = false,
}) {
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
            <p className="text-sm text-gray-500">
              {className} • {time}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-3 leading-relaxed">{content}</p>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
          <img src={image || "/placeholder.svg"} alt="Post content" className="w-full h-auto object-cover" />
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
