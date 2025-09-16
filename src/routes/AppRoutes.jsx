import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { profileRoutes } from "./UserProfileRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...adminRoutes}
      {...profileRoutes}
    </Routes>
  );
}