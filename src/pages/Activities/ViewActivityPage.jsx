import LandingLayout from "@/common/components/layout/LandingLayout"
import ContentLayout from "@/common/components/layout/ContentLayout"
import ViewActivity from "@/features/activities/components/ViewActivity"

export default function ViewActivityPage() {
  return (
    <LandingLayout>
      <ContentLayout contentMaxWidth="80rem">
        <ViewActivity />
      </ContentLayout>
    </LandingLayout>
  )
}