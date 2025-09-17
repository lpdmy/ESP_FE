import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ActivityPage from "@/pages/Activity/ActivityPage";

export const activityRoutes = [
  <Route key="activity" path={ROUTES.ACTIVITY.LIST_EVENT} element={<ActivityPage />} />,
  <Route key="activity" path={ROUTES.ACTIVITY.ACTIVITY_DETAIL} element={<EventDetailPage />} />
];