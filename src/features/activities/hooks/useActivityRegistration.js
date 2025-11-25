import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { useToast } from "@/common/hooks/useToast";
import { ROLE } from "@/common/constants/roles";
import { activityParticipantService } from "../services/activityParticipant.service";
import { ClassGroupService } from "@/services/classgroup.service";

const normalizeSubtype = (subType) => subType?.toLowerCase() ?? "";
const isSportsFestivalSubtype = (subType) => normalizeSubtype(subType) === "sportsfestival";

export const useActivityRegistration = () => {
  const [registeringId, setRegisteringId] = useState(null);
  const [error, setError] = useState(null);
  const [teacherClassId, setTeacherClassId] = useState(null);
  const user = useSelector((state) => state.user?.user);
  const toast = useToast();

  const isTeacher = user?.role === ROLE.TEACHER;

  useEffect(() => {
    let ignore = false;

    const fetchTeacherClass = async () => {
      if (!isTeacher) {
        setTeacherClassId(null);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const currentClass = await ClassGroupService.getCurrentClass(token);
        if (!ignore) {
          setTeacherClassId(currentClass?.id ?? null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Không thể lấy lớp chủ nhiệm hiện tại:", err);
          setTeacherClassId(null);
        }
      }
    };

    fetchTeacherClass();

    return () => {
      ignore = true;
    };
  }, [isTeacher]);

  const canRegisterActivity = useCallback(
    (activity) => {
      if (!activity) return false;
      const subType = activity.subType ?? activity.SubType;
      if (isSportsFestivalSubtype(subType)) {
        return isTeacher;
      }
      return true;
    },
    [isTeacher]
  );

  const register = useCallback(
    async ({ activityId, classGroupId, activitySubType }) => {
      if (!user?.id) {
        toast.showError("Bạn cần đăng nhập để đăng ký hoạt động");
        throw new Error("NOT_AUTHENTICATED");
      }

      if (!activityId) {
        toast.showError("Thiếu thông tin hoạt động");
        throw new Error("INVALID_ACTIVITY");
      }

      if (isSportsFestivalSubtype(activitySubType) && !isTeacher) {
        toast.showError("Chỉ giáo viên chủ nhiệm mới có thể đăng ký Hội thao");
        throw new Error("NOT_ALLOWED");
      }

      const resolvedClassGroupId = classGroupId ?? teacherClassId ?? null;

      if (isSportsFestivalSubtype(activitySubType) && !resolvedClassGroupId) {
        toast.showError("Không tìm thấy lớp chủ nhiệm của bạn. Vui lòng kiểm tra lại thông tin lớp.");
        throw new Error("CLASS_NOT_FOUND");
      }

      const token = localStorage.getItem("token");
      // Ensure all IDs are integers, not floats
      const payload = {
        ActivityId: Number.isInteger(activityId) ? activityId : parseInt(activityId, 10),
        UserId: Number.isInteger(user.id) ? user.id : parseInt(user.id, 10),
        ClassGroupId: resolvedClassGroupId 
          ? (Number.isInteger(resolvedClassGroupId) ? resolvedClassGroupId : parseInt(resolvedClassGroupId, 10))
          : null,
      };
      
      // Validate that all required fields are valid integers
      if (isNaN(payload.ActivityId) || isNaN(payload.UserId)) {
        toast.showError("Dữ liệu không hợp lệ");
        throw new Error("INVALID_DATA");
      }

      try {
        setRegisteringId(activityId);
        const response = await executeApiCall(
          activityParticipantService.register.bind(activityParticipantService),
          [payload, token],
          { setError }
        );
        toast.showSuccess("Đăng ký tham gia thành công");
        return response;
      } catch (err) {
        if (err?.message !== "NOT_AUTHENTICATED" && err?.message !== "INVALID_ACTIVITY") {
          toast.showError(err?.message || "Đăng ký tham gia thất bại");
        }
        throw err;
      } finally {
        setRegisteringId(null);
      }
    },
    [isTeacher, teacherClassId, toast, user?.id]
  );

  return {
    register,
    registeringId,
    error,
    isAuthenticated: Boolean(user?.id),
    isTeacher,
    canRegisterActivity,
    teacherClassId,
  };
};

