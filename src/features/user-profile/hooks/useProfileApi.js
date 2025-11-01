import { useState, useRef } from 'react';
import { executeApiCall } from '@/common/utils/executeApiCall';
import { userService } from '@/features/user-profile/services/profile.service';

export function useProfileApi() {
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to create stable function references
  const getMyProfileRef = useRef(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.getMyProfile.bind(userService), [token], { setLoading: setProfileLoading, setError });
  });

  const updateMyPersonalInfoRef = useRef(async (payload) => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.updateMyPersonalInfo.bind(userService), [payload, token], { setLoading: setSaveLoading, setError });
  });

  const getMyTeacherProfileRef = useRef(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.getMyTeacherProfile.bind(userService), [token], { setLoading: setProfileLoading, setError });
  });

  const updateMyTeacherProfileRef = useRef(async (payload) => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.updateMyTeacherProfile.bind(userService), [payload, token], { setLoading: setSaveLoading, setError });
  });
  const getStudentProfileRef = useRef(async (id) => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.getStudentProfileById.bind(userService), [id,token], { setLoading: setProfileLoading, setError });
  });
  const getTeacherProfileRef = useRef(async (id) => {
    const token = localStorage.getItem('token');
    return executeApiCall(userService.getTeacherProfileById.bind(userService), [id,token], { setLoading: setProfileLoading, setError });
  });
  return {
    profileLoading,
    saveLoading,
    error,
    getMyProfile: getMyProfileRef.current,
    updateMyPersonalInfo: updateMyPersonalInfoRef.current,
    getMyTeacherProfile: getMyTeacherProfileRef.current,
    updateMyTeacherProfile: updateMyTeacherProfileRef.current,
    getStudentProfileRef : getStudentProfileRef.current,
    getTeacherProfileRef: getTeacherProfileRef.current,
    clearError: () => setError(null)
  };
}
