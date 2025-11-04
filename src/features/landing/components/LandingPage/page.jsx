import Sidebar from "@/features/landing/components/Sidebar"
import NewsFeed from "@/features/landing/post/NewsFeed"
import RightPanel from "@/features/landing/components/RightPanel"
import SystemNewsAndNoticesModal from "@/features/systemNewsAndNotices/components/SystemNewsAndNoticesModal"
import { useSystemNewsAndNoticesModal } from "@/features/systemNewsAndNotices/hooks/useSystemNewsAndNoticesModal"

export default function LandingContent() {
  const {
    isModalOpen,
    currentNewsAndNotice,
    currentNewsAndNoticeIndex,
    totalNewsAndNotices,
    handleMarkAsViewed,
    handleNext,
    handleClose,
  } = useSystemNewsAndNoticesModal();

  return (
    <div className="w-full py-6">
  {/* Welcome Banner */}
  <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
    <h1 className="text-4xl font-bold gradient-text mb-2">Chào mừng đến với EduSphere</h1>
    <p className="text-gray-600 text-lg">
      Nền tảng kết nối học sinh THPT FPT School - Nơi chia sẻ, học hỏi và sáng tạo
    </p>
  </div>

  <div className="w-full px-4">
    <div className="flex gap-8 justify-center">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <section className="flex-1 min-w-0 lg:max-w-3xl xl:max-w-3xl">
        <NewsFeed />
      </section>

      {/* Right Panel */}
      <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
        <RightPanel />
      </aside>
    </div>
  </div>

  {/* System NewsAndNotices Modal */}
  <SystemNewsAndNoticesModal
    isOpen={isModalOpen}
    newsAndNotice={currentNewsAndNotice}
    currentIndex={currentNewsAndNoticeIndex}
    totalCount={totalNewsAndNotices}
    onMarkAsViewed={handleMarkAsViewed}
    onNext={handleNext}
    onClose={handleClose}
  />
</div>
  )
}
