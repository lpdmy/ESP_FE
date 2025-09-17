import { Route } from "react-router-dom";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import StudentProfilePage from "@/pages/UserProfile/StudentProfile/StudentProfilePage";
import EditStudentProfilePage from "@/pages/UserProfile/StudentProfile/EditStudentProfilePage";

export const profileRoutes = [
    // <Route element={<ProtectedRoute allowedRoles={[ROLE.STUDENT]} />}>
        <Route key="user-profile" path="/profile" element={<StudentProfilePage />} />,
        <Route key="edit-user-profile" path="/profile/edit" element={<EditStudentProfilePage />} />
    // </Route>
];