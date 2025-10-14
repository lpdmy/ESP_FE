import { Route } from "react-router-dom";
import UserManagementPage from "@/pages/Admin/UserManagementPage";
import DashboardPage from "@/pages/Admin/DashboardPage";
import ClassManagementPage from "@/pages/Admin/ClassManagementPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";

export const adminRoutes = [
    <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN]} />}>
        <Route key="admin-dashboard" path="/admin" element={<DashboardPage />} />,
        <Route key="user-management" path="/admin/users" element={<UserManagementPage />} />
        <Route key="class-management" path="/admin/classes" element={<ClassManagementPage />} />
    </Route>
];