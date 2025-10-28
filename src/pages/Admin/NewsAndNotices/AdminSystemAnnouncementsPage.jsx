import AdminPageLayout from "@/features/admin/components/AdminPageLayout";
import AdminSystemNewsAndNotices from "@/features/admin/components/SystemNewsAndNotices/AdminSystemNewsAndNotices";

export default function AdminSystemAnnouncementsPage() {
  return (
    <AdminPageLayout>
      <AdminSystemNewsAndNotices />
    </AdminPageLayout>
  );
}