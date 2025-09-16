import { Route } from "react-router-dom";
import AuthPage from "../pages/Auth/page";
import ResetPasswordPage from "@/pages/Auth/ResetPassword/page";
import ForgotPasswordPage from "@/pages/Auth/ForgotPassword/page";
import ChangePassword from "@/pages/Auth/ChangePassword/page";
import { ROUTES } from "@/common/constants/routes";

export const authRoutes = [
  <Route key="auth" path={ROUTES.AUTH.LOGIN} element={<AuthPage />} />,
  <Route key="auth" path={ROUTES.AUTH.ONE_TIME_LOGIN} element={<ResetPasswordPage />} />,
  <Route key="auth" path={ROUTES.AUTH.FORGETPASSWORD} element={<ForgotPasswordPage />} />,
  <Route key="auth" path={ROUTES.AUTH.CHANGEPASSWORD} element={<ChangePassword />} />
  
];