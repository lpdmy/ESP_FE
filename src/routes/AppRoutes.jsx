import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { profileRoutes } from "./UserProfileRoutes";
import { activityRoutes } from "./ActivityRoutes";
export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...adminRoutes}
      {...profileRoutes}
      {...activityRoutes}
    </Routes>
  );
}