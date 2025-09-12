import { Route } from "react-router-dom";
import EventsPage from "../pages/Event/page";
import { ROUTES } from "@/common/constants/routes";
import EventDetailPage from "@/pages/Event/Event/EventDetail/page";

export const activityRoutes = [
  <Route key="activity" path={ROUTES.ACTIVITY.LIST_EVENT} element={<EventsPage />} />,
  <Route key="activity" path={ROUTES.ACTIVITY.ACTIVITY_DETAIL} element={<EventDetailPage />} />
];