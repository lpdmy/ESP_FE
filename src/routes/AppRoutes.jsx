import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/page";
import AuthPage from "../pages/Auth/page";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  );
}