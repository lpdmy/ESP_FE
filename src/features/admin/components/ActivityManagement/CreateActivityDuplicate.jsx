"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  Copy,
  Calendar,
  Users,
  MapPin,
  FileText,
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

const getStatusBadge = (activity) => {
  const now = new Date();
  const startDate = activity.startDate ? new Date(activity.startDate) : null;
  const endDate = activity.endDate ? new Date(activity.endDate) : null;
  const endRegisterDate = activity.endRegisterDate ? new Date(activity.endRegisterDate) : null;

  if (!startDate) return { label: "Chưa xác định", color: "bg-gray-100 text-gray-700" };

  if (endRegisterDate && now > endRegisterDate) {
    if (endDate && now > endDate) {
      return { label: "Đã kết thúc", color: "bg-gray-100 text-gray-700" };
    }
    return { label: "Đang diễn ra", color: "bg-green-100 text-green-700" };
  }

  if (startDate && now < startDate) {
    return { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-700" };
  }

  return { label: "Đang diễn ra", color: "bg-green-100 text-green-700" };
};

export default function CreateActivityDuplicate({ onBack }) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await executeApiCall(
        activityService.getListItems.bind(activityService),
        [
          {
            pageNumber,
            pageSize,
            search: searchQuery || null,
            sortBy: "StartDate",
            sortDescending: true,
          },
          token,
        ],
        { setLoading, setError: () => {} }
      );

      console.log("Fetch activities response:", response);

      // Handle different response structures
      if (response?.data?.data) {
        // Check if response has nested data structure
        const responseData = response.data.data;
        if (Array.isArray(responseData)) {
          // Direct array response
          setActivities(responseData);
          setTotalCount(responseData.length);
          setTotalPages(1);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // Paginated response
          setActivities(responseData.data);
          setTotalCount(responseData.totalCount || responseData.data.length);
          setTotalPages(responseData.totalPages || 1);
        } else {
          setActivities([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } else {
        setActivities([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Không thể tải danh sách hoạt động");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pageNumber, pageSize, searchQuery]);

  const handleDuplicate = async (activityId) => {
    setDuplicatingId(activityId);
    try {
      const token = localStorage.getItem("token");
      // Get activity data instead of duplicating
      const response = await executeApiCall(
        activityService.getActivityById.bind(activityService),
        [activityId, token],
        { setLoading: () => {}, setError: () => {} }
      );

      if (response?.data?.data) {
        const activity = response.data.data;
        // Store activity data in sessionStorage to prefill form
        sessionStorage.setItem("prefilledActivityData", JSON.stringify(activity));
        // Navigate to create page with duplicate flag
        navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?duplicate=true`);
        toast.success("Đã tải dữ liệu hoạt động, bạn có thể chỉnh sửa và tạo mới");
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      toast.error("Không thể tải dữ liệu hoạt động");
    } finally {
      setDuplicatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold mb-2">Copy từ hoạt động có sẵn</h1>
          <p className="text-gray-600">
            Chọn một hoạt động để nhân bản. Tất cả thông tin sẽ được sao chép và bạn có thể chỉnh sửa.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNumber(1);
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hoạt động ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingCard text="Đang tải danh sách hoạt động..." />
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Không tìm thấy hoạt động nào</p>
                <Button
                  onClick={() => navigate(ROUTES.ADMIN.CREATE_ACTIVITY)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tạo hoạt động mới
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Phân loại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Địa điểm</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => {
                        const status = getStatusBadge(activity);
                        return (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {activity.thumbnailUrl && (
                                  <img
                                    src={activity.thumbnailUrl}
                                    alt={activity.title}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <span>{activity.title || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {getSubTypeLabel(activity.subType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(activity.startDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {activity.location || "-"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicate(activity.id)}
                                disabled={duplicatingId === activity.id}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              >
                                {duplicatingId === activity.id ? (
                                  "Đang nhân bản..."
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Nhân bản
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
      </div>
    </div>
  );
}

