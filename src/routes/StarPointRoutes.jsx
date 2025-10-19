import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "@/common/constants/routes";

import RewardStorePage from "@/pages/StarPoint/RewardStorePage";
import PointHistoryPage from "@/pages/StarPoint/PointHistoryPage";
import MyRedemptions from "@/features/star-point/components/MyRedemptions";
import MyRedemptionsPage from "@/pages/StarPoint/MyRedemptionsPage";

export const starPointRoutes = [
  <Route
    element={<ProtectedRoute/>}
    key="reward-store-wrapper"
  >
    <Route
      key="reward-store-main"
      path={ROUTES.STAR_POINT.REWARD_STORE}
      element={<RewardStorePage />}
    />
     <Route
      key="star-point-history"
      path={ROUTES.STAR_POINT.HISTORY}
      element={<PointHistoryPage />}
    />
     <Route
      key="my-redemptions"
      path={ROUTES.STAR_POINT.MY_REDEMPTIONS}
      element={<MyRedemptionsPage />}
    />
  </Route>,
];
