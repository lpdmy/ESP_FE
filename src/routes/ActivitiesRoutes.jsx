import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ActivitiesPage from "@/pages/Activities/ActivitiesPage";
import ActivityDetailPage from "@/pages/Activities/ActivityDetailPage";
import ActivitySportsPage from "@/pages/Activities/ActivitySportsPage";

export const activitiesRoutes = [
  <Route element={<ProtectedRoute />}>
    <Route key="activities-list" path={ROUTES.ACTIVITIES.LIST} element={<ActivitiesPage />} />,
    <Route key="activities-sports" path={ROUTES.ACTIVITIES.SPORTS} element={<ActivitySportsPage />} />,
    <Route key="activities-detail" path={ROUTES.ACTIVITIES.DETAIL} element={<ActivityDetailPage />} />,
  </Route>
];


