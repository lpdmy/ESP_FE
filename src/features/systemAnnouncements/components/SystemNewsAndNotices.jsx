import React, { useState, useEffect } from 'react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Clock,
  File,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/common/hooks/useToast';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';
import { LoadingOverlay } from '@/common/components/ui/loading';
import Sidebar from "@/features/landing/components/Sidebar";
import RightPanel from "@/features/landing/components/RightPanel";

export default function SystemNewsAndNotices() {
  const toast = useToast();
  
  const {
    publicAnnouncements,
    loading,
    error,
    getPublicAnnouncements,
    markAsViewed,
    clearErrors
  } = useSystemAnnouncements();

  useEffect(() => {
    getPublicAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

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

  const handleMarkAsViewed = async (announcementId) => {
    try {
      await markAsViewed(announcementId);
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Đang tải thông báo..." />;
  }

  return (
    <div className="w-full py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">Thông báo hệ thống</h1>
        <p className="text-gray-600 text-lg">
          Cập nhật các thông báo quan trọng từ nhà trường
        </p>
      </div>

      <div className="w-full px-4">
        <div className="flex gap-8 justify-center">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0 lg:max-w-3xl xl:max-w-3xl">
            {/* Announcements List */}
            <div className="space-y-4">
        {publicAnnouncements.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông báo</h3>
            <p className="text-gray-500">Hiện tại chưa có thông báo nào từ hệ thống.</p>
          </Card>
        ) : (
          publicAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`p-6 transition-all duration-200 hover:shadow-lg ${
                announcement.isUrgent ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      {announcement.isUrgent && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Khẩn cấp</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                      <Badge className={typeColors[announcement.announcementType]}>
                        {typeLabels[announcement.announcementType]}
                      </Badge>
                      {announcement.expiryDate && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className={isExpired(announcement.expiryDate) ? 'text-red-500' : ''}>
                            Hết hạn: {formatDate(announcement.expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsViewed(announcement.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />

                {/* Attachments - Separate Images and Files */}
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="pt-4 space-y-4 border-t">
                    {/* Image Attachments - Display Large */}
                    {announcement.attachments.filter(att => isImageFile(att)).length > 0 && (
                      <div className="space-y-3">
                        {announcement.attachments.filter(att => isImageFile(att)).map((attachment, index) => (
                          <div key={`image-${index}`} className="rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={attachment.fileUrl} 
                              alt={attachment.fileName || 'Image attachment'}
                              className="w-full h-auto max-h-80 object-contain bg-gray-50"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* File Attachments - Display as Cards */}
                    {announcement.attachments.filter(att => !isImageFile(att)).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Tài liệu đính kèm ({announcement.attachments.filter(att => !isImageFile(att)).length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {announcement.attachments.filter(att => !isImageFile(att)).map((attachment, index) => {
                            const fileInfo = getFileTypeInfo(attachment);
                            const IconComponent = fileInfo.icon;

                            return (
                              <div 
                                key={`file-${index}`}
                                className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                {/* File Icon */}
                                <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${fileInfo.color} flex flex-col items-center justify-center`}>
                                  <IconComponent className="h-5 w-5" />
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
              </div>
            </Card>
          ))
        )}
            </div>
          </section>

          {/* Right Panel */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <RightPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
