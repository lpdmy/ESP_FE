import { Routes } from "react-router-dom";
import { landingRoutes } from "./LandingRoutes";
import { authRoutes } from "./AuthRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {...landingRoutes}
      {...authRoutes}
    </Routes>
  );
}