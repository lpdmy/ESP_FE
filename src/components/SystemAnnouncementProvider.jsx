import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SystemNewsAndNoticesModal from '@/common/components/SystemNewsAndNoticesModal';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function SystemAnnouncementProvider({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [mockAnnouncements, setMockAnnouncements] = useState([]);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  
  const { user } = useSelector(state => state.user);
  const { getPublicAnnouncements, getUnviewedAnnouncements } = useSystemAnnouncements();
  const location = useLocation();

  // Check announcements when user logs in
  useEffect(() => {
    const checkForAnnouncements = async () => {
      console.log('🔍 SystemAnnouncementProvider useEffect triggered');
      console.log('👤 User state:', user);
      
      // Only check if user is actually logged in and haven't checked yet
      if (user && user.id && !hasCheckedOnce) {
        console.log('🔍 User object:', user);
        console.log('🔍 User role:', user.role);
        console.log('🔍 User roles:', user.roles);
        console.log('🔍 Current path:', location.pathname);
        
        // Skip if on admin pages
        if (location.pathname.startsWith('/admin')) {
          console.log('👑 On admin page - skipping announcement modal');
          setHasCheckedOnce(true);
          return;
        }
        
        // Only show modal for Students and Teachers, not Admins
        const isAdmin = user.role === 'Admin' || 
                       user.roles?.includes('Admin') || 
                       user.roles?.some(role => role.name === 'Admin');
        
        if (isAdmin) {
          console.log('👑 Admin user - skipping announcement modal');
          setHasCheckedOnce(true);
          return;
        }
        
        try {
          console.log('🚀 Starting announcement check for user:', user);
          
          // Skip API call for now - use mock data directly
          console.log('🧪 Using mock data directly to avoid API issues');
          
          const mockData = [
            {
              id: 1,
              title: "Thông báo hệ thống",
              content: "Đây là thông báo test từ hệ thống",
              isUrgent: true,
              announcementType: "general",
              createdAt: new Date().toISOString(),
              attachments: []
            },
            {
              id: 2,
              title: "Lịch thi cuối kỳ",
              content: "Lịch thi cuối kỳ sẽ diễn ra từ ngày 15/11 đến 30/11/2024",
              isUrgent: false,
              announcementType: "exam",
              createdAt: new Date().toISOString(),
              attachments: []
            },
            {
              id: 3,
              title: "Thông báo nghỉ học",
              content: "Trường sẽ nghỉ học vào ngày 20/11/2024",
              isUrgent: false,
              announcementType: "holiday",
              createdAt: new Date().toISOString(),
              attachments: []
            }
          ];
          
          setMockAnnouncements(mockData);
          
          if (mockData.length > 0) {
            console.log('🎉 Showing modal with mock data');
            setShowModal(true);
          }
          
          setHasCheckedOnce(true);
        } catch (error) {
          console.error('❌ Error checking announcements:', error);
          setHasCheckedOnce(true);
        }
      } else {
        console.log('⏭️ No user logged in or already checked - skipping check');
      }
    };

    checkForAnnouncements();
  }, [user, hasCheckedOnce, location.pathname]);

  // Reset modal when user logs out
  useEffect(() => {
    if (!user) {
      console.log('🚪 User logged out - closing modal');
      setShowModal(false);
      setHasCheckedOnce(false); // Reset check flag
      setMockAnnouncements([]);
    }
  }, [user]);

  const handleCloseModal = () => {
    console.log('🚪 Closing modal');
    setShowModal(false);
    setMockAnnouncements([]); // Reset mock data
  };

  console.log('🎭 Modal state:', showModal);

  return (
    <>
      {children}
      <SystemNewsAndNoticesModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        mockAnnouncements={mockAnnouncements}
      />
    </>
  );
}
