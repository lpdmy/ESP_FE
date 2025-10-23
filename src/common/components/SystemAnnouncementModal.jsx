import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { AlertTriangle, FileText, Calendar, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/common/hooks/useToast';

export default function SystemAnnouncementModal({ announcement, isOpen, onClose, onMarkViewed }) {
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  const handleClose = () => {
    setIsClosing(true);
    if (onMarkViewed && announcement) {
      onMarkViewed(announcement.id);
    }
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const getAnnouncementTypeLabel = (type) => {
    const types = {
      'exam_schedule': 'Lịch thi',
      'emergency': 'Khẩn cấp',
      'holiday': 'Nghỉ học',
      'general': 'Thông báo'
    };
    return types[type] || 'Thông báo';
  };

  const getAnnouncementTypeColor = (type) => {
    const colors = {
      'exam_schedule': 'bg-blue-100 text-blue-800',
      'emergency': 'bg-red-100 text-red-800',
      'holiday': 'bg-green-100 text-green-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleDownload = (attachment) => {
    // TODO: Implement download functionality
    toast.success(`Đang tải xuống ${attachment.name}`);
  };

  if (!announcement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {announcement.isUrgent ? (
                <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600" />
              )}
              {announcement.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getAnnouncementTypeColor(announcement.announcementType)}>
              {getAnnouncementTypeLabel(announcement.announcementType)}
            </Badge>
            {announcement.isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                Khẩn cấp
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {format(new Date(announcement.createdAt), 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div className="prose max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: announcement.body }}
              className="text-gray-700 leading-relaxed"
            />
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Tệp đính kèm:</h4>
              <div className="space-y-2">
                {announcement.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-xs text-gray-500">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiry Date */}
          {announcement.expiryDate && (
            <div className="text-sm text-gray-600">
              <strong>Hết hạn:</strong> {format(new Date(announcement.expiryDate), 'dd/MM/yyyy HH:mm')}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleClose}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
