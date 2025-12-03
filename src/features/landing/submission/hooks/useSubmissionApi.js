import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { SubmissionService } from "../services/submission.service";
export function useSubmissionApi() {
  const [juryLoading, setJuryLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const submissionService = new SubmissionService();
  const getSubmissionByUser = async (search, pageSize, pageNumber) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      submissionService.getSubmissionByUser.bind(submissionService),
      [token, search, pageSize, pageNumber],
      { setLoading: setSaveLoading, setError }
    );
  };
  const getSubmissionDetail = async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      submissionService.getSubmissionDetail.bind(submissionService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  };

  return {
    getSubmissionByUser,
    getSubmissionDetail
  };
}
