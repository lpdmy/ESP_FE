import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  FileText,
  Users,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
import { LoadingCard } from "@/common/components/ui/loading";

export default function ActivitiesWithoutJury() {
  const { getActivitiesWithoutJury } = useJuryApi();
  const toast = useToast();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const response = await getActivitiesWithoutJury();
      setActivities(response.data.data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sự kiện. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Chưa có";
    }
  };

  const handleAssignJury = (activityId) => {
    // Navigate to assign jury page for this activity
    navigate(`/admin/activities/${activityId}/assign-jury`);
  };

  if (isLoading) {
    return <LoadingCard isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sự kiện chưa có giám khảo
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các hoạt động/sự kiện chưa được phân công giám khảo
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadActivities}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Alert if no activities */}
      {activities.length === 0 && !isLoading && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  Tất cả sự kiện đã có giám khảo
                </p>
                <p className="text-sm text-green-700">
                  Không có sự kiện nào cần phân công giám khảo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      {activities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:shadow-lg transition-shadow border-orange-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {activity.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      activity.hasSubmissions
                        ? "bg-orange-100 text-orange-700 border-orange-300"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }
                  >
                    {activity.hasSubmissions
                      ? `${activity.submissionCount} bài nộp`
                      : "Chưa có bài nộp"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {activity.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  {activity.startDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        <strong>Bắt đầu:</strong> {formatDate(activity.startDate)}
                      </span>
                    </div>
                  )}
                  {activity.endDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        <strong>Kết thúc:</strong> {formatDate(activity.endDate)}
                      </span>
                    </div>
                  )}
                  {activity.submissionDeadline && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <FileText className="h-4 w-4" />
                      <span>
                        <strong>Hạn nộp:</strong>{" "}
                        {formatDate(activity.submissionDeadline)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleAssignJury(activity.id)}
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Users className="h-4 w-4" />
                  Phân công giám khảo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

