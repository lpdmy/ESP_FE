import ClubDetail from "@/features/landing/club/ClubDetail/page";
import LandingLayout from "@/common/components/layout/LandingLayout";
export default function ClubDetailPage() {
  return (
    <LandingLayout>
      <div className="w-full py-6 pl-6">
        <div className="w-full px-4">
          <div className="flex gap-7 justify-center">
            <section className="flex-1 min-w-0 lg:max-w-8xl xl:max-w-8xl">
              <ClubDetail />
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}