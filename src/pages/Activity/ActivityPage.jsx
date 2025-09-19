import ListActivity from "@/features/activity/components/ListActivity";
import Header from "@/features/landing/components/Header";
import Sidebar from "@/features/landing/components/Sidebar";
export default function ActivityPage(){
return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
  {/* Header */}
  <header className="sticky top-0 z-50 bg-orange-100 shadow-sm h-20 flex items-center w-full px-6">
    <div className="flex items-center justify-between w-full">
      <Header />
    </div>
  </header>

  {/* Nội dung chính */}
  <main className="flex gap-8 justify-center px-4 py-6">
    {/* Sidebar trái */}
    <aside className="hidden lg:block w-72 xl:w-80 sticky top-[88px] self-start flex-shrink-0">
      <Sidebar />
    </aside>

    {/* Khu vực giữa */}
    <section className="flex-1 min-w-0 lg:max-w-5xl xl:max-w-6xl min-h-[600px]">
      <ListActivity />
    </section>
  </main>
</div>
);

}