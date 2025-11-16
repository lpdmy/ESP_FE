import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { JuryService } from "../services/jury.service";
export function useJuryApi() {
  const [juryLoading, setJuryLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const juryService = new JuryService();
  const createJury = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.createJury.bind(juryService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getJuryByClubId = async (id, search) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.getJuryByClubId.bind(juryService),
      [token, id, search],
      { setLoading: setSaveLoading, setError }
    );
  };
  const deleteJury = async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.deleteJury.bind(juryService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  };
  const getSubmissionByAcitivty = async (id, search, pageSize, pageNumber) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.getSubmissionByAcitivty.bind(juryService),
      [token, id, search, pageSize, pageNumber],
      { setLoading: setSaveLoading, setError }
    );
  };
  const getJuryAcitivty = async (search, pageSize, pageNumber) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.getJuryAcitivty.bind(juryService),
      [token, search, pageSize, pageNumber],
      { setLoading: setSaveLoading, setError }
    );
  };
  const assignJury = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.assignJury.bind(juryService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const ramdomAssignJury = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.ramdomAssignJury.bind(juryService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const deleteRandomAssign = async (id) => {
  const token = localStorage.getItem("token");
  return executeApiCall(
    () => juryService.deleteRandomAssign(token, id),
    [],
    { setLoading: setSaveLoading, setError }
  );
};
const getJuryAssign = async (id, search, pageSize, pageNumber) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.getJuryAssign.bind(juryService),
      [token, id, search, pageSize, pageNumber],
      { setLoading: setSaveLoading, setError }
    );
  };
  const getJuryAssignNotGrade = async (id, search, pageSize, pageNumber) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      juryService.getJuryAssignNotGrade.bind(juryService),
      [token, id, search, pageSize, pageNumber],
      { setLoading: setSaveLoading, setError }
    );
  };

  return {
    createJury: createJury.current,
    getJuryByClubId,
    deleteJury,
    getSubmissionByAcitivty,
    getJuryAcitivty,
    assignJury : assignJury.current,
    ramdomAssignJury: ramdomAssignJury.current,
    deleteRandomAssign,
    getJuryAssign,
    getJuryAssignNotGrade
  };
}
