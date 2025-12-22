import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SystemNewsAndNoticesModal from '@/common/components/SystemNewsAndNoticesModal';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';
import { ROLE } from '@/common/constants/roles';
import { connectNotificationHub } from '@/features/notifications/services/signalr/notificationHub';

export default function SystemAnnouncementProvider({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const { user } = useSelector(state => state.user);
  const { publicAnnouncements, getPublicAnnouncements, getUnviewedAnnouncements } = useSystemAnnouncements();
  const location = useLocation();

  // Get check status from localStorage
  const getCheckStatus = () => {
    if (!user?.id) return false;
    const checkKey = `announcement_checked_${user.id}`;
    const sessionKey = `announcement_session_${user.id}`;
    const currentSession = sessionStorage.getItem('sessionId') || Date.now().toString();
    
    // Check if checked in this session
    const checkedInSession = sessionStorage.getItem(checkKey) === currentSession;
    const lastSession = sessionStorage.getItem(sessionKey);
    
    // If new session or never checked, allow check
    if (!lastSession || lastSession !== currentSession) {
      sessionStorage.setItem(sessionKey, currentSession);
      return false; // Allow check
    }
    
    return checkedInSession;
  };

  // Check if user should see announcements when they log in
  useEffect(() => {
    // Only check if user is actually logged in and haven't checked yet
    if (user && user.id && !hasCheckedOnce && !isChecking) {
      // Skip if on admin pages
      if (location.pathname.startsWith('/admin')) {
        setHasCheckedOnce(true);
        return;
      }
      
      // Only show modal for Students and Teachers, not Admins
      const isAdmin = user.role === ROLE.ADMIN || 
                     user.role === 0 ||
                     user.role === 'Admin' ||
                     user.roles?.includes('Admin') || 
                     user.roles?.some(role => role.name === 'Admin' || role === 0);
      
      if (isAdmin) {
        setHasCheckedOnce(true);
        return;
      }
      
      // Check if already checked in this session
      if (getCheckStatus()) {
        setHasCheckedOnce(true);
        return;
      }
      
      setIsChecking(true);
      // Trigger announcement fetch
      getPublicAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasCheckedOnce, location.pathname]);

  // Watch for publicAnnouncements to be loaded and check for unviewed (only once)
  useEffect(() => {
    if (isChecking && publicAnnouncements.length > 0 && !hasCheckedOnce && user?.id) {
      // Get unviewed announcements for this user
      const unviewed = getUnviewedAnnouncements(user.id);
      
      if (unviewed && unviewed.length > 0) {
        setShowModal(true);
      }
      
      // Mark as checked in this session
      const currentSession = sessionStorage.getItem('sessionId') || Date.now().toString();
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', currentSession);
      }
      const checkKey = `announcement_checked_${user.id}`;
      sessionStorage.setItem(checkKey, currentSession);
      
      setHasCheckedOnce(true);
      setIsChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, publicAnnouncements, hasCheckedOnce, user?.id]);

  // Listen for urgent announcement notifications via SignalR
  useEffect(() => {
    if (!user || !user.id) return;

    // Connect to notification hub
    let connection = null;
    const setupSignalR = async () => {
      try {
        connection = await connectNotificationHub(user.id, () => {
          // Handle regular notifications if needed
        });
      } catch (error) {
        console.error('Error connecting to notification hub:', error);
      }
    };

    setupSignalR();

    // Listen for urgent announcement custom event
    const handleUrgentAnnouncement = async (event) => {
      const announcement = event.detail;
      
      // Skip if user is admin or on admin pages
      const isAdmin = user.role === ROLE.ADMIN || 
                     user.role === 0 ||
                     user.role === 'Admin' ||
                     user.roles?.includes('Admin') || 
                     user.roles?.some(role => role.name === 'Admin' || role === 0);
      
      if (isAdmin || location.pathname.startsWith('/admin')) {
        return;
      }

      // Refresh public announcements to get the latest data
      await getPublicAnnouncements();
      
      // Show modal immediately for urgent announcements (bypass session check)
      setShowModal(true);
    };

    window.addEventListener('urgentAnnouncement', handleUrgentAnnouncement);

    return () => {
      window.removeEventListener('urgentAnnouncement', handleUrgentAnnouncement);
    };
  }, [user, location.pathname, getPublicAnnouncements]);

  // Reset modal when user logs out
  useEffect(() => {
    if (!user) {
      setShowModal(false);
      setHasCheckedOnce(false);
      setIsChecking(false);
    }
  }, [user]);

  const handleCloseModal = () => {
    setShowModal(false);
    // Mark as checked when user closes modal
    if (user?.id) {
      const currentSession = sessionStorage.getItem('sessionId') || Date.now().toString();
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', currentSession);
      }
      const checkKey = `announcement_checked_${user.id}`;
      sessionStorage.setItem(checkKey, currentSession);
      setHasCheckedOnce(true);
    }
  };

  return (
    <>
      {children}
      <SystemNewsAndNoticesModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
      />
    </>
  );
}
