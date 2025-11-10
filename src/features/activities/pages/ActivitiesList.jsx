import React, { useState } from "react";
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
import Sidebar from "@/features/landing/components/Sidebar";
import ActivityListItem from "../components/ActivityListItem";
import CompactFilter from "../components/CompactFilter";

export default function ActivitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    subType: [],
    status: "all",
    location: "",
  });

  const featuredActivity = {
    id: 1,
    title: "Hội thao Liên trường 2024",
    description:
      "Giải thi đấu thể thao lớn nhất năm với nhiều môn thi đấu hấp dẫn",
    category: "Activity",
    subType: "SportsFestival",
    thumbnail: "/Picturemockdata/DSC03778.jpg",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    location: "Sân vận động FPT",
    organizer: "Đoàn trường",
    maxParticipants: 500,
    currentParticipants: 342,
    status: "Đang đăng ký",
  };

  const upcomingActivities = [
    {
      id: 2,
      title: "Cuộc thi vẽ tranh 'Mùa xuân'",
      description: "Thể hiện tài năng hội họa với chủ đề mùa xuân",
      category: "Event",
      subType: "DrawingContest",
      thumbnail: "/Picturemockdata/images (1).jpg",
      startDate: "2024-03-20",
      endDate: "2024-03-25",
      location: "Phòng mỹ thuật",
      organizer: "CLB Hội họa",
      maxParticipants: 100,
      currentParticipants: 67,
      status: "Đang đăng ký",
    },
    {
      id: 3,
      title: "Hội thảo 'AI trong Giáo dục'",
      description: "Khám phá ứng dụng AI trong học tập và giảng dạy",
      category: "Event",
      subType: "Seminar",
      thumbnail: "/Picturemockdata/download (3).jpg",
      startDate: "2024-03-18",
      endDate: "2024-03-18",
      location: "Hội trường A",
      organizer: "CLB Công nghệ",
      maxParticipants: 200,
      currentParticipants: 156,
      status: "Sắp diễn ra",
    },
    {
      id: 4,
      title: "Cuộc thi sáng tác 'Tuổi trẻ và ước mơ'",
      description: "Viết về ước mơ và hoài bão của tuổi trẻ",
      category: "Event",
      subType: "CreativeWriting",
      thumbnail: "/Picturemockdata/download (4).jpg",
      startDate: "2024-03-22",
      endDate: "2024-04-05",
      location: "Online",
      organizer: "CLB Văn học",
      maxParticipants: 150,
      currentParticipants: 89,
      status: "Đang đăng ký",
    },
  ];

  const allActivities = [
    ...upcomingActivities,
    {
      id: 5,
      title: "Workshop 'Kỹ năng thuyết trình'",
      description: "Nâng cao kỹ năng thuyết trình và giao tiếp",
      category: "Activity",
      subType: "Workshop",
      thumbnail: "/Picturemockdata/download (5).jpg",
      startDate: "2024-03-25",
      endDate: "2024-03-25",
      location: "Phòng 301",
      organizer: "Phòng Đào tạo",
      maxParticipants: 50,
      currentParticipants: 45,
      status: "Sắp đầy",
    },
    {
      id: 6,
      title: "Giải bóng đá Khoa Công nghệ",
      description: "Giải đấu bóng đá giao hữu giữa các lớp",
      category: "Activity",
      subType: "SportsFestival",
      thumbnail: "/Picturemockdata/DSC04766.jpg",
      startDate: "2024-02-20",
      endDate: "2024-02-28",
      location: "Sân bóng trường",
      organizer: "Khoa Công nghệ",
      maxParticipants: 200,
      currentParticipants: 200,
      status: "Đã kết thúc",
    },
    {
      id: 7,
      title: "Trận bán kết bóng chuyền nam",
      description: "Cuộc đối đầu căng thẳng giữa 12A1 và 12A2",
      category: "Activity",
      subType: "Volleyball",
      thumbnail: "/Picturemockdata/download (6).jpg",
      startDate: "2024-03-14",
      endDate: "2024-03-14",
      location: "Nhà thi đấu đa năng",
      organizer: "Ban Thể thao",
      maxParticipants: 200,
      currentParticipants: 180,
      status: "Đang diễn ra",
    },
    {
      id: 8,
      title: "Giải chạy marathon học sinh",
      description: "Cuộc thi chạy marathon dành cho toàn thể học sinh",
      category: "Activity",
      subType: "SportsFestival",
      thumbnail: "/Picturemockdata/download (7).jpg",
      startDate: "2024-04-01",
      endDate: "2024-04-01",
      location: "Sân vận động chính",
      organizer: "Ban Thể thao",
      maxParticipants: 300,
      currentParticipants: 245,
      status: "Sắp diễn ra",
    },
    {
      id: 9,
      title: "Cuộc thi hùng biện tiếng Anh",
      description: "Thể hiện khả năng hùng biện và giao tiếp tiếng Anh",
      category: "Event",
      subType: "Contest",
      thumbnail: "/Picturemockdata/download (8).jpg",
      startDate: "2024-03-28",
      endDate: "2024-03-30",
      location: "Hội trường lớn",
      organizer: "CLB Tiếng Anh",
      maxParticipants: 80,
      currentParticipants: 52,
      status: "Đang đăng ký",
    },
    {
      id: 10,
      title: "Lễ hội văn hóa dân gian",
      description: "Khám phá và trải nghiệm văn hóa truyền thống Việt Nam",
      category: "Event",
      subType: "Festival",
      thumbnail: "/Picturemockdata/IMG_1492.jpg",
      startDate: "2024-04-10",
      endDate: "2024-04-12",
      location: "Sân trường",
      organizer: "Đoàn trường",
      maxParticipants: 1000,
      currentParticipants: 678,
      status: "Sắp diễn ra",
    },
  ];

  const listFiltered = allActivities.filter((activity) => {
    const byText =
      !searchQuery ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const byCategory =
      selectedFilters.category.length === 0 ||
      selectedFilters.category.includes(activity.category);
    return byText && byCategory;
  });

  const tabFiltered = listFiltered.filter((activity) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") {
      return ["Đang đăng ký", "Sắp diễn ra"].includes(activity.status);
    }
    if (activeTab === "ongoing") {
      return ["Đang diễn ra", "Sắp đầy"].includes(activity.status);
    }
    if (activeTab === "ended") {
      return activity.status === "Đã kết thúc";
    }
    return true;
  });

  const totalPages = Math.ceil(tabFiltered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = tabFiltered.slice(startIndex, startIndex + itemsPerPage);

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
            <div className="flex items-center justify-between mb-6">
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
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hoạt động sắp tới</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">CLB</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Điểm</p>
                  <p className="text-2xl font-bold text-gray-900">450</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hạng</p>
                  <p className="text-2xl font-bold text-gray-900">#3</p>
                </div>
              </div>
            </Card>

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
                  {paginatedActivities.length > 0 ? (
                    paginatedActivities.map((activity) => (
                      <ActivityListItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      Không tìm thấy hoạt động nào
                    </div>
                  )}
                </div>
              </Card>

              {totalPages > 1 && (
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
