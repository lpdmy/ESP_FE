import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import ViewActivityPage from "@/pages/Activities/ViewActivityPage";
import MyActivityPage from "@/pages/Activities/MyActivityPage";

export const activityRoutes = [
    <Route key="activity"  
    element={<ProtectedRoute />} >
        <Route key="view-activity" path={ROUTES.ACTIVITY.VIEW_ACTIVITY} element={<ViewActivityPage />} />
        <Route key="my-activity" path={ROUTES.ACTIVITY.MY_ACTIVITY} element={<MyActivityPage />} />
    </Route>
];