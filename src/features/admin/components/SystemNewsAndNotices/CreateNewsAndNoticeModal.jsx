import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Switch } from '@/common/components/ui/switch';
import CustomDropdown from '@/common/components/ui/custom-dropdown';
import RichTextEditor from '@/common/components/ui/rich-text-editor';
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
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';

export default function CreateNewsAndNoticeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcementType: 'general',
    isUrgent: false,
    expiryDate: '',
    files: []
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { createNewAnnouncement } = useSystemAnnouncements();

  const announcementTypes = [
    { value: 'exam', label: 'Lịch thi' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'holiday', label: 'Nghỉ học' },
    { value: 'general', label: 'Thông báo chung' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.showError("Vui lòng nhập tiêu đề");
      return;
    }

    if (!formData.content.trim()) {
      toast.showError("Vui lòng nhập nội dung");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for API call
      const submitData = new FormData();
      submitData.append('Title', formData.title);
      submitData.append('Content', formData.content);
      submitData.append('AnnouncementType', formData.announcementType);
      submitData.append('IsUrgent', formData.isUrgent);
      
      if (formData.expiryDate) {
        submitData.append('ExpiryDate', new Date(formData.expiryDate).toISOString());
      }

      // Add files
      formData.files.forEach(file => {
        submitData.append('Files', file);
      });

      await createNewAnnouncement(submitData);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        announcementType: 'general',
        isUrgent: false,
        expiryDate: '',
        files: []
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.showError("Không thể tạo thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        content: '',
        announcementType: 'general',
        isUrgent: false,
        expiryDate: '',
        files: []
      });
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Tạo thông báo hệ thống
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full"
              required
            />
          </div>

          {/* Announcement Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Loại thông báo <span className="text-red-500">*</span>
            </Label>
            <CustomDropdown
              options={announcementTypes}
              value={formData.announcementType}
              onChange={(value) => handleInputChange('announcementType', value)}
              placeholder="Chọn loại thông báo"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Nội dung <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="Nhập nội dung thông báo..."
            />
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center space-x-3">
            <Switch
              id="isUrgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => handleInputChange('isUrgent', checked)}
            />
            <Label htmlFor="isUrgent" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Thông báo khẩn cấp</span>
            </Label>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">
              Ngày hết hạn
            </Label>
            <div className="relative">
              <Input
                id="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              File đính kèm
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Chọn file hoặc kéo thả vào đây
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, Word, Excel, JPG, PNG (tối đa 10MB)
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* File List */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Files đã chọn:</h4>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo thông báo'}
            </Button>
          </div>
        </form>

        {loading && <LoadingOverlay isLoading={true} text="Đang tạo thông báo..." />}
      </DialogContent>
    </Dialog>
  );
}