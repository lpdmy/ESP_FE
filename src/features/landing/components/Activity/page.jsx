import Sidebar from "../Sidebar"
import ListActivity from "./ListActivity/page"
import RightPanel from "../RightPanel"

export default function ActivityContent() {
  return (
    <div className="w-full py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">Hoạt động & Sự kiện</h1>
        <p className="text-gray-600 text-lg">
          Khám phá và tham gia các hoạt động thú vị tại FPT School
        </p>
      </div>

      <div className="w-full px-4">
        <div className="flex gap-8 justify-center">
          {/*Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0 lg:max-w-3xl xl:max-w-3xl">
            <ListActivity />
          </section>

          {/* Right Panel */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <RightPanel />
          </aside>
        </div>
      </div>
    </div>
  )
}
