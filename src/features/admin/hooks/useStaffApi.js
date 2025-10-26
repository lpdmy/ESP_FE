import { useState, useCallback,useRef } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { StaffService } from "../services/staff.service";

export const useStaffApi = () => {
  const [staffLoading, setStaffLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const staffService = new StaffService();

  const getAllStaff = useCallback(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.getAllStaff.bind(staffService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  }, []);

  const getStaffById = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.getStaffById.bind(staffService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  }, []);
  const createStaff = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.createStaff.bind(staffService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const updateStaff = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.updateStaff.bind(staffService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const deleteStaff = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.deleteStaff.bind(staffService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  }, []);
  const recoveryStaff = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      staffService.recoveryStaff.bind(staffService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  }, []);
  return {
    staffLoading,
    saveLoading,
    error,
    getAllStaff,
    getStaffById,
    createStaff : createStaff.current,
    updateStaff: updateStaff.current,
    deleteStaff,
    recoveryStaff
  };
};
