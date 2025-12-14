import { useSearchParams } from "react-router-dom";
import CreateActivityLanding from "@/features/admin/components/ActivityManagement/CreateActivityLanding";
import CreateActivity from "@/features/admin/components/ActivityManagement/CreateActivity";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";

export default function CreateActivityPage() {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draftId");
  const fromLanding = searchParams.get("fromLanding");

  // If draftId is specified, show the form with draft data
  // If fromLanding is true, show the form for creating new activity
  // Otherwise show the landing page with options
  if (draftId || fromLanding === "true") {
  return (
    <AdminPageLayout>
      <CreateActivity />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <CreateActivityLanding />
    </AdminPageLayout>
  );
}
