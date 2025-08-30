import { Route } from "react-router-dom";
import AuthPage from "../pages/Auth/page";

export const authRoutes = [
  <Route key="auth" path="/login" element={<AuthPage />} />
];