import ContentLayout from "@/common/components/layout/ContentLayout";
import LandingLayout from "@/common/components/layout/LandingLayout";
import MyEventsPage from "@/features/activities/components/MyActivity";
export default function MyActivityPage() {
  return (
    <LandingLayout>
      <ContentLayout>
          <MyEventsPage />
      </ContentLayout>
    </LandingLayout>
  );
}