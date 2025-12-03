import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Switch } from '@/common/components/ui/switch';
import RichTextEditor from '@/common/components/ui/rich-text-editor';
import CustomDropdown from '@/common/components/ui/custom-dropdown';
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
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function EditNewsAndNoticeModal({ isOpen, onClose, newsAndNotice, onSuccess, loading: isLoadingData }) {
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
  const { updateExistingAnnouncement } = useSystemAnnouncements();

  const announcementTypes = [
    { value: 'exam', label: 'Lịch thi' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'holiday', label: 'Nghỉ học' },
    { value: 'general', label: 'Thông báo chung' }
  ];

  useEffect(() => {
    if (newsAndNotice) {
      // Format expiryDate for datetime-local input
      let expiryDateValue = '';
      if (newsAndNotice.expiryDate) {
        const date = new Date(newsAndNotice.expiryDate);
        // Convert to local datetime string format (YYYY-MM-DDTHH:mm)
        expiryDateValue = date.toISOString().slice(0, 16);
      }
      
      // Map existing attachments from API to form format
      const existingAttachments = (newsAndNotice.attachments || []).map(att => {
        // Extract filename from URL if available
        const fileName = att.fileUrl 
          ? att.fileUrl.split('/').pop().split('?')[0] 
          : `File_${att.id}`;
        
        // Extract file extension
        const extension = fileName.split('.').pop() || '';
        
        return {
          id: att.id || `existing_${Date.now()}_${Math.random()}`,
          name: fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType || att.mime || '',
          size: 0, // Size not available from API
          isExisting: true, // Mark as existing attachment
          attachmentId: att.id // Keep original ID for reference
        };
      });
      
      setFormData({
        title: newsAndNotice.title || '',
        body: newsAndNotice.content || newsAndNotice.body || '',
        announcementType: newsAndNotice.announcementType || 'general',
        isUrgent: newsAndNotice.isUrgent || false,
        expiryDate: expiryDateValue,
        attachments: existingAttachments
      });
    } else {
      // Reset form when modal closes
      setFormData({
        title: '',
        body: '',
        announcementType: 'general',
        isUrgent: false,
        expiryDate: '',
        attachments: []
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
    const fileName = attachment.file 
      ? attachment.file.name 
      : attachment.name || attachment.fileUrl?.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const fileType = attachment.file?.type || attachment.fileType || attachment.mime || '';

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
    // For new files (File objects)
    if (attachment.file && attachment.file.type.startsWith('image/')) {
      return URL.createObjectURL(attachment.file);
    }
    // For existing files from server
    if (attachment.fileUrl) {
      const ext = attachment.fileUrl.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return attachment.fileUrl;
      }
    }
    // Check by fileType/mime
    if (attachment.fileType?.startsWith('image/') || attachment.mime?.startsWith('image/')) {
      return attachment.fileUrl;
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
      toast.showError("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    if (!formData.body.trim()) {
      toast.showError("Vui lòng nhập nội dung thông báo");
      return;
    }

    if (!newsAndNotice || !newsAndNotice.id) {
      toast.showError("Không tìm thấy thông báo để cập nhật");
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for API call
      const submitData = new FormData();
      submitData.append('Id', newsAndNotice.id.toString());
      submitData.append('Title', formData.title);
      submitData.append('Content', formData.body);
      submitData.append('AnnouncementType', formData.announcementType);
      submitData.append('IsUrgent', formData.isUrgent.toString());
      submitData.append('IsVisible', newsAndNotice.isVisible !== undefined ? newsAndNotice.isVisible.toString() : 'true');
      
      if (formData.expiryDate) {
        submitData.append('ExpiryDate', new Date(formData.expiryDate).toISOString());
      }

      // Add new files (only files that are File objects)
      formData.attachments.forEach(attachment => {
        if (attachment.file && attachment.file instanceof File) {
          submitData.append('Files', attachment.file);
        }
      });

      await updateExistingAnnouncement(newsAndNotice.id, submitData);
      
      toast.showSuccess("Cập nhật thông báo thành công");
      onSuccess();
      
    } catch (error) {
      console.error('Error updating news and notice:', error);
      toast.showError(error.message || "Không thể cập nhật thông báo");
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

        {isLoadingData || !newsAndNotice ? (
          <div className="flex items-center justify-center py-12">
            <LoadingOverlay isLoading={true} text="Đang tải thông tin thông báo..." />
          </div>
        ) : (
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
            <CustomDropdown
              options={announcementTypes}
              value={formData.announcementType}
              onChange={(value) => handleInputChange('announcementType', value)}
              placeholder="Chọn loại thông báo"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="body">Nội dung thông báo *</Label>
            <RichTextEditor
              value={formData.body}
              onChange={(value) => handleInputChange('body', value)}
              placeholder="Nhập nội dung thông báo..."
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
            <div className="relative">
              <Input
                id="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
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
                    const displayName = attachment.file 
                      ? attachment.file.name 
                      : attachment.name || attachment.fileUrl?.split('/').pop() || 'Unknown';
                    const displaySize = attachment.size || (attachment.file ? attachment.file.size : 0);
                    const isExisting = attachment.isExisting;

                    return (
                      <div key={attachment.id} className="relative group">
                        <div className={`flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border ${isExisting ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} hover:border-gray-300 transition-colors`}>
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                              {isExisting && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Đã có</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {displaySize > 0 ? formatFileSize(displaySize) : 'File từ server'}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title={isExisting ? "Xóa file đính kèm" : "Xóa file"}
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
          <div className="flex justify-end space-x-3 pt-4 ">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-100-600 text-white" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật thông báo"}
            </Button>
          </div>
        </form>
        )}

        {loading && <LoadingOverlay isLoading={true} text="Đang cập nhật thông báo..." />}
      </DialogContent>
    </Dialog>
  );
}
