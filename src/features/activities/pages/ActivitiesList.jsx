import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, TrendingUp, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { LoadingCard } from "@/common/components/ui/loading";
import Sidebar from "@/features/landing/components/Sidebar";
import ActivityListItem from "../components/ActivityListItem";
import CompactFilter from "../components/CompactFilter";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "../services/activity.service";
import { useActivityRegistration } from "../hooks/useActivityRegistration";

const CATEGORY_LABELS = {
  1: "Activity",
  2: "Event",
};

const formatDateLabel = (value) => {
  if (!value) return "Đang cập nhật";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

const deriveStatus = (activity) => {
  const now = new Date();
  const registerEnd = activity.endRegisterDate ? new Date(activity.endRegisterDate) : null;
  const start = activity.startDate ? new Date(activity.startDate) : null;
  const end = activity.endDate ? new Date(activity.endDate) : null;

  if (end && end < now) return "Đã kết thúc";
  if (start && start <= now && (!end || end >= now)) return "Đang diễn ra";
  if (registerEnd && registerEnd >= now) return "Đang đăng ký";
  return "Sắp diễn ra";
};

const mapActivityDto = (dto) => {
  const status = deriveStatus(dto);
  return {
    id: dto.id,
    title: dto.title ?? "Hoạt động",
    description: dto.description ?? "Đang cập nhật mô tả",
    category: CATEGORY_LABELS[dto.category] ?? dto.category ?? "Activity",
    subType: dto.subType ?? "",
    thumbnail: dto.thumbnailUrl,
    startDate: formatDateLabel(dto.startDate),
    endDate: formatDateLabel(dto.endDate),
    location: dto.location ?? "Đang cập nhật",
    organizer: dto.organizer ?? "Ban tổ chức",
    maxParticipants: dto.maxParticipants ?? 0,
    currentParticipants: dto.numberOfParticipants ?? 0,
    status,
    raw: dto,
  };
};

export default function ActivitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    register: registerActivity,
    registeringId,
    canRegisterActivity,
    isTeacher,
  } = useActivityRegistration();
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    subType: [],
    status: "all",
    location: "",
  });

  const fetchActivities = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await executeApiCall(
        activityService.getActivities.bind(activityService),
        [{ pageNumber: 1, pageSize: 200 }, token],
        { setLoading, setError }
      );

      const payload = response?.data?.data ?? [];
      setActivities(payload.map(mapActivityDto));
    } catch (fetchError) {
      console.error("Failed to fetch activities", fetchError);
    }
  }, []);

  const handleRegister = useCallback(
    async (activityItem) => {
      try {
        await registerActivity({
          activityId: activityItem.id,
          activitySubType: activityItem.subType || activityItem.raw?.subType,
        });
        fetchActivities();
      } catch (registerError) {
        // Error đã được toast trong hook, chỉ cần log để debug
        console.error("Register activity failed", registerError);
      }
    },
    [fetchActivities, registerActivity]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const listFiltered = useMemo(() => {
    return activities.filter((activity) => {
      const byText =
        !searchQuery ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase());
      const byCategory =
        selectedFilters.category.length === 0 ||
        selectedFilters.category.includes(activity.category);
      const byStatus =
        selectedFilters.subType.length === 0 ||
        selectedFilters.subType.includes(activity.status);
      return byText && byCategory && byStatus;
    });
  }, [activities, searchQuery, selectedFilters]);

  const tabFiltered = useMemo(() => {
    return listFiltered.filter((activity) => {
      if (activeTab === "all") return true;
      if (activeTab === "upcoming") {
        return ["Đang đăng ký", "Sắp diễn ra"].includes(activity.status);
      }
      if (activeTab === "ongoing") {
        return activity.status === "Đang diễn ra";
      }
      if (activeTab === "ended") {
        return activity.status === "Đã kết thúc";
      }
      return true;
    });
  }, [activeTab, listFiltered]);

  const totalPages = Math.ceil(tabFiltered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = tabFiltered.slice(startIndex, startIndex + itemsPerPage);
  const upcomingActivities = useMemo(
    () => activities.filter((activity) => ["Đang đăng ký", "Sắp diễn ra"].includes(activity.status)),
    [activities]
  );

  const featuredActivity = useMemo(() => {
    if (!activities.length) return null;
    return (
      activities.find((activity) => activity.status === "Đang đăng ký") ||
      activities.find((activity) => activity.status === "Sắp diễn ra") ||
      activities[0]
    );
  }, [activities]);

  const statsCardData = useMemo(() => {
    const uniqueOrganizers = new Set(activities.map((activity) => activity.organizer).filter(Boolean));
    const totalPoints = activities.reduce(
      (sum, activity) => sum + (activity.raw?.registrationReward?.starPoints ?? 0),
      0
    );

    return [
      {
        label: "Hoạt động sắp tới",
        value: upcomingActivities.length,
      },
      {
        label: "CLB",
        value: uniqueOrganizers.size || "--",
      },
      {
        label: "Điểm thưởng",
        value: totalPoints || 0,
      },
      {
        label: "Hạng",
        value: activities.length ? `#${Math.max(1, Math.min(activities.length, 99))}` : "--",
      },
    ];
  }, [activities, upcomingActivities]);

  const tabButtons = [
    { value: "all", label: "Tất cả" },
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "ended", label: "Đã kết thúc" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8 justify-center">
          <aside className="hidden lg:block w-64 xl:w-72 sticky top-[88px] self-start flex-shrink-0">
            <Sidebar />
          </aside>

          <section
            className="flex-1 min-w-0 w-full space-y-8"
            style={{ maxWidth: "1200px", width: "100%" }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                  Hoạt động ngoại khóa
                </h1>
                <p className="text-gray-600 text-lg">
                  Khám phá và tham gia các hoạt động, sự kiện, cuộc thi hấp dẫn
                </p>
              </div>
              <Button variant="orange">Tạo hoạt động</Button>
            </div>

            <Card className="p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statsCardData.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <LoadingCard isLoading={loading} text="Đang tải hoạt động...">
              {featuredActivity ? (
                <Card className="overflow-hidden shadow-md border-2 border-orange-200">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-80">
                      <img
                        src={featuredActivity.thumbnail || "/placeholder.svg"}
                        alt={featuredActivity.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold">
                        Nổi bật
                      </span>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center gap-4 bg-white">
                      <div className="space-y-3">
                        <Badge variant="secondary" className="w-fit">
                          {featuredActivity.status}
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                          {featuredActivity.title}
                        </h2>
                        <p className="text-base text-gray-600 leading-relaxed">
                          {featuredActivity.description}
                        </p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          {featuredActivity.startDate} - {featuredActivity.endDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          {featuredActivity.currentParticipants}/{featuredActivity.maxParticipants} người tham gia
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="orange" size="lg" asChild>
                          <Link to={`/activities/${featuredActivity.id}`}>Đăng ký ngay</Link>
                        </Button>
                        <Link
                          to={`/activities/${featuredActivity.id}`}
                          className="text-sm text-orange-600 hover:text-orange-700 hover:underline self-center"
                        >
                          Xem chi tiết →
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="py-16 text-center text-gray-500">
                  {error ? "Không thể tải dữ liệu hoạt động" : "Chưa có hoạt động nào"}
                </Card>
              )}
            </LoadingCard>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full md:w-auto">
                  <TabsList className="bg-gray-100 p-1 rounded-lg">
                    {tabButtons.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-4 py-2 rounded-md data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Tìm kiếm hoạt động..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <CompactFilter
                    selectedFilters={selectedFilters}
                    onFilterChange={setSelectedFilters}
                  />
                </div>
              </div>

              <Card className="overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  {loading ? (
                    <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>
                  ) : paginatedActivities.length > 0 ? (
                    paginatedActivities.map((activity) => {
                      const isSportsFestival =
                        (activity.raw?.subType ?? activity.subType ?? "").toLowerCase() === "sportsfestival";
                      return (
                        <ActivityListItem
                          key={activity.id}
                          activity={activity}
                          onRegister={handleRegister}
                          isRegistering={registeringId === activity.id}
                          canRegister={canRegisterActivity(activity.raw)}
                          showTeacherNote={isSportsFestival && !isTeacher}
                        />
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      Không tìm thấy hoạt động nào
                    </div>
                  )}
                </div>
              </Card>

              {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-4">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
