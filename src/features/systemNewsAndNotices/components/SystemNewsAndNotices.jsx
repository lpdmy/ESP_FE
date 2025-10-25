import React, { useState, useEffect } from 'react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar 
} from 'lucide-react';
import { LoadingOverlay } from '@/common/components/ui/loading';
import { useToast } from '@/common/hooks/useToast';
import StatusBadge from '@/common/components/ui/status-badge';
import NewsAndNoticesViewModal from '@/common/components/NewsAndNoticesViewModal';
import Sidebar from "@/features/landing/components/Sidebar";
import RightPanel from "@/features/landing/components/RightPanel";
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function SystemNewsAndNotices() {
  const [selectedNewsAndNotice, setSelectedNewsAndNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  
  const { publicAnnouncements, loading, getPublicAnnouncements } = useSystemAnnouncements();

  const typeLabels = {
    exam: "Lịch thi",
    urgent: "Khẩn cấp",
    holiday: "Nghỉ học",
    general: "Thông báo chung",
  };

  const typeColors = {
    exam: "info",
    urgent: "error",
    holiday: "warning",
    general: "secondary",
  };

  // Fetch announcements on mount
  useEffect(() => {
    getPublicAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewNewsAndNotice = (newsAndNotice) => {
    setSelectedNewsAndNotice(newsAndNotice);
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Đang tải danh sách thông báo..." />;
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
            {/* NewsAndNotices List */}
            <div className="space-y-4">
          {publicAnnouncements.map((newsAndNotice) => (
            <Card
              key={newsAndNotice.id}
              className="p-6 hover-lift cursor-pointer transition-all"
              onClick={() => handleViewNewsAndNotice(newsAndNotice)}
            >
              {/* Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0">
                  {newsAndNotice.isUrgent ? (
                    <AlertTriangle className="h-6 w-6 text-red-500 pulse-orange" />
                  ) : (
                    <FileText className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{newsAndNotice.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <StatusBadge variant={typeColors[newsAndNotice.announcementType]}>
                      {typeLabels[newsAndNotice.announcementType]}
                    </StatusBadge>
                    {newsAndNotice.isUrgent && (
                      <StatusBadge variant="error" animated>
                        Khẩn cấp
                      </StatusBadge>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div 
                className="text-gray-700 mb-4 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: newsAndNotice.content }}
              />

              {/* Meta Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Tạo: {new Date(newsAndNotice.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {newsAndNotice.expiryDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Hết hạn: {new Date(newsAndNotice.expiryDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {newsAndNotice.attachments && newsAndNotice.attachments.length > 0 && (
                <div className="pt-4 ">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tệp đính kèm ({newsAndNotice.attachments.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {newsAndNotice.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.fileType?.toUpperCase()} File
                            </p>
                            <p className="text-xs text-gray-500">{file.fileType}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex-shrink-0"
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
            </div>
          </section>

          {/* Right Panel */}
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <RightPanel />
          </aside>
        </div>
      </div>

      {/* View Modal */}
      {selectedNewsAndNotice && (
        <NewsAndNoticesViewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNewsAndNotice(null);
          }}
          newsAndNotice={selectedNewsAndNotice}
        />
      )}
    </div>
  );
}
