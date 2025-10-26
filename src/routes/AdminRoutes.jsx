import { Route } from "react-router-dom";
import UserManagementPage from "@/pages/Admin/UserManagementPage";
import ClubManagementPage from "@/pages/Admin/ClubManagementPage";
import DashboardPage from "@/pages/Admin/DashboardPage";
import ImportStudentsPage from "@/pages/Admin/ImportStudentsPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RewardManagementPage from "@/pages/Admin/StarPointManagement/RewardManagementPage";
import StaffManagementPage from "@/pages/Admin/StaffManagerPage";
import { ROUTES } from "@/common/constants/routes";

export const adminRoutes = [
  <Route
    element={<ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.STAFF]} />}
    key="admin-dashboard-route"
  >
    <Route
      key="admin-dashboard"
      path={ROUTES.ADMIN.MAIN}
      element={<DashboardPage />}
    />
  </Route>,

  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_USER"]}
      />
    }
    key="user-management-route"
  >
    <Route
      key="user-management"
      path={ROUTES.ADMIN.USER_MANAGEMENT}
      element={<UserManagementPage />}
    />
  </Route>,

  // 📥 Import học sinh
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_USER"]}
      />
    }
    key="import-students-route"
  >
    <Route
      key="import-students"
      path={ROUTES.ADMIN.IMPORT_USERS}
      element={<ImportStudentsPage />}
    />
  </Route>,

  // 🌟 Quản lý điểm thưởng
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_REWARDS"]}
      />
    }
    key="reward-management-route"
  >
    <Route
      key="star-point"
      path={ROUTES.ADMIN.REWARDS}
      element={<RewardManagementPage />}
    />
  </Route>,

  // 🏫 Quản lý CLB
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_CLUBS"]}
      />
    }
    key="club-manage-route"
  >
    <Route
      key="club-manage"
      path={ROUTES.ADMIN.CLUB}
      element={<ClassManagementPage />}
    />
  </Route>,

  // 👨‍💼 Quản lý nhân viên
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_STAFF"]}
      />
    }
    key="staff-manage-route"
  >
    <Route
      key="staff-manage"
      path={ROUTES.ADMIN.STAFF}
      element={<StaffManagementPage />}
    />
  </Route>,
];
