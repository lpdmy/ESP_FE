import { Route } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import WeeklyQuizListPage from "@/features/weekly-quiz/components/WeeklyQuizListPage";
import WeeklyQuizFormPage from "@/features/weekly-quiz/components/WeeklyQuizFormPage";
import WeeklyQuizTakingPage from "@/features/weekly-quiz/components/WeeklyQuizTakingPage";
import WeeklyQuizMySubmissionsPage from "@/features/weekly-quiz/components/WeeklyQuizMySubmissionsPage";

export const weeklyQuizRoutes = [
  <Route key="weekly-quiz" element={<ProtectedRoute />}>
    <Route
      key="weekly-quiz-list"
      path={ROUTES.WEEKLY_QUIZ.LIST}
      element={<WeeklyQuizListPage />}
    />
    <Route
      key="weekly-quiz-create"
      path={ROUTES.WEEKLY_QUIZ.CREATE}
      element={<WeeklyQuizFormPage />}
    />
    <Route
      key="weekly-quiz-detail"
      path={ROUTES.WEEKLY_QUIZ.DETAIL}
      element={<WeeklyQuizTakingPage />}
    />
    <Route
      key="weekly-quiz-my-submissions"
      path={ROUTES.WEEKLY_QUIZ.MY_SUBMISSIONS}
      element={<WeeklyQuizMySubmissionsPage />}
    />
  </Route>,
];

