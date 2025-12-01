import LandingLayout from "@/common/components/layout/LandingLayout";
import Sidebar from "@/features/landing/components/Sidebar";
import MySubmissions from "@/features/landing/submission/components/my-submission/page";
export default function MySubmissionPage() {
  return (
    <LandingLayout>
        <div className="w-full py-6 pl-6">
      <div className="w-full px-4">
        <div className="flex gap-7 justify-center">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <Sidebar />
          </aside>
          {/* Main Content (slightly wider than homepage center column) */}
          <section className="flex-1 min-w-0 lg:max-w-6xl xl:max-w-6xl">
            <MySubmissions />
          </section>
    
          {/* Right spacer to keep layout balanced like homepage (no panel) */}
          <aside
            className="hidden lg:block w-50 xl:w-60 flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
    </LandingLayout>
  );
}
