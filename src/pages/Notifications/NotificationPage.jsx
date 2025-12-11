import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import ListNotifications from "@/features/notifications/ListNotifications"

export default function NotificationPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <ListNotifications />
      </ContentLayout>
    </LandingLayout>
  )
}
