import { lazy, Suspense } from "react"

// Lazy load Sidebar để tránh circular dependency và tối ưu bundle size
const Sidebar = lazy(() => import("@/features/landing/components/Sidebar"))

/**
 * ContentLayout - Layout component tái sử dụng cho các page có sidebar và main content
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung chính của page
 * @param {boolean} props.showSidebar - Hiển thị sidebar (default: true)
 * @param {string} props.sidebarWidth - Chiều rộng sidebar (default: "20rem")
 * @param {string} props.contentMaxWidth - Max width của content (default: "70rem")
 * @param {string} props.gap - Khoảng cách giữa sidebar và content (default: "gap-8")
 * @param {React.ReactNode} props.customSidebar - Custom sidebar component (optional, nếu không có sẽ dùng Sidebar mặc định)
 */
export default function ContentLayout({
  children,
  showSidebar = true,
  sidebarWidth = "20rem",
  contentMaxWidth = "70rem",
  gap = "gap-8",
  customSidebar,
}) {
  return (
    <div className="w-full py-6">
      <div className="w-full px-4">
        <div className={`flex ${gap} justify-center`}>
          {/* Sidebar */}
          {showSidebar && (
            <aside
              className={`hidden lg:block sticky top-[88px] self-start flex-shrink-0`}
              style={{ width: sidebarWidth }}
            >
              {customSidebar || (
                <Suspense fallback={<div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                  <Sidebar />
                </Suspense>
              )}
            </aside>
          )}

          {/* Main Content */}
          <section
            className="flex-1 min-w-0"
            style={{ maxWidth: contentMaxWidth }}
          >
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}

