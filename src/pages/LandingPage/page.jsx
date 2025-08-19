import Header from "@LandingPage/Header"
import Sidebar from "@LandingPage/Sidebar"
import NewsFeed from "@LandingPage/NewsFeed"
import RightPanel from "@LandingPage/RightPanel"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Chào mừng đến với EduSephia</h1>
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
    </div>
  )
}
