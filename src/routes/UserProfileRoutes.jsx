import { Route } from "react-router-dom";
import { ROLE } from "@/common/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import StudentProfilePage from "@/pages/UserProfile/StudentProfile/StudentProfilePage";
import EditStudentProfilePage from "@/pages/UserProfile/StudentProfile/EditStudentProfilePage";
import TeacherProfilePage from "@/pages/UserProfile/TeacherProfile/TeacherProfilePage";
import EditTeacherProfilePage from "@/pages/UserProfile/TeacherProfile/EditTeacherProfilePage";
import { ROUTES } from "@/common/constants/routes";

export const profileRoutes = [
    <Route element={<ProtectedRoute allowedRoles={[ROLE.STUDENT]} />}>
        <Route key="user-profile" path={ROUTES.USER_PROFILE.PROFILE} element={<StudentProfilePage />} />,
        <Route key="edit-user-profile" path={ROUTES.USER_PROFILE.EDIT} element={<EditStudentProfilePage />} />
    </Route>,
    <Route element={<ProtectedRoute allowedRoles={[ROLE.TEACHER]} />}>
        <Route key="teacher-profile-alt" path={ROUTES.USER_PROFILE.TEACHER_PROFILE} element={<TeacherProfilePage />} />,
        <Route key="edit-teacher-profile-alt" path={ROUTES.USER_PROFILE.EDIT_TEACHER} element={<EditTeacherProfilePage />} />
    </Route>
];