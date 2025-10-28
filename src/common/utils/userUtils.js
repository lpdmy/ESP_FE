/**
 * Utility function to extract userId from user object
 * Handles different user object structures consistently
 * @param {Object} user - User object from Redux store
 * @returns {number|null} - User ID or null if not found
 */
export const getUserId = (user) => {
  if (!user) return null;
  return user?.userId || user?.id || null;
};

/**
 * Utility function to check if user is authenticated
 * @param {Object} user - User object from Redux store
 * @returns {boolean} - True if user is authenticated
 */
export const isUserAuthenticated = (user) => {
  return getUserId(user) !== null;
};

/**
 * Utility function to get user display name
 * @param {Object} user - User object from Redux store
 * @returns {string} - User display name or "Unknown User"
 */
export const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";
  return user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.name || user?.username || "Unknown User";
};

/**
 * Utility function to get user avatar URL
 * @param {Object} user - User object from Redux store
 * @returns {string} - Avatar URL or default placeholder
 */
export const getUserAvatar = (user) => {
  if (!user) return "/placeholder.svg";
  return user?.avatarUrl || user?.avatar || "/placeholder.svg";
};
