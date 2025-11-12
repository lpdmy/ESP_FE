"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Clock, CheckCircle2, AlertCircle, Eye, Star, Search, Calendar, ArrowRight } from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";
export default function JuryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize,setPageSize] = useState(10);
  const [pageNumber,setPageNumber] = useState(1);
  const [juryActivity,setJuryActivity] = useState([])
  const {getJuryAcitivty} = useJuryApi()
  const handldeLoadActivity = async() =>{
     try {
        const response = await getJuryAcitivty(searchQuery,pageSize,pageNumber)
        setJuryActivity(response.data.data)
        console.log(response.data.data)
     } catch (error) {
        console.log(error)
     }
  }
  function formatVietnamDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

  const juryAssignments = [
    {
      id: 1,
      activityTitle: "Cuộc thi Lập trình 2024",
      category: "Lập trình",
      submissionCount: 45,
      submissionsGraded: 32,
      submissionsPending: 13,
      status: "in-progress",
      startDate: "2024-01-15",
      endDate: "2024-02-28",
      role: "Giám khảo chính",
    },
    {
      id: 2,
      activityTitle: "Cuộc thi Vẽ tranh 'Mùa xuân'",
      category: "Mỹ thuật",
      submissionCount: 28,
      submissionsGraded: 28,
      submissionsPending: 0,
      status: "completed",
      startDate: "2024-01-10",
      endDate: "2024-01-31",
      role: "Giám khảo",
    },
    {
      id: 3,
      activityTitle: "Hội thảo 'AI trong Giáo dục'",
      category: "Hội thảo",
      submissionCount: 15,
      submissionsGraded: 0,
      submissionsPending: 15,
      status: "pending",
      startDate: "2024-02-20",
      endDate: "2024-03-30",
      role: "Giám khảo",
    },
    {
      id: 4,
      activityTitle: "Workshop 'Kỹ năng thuyết trình'",
      category: "Workshop",
      submissionCount: 22,
      submissionsGraded: 18,
      submissionsPending: 4,
      status: "in-progress",
      startDate: "2024-02-01",
      endDate: "2024-02-25",
      role: "Giám khảo phụ",
    },
    {
      id: 5,
      activityTitle: "Giải bóng đá Khoa Công nghệ",
      category: "Thể thao",
      submissionCount: 8,
      submissionsGraded: 8,
      submissionsPending: 0,
      status: "completed",
      startDate: "2023-12-20",
      endDate: "2024-01-10",
      role: "Trọng tài",
    },
  ];

  const stats = [
    {
      title: "Đang chấm",
      value: "2",
      description: "hoạt động",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Đã hoàn thành",
      value: "2",
      description: "hoạt động",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Chưa bắt đầu",
      value: "1",
      description: "hoạt động",
      icon: AlertCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng bài chấm",
      value: "86",
      description: "bài nộp",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  function getStatusBadge(status) {
    switch (status) {
      case "in-progress":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Đang chấm</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Hoàn thành</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Chưa bắt đầu</Badge>;
      default:
        return null;
    }
  }

  function getProgressColor(graded, total) {
    const percentage = (graded / total) * 100;
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-yellow-500";
  }

  const filteredAssignments = juryAssignments.filter((assignment) => {
    const matchesSearch = assignment.activityTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
useEffect(()=>{
handldeLoadActivity()
},[pageNumber,searchQuery])
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Danh sách giám khảo</h1>
          <p className="text-gray-600">Quản lý các hoạt động và bài nộp được phân công</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                  <SelectItem value="in-progress">Đang chấm</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả ({juryAssignments.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Chưa bắt đầu ({juryAssignments.filter((a) => a.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Đang chấm ({juryAssignments.filter((a) => a.status === "in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({juryAssignments.filter((a) => a.status === "completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {juryActivity.length > 0 ? (
              juryActivity.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Activity Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{assignment.activity.title}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                                {assignment.activity.subType}
                              </Badge>
                              {getStatusBadge(assignment.status)}
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {assignment.role}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Tổng bài nộp</div>
                            <div className="text-2xl font-bold">{assignment.submissionCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Đã chấm
                            </div>
                            <div className="text-2xl font-bold text-green-600">{assignment.submissionsGraded}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-4 h-4 text-orange-500" />
                              Chưa chấm
                            </div>
                            <div className="text-2xl font-bold text-orange-600">{assignment.submissionsPending}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Tiến độ</div>
                            <div className="text-2xl font-bold">
                              {Math.round((assignment.submissionsGraded / assignment.submissionCount) * 100)}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiến độ chấm điểm</span>
                            <span className="font-medium">
                              {assignment.submissionsGraded}/{assignment.submissionCount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(
                                assignment.submissionsGraded,
                                assignment.submissionCount
                              )} rounded-full transition-all`}
                              style={{
                                width: `${(assignment.submissionsGraded / assignment.submissionCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Timeline & Actions */}
                      <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="text-gray-600">Bắt đầu</div>
                                <div className="font-medium">{formatVietnamDate(assignment.activity.startDate)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="text-gray-600">Kết thúc</div>
                                <div className="font-medium">{formatVietnamDate(assignment.activity.endDate)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link href={`/activities/${assignment.id}/jury-submissions`}>
                            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white gap-2">
                              <Eye className="h-4 w-4" />
                              Xem bài nộp
                            </Button>
                          </Link>
                          {assignment.submissionsPending > 0 && (
                            <Link href={`/activities/${assignment.id}/grade`}>
                              <Button variant="outline" className="w-full gap-2 bg-transparent">
                                <Star className="h-4 w-4" />
                                Chấm điểm
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Không tìm thấy hoạt động phù hợp</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredAssignments
              .filter((a) => a.status === "pending")
              .map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{assignment.activityTitle}</h3>
                        <p className="text-sm text-gray-600">Sắp bắt đầu chấm: {assignment.submissionCount} bài nộp</p>
                      </div>
                      <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                        Xem chi tiết
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {filteredAssignments
              .filter((a) => a.status === "in-progress")
              .map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{assignment.activityTitle}</h3>
                        <p className="text-sm text-gray-600">Còn {assignment.submissionsPending} bài chưa chấm</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {assignment.submissionsGraded}/{assignment.submissionCount}
                        </div>
                        <p className="text-sm text-gray-600">bài đã chấm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredAssignments
              .filter((a) => a.status === "completed")
              .map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{assignment.activityTitle}</h3>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Hoàn thành chấm điểm – {assignment.submissionCount} bài
                        </p>
                      </div>
                      <Button variant="outline" className="bg-transparent">
                        Xem kết quả
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
