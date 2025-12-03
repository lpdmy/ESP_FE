import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import MyRedemptions from "@/features/star-point/components/MyRedemptions"

export default function MyRedemptionsPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <MyRedemptions />
      </ContentLayout>
    </LandingLayout>
  )
}
