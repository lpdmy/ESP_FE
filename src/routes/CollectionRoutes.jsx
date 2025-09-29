import { ROUTES } from "@/common/constants/routes";
import CollectionDetailPage from "@/pages/Collection/CollectionDetail/page";
import ListCollectionPage from "@/pages/Collection/ListCollection/page";
import { Route } from "react-router-dom";
export const collectionsRoutes = [
    <Route key="collections" path={ROUTES.COLLECTION.LIST_COLLECTION} element={<ListCollectionPage />} />,
    <Route key="collections" path={ROUTES.COLLECTION.COLLECTION_DETAIL} element={<CollectionDetailPage />} />,
]