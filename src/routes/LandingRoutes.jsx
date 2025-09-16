import { Route } from "react-router-dom";
import HomePage from "@/pages/Landing/HomePage";

export const landingRoutes = [
  <Route key="landing" path="/" element={<HomePage />} />
];