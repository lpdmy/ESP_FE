import SystemNewsAndNotices from "@/features/systemAnnouncements/components/SystemNewsAndNotices";
import LandingLayout from "@/common/components/layout/LandingLayout";
import ContentLayout from "@/common/components/layout/ContentLayout";

export default function SystemAnnouncementsPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <SystemNewsAndNotices />
      </ContentLayout>
    </LandingLayout>
  );
}