"use client";

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { Input } from "@/common/components/ui/input";
import { Search, Calendar, CheckCircle2, Clock, Eye } from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";

export default function JuryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize] = useState(10);
  const [pageNumber] = useState(1);
  const [juryActivity, setJuryActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const { getJuryAcitivty } = useJuryApi();

  const handleLoadActivity = async () => {
    try {
      const response = await getJuryAcitivty(searchQuery, pageSize, pageNumber);
      setJuryActivity(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  function formatVietnamDate(date) {
    return new Date(date).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function getActivityStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "pending";
    if (now > end) return "completed";
    return "in-progress";
  }

  function getStatusBadge(status) {
    switch (status) {
      case "in-progress":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            Đang chấm
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Hoàn thành
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Chưa bắt đầu
          </Badge>
        );
      default:
        return null;
    }
  }

  // ✅ FIX: KHÔNG CHIA 0 / 0
  function getProgressColor(graded, total) {
    if (total === 0) return "bg-gray-300";
    if (graded === total) return "bg-green-500";

    const percentage = (graded / total) * 100;
    if (percentage >= 50) return "bg-orange-500";
    return "bg-yellow-500";
  }

  const activitiesWithStatus = useMemo(
    () =>
      juryActivity.map((assignment) => ({
        ...assignment,
        status: getActivityStatus(
          assignment.activity.startDate,
          assignment.activity.endDate
        ),
      })),
    [juryActivity]
  );

  const countCompleted = activitiesWithStatus.filter(
    (x) => x.status === "completed"
  ).length;
  const countInProgress = activitiesWithStatus.filter(
    (x) => x.status === "in-progress"
  ).length;
  const countPending = activitiesWithStatus.filter(
    (x) => x.status === "pending"
  ).length;

  useEffect(() => {
    handleLoadActivity();
  }, [pageNumber, searchQuery]);

  const filteredActivities = activitiesWithStatus.filter(
    (a) => activeTab === "all" || a.status === activeTab
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Danh sách cuộc thi
          </h1>
          <p className="text-gray-600">
            Quản lý các hoạt động và bài nộp được phân công
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activities list */}
        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="all">
              Tất cả ({activitiesWithStatus.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Chưa bắt đầu ({countPending})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Đang chấm ({countInProgress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({countCompleted})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-gray-500 italic mt-4">
                Không có hoạt động nào trong mục này.
              </p>
            ) : (
              filteredActivities.map((assignment) => {
                const completed =
                  assignment.activity.numberOfCompletedSubmission;
                const total = assignment.activity.numberOfSubmission;

                // ✅ FIX: normalize progress
                const progress =
                  total === 0
                    ? 0
                    : Math.round((completed / total) * 100);

                return (
                  <Card
                    key={assignment.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-2">
                            {assignment.activity.title}
                          </h3>

                          <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-orange-50 border-orange-200 text-orange-700">
                              {assignment.activity.subType}
                            </Badge>
                            {getStatusBadge(assignment.status)}
                            <Badge className="bg-blue-50 text-blue-700">
                              {assignment.role}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Tổng bài nộp
                              </p>
                              <p className="text-2xl font-bold">{total}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 flex gap-1 items-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Đã chấm
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {completed}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 flex gap-1 items-center">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Chưa chấm
                              </p>
                              <p className="text-2xl font-bold text-orange-600">
                                {assignment.activity.numberOfPendingSubmission}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600">Tiến độ</p>
                              <p className="text-2xl font-bold">{progress}%</p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Tiến độ chấm
                              </span>
                              <span className="font-medium">
                                {completed}/{total}
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-full ${getProgressColor(
                                  completed,
                                  total
                                )} rounded-full transition-all`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="lg:w-64 flex-shrink-0">
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-gray-600">Bắt đầu</p>
                                <p className="font-medium">
                                  {formatVietnamDate(
                                    assignment.activity.startDate
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-gray-600">Kết thúc</p>
                                <p className="font-medium">
                                  {formatVietnamDate(
                                    assignment.activity.endDate
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/jury/submission/${assignment.activityId}`}
                          >
                            <Button className="w-full gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                              <Eye className="h-4 w-4" />
                              Xem bài nộp
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
