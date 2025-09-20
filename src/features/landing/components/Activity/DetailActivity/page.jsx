import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import mockLeaderboardData from "@/mock_data/leaderBoard.json";
import { LoadingOverlayListActivity } from '@/common/components/ui/loading';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  Medal,
  Star,
  Target,
  BookOpen,
  Music,
  Palette,
  Code,
  Heart,
} from "lucide-react";
import { useActivityApi } from "@/features/landing/hooks/useActivityApi";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activityLoading,
    getActivityDetail,
    error,
  } = useActivityApi();
  const [activity, setActivity] = useState(null);
  const mockLeaderboard = mockLeaderboardData;
  useEffect(() => {
  if (!id) return;
  console.log("Fetching detail for id:", id);
  const fetchDetail = async () => {
    try {
      const data = await getActivityDetail(parseInt(id, 10));
      console.log("API result:", data.data);
      setActivity(data.data);
    } catch (err) {
      console.error("Lỗi khi gọi getActivityDetail:", err);
    }
  };
  fetchDetail();
}, []);
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h1>
            <p className="text-red-600 mb-4">{error.message || "Không thể tải thông tin sự kiện."}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const event = activity ?? {};
  const isCompetition = event.category === 1;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">#{rank}</span>;
    }
  };
  
  return (
    <div className="w-full">
        {activityLoading && <LoadingOverlayListActivity isLoading={true} />}
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/50 hover:bg-white/80">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>

            {/* Event Header */}
            <Card className="glass hover-lift mb-6">
              <CardContent className="pb-6 pt-6 pl-6 pr-6 py-3 bg-white border-2 border-orange-200 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-4 ">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 ">
                      <h1 className="text-3xl font-bold gradient-text">{event.title}</h1>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Ngày tổ chức</p>
                      <p className="text-sm">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Ngày kết thúc</p>
                      <p className="text-sm">{formatDate(event.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Địa điểm</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>
                  {isCompetition && event.prize && (
                    <div className="flex items-center text-gray-600">
                      <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Giải thưởng</p>
                        <p className="text-sm font-semibold text-orange-600">{event.prize}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>
                  {event.numberOfParticipants}/{event.maxParticipants} người tham gia
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Target className="w-5 h-5 mr-2" />
                <span>Tổ chức bởi {event.organizer}</span>
              </div>
            </div>
                  <div className="flex gap-2">
                   {new Date(event.endRegisterDate) > new Date() ? (
                   <Button size="sm" className="btn-primary">
                    Đăng ký
                    </Button>
                   ) : (
                    <Button size="sm" variant="outline" disabled>
                     Hết thời gian
                  </Button>
                 )}
                 </div>
                </div>
                {event?.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs mr-2">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <div className={`grid grid-cols-1 ${isCompetition ? "lg:grid-cols-3" : ""} gap-6`}>
              {/* Event Rules */}
              <div className={isCompetition ? "lg:col-span-1" : ""}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-orange-500" />
                      {isCompetition ? "Thể lệ cuộc thi" : "Quy định tham gia"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-6 pt-6 pl-6 pr-6 py-3 bg-white border-2 border-orange-200 p-4 rounded-lg">
                    {event.rules && event.rules.length > 0 ? (
                      <ul className="space-y-3">
                        {event.rules.map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-600 leading-relaxed">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-m text-gray-500 italic">Không có quy định</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* Leaderboard */}
              {isCompetition && (
                <div className="lg:col-span-2 ">
                  <Card className="glass ">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                          Bảng xếp hạng
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Top 10
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6 pt-6 pl-6 pr-6 py-3 bg-white border-2 border-orange-200 p-4 rounded-lg">
                      <div className="space-y-2">
                        {mockLeaderboard.map((participant) => (
                          <div
                            key={participant.rank}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              participant.isCurrentUser
                                ? "bg-orange-50 border-2 border-orange-200 shadow-sm"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8">
                                {getRankIcon(participant.rank)}
                              </div>
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="text-xs font-semibold">
                                  {participant.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p
                                  className={`font-medium ${
                                    participant.isCurrentUser ? "text-orange-700" : "text-gray-900"
                                  }`}
                                >
                                  {participant.name}
                                  {participant.isCurrentUser && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Bạn
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  participant.isCurrentUser ? "text-orange-600" : "text-gray-900"
                                }`}
                              >
                                {participant.score} điểm
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
    </div>
  );
}
