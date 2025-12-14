import { Route } from "react-router-dom";
import UserManagementPage from "@/pages/Admin/UserManagementPage";
import ClassManagementPage from "@/pages/Admin/ClassManagementPage";
import ClubManagementPage from "@/pages/Admin/ClubManagementPage";
import DashboardPage from "@/pages/Admin/DashboardPage";
import ImportStudentsPage from "@/pages/Admin/ImportStudentsPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RewardManagementPage from "@/pages/Admin/StarPointManagement/RewardManagementPage";
import StaffManagementPage from "@/pages/Admin/StaffManagerPage";
import { ROUTES } from "@/common/constants/routes";
import CreateActivityPage from "@/pages/Admin/Activities/CreateActivityPage";
import ActivityManagementPage from "@/pages/Admin/Activities/ActivityManagementPage";
import EditActivityPage from "@/pages/Admin/Activities/EditActivityPage";
import AISchedulePage from "@/pages/Admin/Activities/AISchedulePage";
import ActivityDraftsList from "@/features/admin/components/ActivityManagement/ActivityDraftsList";
import ClassDetailPage from "@/pages/Admin/ClassDetailPage";
import ModerationManagementPage from "@/pages/Admin/ModerationPage";
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
      element={<ClubManagementPage />}
    />
  </Route>,

  // 🏫 Quản lý Lớp
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
        requiredPermissions={["MANAGE_CLASSES"]}
      />
    }
    key="class-manage-route"
  >
    <Route
      key="class-manage"
      path={ROUTES.ADMIN.CLASSES}
      element={<ClassManagementPage />}
    />
    <Route
      key="class-detail"
      path={ROUTES.ADMIN.CLASS_DETAIL}
      element={<ClassDetailPage  />}
    />
  </Route>,
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
  <Route
    element={
      <ProtectedRoute
        allowedRoles={[ROLE.ADMIN, ROLE.STAFF, ROLE.TEACHER]}
        requiredPermissions={["MANAGE_ACTIVITIES"]}
      />
    }
    key="activity-manage-route"
  >
    <Route
      key="activity-manage"
      path={ROUTES.ADMIN.CREATE_ACTIVITY}
      element={<CreateActivityPage />}
    />
    <Route
      key="activity-manage"
      path={ROUTES.ADMIN.ACTIVITIES}
      element={<ActivityManagementPage />}
    />
    <Route
      key="activity-edit"
      path={ROUTES.ADMIN.EDIT_ACTIVITY}
      element={<EditActivityPage />}
    />
    <Route
      key="activity-ai-schedule"
      path={ROUTES.ADMIN.AI_SCHEDULE}
      element={<AISchedulePage />}
    />
    <Route
      key="activity-drafts"
      path="/admin/activities/drafts"
      element={<ActivityDraftsList />}
    />
    <Route
      key="moderation"
      path={ROUTES.ADMIN.MODERATION}
      element={<ModerationManagementPage />}
    />
  </Route>,
];

