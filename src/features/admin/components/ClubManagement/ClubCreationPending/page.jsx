import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
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
import { SimpleSelect } from "@/common/components/ui/select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Search,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { useClubApi } from "@/features/landing/club/hooks/useClubApi";
import { useToast } from "@/common/hooks/useToast";

export default function ClubApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortField, setSortField] = useState("submittedDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState(-1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const { getClubJoinCreation, approveCreation, rejectCreation } = useClubApi();
  const toast = useToast();
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const toggleMenu = (id) => {
    setOpenMenuId((curr) => (curr === id ? null : id));
  };
  const getStatusBadge = (status) => {
    let colorClass = "";
    let label = "";

    switch (status?.toLowerCase()) {
      case "approved":
        colorClass = "bg-green-100 text-green-700 border border-green-400";
        label = "Đã duyệt";
        break;
      case "pending":
        colorClass = "bg-yellow-100 text-yellow-700 border border-yellow-400";
        label = "Chờ duyệt";
        break;
      case "rejected":
        colorClass = "bg-red-100 text-red-700 border border-red-400";
        label = "Từ chối";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-700 border border-gray-300";
        label = status || "Không xác định";
        break;
    }

    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // ⏳ delay 0.5s sau khi người dùng ngừng gõ

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const handleJoinCreation = async () => {
    try {
      const resposne = await getClubJoinCreation(
        pageNumber,
        pageSize,
        debouncedSearch,
        status === -1 ? null : status
      );
      
      const data = resposne.data.data;
      setRequests(data);
        console.log(status)
      const total = resposne.data.totalCount || data.length;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
      
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    
    handleJoinCreation();
  }, [pageNumber, status, debouncedSearch]);
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setIsDetailDialogOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await approveCreation(id);
      toast.approveCreationSucces;
      handleJoinCreation();
    } catch (err) {
      console.log(err);
      toast.approveCreationFail;
    } finally {
      setIsDetailDialogOpen(false);
    }
  };

  const handleReject = async (id) => {
    try {
      const payload = { id, reason: rejectionReason };
      await rejectCreation(payload);
      toast.rejectCreationRequsetSuccess();
      handleViewDetails();
      setIsDetailDialogOpen(false);
    } catch (err) {
      setIsDetailDialogOpen(false);
      toast.showError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const SortHeader = ({ field, children }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </div>
    </TableHead>
  );
  return (
    <div className="space-y-6">
      <Card className="!p-0 !border-none">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SimpleSelect
              value={status}
              onValueChange={setStatus}
              options={[
                { value: -1, label: "Tất cả" },
                { value: 1, label: "Chờ duyệt" },
                { value: 2, label: "Đã duyệt" },
                { value: 0, label: "Đã từ chối" },
              ]}
              className="h-12 text-base px-4"
            />
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-gray-100 border border-gray-200 rounded-md">
                  <SortHeader field="clubName">Tên CLB</SortHeader>
                  <TableHead>Người đề xuất</TableHead>
                  <SortHeader field="field">Lĩnh vực</SortHeader>
                  <SortHeader field="submittedDate">Ngày gửi</SortHeader>
                  <SortHeader field="submittedDate">Trạng thái</SortHeader>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="bg-white hover:bg-gray-100 border border-gray-200 rounded-md"
                  >
                    <TableCell>{request.clubName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={request.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {request.requestedByName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {request.requestedByName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.requestedByEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-gray-600">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {request.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right relative">
                      <div className="relative inline-block text-left">
                        {/* Nút mở menu */}
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === request.id ? null : request.id
                            )
                          }
                          className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Dropdown menu nổi, không phá layout */}
                        {openMenuId === request.id && (
                          <div
                            className="absolute right-0 top-full mt-2 w-44 min-w-[10rem] rounded-md border border-gray-200 bg-white shadow-md z-[9999] animate-in fade-in zoom-in-95"
                            style={{ position: "absolute" }}
                          >
                            <button
                              onClick={() => {
                                handleViewDetails(request);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              Xem chi tiết
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages >= 1 && requests.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Trang {pageNumber} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pageNumber <= 3) {
                        pageNum = i + 1;
                      } else if (pageNumber >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pageNumber - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNumber === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPageNumber(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                  >
                    Tiếp theo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-5xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Chi tiết yêu cầu tạo CLB
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* --- Thông tin CLB --- */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
                  Thông tin CLB
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tên CLB</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.clubName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lĩnh vực</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.categoryName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ngày gửi yêu cầu</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedRequest.requestedAt)}
                    </p>
                  </div>
                </div>

                {/* Mô tả chi tiết */}
                <div className="mt-4">
                  <p className="text-gray-500 mb-1">Mô tả</p>
                  <p className="text-gray-800 whitespace-pre-line">
                    {selectedRequest.description || "Không có mô tả."}
                  </p>
                </div>
              </section>

              {/* --- Liên hệ --- */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email liên hệ</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.contactEmail || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.contactPhone || "—"}
                    </p>
                  </div>
                </div>
              </section>
              {/* --- Lý do từ chối (nếu admin muốn nhập) --- */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
                  Lý do từ chối (Admin)
                </h3>
                <Textarea
                  value={rejectionReason || selectedRequest?.rejectReason || ""}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối tại đây..."
                />
              </section>
            </div>
          )}

          {/* --- Footer hành động --- */}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
            {selectedRequest?.status === "Pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest.id)}
                  className="!bg-gray-400 !hover:bg-gray-800 hover:text-white "
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>

                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="!bg-blue-500 !hover:bg-green-800 text-white transition-all duration-300 ease-in-out"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
