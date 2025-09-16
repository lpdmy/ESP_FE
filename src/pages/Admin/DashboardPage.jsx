import AdminPageLayout from "@/features/admin/components/AdminPageLayout"

export default function DashboardPage() {
  return (
    <AdminPageLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">1,100</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">New Users</h3>
            <p className="text-3xl font-bold text-orange-600">50</p>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  )
}
