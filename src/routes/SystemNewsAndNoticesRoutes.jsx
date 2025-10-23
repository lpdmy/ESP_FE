import { Route } from "react-router-dom";
import SystemAnnouncementsPage from "@/pages/NewsAndNotices/SystemAnnouncementsPage";
import SystemAnnouncementDetailPage from "@/pages/NewsAndNotices/SystemAnnouncementDetailPage";
import { ROUTES } from "@/common/constants/routes";

export const systemNewsAndNoticesRoutes = [
  <Route key="system-news-and-notices" path={ROUTES.SYSTEM_NEWS_AND_NOTICES.LIST} element={<SystemAnnouncementsPage />} />,
  <Route key="system-news-and-notice-detail" path={ROUTES.SYSTEM_NEWS_AND_NOTICES.DETAIL} element={<SystemAnnouncementDetailPage />} />
];
