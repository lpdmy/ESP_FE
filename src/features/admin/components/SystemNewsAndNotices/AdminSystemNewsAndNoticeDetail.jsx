import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { AlertTriangle, FileText, Calendar, Download, ArrowLeft, Bell, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingOverlay } from '@/common/components/ui/loading';
import { useToast } from '@/common/hooks/useToast';

export default function AdminSystemNewsAndNoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsAndNotice, setNewsAndNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Mock data - sẽ thay thế bằng API call
  const mockNewsAndNotice = {
    id: parseInt(id),
    title: "Lịch thi học kỳ 1 năm học 2024-2025",
    body: `
      <h3>Thông báo lịch thi học kỳ 1 năm học 2024-2025</h3>
      <p>Kính gửi các em học sinh và phụ huynh,</p>
      <p>Nhà trường thông báo lịch thi học kỳ 1 năm học 2024-2025 đã được cập nhật. Các em học sinh vui lòng kiểm tra lịch thi của mình và chuẩn bị tốt cho kỳ thi sắp tới.</p>
      
      <h4>Lịch thi chi tiết:</h4>
      <ul>
        <li><strong>Ngày 15/02/2024:</strong> Thi Toán (8:00 - 10:00)</li>
        <li><strong>Ngày 16/02/2024:</strong> Thi Văn (8:00 - 10:00)</li>
        <li><strong>Ngày 17/02/2024:</strong> Thi Anh (8:00 - 10:00)</li>
        <li><strong>Ngày 18/02/2024:</strong> Thi Lý (8:00 - 10:00)</li>
        <li><strong>Ngày 19/02/2024:</strong> Thi Hóa (8:00 - 10:00)</li>
      </ul>
      
      <h4>Lưu ý quan trọng:</h4>
      <ul>
        <li>Học sinh có mặt tại phòng thi trước 15 phút</li>
        <li>Mang đầy đủ dụng cụ học tập</li>
        <li>Tuân thủ nội quy thi cử</li>
      </ul>
      
      <p>Chúc các em học sinh đạt kết quả tốt trong kỳ thi!</p>
    `,
    announcementType: "exam_schedule",
    isUrgent: false,
    status: "Published",
    createdAt: "2024-01-15T08:00:00Z",
    expiryDate: "2024-02-15T23:59:59Z",
    viewCount: 1250,
    attachments: [
      { name: "Lich_thi_HK1_2024-2025.pdf", url: "#", size: "2.5 MB" },
      { name: "Huong_dan_thi.pdf", url: "#", size: "1.2 MB" },
      { name: "Noi_quy_thi_cu.pdf", url: "#", size: "800 KB" }
    ]
  };

  useEffect(() => {
    const loadNewsAndNotice = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await adminSystemNewsAndNoticeService.getNewsAndNoticeById(id);
        // setNewsAndNotice(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          setNewsAndNotice(mockNewsAndNotice);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast({
          title: "Lỗi",
          description: "Không thể tải chi tiết thông báo",
          variant: "destructive",
        });
      }
    };

    loadNewsAndNotice();
  }, [id, toast]);

  const getNewsAndNoticeTypeLabel = (type) => {
    const types = {
      'exam_schedule': 'Lịch thi',
      'emergency': 'Khẩn cấp',
      'holiday': 'Nghỉ học',
      'general': 'Thông báo'
    };
    return types[type] || 'Thông báo';
  };

  const getNewsAndNoticeTypeColor = (type) => {
    const colors = {
      'exam_schedule': 'bg-blue-100 text-blue-800',
      'emergency': 'bg-red-100 text-red-800',
      'holiday': 'bg-green-100 text-green-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Published': 'bg-green-100 text-green-800',
      'Hidden': 'bg-gray-100 text-gray-800',
      'Draft': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    navigate(`/admin/system-news-and-notices/${id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    toast({
      title: "Thành công",
      description: "Đã xóa thông báo",
    });
    navigate('/admin/system-news-and-notices');
  };

  const handleToggleStatus = () => {
    // TODO: Implement toggle status functionality
    toast({
      title: "Thành công",
      description: `Đã ${newsAndNotice.status === 'Published' ? 'ẩn' : 'hiển thị'} thông báo`,
    });
  };

  const handleDownload = (attachment) => {
    // TODO: Implement download functionality
    toast({
      title: "Thông báo",
      description: `Đang tải xuống ${attachment.name}`,
    });
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Đang tải chi tiết thông báo..." />;
  }

  if (error || !newsAndNotice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông báo</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/admin/system-news-and-notices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/system-news-and-notices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className={newsAndNotice.status === 'Published' ? 'text-orange-600' : 'text-green-600'}
          >
            {newsAndNotice.status === 'Published' ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ẩn
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Hiển thị
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* NewsAndNotice Detail */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {newsAndNotice.isUrgent ? (
                <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              ) : (
                <Bell className="h-6 w-6 text-blue-600" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{newsAndNotice.title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={getNewsAndNoticeTypeColor(newsAndNotice.announcementType)}>
                {getNewsAndNoticeTypeLabel(newsAndNotice.announcementType)}
              </Badge>
              {newsAndNotice.isUrgent && (
                <Badge variant="destructive" className="animate-pulse">
                  Khẩn cấp
                </Badge>
              )}
              <Badge className={getStatusColor(newsAndNotice.status)}>
                {newsAndNotice.status === 'Published' ? 'Đang hiển thị' : 'Đã ẩn'}
              </Badge>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ngày đăng: {format(new Date(newsAndNotice.createdAt), 'dd/MM/yyyy HH:mm')}
              </div>
              {newsAndNotice.expiryDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Hết hạn: {format(new Date(newsAndNotice.expiryDate), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Lượt xem: {newsAndNotice.viewCount?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: newsAndNotice.body }}
              className="text-gray-700 leading-relaxed"
            />
          </div>

          {/* Attachments */}
          {newsAndNotice.attachments && newsAndNotice.attachments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tệp đính kèm</h3>
              <div className="space-y-3">
                {newsAndNotice.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-500">{attachment.size}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownload(attachment)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
