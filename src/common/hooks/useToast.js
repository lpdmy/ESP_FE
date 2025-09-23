import { toast } from 'react-toastify'
import { PROFILE_MESSAGES, AUTH_MESSAGES, COMMON_MESSAGES } from '@/common/constants/messages'

export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    return toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    return toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    return toast.info(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    })
  }

  const showWarning = (message, options = {}) => {
    return toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    })
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
    
    // Direct access to messages
    PROFILE_MESSAGES,
    AUTH_MESSAGES,
    COMMON_MESSAGES
  }
}
