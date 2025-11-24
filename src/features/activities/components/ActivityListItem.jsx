import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";

export default function ActivityListItem({
  activity,
  onRegister,
  isRegistering,
  canRegister = true,
  showTeacherNote = false,
}) {
  const handleRegister = () => {
    if (onRegister) {
      onRegister(activity);
    }
  };

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
              <Badge variant="outline" className="text-xs">
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
            {canRegister ? (
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
              to={`/activities/${activity.id}`}
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

