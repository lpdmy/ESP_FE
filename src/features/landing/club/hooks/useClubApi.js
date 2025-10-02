import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { ClubService } from "../service/club.service";
export function useClubApi() {
  const [clubLoading, setclubLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const clubService = new ClubService();
  const createClub = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.createClubCreation.bind(clubService),
      [ token,payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  return{
    clubLoading,
    saveLoading,
    error,
    createClub : createClub.current
  };
}