import { useParams } from "react-router-dom";
import AssignJury from "@/features/landing/jury/components/assign-jury/page";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";

export default function AssignJuryPage() {
  const { id } = useParams();
  
  return (
    <AdminPageLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Phân công giám khảo</h1>
          <p className="text-gray-600 mt-1">Quản lý và phân công giám khảo cho hoạt động</p>
        </div>
        <AssignJury activityId={id} />
      </div>
    </AdminPageLayout>
  );
}
