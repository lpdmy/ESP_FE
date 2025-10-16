import { Route } from "react-router-dom";
import UserManagementPage from "@/pages/Admin/UserManagementPage";
import DashboardPage from "@/pages/Admin/DashboardPage";
import ImportStudentsPage from "@/pages/Admin/ImportStudentsPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";

export const adminRoutes = [
    <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN]} />}>
        <Route key="admin-dashboard" path="/admin" element={<DashboardPage />} />,
        <Route key="user-management" path="/admin/users" element={<UserManagementPage />} />,
        <Route key="import-students" path="/admin/users/import" element={<ImportStudentsPage />} />
    </Route>
];