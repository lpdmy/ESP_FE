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

export default function SystemNewsAndNotices() {
  const [newsAndNotices, setNewsAndNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsAndNotice, setSelectedNewsAndNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  // Mock data - sẽ thay thế bằng API call
  const mockNewsAndNotices = [
    {
      id: "1",
      title: "Lịch thi cuối kỳ 1",
      type: "exam",
      content: "Lịch thi cuối kỳ 1 sẽ diễn ra từ ngày 15/11 đến 30/11/2024. Các em vui lòng chuẩn bị tốt cho kỳ thi này.",
      isUrgent: false,
      createdDate: "20/10/2024",
      expiryDate: "15/11/2024",
      files: [{ name: "Lich_thi_cuoi_ky_1.pdf", size: 2048000 }],
    },
    {
      id: "2",
      title: "Thông báo khẩn cấp: Lịch nghỉ Tết",
      type: "urgent",
      content: "Lịch nghỉ Tết Nguyên Đán 2025 sẽ từ ngày 25/01 đến 05/02/2025. Tất cả học sinh vui lòng lưu ý.",
      isUrgent: true,
      createdDate: "19/10/2024",
      expiryDate: "31/12/2024",
      files: [],
    },
    {
      id: "3",
      title: "Thông báo chung về cập nhật hệ thống",
      type: "general",
      content: "Hệ thống EduSephia sẽ được cập nhật vào ngày 25/10/2024 lúc 22:00 - 23:00. Trong thời gian này, các em có thể không thể truy cập được hệ thống.",
      isUrgent: false,
      createdDate: "18/10/2024",
      expiryDate: "25/10/2024",
      files: [
        { name: "Huong_dan_su_dung.pdf", size: 1024000 },
        { name: "FAQ.docx", size: 512000 },
      ],
    },
  ];

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

  useEffect(() => {
    const loadNewsAndNotices = async () => {
      try {
        setLoading(true);
        // TODO: Thay thế bằng API call thực tế
        setNewsAndNotices(mockNewsAndNotices);
      } catch (error) {
        console.error('Error loading news and notices:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách thông báo",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNewsAndNotices();
  }, [toast]);

  const handleViewNewsAndNotice = (newsAndNotice) => {
    setSelectedNewsAndNotice(newsAndNotice);
    setIsModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
          {newsAndNotices.map((newsAndNotice) => (
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
                    <StatusBadge variant={typeColors[newsAndNotice.type]}>
                      {typeLabels[newsAndNotice.type]}
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
              <p className="text-gray-700 mb-4 line-clamp-2">{newsAndNotice.content}</p>

              {/* Meta Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Tạo: {newsAndNotice.createdDate}</span>
                </div>
                {newsAndNotice.expiryDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Hết hạn: {newsAndNotice.expiryDate}</span>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {newsAndNotice.files && newsAndNotice.files.length > 0 && (
                <div className="pt-4 ">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tệp đính kèm ({newsAndNotice.files.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {newsAndNotice.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex-shrink-0"
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
