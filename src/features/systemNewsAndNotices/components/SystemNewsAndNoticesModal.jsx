import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar,
  X,
  ChevronRight,
  Check
} from 'lucide-react';
import StatusBadge from '@/common/components/ui/status-badge';

// CSS cho rich text content
const richTextStyles = `
  .rich-content h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    color: #1f2937;
  }
  
  .rich-content h2 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0.875rem 0 0.375rem 0;
    color: #1f2937;
  }
  
  .rich-content h3 {
    font-size: 1.125rem;
    font-weight: bold;
    margin: 0.75rem 0 0.25rem 0;
    color: #1f2937;
  }
  
  .rich-content strong, .rich-content b {
    font-weight: bold;
  }
  
  .rich-content em, .rich-content i {
    font-style: italic;
  }
  
  .rich-content u {
    text-decoration: underline;
  }
  
  .rich-content hr {
    border: none;
    border-top: 1px solid #d1d5db;
    margin: 1rem 0;
  }
  
  .rich-content p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
`;

const SystemNewsAndNoticesModal = ({
  isOpen,
  newsAndNotice,
  currentIndex,
  totalCount,
  onMarkAsViewed,
  onNext,
  onClose,
}) => {
  if (!newsAndNotice) return null;

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleMarkAsViewed = () => {
    onMarkAsViewed(newsAndNotice.id);
    onNext();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Thông báo hệ thống
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {totalCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* NewsAndNotice Content */}
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                {newsAndNotice.isUrgent ? (
                  <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {newsAndNotice.title}
                </h3>
                <div className="flex items-center space-x-2">
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
            <div className="mb-6">
              <style>{richTextStyles}</style>
              <div 
                className="rich-content text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: newsAndNotice.content }}
              />
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
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
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Tệp đính kèm ({newsAndNotice.files.length})
                </p>
                <div className="space-y-2">
                  {newsAndNotice.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentIndex + 1 < totalCount 
                ? `Còn ${totalCount - currentIndex - 1} thông báo chưa xem`
                : 'Đã xem hết thông báo'
              }
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-gray-600"
              >
                Đóng
              </Button>
              {currentIndex + 1 < totalCount ? (
                <Button
                  onClick={onNext}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Tiếp theo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleMarkAsViewed}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Đã xem hết
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemNewsAndNoticesModal;
