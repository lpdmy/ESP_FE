import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar,
  ArrowLeft,
  File,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { LoadingOverlay } from '@/common/components/ui/loading';
import { useToast } from '@/common/hooks/useToast';
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

export default function SystemNewsAndNoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsAndNotice, setNewsAndNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Mock data - sẽ thay thế bằng API call
  const mockNewsAndNotice = {
    id: "1",
    title: "Lịch thi cuối kỳ 1",
    type: "exam",
    content: `<h1>Lịch thi cuối kỳ 1</h1>
<p>Lịch thi cuối kỳ 1 sẽ diễn ra từ ngày <strong>15/11 đến 30/11/2024</strong>. Các em vui lòng chuẩn bị tốt cho kỳ thi này.</p>

<h2>Chi tiết lịch thi:</h2>
<p><strong>Ngày 15/11:</strong> Toán, Lý</p>
<p><strong>Ngày 16/11:</strong> Hóa, Sinh</p>
<p><strong>Ngày 17/11:</strong> Văn, Sử</p>
<p><strong>Ngày 18/11:</strong> Địa, GDCD</p>

<h3>Các em học sinh cần:</h3>
<p>1. Chuẩn bị đầy đủ dụng cụ học tập</p>
<p>2. Có mặt tại phòng thi trước <u>15 phút</u></p>
<p>3. Tuân thủ quy định thi cử</p>

<hr>

<p><em>Chúc các em thi tốt!</em></p>`,
    isUrgent: false,
    createdDate: "20/10/2024",
    expiryDate: "15/11/2024",
    files: [
      { name: "Lich_thi_cuoi_ky_1.pdf", size: 2048000 },
      { name: "Quy_dinh_thi.pdf", size: 1024000 }
    ],
  };

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
    const loadNewsAndNotice = async () => {
      try {
        setLoading(true);
        // TODO: Thay thế bằng API call thực tế
        // const response = await systemNewsAndNoticeService.getNewsAndNoticeById(id);
        // setNewsAndNotice(response.data);
        
        // Using mock data for now
        setNewsAndNotice(mockNewsAndNotice);
      } catch (error) {
        console.error('Error loading news and notice:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông báo",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNewsAndNotice();
  }, [id, toast]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file type info (icon, color, label)
  const getFileTypeInfo = (file) => {
    const fileName = file.url || file.name || '';
    const extension = fileName.split('.').pop().toLowerCase();

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
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
      label: extension.toUpperCase() || 'FILE',
      isImage: false
    };
  };

  // Check if file is an image
  const isImageFile = (file) => {
    const fileName = file.url || file.name || '';
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const handleDownload = (file) => {
    // TODO: Implement download functionality
    toast({
      title: "Thông báo",
      description: `Đang tải xuống ${file.name}`,
    });
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Đang tải thông báo..." />;
  }

  if (!newsAndNotice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông báo</h2>
            <p className="text-gray-600 mb-4">Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate('/system-news-and-notices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/system-news-and-notices')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>

        {/* NewsAndNotice Detail */}
        <Card className="p-8">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              {newsAndNotice.isUrgent ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <FileText className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{newsAndNotice.title}</h1>
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
          <Card className="p-4 bg-gray-50 mb-6">
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung</h2>
            <style>{richTextStyles}</style>
            <div className="rich-content text-gray-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: newsAndNotice.content }} />
            </div>
          </div>

          {/* Attachments - Separate Images and Files */}
          {newsAndNotice.files && newsAndNotice.files.length > 0 && (
            <div className="space-y-6">
              {/* Image Attachments - Display Large */}
              {newsAndNotice.files.filter(file => isImageFile(file)).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Hình ảnh ({newsAndNotice.files.filter(file => isImageFile(file)).length})
                  </h2>
                  <div className="space-y-4">
                    {newsAndNotice.files.filter(file => isImageFile(file)).map((file, index) => (
                      <div key={`image-${index}`} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="w-full h-auto max-h-[600px] object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Attachments - Display as Cards */}
              {newsAndNotice.files.filter(file => !isImageFile(file)).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Tài liệu đính kèm ({newsAndNotice.files.filter(file => !isImageFile(file)).length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newsAndNotice.files.filter(file => !isImageFile(file)).map((file, index) => {
                      const fileInfo = getFileTypeInfo(file);
                      const IconComponent = fileInfo.icon;

                      return (
                        <Card key={`file-${index}`} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            {/* File Icon */}
                            <div className={`flex-shrink-0 w-20 h-20 rounded-lg ${fileInfo.color} flex flex-col items-center justify-center`}>
                              <IconComponent className="h-7 w-7" />
                              <span className="text-xs font-medium mt-1">{fileInfo.label}</span>
                            </div>
                            
                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 mt-2"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6  mt-8">
            <Button variant="outline" onClick={() => navigate('/system-news-and-notices')}>
              Quay lại
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Đã hiểu
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
