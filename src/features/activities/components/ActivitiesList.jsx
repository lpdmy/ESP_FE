// Placeholder image as data URI to avoid 404 errors
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EẢnh hoạt động%3C/text%3E%3C/svg%3E";

// Helper function to format date for display
// API trả về date string đã là VN time rồi, không cần convert thêm
const formatDate = (dateString) => {
  if (!dateString) return "Đang cập nhật";
  try {
    // Parse date string từ API (đã là VN time)
    // Nếu date string không có timezone, parse như local time
    let normalized = dateString;
    if (
      typeof normalized === "string" &&
      normalized.includes("T") &&
      !normalized.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(normalized) &&
      !/[+-]\d{4}$/.test(normalized)
    ) {
      // Date string không có timezone, parse như local time (VN time)
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      // Date string có timezone, parse và format
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  } catch {
    return dateString;
  }
};

const SUB_TYPE_LABELS = {
  all: "Tất cả loại hoạt động",
  SeminarWorkshop: "Workshop / Seminar",
  CreativeContest: "Cuộc thi nộp bài",
  SportsFestival: "Hội thao",
};

const STATUS_LABELS = {
  all: "Tất cả trạng thái",
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  ended: "Đã kết thúc",
};

function ActivitiesCarousel({ activities }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;

  // Chia activities thành các nhóm 2 items
  const pages = [];
  for (let i = 0; i < activities.length; i += itemsPerPage) {
    pages.push(activities.slice(i, i + itemsPerPage));
  }

  const totalPages = pages.length;
  const maxPage = Math.max(totalPages - 1, 0);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, maxPage));

  if (activities.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl gradient-text font-bold text-gray-900">
            Sự kiện nổi bật gần đây
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {activities.length} hoạt động đang diễn ra
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full  border-orange-200 bg-white p-3 text-orange-500 transition hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              onClick={handlePrev}
              disabled={currentPage === 0}
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rounded-full  border-orange-200 bg-white p-3 text-orange-500 transition hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              onClick={handleNext}
              disabled={currentPage >= maxPage}
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden rounded-3xl w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-0"
            >
              {page.map((activity) => (
                <Link
                  key={`carousel-${activity.id}`}
                  to={ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", activity.id)}
                  className="group"
                >
                  <div className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img
                        src={
                          activity.thumbnailUrl ||
                          activity.thumbnail ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          if (e.target.src !== PLACEHOLDER_IMAGE) {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                      {/* Badge */}
                      <div className="mb-4">
                        <Badge 
                          className="bg-orange-500/90 text-white border-0 text-xs px-3 py-1 mb-3 backdrop-blur-sm font-sans"
                          style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        >
                          {activity.status || "Đang diễn ra"}
                        </Badge>
                        {activity.subType && (
                          <Badge
                            variant="outline"
                            className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 ml-2 backdrop-blur-sm"
                          >
                            {SUB_TYPE_LABELS[activity.subType] ||
                              activity.subType}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-orange-300 transition-colors">
                        {activity.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-200 line-clamp-2 mb-4 leading-relaxed">
                        {activity.description}
                      </p>

                      {/* Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-200 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-300" />
                          <span>
                            {formatDate(activity.startDate)} -{" "}
                            {formatDate(activity.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-300" />
                          <span>{activity.location || "Đang cập nhật"}</span>
                        </div>
                        {activity.numberOfParticipants !== undefined && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-300" />
                            <span>
                              {activity.numberOfParticipants} người tham gia
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-orange-300 font-semibold group-hover:text-orange-200 transition-colors">
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all ${
                currentPage === i
                  ? "w-8 bg-orange-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { LoadingCard } from "@/common/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { useToast } from "@/common/hooks/useToast";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "@/features/activities/services/activity.service";
import { activityParticipantService } from "@/features/activities/services/activityParticipant.service";
import { ROUTES } from "@/common/constants/routes";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  User,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const PAGE_SIZE = 10;

const SUB_TYPE_OPTIONS = Object.entries(SUB_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_BADGE = {
  ended: "bg-red-100 text-red-700 border-red-200",
  ongoing: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Đã kết thúc":
      return STATUS_BADGE.ended;
    case "Đang diễn ra":
      return STATUS_BADGE.ongoing;
    case "Sắp diễn ra":
    case "Đang đăng ký":
      return STATUS_BADGE.upcoming;
    default:
      return STATUS_BADGE.default;
  }
};

// Helper function to parse registration settings
const parseRegistrationSettings = (settings) => {
  if (!settings) return null;
  if (typeof settings === "string") {
    try {
      return JSON.parse(settings);
    } catch (err) {
      console.warn("Không thể parse registration settings", err);
      return null;
    }
  }
  return settings;
};

// Helper function to get registration type ("individual" or "group")
const getRegistrationType = (registrationSettings) => {
  const parsed = parseRegistrationSettings(registrationSettings);
  return parsed?.registrationType || "individual"; // Default to individual
};

// Helper function to get group settings with defaults
const getGroupSettings = (registrationSettings) => {
  const parsed = parseRegistrationSettings(registrationSettings);
  const groupReg = parsed?.groupRegistration;
  if (!groupReg) return null;
  return {
    minMembers: groupReg.minMembers ?? 1,
    maxMembers: groupReg.maxMembers ?? null,
    requireLeader: groupReg.requireLeader ?? false,
  };
};

export default function ActivitiesList() {
  const toast = useToast();
  const [hasSubmitted,setHasSubmitted] = useState(true)
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(""); // Input value
  const [search, setSearch] = useState(""); // Actual search value for API
  const [subTypeFilter, setSubTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minParticipantsFilter, setMinParticipantsFilter] = useState("");
  const [maxParticipantsFilter, setMaxParticipantsFilter] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch activities với server-side filtering và pagination
  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingActivities(false);
        setLoadingCarousel(false);
        return;
      }

      setLoadingActivities(true);

      try {
        // Build filter object
        // Convert dateFrom/dateTo to UTC ISO string để match với BE
        const convertToUTCISO = (dateString) => {
          if (!dateString) return undefined;
          // dateString từ input type="date" là YYYY-MM-DD (local time, no timezone)
          // Convert sang UTC start of day để match với BE
          const date = new Date(dateString + "T00:00:00"); // Local midnight
          // Convert to UTC ISO string
          return date.toISOString().split("T")[0] + "T00:00:00Z";
        };

        const filters = {
          pageNumber,
          pageSize,
          search: search || undefined,
          subType: subTypeFilter !== "all" ? subTypeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          dateFrom: dateFromFilter
            ? convertToUTCISO(dateFromFilter)
            : undefined,
          dateTo: dateToFilter ? convertToUTCISO(dateToFilter) : undefined,
          organizer: organizerFilter || undefined,
          minParticipants: minParticipantsFilter
            ? Number(minParticipantsFilter)
            : undefined,
          maxParticipants: maxParticipantsFilter
            ? Number(maxParticipantsFilter)
            : undefined,
          sortBy: "StartDate",
          sortDescending: true, // true = DESC, false = ASC
        };

        // Gọi API với filters
        const response = await executeApiCall(
          activityService.getListItems.bind(activityService),
          [filters, token],
          {
            setLoading: () => {}, // Không dùng global loading
            setError,
          }
        );

        // Response format: { data: { data: ActivityListItemDto[], totalCount, pageNumber, pageSize, totalPages }, message, statusCode }
        let list = [];
        let pagination = null;

        if (response?.data) {
          if (Array.isArray(response.data)) {
            // Fallback: nếu response.data là array trực tiếp (backward compatibility)
            list = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // New format: paginated response
            list = response.data.data;
            pagination = {
              totalCount: response.data.totalCount || 0,
              pageNumber: response.data.pageNumber || 1,
              pageSize: response.data.pageSize || pageSize,
              totalPages: response.data.totalPages || 0,
            };
          }
        }

        const validActivities = Array.isArray(list) ? list : [];

        // Debug: Log isRegistered values để kiểm tra
        if (validActivities.length > 0) {
          console.log(
            "🔍 Activities with registration status:",
            validActivities.map((a) => ({
              id: a.id,
              title: a.title,
              isRegistered: a.isRegistered,
              IsRegistered: a.IsRegistered,
              hasIsRegistered: "isRegistered" in a,
              hasIsRegisteredPascal: "IsRegistered" in a,
            }))
          );
        }

        setActivities(validActivities);
        
        if (pagination) {
          setTotalCount(pagination.totalCount);
          // Tính totalPages từ totalCount và pageSize để đảm bảo chính xác
          const calculatedTotalPages =
            pagination.totalCount > 0
              ? Math.ceil(pagination.totalCount / pagination.pageSize)
              : 0;
          setTotalPages(calculatedTotalPages || pagination.totalPages || 0);
        } else {
          // Nếu không có pagination info, tính từ data length
          setTotalCount(validActivities.length);
          setTotalPages(validActivities.length > 0 ? 1 : 0);
        }

        // Simulate carousel loading nhanh hơn (chỉ cần running activities)
        setTimeout(() => {
          setLoadingCarousel(false);
        }, 300);

        setLoadingActivities(false);
      } catch (err) {
        console.error("Không thể tải danh sách hoạt động:", err);
        toast.showError(err?.message || "Không thể tải danh sách hoạt động.");
        setActivities([]);
        setLoadingActivities(false);
        setLoadingCarousel(false);
      }
    };

    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageNumber,
    search,
    subTypeFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    minParticipantsFilter,
    maxParticipantsFilter,
    organizerFilter,
  ]);

  // Filter out soft-deleted activities (client-side only, server already filters)
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      return activity.isDeleted !== true && activity.isDeleted !== "true";
    });
  }, [activities]);

  const hasActiveFilters = useMemo(() => {
    return (
      search ||
      subTypeFilter !== "all" ||
      statusFilter !== "all" ||
      dateFromFilter ||
      dateToFilter ||
      minParticipantsFilter ||
      maxParticipantsFilter ||
      organizerFilter
    );
  }, [
    search,
    subTypeFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    minParticipantsFilter,
    maxParticipantsFilter,
    organizerFilter,
  ]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setSubTypeFilter("all");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setMinParticipantsFilter("");
    setMaxParticipantsFilter("");
    setOrganizerFilter("");
    setPageNumber(1); // Reset về trang đầu khi reset filters
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPageNumber(1); // Reset về trang đầu khi search
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Reset về trang 1 khi filters thay đổi (không bao gồm searchInput vì search chỉ trigger khi nhấn nút)
  useEffect(() => {
    setPageNumber(1);
  }, [
    subTypeFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    minParticipantsFilter,
    maxParticipantsFilter,
    organizerFilter,
  ]);

  const appliedFilterTags = useMemo(() => {
    const tags = [];
    if (search) tags.push({ key: "search", label: `Tìm kiếm: "${search}"` });
    if (subTypeFilter !== "all")
      tags.push({ key: "type", label: SUB_TYPE_LABELS[subTypeFilter] });
    if (statusFilter !== "all")
      tags.push({ key: "status", label: STATUS_LABELS[statusFilter] });
    if (dateFromFilter)
      tags.push({ key: "dateFrom", label: `Từ ${dateFromFilter}` });
    if (dateToFilter)
      tags.push({ key: "dateTo", label: `Đến ${dateToFilter}` });
    if (organizerFilter)
      tags.push({ key: "organizer", label: organizerFilter });
    if (minParticipantsFilter)
      tags.push({ key: "min", label: `≥ ${minParticipantsFilter} người` });
    if (maxParticipantsFilter)
      tags.push({ key: "max", label: `≤ ${maxParticipantsFilter} người` });
    return tags;
  }, [
    search,
    dateFromFilter,
    dateToFilter,
    maxParticipantsFilter,
    minParticipantsFilter,
    organizerFilter,
    subTypeFilter,
    statusFilter,
  ]);

  const handleRemoveTag = (key) => {
    switch (key) {
      case "search":
        setSearchInput("");
        setSearch("");
        break;
      case "type":
        setSubTypeFilter("all");
        break;
      case "status":
        setStatusFilter("all");
        break;
      case "dateFrom":
        setDateFromFilter("");
        break;
      case "dateTo":
        setDateToFilter("");
        break;
      case "organizer":
        setOrganizerFilter("");
        break;
      case "min":
        setMinParticipantsFilter("");
        break;
      case "max":
        setMaxParticipantsFilter("");
        break;
      default:
        break;
    }
  };

  const runningActivities = useMemo(
    () =>
      activities.filter((activity) => {
        // Filter out soft-deleted activities
        if (activity.isDeleted === true || activity.isDeleted === "true")
          return false;

        const status = (activity?.status || "").toLowerCase();
        return status.includes("đang") || status.includes("sắp");
      }),
    [activities]
  );

  if (error) {
    return (
      <Card className="glass bg-red-50 border-red-100">
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Badge className="bg-orange-100 text-orange-700 font-sans">Hoạt động</Badge>
          <h1 className="text-4xl gradient-text font-bold text-gray-900">
            Khám phá sự kiện nổi bật
          </h1>
          <p className="text-gray-600">
            Danh sách workshop, cuộc thi sáng tạo và hội thao bạn có thể tham
            gia ngay hôm nay.
          </p>
        </div>
        <Link to={ROUTES.ACTIVITY.MY_ACTIVITY}>
          <Button
            type="button"
            className="h-11 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 whitespace-nowrap"
          >
            <User className="w-4 h-4" />
            Hoạt động của tôi
          </Button>
        </Link>
      </div>

      {/* Carousel với loading riêng */}
      <LoadingCard
        isLoading={loadingCarousel}
        text="Đang tải sự kiện nổi bật..."
      >
        {(runningActivities.length > 0 || activities.length > 0) &&
          !loadingCarousel && (
            <ActivitiesCarousel
              activities={
                runningActivities.length > 0
                  ? runningActivities.slice(0, 10)
                  : activities.slice(0, 10)
              }
            />
          )}
      </LoadingCard>

      <Card className="glass overflow-visible">
        <CardContent className="py-6 space-y-4 overflow-visible">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto_auto]">
            <div className="flex gap-2 md:col-span-2 lg:col-span-1">
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="h-12 rounded-xl border-orange-200 flex-1"
              />
              <Button
                type="button"
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
            </div>
            <FilterSelect
              value={subTypeFilter}
              onChange={setSubTypeFilter}
              options={SUB_TYPE_OPTIONS}
              className="md:w-full"
            />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              className="md:w-full"
            />
            <Button
              type="button"
              variant="outline"
              className="border-orange-200 text-orange-600 h-12 rounded-xl"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              {showFilters ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                className="text-orange-600 h-12 rounded-xl hover:bg-orange-50"
                onClick={handleResetFilters}
              >
                Xóa tất cả
              </Button>
            )}
          </div>

          {appliedFilterTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Bộ lọc đang áp dụng:
                </span>
                <span className="text-sm text-gray-500">
                  ({appliedFilterTags.length} bộ lọc)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {appliedFilterTags.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                    onClick={() => handleRemoveTag(tag.key)}
                  >
                    <span>{tag.label}</span>
                    <span className="text-orange-500 font-bold">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FilterField label="Ngày bắt đầu từ">
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Ngày kết thúc đến">
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Đơn vị tổ chức">
                <Input
                  placeholder="Ví dụ: Phòng Đoàn"
                  value={organizerFilter}
                  onChange={(e) => setOrganizerFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Số người tham gia tối thiểu">
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 10"
                  value={minParticipantsFilter}
                  onChange={(e) => setMinParticipantsFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Số người tham gia tối đa">
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 100"
                  value={maxParticipantsFilter}
                  onChange={(e) => setMaxParticipantsFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities List với loading riêng */}
      <LoadingCard
        isLoading={loadingActivities}
        text="Đang tải danh sách hoạt động..."
      >
        {!loadingActivities && (
          <>
            {filteredActivities.length === 0 ? (
              <Card className="glass bg-gray-50 border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                  Không tìm thấy hoạt động phù hợp với bộ lọc hiện tại.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm ">
                  {filteredActivities.map((activity) => (
                    <ActivityListItem key={activity.id} activity={activity} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                      {totalCount > 0 ? (
                        <>
                          Hiển thị{" "}
                          <span className="font-semibold text-orange-600">
                            {(pageNumber - 1) * pageSize + 1}
                          </span>{" "}
                          -{" "}
                          <span className="font-semibold text-orange-600">
                            {Math.min(pageNumber * pageSize, totalCount)}
                          </span>{" "}
                          trong tổng số{" "}
                          <span className="font-semibold text-orange-600">
                            {totalCount}
                          </span>{" "}
                          hoạt động
                        </>
                      ) : (
                        <span className="text-gray-500">
                          Không có hoạt động nào
                        </span>
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-4 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            setPageNumber((prev) => Math.max(1, prev - 1))
                          }
                          disabled={pageNumber === 1 || loadingActivities}
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Trước
                        </Button>
                        <div className="flex items-center gap-1">
                          {/* First page */}
                          {pageNumber > 3 && totalPages > 5 && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 w-9 px-0 border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => setPageNumber(1)}
                                disabled={loadingActivities}
                              >
                                1
                              </Button>
                              {pageNumber > 4 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                            </>
                          )}
                          {/* Page numbers */}
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
                                  type="button"
                                  variant={
                                    pageNumber === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  className={`h-9 w-9 px-0 ${
                                    pageNumber === pageNum
                                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                                      : "border-orange-200 text-orange-600 hover:bg-orange-50"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  onClick={() => setPageNumber(pageNum)}
                                  disabled={loadingActivities}
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}
                          {/* Last page */}
                          {pageNumber < totalPages - 2 && totalPages > 5 && (
                            <>
                              {pageNumber < totalPages - 3 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 w-9 px-0 border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => setPageNumber(totalPages)}
                                disabled={loadingActivities}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-4 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            setPageNumber((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={
                            pageNumber >= totalPages || loadingActivities
                          }
                        >
                          Sau
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </LoadingCard>
    </div>
  );
}

function ActivityListItem({ activity }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId =
        parseInt(
          decoded?.Id ||
            decoded?.id ||
            decoded?.sub ||
            decoded?.nameid ||
            decoded?.[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ||
            0
        ) || null;
      const normalizedRole =
        decoded?.UserRole ||
        decoded?.role ||
        decoded?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      setCurrentUser({
        id: userId,
        role: normalizedRole,
      });
    } catch (err) {
      console.warn("Cannot decode token", err);
    }
  }, []);

  const participationCount =
    activity?.numberOfParticipants ?? activity?.currentParticipants ?? 0;
  const maxParticipants =
    activity?.maxParticipants ?? activity?.capacity ?? "∞";
  const categoryLabel = activity?.category === 1 ? "Hoạt động" : "Sự kiện";
  const detailLink = ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", activity.id);
  const participationRate =
    maxParticipants === "∞"
      ? null
      : Math.min(participationCount / (maxParticipants || 1), 1);

  const isCreativeContest = activity?.subType === "CreativeContest";
  const registrationType = getRegistrationType(activity?.registrationSettings);
  const groupSettings = getGroupSettings(activity?.registrationSettings);
  const minMembers = groupSettings?.minMembers ?? 1;

  // Kiểm tra user đã đăng ký chưa (từ backend)
  // Backend trả về IsRegistered (PascalCase) nhưng JSON serializer có thể convert sang camelCase
  const isRegistered = useMemo(() => {
    // Check cả camelCase và PascalCase để đảm bảo tương thích
    const registered =
      activity?.isRegistered === true ||
      activity?.IsRegistered === true ||
      activity?.isRegistered === "true" ||
      activity?.IsRegistered === "true";

    // Debug log để kiểm tra (chỉ log khi có activity)
    if (
      activity?.id &&
      (activity?.isRegistered !== undefined ||
        activity?.IsRegistered !== undefined)
    ) {
      console.log(
        `🔍 Activity ${activity?.id} "${activity?.title}" - isRegistered:`,
        activity?.isRegistered,
        "IsRegistered:",
        activity?.IsRegistered,
        "Result:",
        registered
      );
    }

    return registered;
  }, [
    activity?.isRegistered,
    activity?.IsRegistered,
    activity?.id,
    activity?.title,
  ]);

  // Helper function để convert date sang UTC để so sánh với BE
  const toUTC = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    // Nếu dateString không có timezone info, giả sử nó là UTC
    // Convert sang UTC để so sánh với BE (BE dùng DateTime.UtcNow)
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  // Kiểm tra hoạt động đã kết thúc chưa (dùng UTC để match với BE)
  const isEnded = useMemo(() => {
    if (!activity?.endDate) return false;
    const now = new Date(); // Local time
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC
    const endDate = toUTC(activity.endDate);
    if (!endDate) return false;
    return nowUTC > endDate;
  }, [activity?.endDate]);

  // Kiểm tra hết thời hạn đăng ký chưa (dùng UTC để match với BE)
  const isRegistrationClosed = useMemo(() => {
    if (!activity?.endRegisterDate) return false;
    const now = new Date(); // Local time
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC
    const endRegisterDate = toUTC(activity.endRegisterDate);
    if (!endRegisterDate) return false;
    return nowUTC > endRegisterDate;
  }, [activity?.endRegisterDate]);

  // Kiểm tra có thể đăng ký không (chưa hết thời hạn và chưa kết thúc)
  const canRegister = useMemo(() => {
    return !isEnded && !isRegistrationClosed && !isRegistered;
  }, [isEnded, isRegistrationClosed, isRegistered]);

  // Kiểm tra có thể hủy đăng ký không (trước thời hạn đăng ký, dùng UTC)
  const canCancelRegistration = useMemo(() => {
    if (!activity?.endRegisterDate || !isRegistered) return false;
    const now = new Date(); // Local time
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC
    const endRegisterDate = toUTC(activity.endRegisterDate);
    if (!endRegisterDate) return false;
    return nowUTC <= endRegisterDate;
  }, [activity?.endRegisterDate, isRegistered]);

  const handleCancelRegistration = async () => {
    if (!activity?.id) {
      toast.showError("Không tìm thấy thông tin hoạt động");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.showError("Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    // Đảm bảo activityId là number
    const activityId = Number(activity.id);
    if (isNaN(activityId) || activityId <= 0) {
      toast.showError("ID hoạt động không hợp lệ");
      return;
    }

    setIsCancelling(true);
    try {
      await executeApiCall(
        activityParticipantService.cancelRegistration.bind(
          activityParticipantService
        ),
        [activityId, token],
        { setError: () => {} }
      );

      toast.showSuccess("Đã hủy đăng ký tham gia hoạt động.");
      // Refresh page để cập nhật trạng thái
      window.location.reload();
    } catch (err) {
      console.error("Error cancelling registration:", err);
      // Parse error message từ response - có thể là object hoặc string
      let errorMessage = "Có lỗi xảy ra khi hủy đăng ký";
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data && typeof err.data === 'string') {
        errorMessage = err.data;
      }
      toast.showError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRegisterClick = () => {
    if (isCreativeContest && registrationType === "group") {
      // Chỉ đăng ký nhóm, navigate đến trang register
      navigate(ROUTES.ACTIVITY.REGISTER_ACTIVITY.replace(":id", activity.id));
    } else if (isCreativeContest && registrationType === "individual") {
      // Đăng ký cá nhân trực tiếp
      handleSimpleRegister();
    } else {
      // Các loại khác (không phải CreativeContest), navigate đến trang register
      navigate(ROUTES.ACTIVITY.REGISTER_ACTIVITY.replace(":id", activity.id));
    }
  };

  const handleSimpleRegister = async () => {
    if (!currentUser?.id) {
      toast.showError("Vui lòng đăng nhập để đăng ký.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.showError("Vui lòng đăng nhập để đăng ký.");
      return;
    }
    try {
      await executeApiCall(
        activityParticipantService.registerForActivity.bind(
          activityParticipantService
        ),
        [
          {
            activityId: Number(activity.id),
            userId: currentUser.id,
          },
          token,
        ],
        { setLoading: () => {}, setError: () => {} }
      );
      toast.showSuccess("Đăng ký thành công!");
      // Refresh page or navigate
      window.location.reload();
    } catch (err) {
      console.error("Register failed:", err);
      toast.showError(err?.message || "Không thể đăng ký hoạt động.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 !mhover:bg-orange-50/50 transition-colors md:flex-row md:items-stretch">
      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 md:w-32 md:h-32">
        <img
          src={activity.thumbnailUrl || activity.thumbnail || PLACEHOLDER_IMAGE}
          alt={activity.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (e.target.src !== PLACEHOLDER_IMAGE) {
              e.target.src = PLACEHOLDER_IMAGE;
            }
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-stretch">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs font-sans"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              {categoryLabel}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-sans ${getStatusBadgeClass(activity.status)}`}
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              {activity.status || "Đang cập nhật"}
            </Badge>
            {activity.subType && (
              <Badge 
                variant="outline" 
                className="text-xs border-gray-200 font-sans"
                style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {SUB_TYPE_LABELS[activity.subType] || activity.subType}
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
            {activity.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {activity.description}
          </p>

          <div className="mt-3 grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {activity.location || "Đang cập nhật"}
            </span>
            <span className="flex items-center gap-1 text-orange-600">
              <Users className="h-3 w-3" />
              {participationCount}/{maxParticipants} người
            </span>
          </div>

          {participationRate !== null && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tiến độ đăng ký</span>
                <span className="font-medium text-orange-600">
                  {Math.round(participationRate * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                  style={{ width: `${Math.round(participationRate * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col h-full gap-3 md:w-48">
          <div className="flex-1 flex flex-col justify-start pt-20">
            <Button
              className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate(detailLink)}
            >
              Xem chi tiết
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {isRegistered ? (
              <>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-red-300 text-red-600 hover:bg-red-50 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCancelRegistration}
                  disabled={isCancelling || !canCancelRegistration || activity.hasSubmitted}
                  title={!canCancelRegistration ? "Đã hết thời hạn hủy đăng ký" : ""}
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
                </Button>
                {!canCancelRegistration && (
                  <p className="text-xs text-gray-500 text-center">
                    Đã hết thời hạn hủy đăng ký
                  </p>
                )}
              </>
            ) : isEnded ? (
              <div className="p-3 bg-gray-50 rounded-xl text-gray-500 border border-gray-200 text-sm text-center">
                Hoạt động đã kết thúc
              </div>
            ) : isRegistrationClosed ? (
              <div className="p-3 bg-gray-50 rounded-xl text-gray-500 border border-gray-200 text-sm text-center">
                Đã hết thời hạn đăng ký
              </div>
            ) : (
              <Button
                variant="outline"
                className="h-11 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={handleRegisterClick}
                disabled={!canRegister}
              >
                Đăng ký
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, options, className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={`relative z-10 ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-lg border px-4 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
          open
            ? "border-orange-400 ring-2 ring-orange-500"
            : "border-orange-200"
        }`}
      >
        <span className="truncate">
          {selected ? selected.label : "Loại hoạt động"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-orange-500 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-orange-100 bg-white shadow-xl overflow-hidden">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                value === option.value
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
