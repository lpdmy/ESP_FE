import { Calendar, Trophy, Users2, Sparkles } from "lucide-react"
import IconBox from "./IconBox"
import FloatingIcon from "./FloatingIcon"

export default function OnboardingScreen2() {
  return (
    <div className="text-center space-y-8 animate-in fade-in-50 duration-700 py-8">
      <div className="relative">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3">
          <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center transform -rotate-3">
            <div className="grid grid-cols-2 gap-4">
              <IconBox icon={<Calendar className="w-8 h-8 text-white" />} colors="from-blue-400 to-blue-500" />
              <IconBox icon={<Trophy className="w-8 h-8 text-white" />} colors="from-green-400 to-green-500" />
              <IconBox icon={<Users2 className="w-8 h-8 text-white" />} colors="from-yellow-400 to-yellow-500" />
              <IconBox icon={<Sparkles className="w-8 h-8 text-white" />} colors="from-purple-400 to-purple-500" />
            </div>
          </div>
        </div>

        <FloatingIcon emoji="🎨" position="top-4 left-4" colors="from-pink-400 to-red-400" />
        <FloatingIcon emoji="⚽" position="top-8 right-8" colors="from-green-400 to-teal-400" delay="delay-200" />
        <FloatingIcon emoji="🎵" position="bottom-8 left-12" colors="from-blue-400 to-indigo-400" delay="delay-400" />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Khám phá{" "}
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Thế giới đa sắc</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed px-4">
          Tham gia các hoạt động thú vị, câu lạc bộ đa dạng và cuộc thi hấp dẫn. Khám phá sở thích, phát triển kỹ năng
          và tạo nên những kỷ niệm đáng nhớ cùng bạn bè.
        </p>
      </div>
      {/* Activity categories */}
      <div className="w-full max-w-4xl mx-auto pt-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-blue-700">Sự kiện</p>
            <p className="text-xs text-blue-600">Hoạt động hàng tuần</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-green-700">Cuộc thi</p>
            <p className="text-xs text-green-600">Thử thách bản thân</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
            <Users2 className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-yellow-700">Câu lạc bộ</p>
            <p className="text-xs text-yellow-600">Cộng đồng sở thích</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-purple-700">Kỹ năng</p>
            <p className="text-xs text-purple-600">Phát triển bản thân</p>
          </div>
        </div>
      </div>
    </div>
  )
}
