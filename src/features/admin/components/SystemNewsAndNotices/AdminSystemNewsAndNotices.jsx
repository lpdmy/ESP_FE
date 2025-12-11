import React, { useState, useEffect } from 'react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/common/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Trash2, 
  FileText, 
  AlertTriangle
} from 'lucide-react';
import { LoadingOverlay } from '@/common/components/ui/loading';
import { useToast } from '@/common/hooks/useToast';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';
import CreateNewsAndNoticeModal from './CreateNewsAndNoticeModal';
import EditNewsAndNoticeModal from './EditNewsAndNoticeModal';
import StatsCard from '@/common/components/ui/stats-card';
import StatusBadge from '@/common/components/ui/status-badge';

export default function AdminSystemNewsAndNotices() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsAndNotice, setSelectedNewsAndNotice] = useState(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const {
    announcements,
    currentAnnouncement,
    pagination,
    loading,
    error,
    getAllAnnouncements,
    getAnnouncementById,
    deleteExistingAnnouncement,
    toggleVisibility,
    clearErrors
  } = useSystemAnnouncements();

  useEffect(() => {
    getAllAnnouncements({
      pageNumber: 1,
      pageSize: 10,
      search: '',
      sortBy: 'CreatedAt',
      sortDescending: true
    });
  }, [getAllAnnouncements]);

  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearErrors();
    }
  }, [error, toast, clearErrors]);

  const stats = [
    { title: "Tổng thông báo", value: announcements.length, icon: FileText, color: "blue" },
    {
      title: "Khẩn cấp",
      value: announcements.filter((a) => a.isUrgent).length,
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "Đang hiển thị",
      value: announcements.filter((a) => a.isVisible).length,
      icon: Eye,
      color: "green",
    },
    {
      title: "Đã ẩn",
      value: announcements.filter((a) => !a.isVisible).length,
      icon: EyeOff,
      color: "gray",
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

  const handleEdit = async (newsAndNotice) => {
    try {
      // Fetch full details of the announcement
      await getAnnouncementById(newsAndNotice.id);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching announcement details:', error);
      toast.showError("Không thể tải chi tiết thông báo");
    }
  };

  const handleDeleteClick = (newsAndNotice) => {
    setAnnouncementToDelete(newsAndNotice);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;

    try {
      setIsDeleting(true);
      await deleteExistingAnnouncement(announcementToDelete.id);
      toast.showSuccess("Xóa thông báo thành công");
      setIsDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
      
      // Refresh the list
      getAllAnnouncements({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        search: '',
        sortBy: 'CreatedAt',
        sortDescending: true
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.showError(error.message || "Không thể xóa thông báo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  const handleToggleVisibility = async (newsAndNotice) => {
    try {
      await toggleVisibility(newsAndNotice.id);
      toast.showSuccess(newsAndNotice.isVisible ? "Đã ẩn thông báo" : "Đã hiển thị thông báo");
    } catch (error) {
      toast.showError("Không thể thay đổi trạng thái");
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    toast.showSuccess("Tạo thông báo thành công");
    // Refresh the list
    getAllAnnouncements({
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      search: '',
      sortBy: 'CreatedAt',
      sortDescending: true
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedNewsAndNotice(null);
    toast.showSuccess("Cập nhật thông báo thành công");
    // Refresh the list
    getAllAnnouncements({
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      search: '',
      sortBy: 'CreatedAt',
      sortDescending: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} text="Đang tải danh sách thông báo..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo hệ thống</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả thông báo hệ thống</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Tạo thông báo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* NewsAndNotices Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Loại</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ưu tiên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hết hạn</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{announcement.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge variant={typeColors[announcement.announcementType]}>
                      {typeLabels[announcement.announcementType]}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge variant={announcement.isUrgent ? "error" : "secondary"}>
                      {announcement.isUrgent ? "Khẩn cấp" : "Bình thường"}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge variant={announcement.isVisible ? "success" : "secondary"}>
                      {announcement.isVisible ? "Đang hiển thị" : "Đã ẩn"}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(announcement.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {announcement.expiryDate ? formatDate(announcement.expiryDate) : 'Không giới hạn'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(announcement)}
                        title="Chỉnh sửa thông báo"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleToggleVisibility(announcement)}
                        title={announcement.isVisible ? "Ẩn thông báo" : "Hiển thị thông báo"}
                      >
                        {announcement.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(announcement)}
                        title="Xóa thông báo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <CreateNewsAndNoticeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <EditNewsAndNoticeModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNewsAndNotice(null);
        }}
        newsAndNotice={currentAnnouncement}
        onSuccess={handleEditSuccess}
        loading={loading && !currentAnnouncement}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa thông báo
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa thông báo này không? Hành động này không thể hoàn tác.
              {announcementToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">Tiêu đề:</p>
                  <p className="text-sm text-gray-700 mt-1">{announcementToDelete.title}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-6">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa vĩnh viễn
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
