import LandingLayout from "@/common/components/layout/LandingLayout"
import Sidebar from "@/features/landing/components/Sidebar"
import ActivityRegisterForm from "@/features/activities/components/ActivityRegisterForm"

export default function ActivityRegisterPage() {
  return (
    <LandingLayout>
      <div className="w-full py-6 pl-6">
        <div className="w-full px-4">
          <div className="flex gap-7 justify-center">
            <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
              <Sidebar />
            </aside>
            <section className="flex-1 min-w-0 lg:max-w-4xl xl:max-w-4xl">
              <ActivityRegisterForm />
            </section>
            <aside className="hidden lg:block w-50 xl:w-60 flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}

