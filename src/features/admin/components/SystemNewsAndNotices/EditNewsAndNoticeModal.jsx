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
  X,    
  File,
  FileSpreadsheet,
  Image as ImageIcon
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
  const [isDragging, setIsDragging] = useState(false);
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
    setFormData(prev => {
      const updates = { [field]: value };
      
      // Tự động set isUrgent = true khi chọn loại "urgent"
      if (field === 'announcementType') {
        if (value === 'urgent') {
          updates.isUrgent = true;
        } else if (prev.announcementType === 'urgent') {
          // Reset isUrgent khi chuyển từ urgent sang loại khác
          updates.isUrgent = false;
        }
      }
      
      return { ...prev, ...updates };
    });
  };

  // Get file type info (icon, color, label)
  const getFileTypeInfo = (attachment) => {
    const fileName = attachment.file ? attachment.file.name : attachment.fileUrl || '';
    const extension = fileName.split('.').pop().toLowerCase();
    const fileType = attachment.file?.type || attachment.fileType || '';

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
      label: extension.toUpperCase(),
      isImage: false
    };
  };

  // Get preview URL (for new files or existing images)
  const getPreviewUrl = (attachment) => {
    if (attachment.file && attachment.file.type.startsWith('image/')) {
      return URL.createObjectURL(attachment.file);
    }
    if (attachment.fileUrl) {
      const ext = attachment.fileUrl.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return attachment.fileUrl;
      }
    }
    return null;
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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
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

          {/* Urgent Toggle - Ẩn khi đã chọn loại "Khẩn cấp" */}
          {formData.announcementType !== 'urgent' && (
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
          )}

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

          {/* File Upload with Drag & Drop */}
          <div className="space-y-2">
            <Label>Tệp đính kèm</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="mt-4">
                  <label htmlFor="file-upload-edit" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Chọn file hoặc kéo thả vào đây
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, Word, Excel, JPG, PNG (tối đa 10MB)
                    </span>
                  </label>
                  <input
                    id="file-upload-edit"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* Attachments List with Preview */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                <Label>Tệp đã chọn ({formData.attachments.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.attachments.map((attachment) => {
                    const fileInfo = getFileTypeInfo(attachment);
                    const previewUrl = getPreviewUrl(attachment);
                    const IconComponent = fileInfo.icon;
                    const displayName = attachment.file ? attachment.file.name : attachment.name || 'Unknown';
                    const displaySize = attachment.size;

                    return (
                      <div key={attachment.id} className="relative group">
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          {/* Preview/Icon */}
                          {previewUrl ? (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img 
                                src={previewUrl} 
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${fileInfo.color} flex flex-col items-center justify-center`}>
                              <IconComponent className="h-6 w-6" />
                              <span className="text-xs font-medium mt-1">{fileInfo.label}</span>
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(displaySize)}</p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              {loading ? "Đang cập nhật..." : "Cập nhật thông báo"}
            </Button>
          </div>
        </form>

        {loading && <LoadingOverlay isLoading={true} text="Đang cập nhật thông báo..." />}
      </DialogContent>
    </Dialog>
  );
}
