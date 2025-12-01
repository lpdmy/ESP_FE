import LandingLayout from "@/common/components/layout/LandingLayout"
import ContentLayout from "@/common/components/layout/ContentLayout"
import ActivitiesList from "@/features/activities/components/ActivitiesList"

export default function ActivitiesListPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <ActivitiesList />
      </ContentLayout>
    </LandingLayout>
  )
}