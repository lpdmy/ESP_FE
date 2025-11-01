import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import NotificationsPage from "@/pages/Notifications/NotificationPage";
import ProtectedRoute from "./ProtectedRoute";

export const notificationRoutes = [
    <Route key="chat" element={<ProtectedRoute />}>
        <Route key="list-notifications" path={ROUTES.NOTIFICATION.LIST_NOTIFICATION} element={<NotificationsPage />} />
    </Route>
];