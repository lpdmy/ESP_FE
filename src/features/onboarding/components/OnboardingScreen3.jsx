import { Share2, MessageCircle, Camera, Star, HelpCircle } from "lucide-react"
import { Button } from "@common/components/ui/button"
import { Link } from "react-router-dom"
import { ROUTES } from "@/common/constants/routes"

export default function OnboardingScreen3() {
  return (
    <div className="text-center space-y-6 animate-in fade-in-50 duration-700 py-4">
      {/* Illustration area */}
      <div className="relative">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Social media post mockup */}
            <div className="w-32 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-16 bg-gradient-to-br from-orange-200 to-yellow-200 rounded mb-2"></div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between mt-2">
                <MessageCircle className="w-3 h-3 text-gray-400" />
                <Share2 className="w-3 h-3 text-gray-400" />
                <Star className="w-3 h-3 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating social elements */}
        <div className="absolute top-12 left-8 w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-bounce">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="absolute top-20 right-4 w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center animate-bounce delay-200">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-16 left-4 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce delay-400">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-8 right-12 w-10 h-10 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center animate-bounce delay-600">
          <Star className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Chia sẻ và{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Tỏa sáng</span>
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed px-4">
          Chia sẻ những khoảnh khắc đáng nhớ, tương tác với bạn bè và xây dựng mạng lưới cá nhân tích cực. Hãy để cá
          tính của bạn tỏa sáng trong cộng đồng của trường!
        </p>
      </div>

      {/* Social features */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-3 rounded-lg border border-pink-200 text-center">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 text-sm">Tương tác</p>
          <p className="text-xs text-gray-600">Bình luận, thích và chia sẻ</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 text-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 text-sm">Chia sẻ</p>
          <p className="text-xs text-gray-600">Đăng ảnh và khoảnh khắc</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200 text-center">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 text-sm">Tỏa sáng</p>
          <p className="text-xs text-gray-600">Thể hiện cá tính độc đáo</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3 pt-4">
        <Link to={ROUTES.AUTH.LOGIN}>
          <Button className="w-48 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            Đăng nhập ngay
          </Button>
        </Link>
        
      </div>
       {/* Secondary text */}
       <p className="text-sm text-gray-600 px-4 leading-relaxed">
          Chưa có tài khoản? Vui lòng liên hệ với ban quản lý nhà trường.
        </p>

        {/* Support links */}
        <div className="flex justify-center space-x-6 pt-2">
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Thông tin đăng nhập</span>
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">Liên hệ hỗ trợ</button>
        </div>
    </div>
  )
}
