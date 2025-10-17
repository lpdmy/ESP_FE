import LandingLayout from "@/common/components/layout/LandingLayout";
import ClubManage from "@/features/landing/club/ManageClub/page";
export default function ClubManagePage() {
  return (
    <LandingLayout>
      <div className="w-full py-6 pl-6">
        <div className="w-full px-4">
          <div className="flex gap-7 justify-center">
            {/* Main Content (slightly wider than homepage center column) */}
            <section className="flex-1 min-w-0 lg:max-w-5xl xl:max-w-5xl">
              <ClubManage />
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}