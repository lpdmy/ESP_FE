import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ActivityPage from "@/pages/Activity/ActivityPage";
import DetailActivityPage from "@/pages/Activity/DetailActivityPage";

export const activityRoutes = [
  <Route key="activity" path={ROUTES.ACTIVITY.LIST_ACTIVITY} element={<ActivityPage />} />,
  <Route key="detail-activity" path={ROUTES.ACTIVITY.ACTIVITY_DETAIL} element={<DetailActivityPage />} />
];