import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";
import { adminRoutes } from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
      {...adminRoutes}
    </Routes>
  );
}