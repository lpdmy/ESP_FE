import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { createPortal } from "react-dom";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import ModerationModal from "./ModerationDetailModal/page";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import {
  Shield,
  Flag,
  Eye,
  Check,
  X,
  AlertTriangle,
  Ban,
  Clock,
  TrendingDown,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { LoadingAdmin } from "@/common/components/ui/loading";
import { useModerationApi } from "../../hooks/useModerationApi";
import { useRef } from "react";
import { SendNotificationModal } from "./SendNotificationModal/page";
import { useToast } from "@/common/hooks/useToast";
const violationHistory = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    violations: 3,
    lastViolation: "2024-03-15T10:30:00Z",
    status: "warning",
    totalPenalties: 1,
  },
  {
    id: 2,
    user: "Lê Minh C",
    violations: 5,
    lastViolation: "2024-03-14T15:20:00Z",
    status: "suspended",
    totalPenalties: 2,
  },
  {
    id: 3,
    user: "Hoàng Văn E",
    violations: 1,
    lastViolation: "2024-03-13T09:15:00Z",
    status: "clean",
    totalPenalties: 0,
  },
];

const penaltyTypes = [
  {
    value: "warning",
    label: "Cảnh báo",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "temp_ban",
    label: "Khóa tạm thời",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "permanent_ban",
    label: "Khóa vĩnh viễn",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "content_removal",
    label: "Gỡ nội dung",
    color: "bg-purple-100 text-purple-800",
  },
];

