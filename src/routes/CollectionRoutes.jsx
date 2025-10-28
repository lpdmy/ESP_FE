import { ROUTES } from "@/common/constants/routes";
import CollectionDetailPage from "@/pages/Collection/CollectionDetail/page";
import ListCollectionPage from "@/pages/Collection/ListCollection/page";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export const collectionsRoutes = [
  <Route element={<ProtectedRoute />}>
    <Route key="collections" path={ROUTES.COLLECTION.LIST_COLLECTION} element={<ListCollectionPage />} />
    <Route key="collections" path={ROUTES.COLLECTION.COLLECTION_DETAIL} element={<CollectionDetailPage />} />
  </Route>
]