import { Route } from "react-router-dom";
import AdminSystemAnnouncementsPage from "@/pages/Admin/NewsAndNotices/AdminSystemAnnouncementsPage";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import AdminSystemAnnouncementDetailPage from "@/pages/Admin/NewsAndNotices/AdminSystemAnnouncementDetailPage";   
import { ROUTES } from "@/common/constants/routes";

export const adminSystemNewsAndNoticesRoutes = [
  <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN, ROLE.STAFF]} requiredPermissions={["MANAGE_ANNOUNCEMENTS"]} />}>
    <Route key="admin-system-news-and-notices" path={ROUTES.ADMIN.SYSTEM_NEWS_AND_NOTICES} element={<AdminSystemAnnouncementsPage />} />
    <Route key="admin-system-news-and-notice-detail" path={ROUTES.ADMIN.SYSTEM_NEWS_AND_NOTICES_DETAIL} element={<AdminSystemAnnouncementDetailPage />} />
  </Route>
];
