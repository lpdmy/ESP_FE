import { useState, useCallback,useRef } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { ModerationService } from "../services/moderation.service";
export const useModerationApi = () => {
 const [staffLoading, setStaffLoading] = useState(false);
   const [saveLoading, setSaveLoading] = useState(false);
   const [error, setError] = useState(null);
   const moderationService = new ModerationService();
   const getAllReport = useCallback(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      moderationService.getAllReport.bind(moderationService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  }, []);
  const createReport = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      moderationService.createReport.bind(moderationService),
      [payload,token],
      { setLoading: setSaveLoading, setError }
    );
  });
   const getUserStat = useCallback(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      moderationService.getUserStat.bind(moderationService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  }, []);
  const createNotification = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      moderationService.createNotification.bind(moderationService),
      [payload,token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const updateStatus = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      moderationService.updateStatus.bind(moderationService),
      [payload,token],
      { setLoading: setSaveLoading, setError }
    );
  });
  return {
    getAllReport,
    createReport :createReport.current,
    getUserStat,
    createNotification : createNotification.current,
    updateStatus: updateStatus.current,
  };
}