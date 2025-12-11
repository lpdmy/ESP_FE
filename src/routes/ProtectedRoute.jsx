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

  // Admin không truy cập home/search landing
  if (role === ROLE.ADMIN && (location.pathname === "/" || location.pathname === "/search")) {
    return <Navigate to="/admin" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  if (role === ROLE.ADMIN) {
    return <Outlet />;
  }

  if (role === ROLE.STAFF && requiredPermissions.length > 0) {
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
