import ContentLayout from "@/common/components/layout/ContentLayout"
import LandingLayout from "@/common/components/layout/LandingLayout"
import ChatInbox from "@/features/chat/ChatInbox"

export default function InboxPage() {
  return (
    <LandingLayout>
      <ContentLayout>
        <ChatInbox />
      </ContentLayout>
    </LandingLayout>
  )
}
