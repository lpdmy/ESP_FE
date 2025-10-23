import { Route } from "react-router-dom";
import HomePage from "@/pages/Landing/HomePage";
import ClassDetailPage from "@/pages/MyClasses/ClassDetailPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "@/common/constants/roles";


export const landingRoutes = [
  <Route element={<ProtectedRoute />}>
    <Route key="landing" path="/" element={<HomePage />} />
    <Route key="my-classes" path="/my-classes" element={<ClassDetailPage />} />
  </Route>
];