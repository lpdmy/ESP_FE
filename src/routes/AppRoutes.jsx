import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { activityRoutes } from "./ActivityRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...activityRoutes}
      {...adminRoutes}
    </Routes>
  );
}