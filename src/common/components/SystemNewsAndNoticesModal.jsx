import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Calendar,
  Download,
  Clock,
  X
} from 'lucide-react';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function SystemNewsAndNoticesModal({ isOpen, onClose, mockAnnouncements = [] }) {
  const {
    publicAnnouncements,
    getPublicAnnouncements,
    markAsViewed,
    getUnviewedAnnouncements,
    getUrgentAnnouncements
  } = useSystemAnnouncements();

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [unviewedAnnouncements, setUnviewedAnnouncements] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (mockAnnouncements.length > 0) {
        // Use mock data when API fails
        console.log('🧪 Using mock announcements:', mockAnnouncements);
        setUnviewedAnnouncements(mockAnnouncements);
        setCurrentAnnouncementIndex(0);
      } else {
        // Use real API data
        getPublicAnnouncements();
      }
    }
  }, [isOpen, getPublicAnnouncements, mockAnnouncements]);

  useEffect(() => {
    if (publicAnnouncements.length > 0) {
      const unviewed = getUnviewedAnnouncements();
      const urgent = getUrgentAnnouncements();
      
      // Prioritize urgent announcements
      const prioritized = [...urgent.filter(a => !a.viewed), ...unviewed.filter(a => !urgent.includes(a))];
      setUnviewedAnnouncements(prioritized);
      setCurrentAnnouncementIndex(0);
    }
  }, [publicAnnouncements, getUnviewedAnnouncements, getUrgentAnnouncements]);

  const currentAnnouncement = unviewedAnnouncements[currentAnnouncementIndex];

  const typeLabels = {
    exam: "Lịch thi",
    urgent: "Khẩn cấp",
    holiday: "Nghỉ học",
    general: "Thông báo chung",
  };

  const typeColors = {
    exam: "bg-blue-100 text-blue-800",
    urgent: "bg-red-100 text-red-800",
    holiday: "bg-yellow-100 text-yellow-800",
    general: "bg-gray-100 text-gray-800",
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsViewed = async () => {
    if (currentAnnouncement) {
      try {
        console.log('📝 Marking announcement as viewed:', currentAnnouncement.id);
        
        if (mockAnnouncements.length > 0) {
          // Handle mock data - just remove from list
          console.log('🧪 Mock data - removing from unviewed list');
          const updatedUnviewed = unviewedAnnouncements.filter(
            ann => ann.id !== currentAnnouncement.id
          );
          setUnviewedAnnouncements(updatedUnviewed);
          
          // Move to next announcement or close
          if (updatedUnviewed.length === 0) {
            handleClose();
          } else if (currentAnnouncementIndex >= updatedUnviewed.length) {
            setCurrentAnnouncementIndex(updatedUnviewed.length - 1);
          }
        } else {
          // Handle real API data
          await markAsViewed(currentAnnouncement.id);
          
          // Refresh unviewed list
          const updatedUnviewed = getUnviewedAnnouncements();
          setUnviewedAnnouncements(updatedUnviewed);
          
          if (updatedUnviewed.length === 0) {
            handleClose();
          } else if (currentAnnouncementIndex >= updatedUnviewed.length) {
            setCurrentAnnouncementIndex(updatedUnviewed.length - 1);
          }
        }
      } catch (error) {
        console.error('❌ Error marking as viewed:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentAnnouncementIndex < unviewedAnnouncements.length - 1) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentAnnouncementIndex > 0) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex - 1);
    }
  };

  const handleClose = () => {
    setCurrentAnnouncementIndex(0);
    setUnviewedAnnouncements([]);
    onClose();
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  if (!isOpen || !currentAnnouncement) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Thông báo hệ thống
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentAnnouncementIndex + 1} / {unviewedAnnouncements.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Announcement Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentAnnouncement.title}
              </h3>
              {currentAnnouncement.isUrgent && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Khẩn cấp</span>
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(currentAnnouncement.createdAt)}</span>
              </div>
              <Badge className={typeColors[currentAnnouncement.announcementType]}>
                {typeLabels[currentAnnouncement.announcementType]}
              </Badge>
              {currentAnnouncement.expiryDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Hết hạn: {formatDate(currentAnnouncement.expiryDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
          />

          {/* Attachments */}
          {currentAnnouncement.attachments && currentAnnouncement.attachments.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">File đính kèm:</h4>
              <div className="space-y-2">
                {currentAnnouncement.attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attachment.fileType?.toUpperCase()} File
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.fileType}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              {currentAnnouncementIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Trước
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleMarkAsViewed}
              >
                Đã xem
              </Button>
              {currentAnnouncementIndex < unviewedAnnouncements.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Đóng
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
