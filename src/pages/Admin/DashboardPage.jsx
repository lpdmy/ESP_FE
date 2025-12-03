import { useEffect, useState } from "react";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { LoadingCard } from "@/common/components/ui/loading";
import { dashboardService } from "@/features/admin/services/dashboard.service";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { useToast } from "@/common/hooks/useToast";
import { Users, UserCog, UserCheck, Activity, BarChart3, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const ROLE_COLORS = ["#0f766e", "#2563eb", "#f97316"];

export default function DashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [classDashboard, setClassDashboard] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [userRes, classRes, activityRes] = await Promise.all([
          executeApiCall(dashboardService.getUserStatistics.bind(dashboardService), [token], { setLoading }),
          executeApiCall(dashboardService.getClassGroupDashboard.bind(dashboardService), [token], { setLoading }),
          executeApiCall(dashboardService.getActivitySummary.bind(dashboardService), [token], { setLoading }),
        ]);

        setUserStats(userRes?.data || null);
        setClassDashboard(classRes?.data || null);
        setActivitySummary(activityRes?.data || null);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error(error?.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalActivities = activitySummary?.totalCount || 0;
  const stats = [
    {
      title: "Tổng người dùng",
      value: userStats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "Tất cả tài khoản trong hệ thống",
    },
    {
      title: "Đang hoạt động",
      value: userStats?.activeUsers ?? 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "Người dùng có trạng thái Active",
    },
    {
      title: "Tổng lớp học",
      value: classDashboard?.statistics?.totalClasses ?? 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Số lớp đang được quản lý",
    },
    {
      title: "Tổng hoạt động",
      value: totalActivities,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "Số hoạt động ngoại khóa / sự kiện",
    },
  ];

  const roleChartData = userStats
    ? [
        { name: "Học sinh", value: userStats.students },
        { name: "Giáo viên", value: userStats.teachers },
        { name: "Admin", value: userStats.admins },
      ]
    : [];

  const classByGradeData =
    classDashboard?.classesByGrade?.map((g) => ({
      grade: g.gradeName,
      classes: g.classCount,
      students: g.studentCount,
    })) || [];

  return (
    <AdminPageLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Tổng quan hệ thống: người dùng, lớp học và hoạt động
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingCard text="Đang tải dữ liệu dashboard..." />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
                    <div className="text-xs text-gray-500">{stat.trend}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Phân bố lớp & học sinh theo khối
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {classByGradeData.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Chưa có dữ liệu lớp học.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classByGradeData}>
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="classes" name="Số lớp" fill="#3b82f6" />
                        <Bar dataKey="students" name="Số học sinh" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-600" />
                    Tỉ lệ vai trò người dùng
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  {roleChartData.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Chưa có dữ liệu người dùng.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={roleChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {roleChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
