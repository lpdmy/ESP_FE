import { Route } from "react-router-dom";
import EventsPage from "../pages/Event/page";
import { ROUTES } from "@/common/constants/routes";

export const activityRoutes = [
  <Route key="activity" path={ROUTES.Activity.LIST_EVENT} element={<EventsPage />} />
];