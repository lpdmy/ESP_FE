import { toast } from 'react-toastify'
import { PROFILE_MESSAGES, AUTH_MESSAGES, COMMON_MESSAGES } from '@/common/constants/messages'
import { POST_MESSAGES } from '../constants/messages/post'
import { COLLECTION_MESSAGES } from '../constants/messages/collection'
import { CLUB_MESSAGES } from '../constants/messages/club'
import { COMMENT_MESSAGE } from '../constants/messages/comment'
import { STAFF_MESSAGE } from '../constants/messages/staff'
import { JURY_MESSAGE } from '../constants/messages/jury'
import { ROLE } from '@/common/constants/roles'
import { store } from '@/store'

// Helper function to check if user is admin
const checkIsAdmin = () => {
  try {
    const state = store.getState()
    const user = state?.user?.user
    const pathname = window.location.pathname
    
    if (!user) return false
    
    const isAdminRole = user.role === ROLE.ADMIN || 
                       user.role === 0 ||
                       user.role === 'Admin' ||
                       user.roles?.includes('Admin') || 
                       user.roles?.some(role => role.name === 'Admin' || role === 0)
    
    const isAdminPage = pathname.startsWith('/admin')
    
    return isAdminRole || isAdminPage
  } catch {
    return false
  }
}

// Get toast style based on role
const getToastStyle = () => {
  if (checkIsAdmin()) {
    return {
      backgroundColor: '#3b82f6', // Blue-500
      color: '#ffffff'
    }
  }
  return {}
}

