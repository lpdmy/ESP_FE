import { ROUTES } from "@/common/constants/routes";
import OnboardingPage from "@/pages/Onboarding/OnboardingPage";
import { Route } from "react-router-dom";

export const onboardingRoutes = [
  <Route key="onboarding" path={ROUTES.ONBOARDING.ONBOARDING} element={<OnboardingPage />} />,
];