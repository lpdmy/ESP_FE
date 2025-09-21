import { Route } from "react-router-dom";
import HomePage from "@/pages/Landing/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "@/common/constants/roles";

export const landingRoutes = [
  <Route element={<ProtectedRoute />}>
          <Route key="landing" path="/" element={<HomePage />} />
    </Route>
];