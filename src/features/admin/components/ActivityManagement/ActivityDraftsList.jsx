"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  FileText,
  Copy,
  Eye,
  Calendar,
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "@/features/activities/services/activity.service";
import { LoadingCard } from "@/common/components/ui/loading";

const getSubTypeLabel = (subType) => {
  const subTypeMap = {
    SportsFestival: "Hội thao",
    CreativeContest: "Cuộc thi sáng tạo",
    SeminarWorkshop: "Hội thảo / Workshop",
    Other: "Khác",
  };
  return subTypeMap[subType] || subType || "-";
};

export default function ActivityDraftsList() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        toast.error("Vui lòng đăng nhập lại");
        return;
      }
      
      console.log("Fetching drafts with token:", token.substring(0, 20) + "...");
      console.log("Filters:", { pageNumber, pageSize, search: searchQuery, sortBy: "UpdatedAt", sortDescending: true });
      
      const response = await executeApiCall(
        activityService.getDrafts.bind(activityService),
        [
          {
            pageNumber,
            pageSize,
            search: searchQuery || null,
            sortBy: "UpdatedAt",
            sortDescending: true,
          },
          token,
        ],
        { setLoading, setError: () => {} }
      );
      
      console.log("Drafts response:", response);

      if (response?.data?.data) {
        setDrafts(response.data.data.data || []);
        setTotalCount(response.data.data.totalCount || 0);
        setTotalPages(response.data.data.totalPages || 0);
      } else {
        // Nếu không có data, set empty
        setDrafts([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
      toast.error("Không thể tải danh sách bản nháp");
      // Set empty để tránh crash
      setDrafts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [pageNumber, pageSize, searchQuery]);

  const handleDelete = (draft) => {
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!draftToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await executeApiCall(
        activityService.deleteDraft.bind(activityService),
        [draftToDelete.id, token],
        { setLoading: () => {}, setError: () => {} }
      );

      toast.success("Đã xóa bản nháp thành công");
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
      fetchDrafts();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Không thể xóa bản nháp");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (draftId) => {
    navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?draftId=${draftId}`);
  };

  const handleConvertToActivity = async (draftId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await executeApiCall(
        activityService.convertDraftToActivity.bind(activityService),
        [draftId, token],
        { setLoading, setError: () => {} }
      );

      console.log("Convert draft response:", response);
      
      // Check different response structures
      if (response?.data?.data || response?.data) {
        toast.success("Đã tạo hoạt động từ bản nháp thành công");
        // Refresh drafts list
        await fetchDrafts();
        // Navigate to activities list after a short delay
        setTimeout(() => {
          navigate("/admin/activities");
        }, 500);
      } else {
        toast.error("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error converting draft:", error);
      toast.error(error?.response?.data?.message || "Không thể tạo hoạt động từ bản nháp");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/activities")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold mb-2">Bản nháp hoạt động</h1>
          <p className="text-gray-600">Quản lý và tiếp tục chỉnh sửa các bản nháp</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm bản nháp..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPageNumber(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => navigate(ROUTES.ADMIN.CREATE_ACTIVITY)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Tạo mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drafts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bản nháp ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingCard text="Đang tải danh sách bản nháp..." />
            ) : drafts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Chưa có bản nháp nào</p>
                <Button
                  onClick={() => navigate(ROUTES.ADMIN.CREATE_ACTIVITY)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tạo bản nháp mới
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên bản nháp</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Phân loại</TableHead>
                        <TableHead>Ngày cập nhật</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drafts.map((draft) => (
                        <TableRow key={draft.id}>
                          <TableCell className="font-medium">
                            {draft.draftName || "Bản nháp không tên"}
                          </TableCell>
                          <TableCell>{draft.title || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {getSubTypeLabel(draft.subType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(draft.updatedAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(draft.id)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleConvertToActivity(draft.id)}
                                title="Tạo hoạt động"
                              >
                                <Copy className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(draft)}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Trang {pageNumber}/{totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(pageNumber - 1)}
                        disabled={pageNumber === 1}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(pageNumber + 1)}
                        disabled={pageNumber === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa bản nháp</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa bản nháp này không? Hành động này không thể hoàn tác.
                {draftToDelete && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">
                      {draftToDelete.draftName || draftToDelete.title || "Bản nháp không tên"}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

