import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import RewardStore from "@/features/star-point/components/RewardStore"

export default function RewardStorePage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <RewardStore />
      </ContentLayout>
    </LandingLayout>
  )
}
