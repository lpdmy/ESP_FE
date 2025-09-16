import Sidebar from "@/features/landing/components/Sidebar"
import NewsFeed from "@/features/landing/components/NewsFeed"
import RightPanel from "@/features/landing/components/RightPanel"

export default function LandingContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">Chào mừng đến với EduSphere</h1>
        <p className="text-gray-600 text-lg">
          Nền tảng kết nối học sinh THPT FPT School - Nơi chia sẻ, học hỏi và sáng tạo
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-6 self-start">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <section className="col-span-12 lg:col-span-6 xl:col-span-7">
          <NewsFeed />
        </section>

        {/* Right Panel */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-6 self-start">
          <RightPanel />
        </aside>
      </div>
    </div>
  )
}
