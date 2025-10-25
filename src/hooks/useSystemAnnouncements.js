import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
   fetchAllAnnouncements,
   fetchAnnouncementById,
   createAnnouncement,
   updateAnnouncement,
   deleteAnnouncement,
   toggleAnnouncementVisibility,
   fetchPublicAnnouncements,
   markAnnouncementAsViewed,
   clearError,
   clearCurrentAnnouncement,
   setPagination,
   markAsViewedLocally
} from '../store/slices/systemAnnouncementsSlice';

export const useSystemAnnouncements = () => {
   const dispatch = useDispatch();
   const {
      announcements,
      currentAnnouncement,
      publicAnnouncements,
      pagination,
      loading,
      error,
      viewedAnnouncements
   } = useSelector(state => state.systemAnnouncements);

   // Admin functions
   const getAllAnnouncements = useCallback((params) => {
      dispatch(fetchAllAnnouncements(params));
   }, [dispatch]);

   const getAnnouncementById = useCallback((id) => {
      dispatch(fetchAnnouncementById(id));
   }, [dispatch]);

   const createNewAnnouncement = useCallback((formData) => {
      return dispatch(createAnnouncement(formData));
   }, [dispatch]);

   const updateExistingAnnouncement = useCallback((id, formData) => {
      return dispatch(updateAnnouncement({ id, formData }));
   }, [dispatch]);

   const deleteExistingAnnouncement = useCallback((id) => {
      return dispatch(deleteAnnouncement(id));
   }, [dispatch]);

   const toggleVisibility = useCallback((id) => {
      return dispatch(toggleAnnouncementVisibility(id));
   }, [dispatch]);

   // User functions
   const getPublicAnnouncements = useCallback(() => {
      // Only fetch if we don't have data yet
      if (publicAnnouncements.length === 0 && !loading) {
         dispatch(fetchPublicAnnouncements());
      }
   }, [dispatch, publicAnnouncements.length, loading]);

   const markAsViewed = useCallback((announcementId, userId) => {
      if (userId) {
         dispatch(markAnnouncementAsViewed(announcementId));
         dispatch(markAsViewedLocally({ userId: userId, announcementId }));
      } else {
         console.error('No userId provided to mark as viewed');
      }
   }, [dispatch]);

   // Utility functions
   const clearErrors = useCallback(() => {
      dispatch(clearError());
   }, [dispatch]);

   const clearCurrent = useCallback(() => {
      dispatch(clearCurrentAnnouncement());
   }, [dispatch]);

   const updatePagination = useCallback((params) => {
      dispatch(setPagination(params));
   }, [dispatch]);

   // Helper functions
   const isAnnouncementViewed = useCallback((id) => {
      return viewedAnnouncements.includes(id);
   }, [viewedAnnouncements]);

   const getUnviewedAnnouncements = useCallback((userId = null) => {
      if (!userId) {
         return [];
      }

      // Get from localStorage to ensure we have latest data
      const viewedFromStorage = JSON.parse(localStorage.getItem('viewedAnnouncements') || '{}');
      const userViewed = viewedFromStorage[userId] || {};

      const unviewed = publicAnnouncements.filter(announcement => {
         return !userViewed[announcement.id];
      });

      return unviewed;
   }, [publicAnnouncements, viewedAnnouncements]);

   const getUrgentAnnouncements = useCallback(() => {
      return publicAnnouncements.filter(announcement => announcement.isUrgent);
   }, [publicAnnouncements]);

   return {
      // State
      announcements,
      currentAnnouncement,
      publicAnnouncements,
      pagination,
      loading,
      error,
      viewedAnnouncements,

      // Admin actions
      getAllAnnouncements,
      getAnnouncementById,
      createNewAnnouncement,
      updateExistingAnnouncement,
      deleteExistingAnnouncement,
      toggleVisibility,

      // User actions
      getPublicAnnouncements,
      markAsViewed,

      // Utility actions
      clearErrors,
      clearCurrent,
      updatePagination,

      // Helper functions
      isAnnouncementViewed,
      getUnviewedAnnouncements,
      getUrgentAnnouncements
   };
};
