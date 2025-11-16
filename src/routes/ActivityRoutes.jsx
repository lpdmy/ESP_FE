import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import ViewActivityPage from "@/pages/Activities/ViewActivityPage";

export const activityRoutes = [
    <Route key="activity"  
    element={<ProtectedRoute />} >
        <Route key="view-activity" path={ROUTES.ACTIVITY.VIEW_ACTIVITY} element={<ViewActivityPage />} />
    </Route>
];