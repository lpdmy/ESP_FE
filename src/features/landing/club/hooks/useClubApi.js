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
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const updateClub = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.updateClub.bind(clubService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getListClub = useRef(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getListClub.bind(clubService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getListClubAdmin = useRef(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getListClubAdmin.bind(clubService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubDetail = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubDetail.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubDetailOptimized = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubDetailOptimized.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubMembers = useRef(async (id, pageNumber = 1, pageSize = 20, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubMembers.bind(clubService),
      [token, id, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubCategory = useRef(async () => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubCategory.bind(clubService),
      [token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubJoinRequest = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubJoinRequest.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubJoinCreation = useRef(
    async (pageNumber, pageSize, search = "", status) => {
      const token = localStorage.getItem("token");
      return executeApiCall(
        clubService.getClubJoinCreation.bind(clubService),
        [token, pageNumber, pageSize, (search = ""), status],
        { setLoading: setSaveLoading, setError }
      );
    }
  );
  const createClubJoinRequest = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.createClubJoinRequest.bind(clubService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const approveJoinRequest = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.approveJoinRequest.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const cancelJoinRequest = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.cancelJoinRequest.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const approvePost = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.approvePost.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const rejectJoinRequest = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.rejectJoinRequest.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubByUser = useRef(async () => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubByUser.bind(clubService),
      [token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getPostPending = useRef(
    async (id, pageNumber, pageSize, search = "") => {
      const token = localStorage.getItem("token");
      return executeApiCall(
        clubService.getPostPending.bind(clubService),
        [token, id, pageNumber, pageSize, search],
        { setLoading: setSaveLoading, setError }
      );
    }
  );
  const getClubPost = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubPost.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const leaveClub = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.leaveClub.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const rejectPost = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.rejectPost.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const kickClub = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.kickClub.bind(clubService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const approveCreation = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.approveCreation.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const rejectCreation = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.rejectCreation.bind(clubService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getTeacher = useRef(async (role, pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getTeacher.bind(clubService),
      [token, role, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  });
  const inviteMentor = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.inviteMentor.bind(clubService),
      [token, payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getInvitation = useRef(async (pageNumber, pageSize, search = "") => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getInvitation.bind(clubService),
      [token, pageNumber, pageSize, search],
      { setLoading: setSaveLoading, setError }
    );
  });

  const changeRole = async (userId, clubId) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.changeRole.bind(clubService),
      [token, userId, clubId],
      { setLoading: setSaveLoading, setError }
    );
  };
  const deleteClub = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.deleteClub.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const restoreClub = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.restoreClub.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const approveInvitation = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.approveInvitation.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getClubMentorInvitation = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.getClubMentorInvitation.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const cancelInviteMentor = async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      clubService.cancelInviteMentor.bind(clubService),
      [token, id],
      { setLoading: setSaveLoading, setError }
    );
  };
  return {
    clubLoading,
    saveLoading,
    error,
    createClub: createClub.current,
    getListClub: getListClub.current,
    getClubCategory: getClubCategory.current,
    getClubDetail: getClubDetail.current,
    getClubDetailOptimized: getClubDetailOptimized.current,
    getClubMembers: getClubMembers.current,
    getClubJoinRequest: getClubJoinRequest.current,
    createClubJoinRequest: createClubJoinRequest.current,
    approveJoinRequest: approveJoinRequest.current,
    rejectJoinRequest: rejectJoinRequest.current,
    getClubByUser: getClubByUser.current,
    updateClub: updateClub.current,
    getPostPending: getPostPending.current,
    approvePost: approvePost.current,
    getClubPost: getClubPost.current,
    cancelJoinRequest: cancelJoinRequest.current,
    leaveClub: leaveClub.current,
    rejectPost: rejectPost.current,
    getClubJoinCreation: getClubJoinCreation.current,
    kickClub: kickClub.current,
    approveCreation: approveCreation.current,
    rejectCreation: rejectCreation.current,
    getTeacher: getTeacher.current,
    inviteMentor: inviteMentor.current,
    getInvitation: getInvitation.current,
    changeRole,
    deleteClub: deleteClub.current,
    approveInvitation: approveInvitation.current,
    getClubMentorInvitation: getClubMentorInvitation.current,
    cancelInviteMentor,
    getListClubAdmin : getListClubAdmin.current,
    restoreClub : restoreClub.current,
  };
}
