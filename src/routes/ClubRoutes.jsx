import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import CreateClubPage from "@/pages/Club/CreateClubPage/page";
export const clubRoutes = [
    <Route key="club" path={ROUTES.CLUB.CREATE_CLUB} element={<CreateClubPage />} />,
]