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
  Clock
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
  }, [getPublicAnnouncements]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearErrors();
    }
  }, [error, toast, clearErrors]);

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

                {/* Attachments */}
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">File đính kèm:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {announcement.attachments.map((attachment, index) => (
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
