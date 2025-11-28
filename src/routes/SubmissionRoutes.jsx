import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MySubmissionPage from "@/pages/Submission/My-Submission/page";
import SubmissionDetailPage from "@/pages/Submission/My-Submission-Detail/page";
import { ROLE } from "@/common/constants/roles";
export const submissionRoutes = [
  <Route element={<ProtectedRoute />}>
    <Route key="my-submission" path={ROUTES.SUBMISSION.MY_SUBMISSION} element={<MySubmissionPage />} />
    <Route key="my-submission" path={ROUTES.SUBMISSION.MY_SUBMISSION_DETAIL} element={<SubmissionDetailPage />} />
  </Route>
]