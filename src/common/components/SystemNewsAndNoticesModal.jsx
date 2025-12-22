import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Calendar,
  Download,
  Clock,
  X,
  File,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function SystemNewsAndNoticesModal({ isOpen, onClose }) {
  const {
    publicAnnouncements,
    markAsViewed,
    getUnviewedAnnouncements,
    getUrgentAnnouncements
  } = useSystemAnnouncements();

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [unviewedAnnouncements, setUnviewedAnnouncements] = useState([]);
  
  // Get current user from Redux store
  const { user } = useSelector(state => state.user);

  // Update unviewed list when public announcements change
  useEffect(() => {
    if (isOpen && publicAnnouncements.length > 0 && user?.id) {
      const unviewed = getUnviewedAnnouncements(user.id);
      const urgent = getUrgentAnnouncements();
      
      // Prioritize urgent announcements
      const prioritized = [
        ...urgent.filter(a => !unviewed.some(u => u.id === a.id)),
        ...unviewed
      ];
      
      setUnviewedAnnouncements(prioritized);
      setCurrentAnnouncementIndex(0);
    }
  }, [isOpen, publicAnnouncements, user, getUnviewedAnnouncements, getUrgentAnnouncements]);

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

  // Get file type info (icon, color, label)
  const getFileTypeInfo = (attachment) => {
    const fileName = attachment.fileUrl || '';
    const extension = fileName.split('.').pop().toLowerCase();
    const fileType = attachment.fileType || '';

    // Image files
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return {
        icon: ImageIcon,
        color: 'text-purple-500 bg-purple-50',
        label: extension.toUpperCase(),
        isImage: true
      };
    }

    // Document types
    const fileTypes = {
      pdf: { icon: FileText, color: 'text-red-500 bg-red-50', label: 'PDF' },
      doc: { icon: File, color: 'text-blue-500 bg-blue-50', label: 'DOC' },
      docx: { icon: File, color: 'text-blue-500 bg-blue-50', label: 'DOCX' },
      xls: { icon: FileSpreadsheet, color: 'text-green-500 bg-green-50', label: 'XLS' },
      xlsx: { icon: FileSpreadsheet, color: 'text-green-500 bg-green-50', label: 'XLSX' },
    };

    return fileTypes[extension] || { 
      icon: FileText, 
      color: 'text-gray-500 bg-gray-50', 
      label: extension.toUpperCase() || 'FILE',
      isImage: false
    };
  };

  // Check if file is an image
  const isImageFile = (attachment) => {
    const fileName = attachment.fileUrl || '';
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const handleMarkAsViewed = async () => {
    if (currentAnnouncement && user?.id) {
      try {
        // Mark as viewed via API and localStorage
        markAsViewed(currentAnnouncement.id, user.id);
        
        // Remove from unviewed list
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
      } catch (error) {
        console.error('Error marking as viewed:', error);
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" showCloseButton={false}>
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

          {/* Attachments - Separate Images and Files */}
          {currentAnnouncement.attachments && currentAnnouncement.attachments.length > 0 && (
            <div className="pt-4 space-y-4">
              {/* Image Attachments - Display Large */}
              {currentAnnouncement.attachments.filter(att => isImageFile(att)).length > 0 && (
                <div className="space-y-3">
                  {currentAnnouncement.attachments.filter(att => isImageFile(att)).map((attachment, index) => (
                    <div key={`image-${index}`} className="rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={attachment.fileUrl} 
                        alt={attachment.fileName || 'Image attachment'}
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* File Attachments - Display as Cards */}
              {currentAnnouncement.attachments.filter(att => !isImageFile(att)).length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    File đính kèm ({currentAnnouncement.attachments.filter(att => !isImageFile(att)).length}):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentAnnouncement.attachments.filter(att => !isImageFile(att)).map((attachment, index) => {
                      const fileInfo = getFileTypeInfo(attachment);
                      const IconComponent = fileInfo.icon;

                      return (
                        <div 
                          key={`file-${index}`}
                          className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          {/* File Icon */}
                          <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${fileInfo.color} flex flex-col items-center justify-center`}>
                            <IconComponent className="h-6 w-6" />
                            <span className="text-xs font-medium mt-1">{fileInfo.label}</span>
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.fileName || `${fileInfo.label} File`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.fileType || fileInfo.label}
                            </p>
                          </div>

                          {/* Download Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
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
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
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
