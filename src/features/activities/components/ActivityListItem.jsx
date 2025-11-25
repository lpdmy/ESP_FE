import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";

export default function ActivityListItem({
  activity,
  onRegister,
  isRegistering,
  canRegister = true,
  showTeacherNote = false,
  isRegistered = false,
}) {
  const handleRegister = () => {
    if (onRegister) {
      onRegister(activity);
    }
  };

  // Get badge color based on status
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

  const isEnded = activity.status === "Đã kết thúc";

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={activity.thumbnail || "/placeholder.svg"}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {activity.category}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(activity.status)}`}>
                {activity.status}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
              {activity.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {activity.startDate} - {activity.endDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {activity.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activity.currentParticipants}/{activity.maxParticipants} người
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {isEnded ? (
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="text-gray-500 cursor-not-allowed"
              >
                Đã kết thúc
              </Button>
            ) : isRegistered ? (
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2" 
                size="sm" 
                disabled
              >
                <CheckCircle className="w-4 h-4" />
                Đã đăng ký
              </Button>
            ) : canRegister ? (
              <Button variant="orange" size="sm" onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            ) : (
              showTeacherNote && (
                <span className="text-[11px] text-gray-500 text-right">
                  Chỉ giáo viên chủ nhiệm được đăng ký
                </span>
              )
            )}
            <Link
              to={
                activity.raw?.sports?.length > 1
                  ? `/activities/${activity.id}/sports`
                  : `/activities/${activity.id}`
              }
              className="text-xs text-orange-600 hover:text-orange-700 hover:underline"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

