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
  const [shouldCheckAnnouncements, setShouldCheckAnnouncements] = useState(false);
  
  const { user } = useSelector(state => state.user);
  const { publicAnnouncements, getPublicAnnouncements, getUnviewedAnnouncements } = useSystemAnnouncements();
  const location = useLocation();

  // Check if user should see announcements when they log in
  useEffect(() => {
    // Only check if user is actually logged in and haven't checked yet
    if (user && user.id && !hasCheckedOnce) {
      // Skip if on admin pages
      if (location.pathname.startsWith('/admin')) {
        setHasCheckedOnce(true);
        return;
      }
      
      // Only show modal for Students and Teachers, not Admins
      // Backend returns role as number: 0 = Admin, 2 = Teacher, 4 = Student
      const isAdmin = user.role === ROLE.ADMIN || 
                     user.role === 0 ||
                     user.role === 'Admin' ||
                     user.roles?.includes('Admin') || 
                     user.roles?.some(role => role.name === 'Admin' || role === 0);
      
      if (isAdmin) {
        setHasCheckedOnce(true);
        return;
      }
      
      // Trigger announcement fetch
      getPublicAnnouncements();
      setShouldCheckAnnouncements(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasCheckedOnce, location.pathname]);

  // Watch for publicAnnouncements to be loaded and check for unviewed
  useEffect(() => {
    if (shouldCheckAnnouncements && publicAnnouncements.length > 0 && !hasCheckedOnce) {
      // Get unviewed announcements for this user
      const unviewed = getUnviewedAnnouncements(user?.id);
      
      if (unviewed && unviewed.length > 0) {
        setShowModal(true);
      }
      
      setHasCheckedOnce(true);
      setShouldCheckAnnouncements(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldCheckAnnouncements, publicAnnouncements, hasCheckedOnce]);

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
      console.log('🚨 Urgent announcement received:', announcement);
      
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
      
      // Show modal immediately
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
      setShouldCheckAnnouncements(false);
    }
  }, [user]);

  const handleCloseModal = () => {
    setShowModal(false);
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
