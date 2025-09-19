import { Users, Zap, Heart } from "lucide-react"
import Feature from "./Feature"

export default function OnboardingScreen1() {
  return (
    <div className="text-center space-y-8 animate-in fade-in-50 duration-700 py-8">
      <div className="relative">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
            <div className="relative">
              <Users className="w-20 h-20 text-blue-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-8 left-8 w-6 h-6 bg-orange-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-16 right-12 w-4 h-4 bg-green-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-12 left-16 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Kết nối và{" "}
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Bứt phá</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed px-4">
          Tham gia cộng đồng học sinh sôi động! Kết nối với bạn bè, thầy cô và cựu học sinh để cùng nhau
          phát triển và tìm kiếm những cơ hội tuyệt vời.
        </p>
      </div>

      <div className="flex justify-center space-x-8 pt-4">
        <Feature icon={<Users className="w-6 h-6 text-blue-500" />} label="Kết nối" bg="bg-blue-100" />
        <Feature icon={<Zap className="w-6 h-6 text-green-500" />} label="Phát triển" bg="bg-green-100" />
        <Feature icon={<Heart className="w-6 h-6 text-yellow-500" />} label="Chia sẻ" bg="bg-yellow-100" />
      </div>
    </div>
  )
}
