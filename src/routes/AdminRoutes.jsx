import { Route } from "react-router-dom";
import UserManagementPage from "@/pages/Admin/UserManagementPage";
import ClubManagementPage from "@/pages/Admin/ClassManagementPage";
import DashboardPage from "@/pages/Admin/DashboardPage";
import ImportStudentsPage from "@/pages/Admin/ImportStudentsPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RewardManagementPage from "@/pages/Admin/StarPointManagement/RewardManagementPage";
import { ROUTES } from "@/common/constants/routes";

export const adminRoutes = [
    <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN]} />}>
        <Route key="admin-dashboard" path={ROUTES.ADMIN.MAIN} element={<DashboardPage />} />,
        <Route key="user-management" path={ROUTES.ADMIN.USER_MANAGEMENT} element={<UserManagementPage />} />,
        <Route key="import-students" path={ROUTES.ADMIN.IMPORT_USERS} element={<ImportStudentsPage />} />
        <Route key="star-point" path={ROUTES.ADMIN.REWARDS} element={<RewardManagementPage />} />
        <Route key="club-manage" path={ROUTES.ADMIN.CLUB} element={<ClubManagementPage />} />
    </Route>
];