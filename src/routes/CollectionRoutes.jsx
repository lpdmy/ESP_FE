import { ROUTES } from "@/common/constants/routes";
import ListCollectionPage from "@/pages/Collection/ListCollection/page";
import { Route } from "react-router-dom";
export const collectionsRoutes = [
    <Route key="collections" path={ROUTES.COLLECTION.LIST_COLLECTION} element={<ListCollectionPage />} />,
]