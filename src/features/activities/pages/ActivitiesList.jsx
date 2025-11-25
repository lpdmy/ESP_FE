import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, Users, Trophy, TrendingUp, Search, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
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

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Đã kết thúc":
      return "bg-red-100 text-red-700 border-red-200";
    case "Đang diễn ra":
      return "bg-green-100 text-green-700 border-green-200";
    case "Sắp diễn ra":
    case "Đang đăng ký":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
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
  const user = useSelector((state) => state.user?.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredActivityIds, setRegisteredActivityIds] = useState(new Set());
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselIntervalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
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

  // Load registered activity IDs from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`registeredActivities_${user.id}`);
      if (stored) {
        try {
          const ids = JSON.parse(stored);
          setRegisteredActivityIds(new Set(ids));
        } catch (err) {
          console.error("Failed to parse stored registered activities", err);
        }
      }
    }
  }, [user?.id]);

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
      
      // Note: We don't fetch individual activity details here due to API circular reference issues
      // Registration status is stored in localStorage and updated when user registers successfully
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
        // Update registered activity IDs immediately
        setRegisteredActivityIds(prev => {
          const newSet = new Set([...prev, activityItem.id]);
          // Save to localStorage
          if (user?.id) {
            localStorage.setItem(`registeredActivities_${user.id}`, JSON.stringify([...newSet]));
          }
          return newSet;
        });
        fetchActivities();
      } catch (registerError) {
        // Error đã được toast trong hook, chỉ cần log để debug
        console.error("Register activity failed", registerError);
      }
    },
    [fetchActivities, registerActivity, user?.id]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const upcomingActivities = useMemo(
    () => activities.filter((activity) => ["Đang đăng ký", "Sắp diễn ra"].includes(activity.status)),
    [activities]
  );

  // Auto-play carousel
  useEffect(() => {
    if (upcomingActivities.length <= 1) return;

    carouselIntervalRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % upcomingActivities.length);
    }, 4000); // 4 seconds

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [upcomingActivities.length]);

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
              {upcomingActivities.length > 0 ? (
                <div className="relative w-full">
                  <div
                    className="relative overflow-hidden rounded-xl"
                    onTouchStart={(e) => {
                      touchStartX.current = e.touches[0].clientX;
                    }}
                    onTouchMove={(e) => {
                      touchEndX.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={() => {
                      if (!touchStartX.current || !touchEndX.current) return;
                      const distance = touchStartX.current - touchEndX.current;
                      if (distance > 50) {
                        setCarouselIndex((prev) => (prev + 1) % upcomingActivities.length);
                      } else if (distance < -50) {
                        setCarouselIndex((prev) => (prev - 1 + upcomingActivities.length) % upcomingActivities.length);
                      }
                      touchStartX.current = 0;
                      touchEndX.current = 0;
                    }}
                  >
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${carouselIndex * 100}%)`,
                      }}
                    >
                      {upcomingActivities.map((activity) => (
                        <div key={activity.id} className="w-full flex-shrink-0">
                          <Card className="overflow-hidden shadow-lg border-2 border-orange-200">
                            <div className="grid md:grid-cols-2 gap-0">
                              <div className="relative h-64 md:h-80">
                                <img
                                  src={activity.thumbnail || "/placeholder.svg"}
                                  alt={activity.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                  <Badge variant="outline" className={getStatusBadgeClass(activity.status)}>
                                    {activity.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-6 md:p-8 flex flex-col justify-center gap-4 bg-white">
                                <div className="space-y-3">
                                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                    {activity.title}
                                  </h2>
                                  <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                                    {activity.description}
                                  </p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    {activity.startDate} - {activity.endDate}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    {activity.currentParticipants}/{activity.maxParticipants} người tham gia
                                  </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                  {activity.status === "Đã kết thúc" ? (
                                    <Button variant="outline" size="lg" disabled className="text-gray-500 cursor-not-allowed">
                                      Đã kết thúc
                                    </Button>
                                  ) : registeredActivityIds.has(activity.id) ? (
                                    <Button 
                                      className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2" 
                                      size="lg" 
                                      disabled
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                      Đã đăng ký
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="orange" 
                                      size="lg" 
                                      onClick={() => handleRegister(activity)}
                                      disabled={registeringId === activity.id || !canRegisterActivity(activity.raw)}
                                    >
                                      {registeringId === activity.id ? "Đang đăng ký..." : "Đăng ký ngay"}
                                    </Button>
                                  )}
                                  <Link
                                    to={`/activities/${activity.id}`}
                                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline self-center"
                                  >
                                    Xem chi tiết →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    {upcomingActivities.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                          onClick={() => setCarouselIndex((prev) => (prev - 1 + upcomingActivities.length) % upcomingActivities.length)}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                          onClick={() => setCarouselIndex((prev) => (prev + 1) % upcomingActivities.length)}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}

                    {/* Dots Indicator */}
                    {upcomingActivities.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {upcomingActivities.map((_, index) => (
                          <button
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === carouselIndex
                                ? "w-8 bg-orange-500"
                                : "w-2 bg-white/50 hover:bg-white/75"
                            }`}
                            onClick={() => setCarouselIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="py-16 text-center text-gray-500">
                  {error ? "Không thể tải dữ liệu hoạt động" : "Chưa có hoạt động sắp diễn ra"}
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
                      // Check if user is already registered from state
                      const isRegistered = registeredActivityIds.has(activity.id);
                      return (
                        <ActivityListItem
                          key={activity.id}
                          activity={activity}
                          onRegister={handleRegister}
                          isRegistering={registeringId === activity.id}
                          canRegister={canRegisterActivity(activity.raw)}
                          showTeacherNote={isSportsFestival && !isTeacher}
                          isRegistered={isRegistered}
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
