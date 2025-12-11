import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import PointHistory from "@/features/star-point/components/PointHistory"

export default function PointHistoryPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <PointHistory />
      </ContentLayout>
    </LandingLayout>
  )
}
