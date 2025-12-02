import LandingLayout from "@/common/components/layout/LandingLayout"
import ContentLayout from "@/common/components/layout/ContentLayout"
import ActivityRegisterForm from "@/features/activities/components/ActivityRegisterForm"

export default function ActivityRegisterPage() {
  return (
    <LandingLayout>
      <ContentLayout contentMaxWidth="80rem">
        <ActivityRegisterForm />
      </ContentLayout>
    </LandingLayout>
  )
}

