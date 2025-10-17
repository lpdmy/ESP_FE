import { ROUTES } from "@/common/constants/routes";
import { Route } from "react-router-dom";
import CreateClubPage from "@/pages/Club/CreateClubPage/page";
import ClubListPage from "@/pages/Club/ListClubPage/page";
import ClubDetailPage from "@/pages/Club/ClubDetailPage/page";
import ClubManagePage from "@/pages/Club/ClubManagePage/page";
export const clubRoutes = [
    <Route key="club" path={ROUTES.CLUB.CREATE_CLUB} element={<CreateClubPage />} />,
    <Route key="club" path={ROUTES.CLUB.LIST_CLUB} element={<ClubListPage />} />,
    <Route key="club" path={ROUTES.CLUB.CLUB_DETAIL} element={<ClubDetailPage />} />,
    <Route key="club" path={ROUTES.CLUB.MANAGE_CLUB} element={<ClubManagePage />} />,
]