import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AssignJuryPage from "@/pages/Jury/Assign-jury/page";
import JuryDashBoardPage from "@/pages/Jury/Jury-dashboard/page";
import JurySubmissionPage from "@/pages/Jury/Jury-submission/page";
import JuryGrading from "@/pages/Jury/Jury-grade/page";
import { ROLE } from "@/common/constants/roles";
export const juryRoutes = [
  <Route element={<ProtectedRoute allowedRoles={[ROLE.TEACHER]}/>}>
    <Route key="jury-assign" path={ROUTES.JURY.ASSIGN_JURY} element={<AssignJuryPage />} />
    <Route key="jury-dashboard" path={ROUTES.JURY.JURY_DASHBOARD} element={<JuryDashBoardPage />} />
    <Route key="jury-submission" path={ROUTES.JURY.JURY_SUBMISSION} element={<JurySubmissionPage />} />
    <Route key="jury-grading" path={ROUTES.JURY.JURY_GRADE} element={<JuryGrading />} />
  </Route>
]