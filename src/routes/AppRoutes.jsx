import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";
import { profileRoutes } from "./UserProfileRoutes";
import { onboardingRoutes } from "./OnboardingRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...adminRoutes}
      {...profileRoutes}
      {...onboardingRoutes}
    </Routes>
  );
}