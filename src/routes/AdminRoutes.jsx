import { Route } from "react-router-dom";
import UsersPage from "../pages/Admin/UserManagement/page";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
export const adminRoutes = [
    // <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN]} />}>
        <Route key="user-management" path="/admin/users" element={<UsersPage />} />
    // </Route>
];