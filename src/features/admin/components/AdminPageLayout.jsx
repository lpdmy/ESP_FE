import AdminHeader from "@/features/admin/components/AdminHeader"
import AdminSidebar from "@/features/admin/components/AdminSidebar"
import AdminLayout from "@/common/components/layout/AdminLayout"

export default function AdminPageLayout({ children }) {
  return (
    <AdminLayout
      header={(props) => <AdminHeader {...props} />}
      sidebar={(props) => <AdminSidebar {...props} />}
    >
      {children}
    </AdminLayout>
  )
}
