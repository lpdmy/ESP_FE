/**
 * Utility functions for date handling and URL validation
 */

/**
 * Validates if a string is a valid URL
 * @param {string} url - URL string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url || url.trim() === '') return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates if a string is a valid URL or empty string
 * @param {string} url - URL string to validate
 * @returns {boolean} - True if valid URL or empty, false otherwise
 */
export const isValidUrlOrEmpty = (url) => {
  if (!url || url.trim() === '') return true;
  return isValidUrl(url);
};

/**
 * Formats URL for API - returns null if empty or invalid
 * @param {string} url - URL string
 * @returns {string|null} - Formatted URL or null
 */
export const formatUrlForAPI = (url) => {
  if (!url || url.trim() === '') return null;
  
  if (isValidUrl(url)) {
    return url.trim();
  }
  
  return null;
};

/**
 * Converts a date string (from HTML date input) to ISO string format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string|null} - ISO string or null if invalid
 */
export const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

/**
 * Converts an ISO date string to HTML date input format (YYYY-MM-DD)
 * @param {string} isoString - ISO date string
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid ISO date string:', isoString);
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Converts an ISO date string to Vietnamese locale date format
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (isoString) => {
  if (!isoString) return 'Chưa cập nhật';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid ISO date string:', isoString);
      return 'Chưa cập nhật';
    }
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Chưa cập nhật';
  }
};

/**
 * Validates if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Gets the current date in HTML date input format
 * @returns {string} - Current date in YYYY-MM-DD format
 */
export const getCurrentDateForInput = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Gets a date N years ago in HTML date input format
 * @param {number} years - Number of years ago
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getDateYearsAgoForInput = (years) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split('T')[0];
};

export default {
  formatDateForAPI,
  formatDateForInput,
  formatDateForDisplay,
  isValidDate,
  getCurrentDateForInput,
  getDateYearsAgoForInput
};
