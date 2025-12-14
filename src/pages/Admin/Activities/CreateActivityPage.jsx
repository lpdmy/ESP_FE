import { useSearchParams } from "react-router-dom";
import CreateActivityLanding from "@/features/admin/components/ActivityManagement/CreateActivityLanding";
import CreateActivity from "@/features/admin/components/ActivityManagement/CreateActivity";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";

export default function CreateActivityPage() {
  const [searchParams] = useSearchParams();
  const fromLanding = searchParams.get("fromLanding");
  const mode = searchParams.get("mode"); // "manual" or "template"

  // If fromLanding is true, show the form for creating new activity
  // If mode is specified (template or manual), show the form
  // Otherwise show the landing page with options
  if (fromLanding === "true" || mode) {
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
