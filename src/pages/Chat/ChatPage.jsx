import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import ChatDetail from "@/features/chat/ChatDetail"

export default function ChatPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <ChatDetail />
      </ContentLayout>
    </LandingLayout>
  )
}
