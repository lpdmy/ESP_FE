import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import ViewActivityPage from "@/pages/Activities/ViewActivityPage";
import ActivitiesListPage from "@/pages/Activities/ActivitiesListPage";
import ActivityRegisterPage from "@/pages/Activities/ActivityRegisterPage";

export const activityRoutes = [
    <Route key="activity"  
    element={<ProtectedRoute />} >
        <Route
          key="activities-list"
          path={ROUTES.ACTIVITY.LIST}
          element={<ActivitiesListPage />}
        />
        <Route
          key="register-activity"
          path={ROUTES.ACTIVITY.REGISTER_ACTIVITY}
          element={<ActivityRegisterPage />}
        />
        <Route key="view-activity" path={ROUTES.ACTIVITY.VIEW_ACTIVITY} element={<ViewActivityPage />} />
    </Route>
];