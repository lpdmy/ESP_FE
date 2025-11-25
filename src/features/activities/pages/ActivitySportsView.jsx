import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "@/features/landing/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar, MapPin, Users, Trophy, ArrowLeft } from "lucide-react";
import { LoadingCard } from "@/common/components/ui/loading";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "../services/activity.service";

const formatDate = (value) => {
  if (!value) return "Chưa xác định";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

export default function ActivitySportsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivity = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await executeApiCall(
        activityService.getActivityById.bind(activityService),
        [id, token],
        { setLoading, setError }
      );
      const detail = response?.data;
      setActivity(detail);
    } catch (fetchError) {
      console.error("Failed to fetch activity detail", fetchError);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadActivity();
    }
  }, [id, loadActivity]);

  // Nếu chỉ có 1 môn, redirect đến detail
  useEffect(() => {
    if (activity?.sports?.length === 1) {
      navigate(`/activities/${id}?sportId=${activity.sports[0].id}`, { replace: true });
    }
  }, [activity, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <LoadingCard isLoading text="Đang tải thông tin hoạt động..." />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center text-gray-500">
          {error ? "Không thể tải thông tin hoạt động" : "Hoạt động không tồn tại"}
        </div>
      </div>
    );
  }

  const sports = activity.sports || [];

  if (sports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center text-gray-500">
          Hoạt động này chưa có môn thi đấu
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8 justify-center">
          <aside className="hidden lg:block w-64 sticky top-[88px] self-start flex-shrink-0">
            <Sidebar />
          </aside>

          <div className="flex-1 min-w-0" style={{ maxWidth: "1200px", width: "100%" }}>
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate("/activities")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {activity.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {activity.location || "Đang cập nhật"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {activity.numberOfParticipants ?? 0}/{activity.maxParticipants ?? 0} người tham gia
                </span>
              </div>
            </div>

            {/* Danh sách môn thi đấu */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Các môn thi đấu</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sports.map((sport) => (
                  <Card
                    key={sport.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate(`/activities/${id}?sportId=${sport.id}`)}
                  >
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-8 w-8" />
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          Môn thi đấu
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{sport.sportName}</h3>
                      <Button className="w-full" variant="orange" asChild>
                        <Link to={`/activities/${id}?sportId=${sport.id}`}>Xem chi tiết</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

