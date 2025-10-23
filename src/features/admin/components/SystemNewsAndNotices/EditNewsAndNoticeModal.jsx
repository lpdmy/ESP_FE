import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Label } from '@/common/components/ui/label';
import { Switch } from '@/common/components/ui/switch';
import { 
  AlertTriangle, 
  Upload, 
  FileText, 
  Trash2, 
  Calendar,
  X
} from 'lucide-react';
import { useToast } from '@/common/hooks/useToast';
import { LoadingOverlay } from '@/common/components/ui/loading';

export default function EditNewsAndNoticeModal({ isOpen, onClose, newsAndNotice, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    announcementType: 'general',
    isUrgent: false,
    expiryDate: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const announcementTypes = [
    { value: 'exam', label: 'Lịch thi' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'holiday', label: 'Nghỉ học' },
    { value: 'general', label: 'Thông báo chung' }
  ];

  useEffect(() => {
    if (newsAndNotice) {
      setFormData({
        title: newsAndNotice.title || '',
        body: newsAndNotice.body || '',
        announcementType: newsAndNotice.announcementType || 'general',
        isUrgent: newsAndNotice.isUrgent || false,
        expiryDate: newsAndNotice.expiryDate || '',
        attachments: newsAndNotice.attachments || []
      });
    }
  }, [newsAndNotice]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề thông báo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.body.trim()) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng nhập nội dung thông báo",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Thay thế bằng API call thực tế
      // const response = await systemNewsAndNoticeService.updateNewsAndNotice(newsAndNotice.id, formData);
      
      // Mock success
      const updatedNewsAndNotice = {
        ...newsAndNotice,
        ...formData,
        priority: formData.isUrgent ? 'urgent' : 'normal'
      };

      onSuccess(updatedNewsAndNotice);
      
    } catch (error) {
      console.error('Error updating news and notice:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông báo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">Chỉnh sửa thông báo</span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề thông báo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Loại thông báo</Label>
            <select
              id="type"
              value={formData.announcementType}
              onChange={(e) => handleInputChange('announcementType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {announcementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="body">Nội dung thông báo *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={6}
              className="w-full"
            />
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.isUrgent}
              onCheckedChange={(checked) => handleInputChange('isUrgent', checked)}
            />
            <Label className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Thông báo khẩn cấp</span>
            </Label>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Ngày hết hạn (tùy chọn)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Tệp đính kèm</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Kéo thả tệp vào đây hoặc click để chọn
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload').click()}
              >
                Chọn tệp
              </Button>
            </div>
          </div>

          {/* Attachments List */}
          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Tệp đã chọn ({formData.attachments.length})</Label>
              <div className="space-y-2">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? "Đang cập nhật..." : "Cập nhật thông báo"}
            </Button>
          </div>
        </form>

        {loading && <LoadingOverlay isLoading={true} text="Đang cập nhật thông báo..." />}
      </DialogContent>
    </Dialog>
  );
}
