import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AssignJuryPage from "@/pages/Jury/Assign-jury/page";
import JuryDashBoardPage from "@/pages/Jury/Jury-dashboard/page";
export const juryRoutes = [
  <Route element={<ProtectedRoute />}>
    <Route key="jury-submission" path={ROUTES.JURY.ASSIGN_JURY} element={<AssignJuryPage />} />
    <Route key="jury-dashboard" path={ROUTES.JURY.JURY_DASHBOARD} element={<JuryDashBoardPage />} />

  </Route>
]