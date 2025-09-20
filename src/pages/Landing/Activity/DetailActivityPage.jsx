import ActivityDetailPage from "@/features/landing/components/Activity/DetailActivity/page"
import LandingLayout from "@/common/components/layout/LandingLayout"

export default function DetailActivityPage() {
  return (
    <LandingLayout>
      <div className="w-full py-6">
            <div className="w-full px-4">
              <div className="flex gap-8 justify-center">
                <section className="flex-1 min-w-0 lg:max-w-5xl xl:max-w-5xl">
                  <ActivityDetailPage />
                </section>
              </div>
            </div>
          </div>
    </LandingLayout>
  )
}