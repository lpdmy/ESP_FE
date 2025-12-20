import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { ROLE } from "@/common/constants/roles";
import { useState } from "react";
const ProtectedRoute = ({ allowedRoles = [], requiredPermissions = [] }) => {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [redirect, setRedirect] = useState(false);
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  const { role, permissions } = user;

  // Chuẩn hóa role: hỗ trợ cả dạng number và string, so sánh bằng key
  const ROLE_KEY = {
    [ROLE.ADMIN]: "ADMIN",
    [ROLE.STAFF]: "STAFF",
    [ROLE.TEACHER]: "TEACHER",
    [ROLE.STUDENT]: "STUDENT",
  };
  const toRoleKey = (val) => {
    if (typeof val === "string") return val.toUpperCase();
    return ROLE_KEY[val] ?? val;
  };

  const roleKey = toRoleKey(role);
  const allowedRoleKeys = allowedRoles.map(toRoleKey);

  const isAdminRole = roleKey === "ADMIN";
  const isTeacherRole = roleKey === "TEACHER";
  const isStaffRole = roleKey === "STAFF";

  const isAdminRoute =
    location.pathname.startsWith("/admin") || allowedRoleKeys.includes("ADMIN");

  // Chặn admin đi vào các trang thường (không dành cho admin)
  if (isAdminRole && !isAdminRoute) {
    return <Navigate to="/admin" replace />;
  }

  // Admin được phép truy cập các route dành cho admin hoặc được chỉ định rõ
  if (isAdminRole) {
    return <Outlet />;
  }
  
  // Kiểm tra allowedRoles sau khi đã check ADMIN
  if (allowedRoles.length > 0 && !allowedRoleKeys.includes(roleKey)) {
    return <Navigate to="/" replace />;
  }

  // Teacher có quyền truy cập mà không cần permission (theo BE: Teacher,Staff,Admin)
  if (isTeacherRole) {
    return <Outlet />;
  }

  if (isStaffRole && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some((perm) =>
      permissions?.includes(perm)
    );

    if (!hasPermission) {
      if (!showModal) setShowModal(true);
      return (
        <>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-2xl w-full p-8 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-red-600">
                  ⚠️ Truy cập bị từ chối
                </DialogTitle>
              </DialogHeader>

              <p className="text-base text-gray-700 mt-2 leading-relaxed">
                Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ
                với quản trị viên.
              </p>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setRedirect(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base px-6 py-2"
                >
                  Quay lại trang quản trị
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {redirect && <Navigate to="/admin" replace />}
        </>
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
