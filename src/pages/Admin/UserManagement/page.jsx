import UserManagement from "@/components/AdminPage/UserManagement/UserManagement"
import AdminLayout from "@/layouts/AdminLayout"

export default function UsersPage() {
  return <AdminLayout>
    <UserManagement />
  </AdminLayout>
}