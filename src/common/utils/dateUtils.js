/**
 * Utility functions for date/time conversion between UTC and Vietnam time (UTC+7)
 */

const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

/**
 * Convert Vietnam time (UTC+7) to UTC
 * Normalize date: Start dates → 00:00:00 UTC, End dates → 23:59:59 UTC
 * @param {string|Date} vnDate - Date string (YYYY-MM-DD) in VN time
 * @param {boolean} isEndDate - If true, set time to 23:59:59, else 00:00:00
 * @returns {string} ISO string in UTC
 */
export const vnTimeToUTC = (vnDate, isEndDate = false) => {
   if (!vnDate) return null

   // Parse date string (YYYY-MM-DD) - treat as VN timezone date
   let dateStr = typeof vnDate === 'string' ? vnDate : vnDate.toISOString().split('T')[0]
   
   // Extract year, month, day from string (YYYY-MM-DD)
   const [year, month, day] = dateStr.split('-').map(Number)
   
   // Create date in UTC with normalized time
   // VN time 00:00:00 = UTC 17:00:00 (previous day) for start dates
   // VN time 23:59:59 = UTC 16:59:59 (same day) for end dates
   if (isEndDate) {
      // End date: VN time 23:59:59 = UTC 16:59:59 (same day)
      // But we want to store as UTC 23:59:59 of that day
      // So: VN date 2024-01-15 → UTC 2024-01-15 23:59:59
      const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      return date.toISOString()
   } else {
      // Start date: VN time 00:00:00 → UTC 00:00:00 (same day)
      // So: VN date 2024-01-15 → UTC 2024-01-15 00:00:00
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      return date.toISOString()
   }
}

/**
 * Convert UTC to Vietnam time (UTC+7)
 * Extract date directly from UTC date string - dates are stored as UTC 00:00:00 or 23:59:59
 * @param {string|Date} utcDate - ISO string or Date object in UTC
 * @param {boolean} includeTime - If true, return with time, else date only
 * @returns {string} Date string in VN time format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 */
/**
 * Format date string từ API (đã là VN time) để hiển thị
 * API trả về date string đã là VN time rồi, không cần convert thêm
 * @param {string|Date} dateStr - Date string từ API (đã là VN time)
 * @param {boolean} includeTime - If true, return with time, else date only
 * @returns {string} Date string in format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
 */
export const formatDateFromAPI = (dateStr, includeTime = false) => {
   if (!dateStr) return null

   // Parse date string từ API (đã là VN time)
   // Nếu date string không có timezone, parse như local time
   const date = new Date(dateStr)
   
   // Verify date is valid
   if (isNaN(date.getTime())) {
      return null
   }
   
   // Extract year, month, day từ date (đã là VN time)
   const year = date.getFullYear()
   const month = String(date.getMonth() + 1).padStart(2, '0')
   const day = String(date.getDate()).padStart(2, '0')
   
   if (includeTime) {
      // Return with time: YYYY-MM-DDTHH:mm:ss
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
   } else {
      // Return date only: YYYY-MM-DD
      return `${year}-${month}-${day}`
   }
}

export const utcToVNTime = (utcDate, includeTime = false) => {
   if (!utcDate) return null

   // Normalize date string to ensure it's treated as UTC
   let dateStr = typeof utcDate === 'string' ? utcDate : utcDate.toISOString()
   const originalStr = dateStr
   
   // Handle different date string formats from API
   if (dateStr && typeof dateStr === 'string') {
      // Case 1: Date only format "YYYY-MM-DD" - treat as UTC midnight
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
         dateStr = dateStr + 'T00:00:00.000Z'
      }
      // Case 2: Date with time but no timezone "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ss.fff"
      // API trả về format này, cần thêm 'Z' để parse như UTC
      else if (dateStr.includes('T') && !dateStr.endsWith('Z') && 
               !/[+-]\d{2}:\d{2}$/.test(dateStr) && 
               !/[+-]\d{4}$/.test(dateStr)) {
         // Thêm 'Z' để đảm bảo parse như UTC
         // Ví dụ: "2025-12-15T00:00:00" → "2025-12-15T00:00:00Z"
         dateStr = dateStr.trim() + 'Z'
      }
      // Case 3: Already has timezone info - use as is
   }
   
   // Parse as UTC date
   const date = new Date(dateStr)
   
   // Verify date is valid
   if (isNaN(date.getTime())) {
      return null
   }
   
   // Extract year, month, day from UTC date directly
   // API trả về date đã đúng, chỉ cần extract date để hiển thị
   const year = date.getUTCFullYear()
   const month = String(date.getUTCMonth() + 1).padStart(2, '0')
   const day = String(date.getUTCDate()).padStart(2, '0')
   
   if (includeTime) {
      // Return with time: YYYY-MM-DDTHH:mm:ss (in VN time)
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
   } else {
      // Return date only: YYYY-MM-DD
      return `${year}-${month}-${day}`
   }
}

/**
 * Format date for display in Vietnam timezone
 * @param {string|Date} utcDate - ISO string or Date object in UTC
 * @returns {string} Formatted date string in VN time
 */
export const formatVNTime = (utcDate) => {
   if (!utcDate) return null

   const date = new Date(utcDate)
   const vnDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET)

   return vnDate.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   })
}

/**
 * Format date only (no time) for display in Vietnam timezone
 * @param {string|Date} utcDate - ISO string or Date object in UTC
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatVNDate = (utcDate) => {
   if (!utcDate) return null

   const date = new Date(utcDate)
   const vnDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET)

   return vnDate.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
   })
}