export const useToast = () => {

  const showSuccess = (message, options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: getToastStyle(),
      ...options
    }
    return toast.success(message, toastOptions)
  }

  const showError = (message, options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: getToastStyle(),
      ...options
    }
    return toast.error(message, toastOptions)
  }

  const showInfo = (message, options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: getToastStyle(),
      ...options
    }
    return toast.info(message, toastOptions)
  }

  const showWarning = (message, options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: getToastStyle(),
      ...options
    }
    return toast.warning(message, toastOptions)
  }

  const dismiss = (toastId) => {
    toast.dismiss(toastId)
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  // Predefined message methods
  const profileUpdated = () => showSuccess(PROFILE_MESSAGES.SUCCESS.PROFILE_UPDATED)
  const profileLoadFailed = () => showError(PROFILE_MESSAGES.ERROR.PROFILE_LOAD_FAILED)
  const profileSaveFailed = () => showError(PROFILE_MESSAGES.ERROR.PROFILE_SAVE_FAILED)
  const avatarUploadFailed = () => showError(PROFILE_MESSAGES.ERROR.AVATAR_UPLOAD_FAILED)
  const invalidFileType = () => showError(PROFILE_MESSAGES.ERROR.INVALID_FILE_TYPE)
  const fileTooLarge = () => showError(PROFILE_MESSAGES.ERROR.FILE_TOO_LARGE)
  const networkError = () => showError(COMMON_MESSAGES.ERROR.NETWORK_ERROR)
  const unknownError = () => showError(COMMON_MESSAGES.ERROR.GENERIC)
  const postLoadFaild = () => showError(COMMON_MESSAGES.ERROR.postLoadFaild)
  const createPostSuccess = () =>showSuccess(POST_MESSAGES.NOTIFICATIONS.POST_CREATED)
  const deletePostSucess = () => showSuccess(POST_MESSAGES.NOTIFICATIONS.POST_DELETED)
  const deleteCollection = () => showSuccess(COLLECTION_MESSAGES.SUCCESS.DELETE)
  const createCollection = () => showSuccess(COLLECTION_MESSAGES.SUCCESS.CREATE)
  const updateCollection = () => showSuccess(COLLECTION_MESSAGES.SUCCESS.UPDATE)
  const nameIsNull = () => showError(COLLECTION_MESSAGES.ERROR.REQUIRE_NAME)
  const loadAlbumFail = () =>showError(COLLECTION_MESSAGES.ERROR.LOAD_FAILD)
  const addCollectionIteamFail = () => showError(COLLECTION_MESSAGES.ERROR.SAVE_ALBUM_FAILD)
  const addCollectionIteamSuccess = () => showSuccess(COLLECTION_MESSAGES.SUCCESS.ADD)
  const createClubSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.CREATE)
  const createClubJoinRequestSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.CREATE_CLUB_JOIN)
  const createClubJoinRequestFail = () => showError(CLUB_MESSAGES.ERROR.CREATE_CLUB_JOIN)
  const rejectJoinRequestFail = () => showError(CLUB_MESSAGES.ERROR.REJECT_JOIN)
  const rejectJoinRequestSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.REJECT_JOIN)
  const approveJoinRequestSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.APPROVE_JOIN)
  const approveJoinRequestFail = () => showError(CLUB_MESSAGES.ERROR.APPROVE_JOIN)
  const approvePostFail = () => showError(CLUB_MESSAGES.ERROR.APPROVE_POST)
  const approvePostSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.APPROVE_POST)
  const leaveClubSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.LEAVE_CLUB)
  const loadClubFail = () => showError(CLUB_MESSAGES.ERROR.LIST)
  const kickClubFail = () => showError(CLUB_MESSAGES.ERROR.KICK_CLUB)
  const kickClubSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.KICK_CLUB)
  const rejectPostFail = () => showError(CLUB_MESSAGES.SUCCESS.REJECT_POST)
  const rejectPostSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.REJECT_POST)
  const editCommentSuccess = () => showSuccess(COMMENT_MESSAGE.SUCCESS.EDIT)
  const editCommentFail = () => showError(COMMENT_MESSAGE.Fail.EDIT)
  const loadCommentFail = () => showError(COMMENT_MESSAGE.Fail.LOAD)
  const deleteCommentFail = () =>showError(COMMENT_MESSAGE.Fail.DELETE)
  const deleteCommentSuccess = () =>showSuccess(COMMENT_MESSAGE.SUCCESS.DELETE)
  const loadClubCategoryFail = () =>showError(CLUB_MESSAGES.ERROR.LOAD_CLUB_CATEGORY)
  const approveCreationFail = () =>showError(CLUB_MESSAGES.ERROR.APPROVE_CREATION)
  const approveCreationSucces = () =>showSuccess(CLUB_MESSAGES.ERROR.APPROVE_CREATION)
  const rejectCreationRequsetSuccess = () =>showError(CLUB_MESSAGES.SUCCESS.REJECT_CREATION)
  const inviteMentorSuccess = () =>showSuccess(CLUB_MESSAGES.SUCCESS.INVITE_MENTOR)
  const inviteMentorFail = () => showError(CLUB_MESSAGES.ERROR.INVITE_MENTOR)
  const changeRoleFail = () => showError(CLUB_MESSAGES.ERROR.CHANGE_ROLE)
  const changeRoleSuccess = () => showSuccess(CLUB_MESSAGES.SUCCESS.CHANGE_ROLE)
  const loadPostFail = ()=>showError(CLUB_MESSAGES.ERROR.LOAD_POST)
  const deleteClubFail = ()=>showError(CLUB_MESSAGES.ERROR.DELETE_CLUB)
  const deleteClubSuccess = ()=>showSuccess(CLUB_MESSAGES.SUCCESS.DELETE_CLUB)
  const createStaffSuccess = ()=>showSuccess(STAFF_MESSAGE.SUCCESS.CREATE)
  const createStaffFail = ()=>showError(STAFF_MESSAGE.ERROR.CREATE)
  const updateStaffFail =()=>showError(STAFF_MESSAGE.ERROR.UPDATE)
  const updateStaffSuccess =()=>showSuccess(STAFF_MESSAGE.SUCCESS.UPDATE)
  const deleteStaffSuccess =()=>showSuccess(STAFF_MESSAGE.SUCCESS.DELETE)
  const deleteStaffFail =()=>showSuccess(STAFF_MESSAGE.ERROR.DELETE)
  const recoveryStaffSuccess =()=>showSuccess(STAFF_MESSAGE.SUCCESS.RECOVERY)
  const recoveryStaffFail =()=>showSuccess(STAFF_MESSAGE.ERROR.RECOVERY)
  const approveInvitationSuccess =()=>showSuccess(CLUB_MESSAGES.SUCCESS.APPROVE_INVITAION)
  const approveInvitationFail =()=>showError(CLUB_MESSAGES.ERROR.APPROVE_INVITAION)
  const rejectMentorInvitation =()=>showInfo(CLUB_MESSAGES.SUCCESS.REJECT_MENTOR_INVITATION)
  const addJurySuccess = () =>showSuccess(JURY_MESSAGE.SUCCESS.ADD)
  const addJuryFail = () =>showError(JURY_MESSAGE.ERROR.ADD)
  const deleteJuryFail = () =>showError(JURY_MESSAGE.ERROR.DELETE)
  const deleteJurySuccess = () =>showSuccess(JURY_MESSAGE.SUCCESS.DELETE)
  const loadJuryListFail = () =>showError(JURY_MESSAGE.ERROR.LIST)
  const assignJuryFail = () =>showError(JURY_MESSAGE.ERROR.ASSIGN)
  const assignJurySuccess = () =>showSuccess(JURY_MESSAGE.SUCCESS.ASSIGN)


  return {
    // Basic toast methods
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
    
    // Predefined message methods
    profileUpdated,
    profileLoadFailed,
    profileSaveFailed,
    avatarUploadFailed,
    invalidFileType,
    fileTooLarge,
    networkError,
    unknownError,
    postLoadFaild,
    createPostSuccess,
    deletePostSucess,
    deleteCollection,
    createCollection,
    updateCollection,
    nameIsNull,
    loadAlbumFail,
    addCollectionIteamFail,
    addCollectionIteamSuccess,
    createClubSuccess,
    createClubJoinRequestSuccess,
    createClubJoinRequestFail,
    rejectJoinRequestFail,
    approveJoinRequestSuccess,
    rejectJoinRequestSuccess,
    approveJoinRequestFail,
    approvePostFail,
    approvePostSuccess,
    leaveClubSuccess,
    loadClubFail,
    kickClubFail,
    kickClubSuccess,
    rejectPostFail,
    rejectPostSuccess,
    editCommentSuccess,
    editCommentFail,
    loadCommentFail,
    deleteCommentFail,
    deleteCommentSuccess,
    loadClubCategoryFail,
    approveCreationFail,
    approveCreationSucces,
    rejectCreationRequsetSuccess,
    inviteMentorSuccess,
    inviteMentorFail,
    changeRoleFail,
    changeRoleSuccess,
    loadPostFail,
    deleteClubFail,
    deleteClubSuccess,
    createStaffSuccess,
    createStaffFail,
    updateStaffFail,
    updateStaffSuccess,
    deleteStaffFail,
    deleteStaffSuccess,
    recoveryStaffSuccess,
    recoveryStaffFail,
    approveInvitationSuccess,
    approveInvitationFail,
    rejectMentorInvitation,
    addJurySuccess,
    addJuryFail,
    deleteJuryFail,
    deleteJurySuccess,
    loadJuryListFail,
    assignJuryFail,
    assignJurySuccess,

    // Direct access to messages
    PROFILE_MESSAGES,
    AUTH_MESSAGES,
    COMMON_MESSAGES,
    COLLECTION_MESSAGES
  }
}
