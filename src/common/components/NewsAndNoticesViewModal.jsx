import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar,
  X
} from 'lucide-react';
import StatusBadge from '@/common/components/ui/status-badge';

const NewsAndNoticesViewModal = ({ isOpen, onClose, newsAndNotice }) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">Chi tiết thông báo</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {newsAndNotice.isUrgent ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <FileText className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{newsAndNotice.title}</h2>
              <div className="flex items-center space-x-2 mb-4">
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

          {/* Meta Info */}
          <Card className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span><strong>Ngày tạo:</strong> {newsAndNotice.createdDate}</span>
              </div>
              {newsAndNotice.expiryDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span><strong>Hết hạn:</strong> {newsAndNotice.expiryDate}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {newsAndNotice.content}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {newsAndNotice.files && newsAndNotice.files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tệp đính kèm ({newsAndNotice.files.length})
              </h3>
              <div className="space-y-2">
                {newsAndNotice.files.map((file, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Đã hiểu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsAndNoticesViewModal;