// ❌ Loại bỏ type annotation version TypeScript
function formatDate(dateString, format = "dd/MM/yyyy") {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (format === "dd/MM/yyyy HH:mm") {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

export default function ModerationCenter() {
  function StatusSelect({
    value,
    onChange,
    options,
    placeholder = "Chọn",
    className = "",
  }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);

    const selectedOption = options.find((o) => o.value === value);
    const openDropdown = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
      setOpen(true);
    };

    const closeDropdown = () => setOpen(false);

    useEffect(() => {
      if (open) {
        document.addEventListener("click", closeDropdown);
      }
      return () => document.removeEventListener("click", closeDropdown);
    }, [open]);

    return (
      <>
        {/* Trigger */}
        <div className={`relative ${className}`} ref={triggerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open ? closeDropdown() : openDropdown();
            }}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2
                     flex items-center justify-between text-sm shadow-sm hover:bg-gray-50"
          >
            <span>{selectedOption ? selectedOption.label : placeholder}</span>
            <span className="text-gray-500 text-xs">▼</span>
          </button>
        </div>

        {/* DROPDOWN PORTAL */}
        {open &&
          createPortal(
            <div
              style={{
                position: "absolute",
                top: position.top,
                left: position.left,
                width: position.width,
              }}
              className="bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]
                       max-h-60 overflow-auto"
            >
              {options.map((o) => (
                <div
                  key={o.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(o.value);
                    closeDropdown();
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                  ${value === o.value ? "bg-gray-100 font-semibold" : ""}`}
                >
                  {o.label}
                </div>
              ))}
            </div>,
            document.body
          )}
      </>
    );
  }
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPenaltyDialogOpen, setIsPenaltyDialogOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumberStat, setPageNumberStat] = useState(1);
  const [pageSizeStat, setPageSizeStat] = useState(10);
  const [searchTermStat, setSearchTermStat] = useState("");
  const [reportedContent, setReportedContent] = useState([]);
  const [userStat, setUserStat] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPagesStat, setTotalPagesStat] = useState(0);
  const { getAllReport, getUserStat,updateStatus } = useModerationApi();
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [tab,setTab] =useState("reports")
  const toast = useToast()
  const hanldeGetAllReport = async () => {
    setIsLoading(true);
    try {
      const response = await getAllReport(pageNumber, pageSize, searchTerm);
      setReportedContent(response.data.data);
      const total = response.data.totalCount || response.data.data.length;
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.log(error);
      toast.showError("Tải danh sách thất bại")
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateStatus = async(id,status) =>{
    try {
      const payload = {
        id: id,
        status : status
      }
      console.log(payload)
      await updateStatus(payload)
      hanldeGetUserStat();
      hanldeGetAllReport();
      toast.showSuccess("Cập nhật thành công")
    } catch (error) {
      toast.showError("Cập nhật thất bại")
    }
  }
  const hanldeGetUserStat = async () => {
    setIsLoading(true);
    try {
      const response = await getUserStat(
        pageNumberStat,
        pageSizeStat,
        searchTermStat
      );
      setUserStat(response.data.data);
      const total = response.data.totalCount || response.data.data.length;
      setTotalPagesStat(Math.ceil(total / pageSize));
      console.log("Response :", response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenDetaiModal = (data) =>{
    setOpenModalDetail(true)
    setSelectedReport(data)

  }
  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Approved", label: "Đã phê duyệt" },
    { value: "Rejected", label: "Đã từ chối" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "Approved":
        return "Đã phê duyệt";
      case "Rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };
  const getUserStatusColor = (status) => {
    switch (status) {
      case "clean":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserStatusLabel = (status) => {
    switch (status) {
      case "clean":
        return "Sạch";
      case "warning":
        return "Cảnh báo";
      case "suspended":
        return "Bị khóa";
      default:
        return status;
    }
  };

  const filteredReports = Array.isArray(reportedContent)
    ? reportedContent.filter((report) => {
        if (filterStatus !== "all" && report.status !== filterStatus)
          return false;
        if (filterPriority !== "all" && report.priority !== filterPriority)
          return false;
        return true;
      })
    : [];
  useEffect(() => {
    hanldeGetAllReport();
  }, [pageNumber]);
  useEffect(() => {
  if (tab === "history") {
    hanldeGetUserStat();
  }
}, [tab]);
  return (
    <div className="space-y-6">
      {/* ================== HEADER ================== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trung tâm kiểm duyệt
        </h1>
        <p className="text-gray-600">Xem xét và xử lý nội dung bị báo cáo</p>
      </div>
      {/* ================== TABS ================== */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Báo cáo vi phạm</TabsTrigger>
          <TabsTrigger value="history">Lịch sử vi phạm</TabsTrigger>
        </TabsList>

        {/* ================== REPORTS TAB ================== */}
        <TabsContent value="reports"  className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Nội dung bị báo cáo
                  </CardTitle>
                  <CardDescription>
                    Xem xét và xử lý các báo cáo vi phạm
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <StatusSelect
                    className="w-40"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Trạng thái"
                    options={statusOptions}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* ================== Reports Table ================== */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Người vi phạm</TableHead>
                    <TableHead>Người báo cáo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="py-10 text-center text-gray-500">
                          Đang tải dữ liệu...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-600 truncate">
                              {report.contentText}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-sm">
                            {report.authorName}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-sm">
                            {report.reporterName}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(report.reportedAt, "dd/MM/yyyy HH:mm")}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Xem */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                              onClick={()=> handleOpenDetaiModal(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Chỉ hiện khi pending */}
                            {report.status === "Pending" && (
                              <>
                                {/* Approve */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                                  onClick={()=>{handleUpdateStatus(report.id,1)}}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>

                                {/* Reject */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                                  onClick={()=>{handleUpdateStatus(report.id,2)}}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalPages > 0 && reportedContent.length > 0 && (
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                        }
                      )}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================== HISTORY TAB ================== */}
        <TabsContent value="history"className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Lịch sử vi phạm
              </CardTitle>
              <CardDescription>
                Theo dõi lịch sử vi phạm của người dùng
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Số vi phạm</TableHead>
                    <TableHead>Vi phạm gần nhất</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {userStat.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{record.authorName}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">
                            {record.violationCount}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-gray-500">
                        {formatDate(record.latestViolation, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            onClick={() => {
                              setSelectedUser(record.authorId);
                              setOpenModal(true);
                            }}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {totalPagesStat > 0 && userStat.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Trang {pageNumberStat} / {totalPagesStat}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumberStat(pageNumberStat - 1)}
                      disabled={pageNumberStat === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button> 
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPagesStat) },
                        (_, i) => {
                          let pageNum;
                          if (totalPagesStat <= 5) {
                            pageNum = i + 1;
                          } else if (pageNumberStat <= 3) {
                            pageNum = i + 1;
                          } else if (pageNumberStat >= totalPagesStat - 2) {
                            pageNum = totalPagesStat - 4 + i;
                          } else {
                            pageNum = pageNumberStat - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNumberStat === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setPageNumberStat(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
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
        </TabsContent>
      </Tabs>
      <SendNotificationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        selectedUser={selectedUser}
      />
       <ModerationModal
        open={openModalDetail}
        onClose={() => setOpenModalDetail(false)}
        data={selectedReport}
      />
    </div>
  );
}
