/**
 * Utility functions for date/time conversion between UTC and Vietnam time (UTC+7)
 */

const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

/**
 * Convert Vietnam time (UTC+7) to UTC
 * @param {string|Date} vnDate - Date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) or Date object in VN time
 * @returns {string} ISO string in UTC
 */
export const vnTimeToUTC = (vnDate) => {
   if (!vnDate) return null

   // If it's a date string (YYYY-MM-DD), treat it as VN time midnight
   let date
   if (typeof vnDate === 'string') {
      // If it's just a date (YYYY-MM-DD), add time 00:00:00 in VN time
      if (vnDate.length === 10) {
         // Parse as VN time (UTC+7) midnight
         // Create date in UTC, then subtract 7 hours to get VN time
         date = new Date(vnDate + 'T00:00:00')
         // Subtract 7 hours to convert VN time to UTC
         date = new Date(date.getTime() - VIETNAM_TIMEZONE_OFFSET)
      } else {
         // If it has time, parse it
         date = new Date(vnDate)
         // Subtract 7 hours to convert VN time to UTC
         date = new Date(date.getTime() - VIETNAM_TIMEZONE_OFFSET)
      }
   } else {
      // If it's already a Date object, assume it's in VN time
      date = new Date(vnDate.getTime() - VIETNAM_TIMEZONE_OFFSET)
   }

   return date.toISOString()
}

/**
 * Convert UTC to Vietnam time (UTC+7)
 * @param {string|Date} utcDate - ISO string or Date object in UTC
 * @returns {string} Date string in VN time format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 */
export const utcToVNTime = (utcDate, includeTime = false) => {
   if (!utcDate) return null

   const date = new Date(utcDate)
   // Add 7 hours to convert UTC to VN time
   const vnDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET)

   if (includeTime) {
      // Return with time: YYYY-MM-DDTHH:mm:ss
      return vnDate.toISOString().slice(0, 19)
   } else {
      // Return date only: YYYY-MM-DD
      return vnDate.toISOString().split('T')[0]
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

