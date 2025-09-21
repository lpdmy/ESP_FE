export default function OnboardingScreen0() {
  return (
    <div className="text-center space-y-8 animate-fade-in py-8">
      {/* Logo and radiating effects */}
      <div className="relative flex items-center justify-center mb-12">
        {/* Radiating circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-2 border-orange-200 animate-pulse"></div>
          <div className="absolute w-48 h-48 rounded-full border border-blue-200 animate-ping"></div>
        </div>

        {/* Radiating lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-16 bg-gradient-to-t from-transparent via-orange-300 to-transparent opacity-60 animate-pulse"
              style={{
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: "center 8rem",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Central logo */}
        <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
          <div className="text-white font-bold text-2xl">ES</div>
        </div>
      </div>

      {/* App name and title */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
          EduSphere
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 leading-tight">Chào mừng đến với EduSphere</h2>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <p className="text-lg text-gray-600 leading-relaxed px-4">
          Nơi những trải nghiệm học đường đầy màu sắc đang chờ đón bạn. Cùng khám phá và tạo nên những kỷ niệm đáng nhớ
          tại trường của bạn.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="flex justify-center space-x-4 mt-8">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
      </div>
    </div>
  )
}
