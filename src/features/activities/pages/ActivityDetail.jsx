import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/features/landing/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import FootballScoreboard from "../components/live-score/FootballScoreboard";
import VolleyballScoreboard from "../components/live-score/VolleyballScoreboard";
import BadmintonScoreboard from "../components/live-score/BadmintonScoreboard";
import RaceRanking from "../components/live-score/RaceRanking";

const MOCK_ACTIVITIES = {
  "1": { id: 1, title: "Hội thao Liên trường 2024", type: "football" },
  "2": { id: 2, title: "Giải bóng chuyền khối 12", type: "volleyball" },
  "3": { id: 3, title: "Giải cầu lông đôi nam", type: "badminton" },
  "4": { id: 4, title: "Chạy 100m nam", type: "race" },
};

const UPCOMING_MATCHES = [
  {
    id: "final-football",
    title: "Chung kết bóng đá",
    date: "17/03/2024 • 18:30",
    location: "Sân vận động FPT",
    status: "Sắp diễn ra",
  },
  {
    id: "semi-volleyball",
    title: "Bán kết bóng chuyền",
    date: "14/03/2024 • 15:00",
    location: "Nhà thi đấu đa năng",
    status: "Đang diễn ra",
  },
  {
    id: "relay-race",
    title: "Giải chạy tiếp sức",
    date: "20/03/2024 • 07:00",
    location: "Sân vận động chính",
    status: "Đang đăng ký",
  },
];

export default function ActivityDetail() {
  const { id } = useParams();
  const activity = MOCK_ACTIVITIES[id] || {
    id,
    title: "Hoạt động",
    type: "football",
  };

  const renderScore = () => {
    switch (activity.type) {
      case "football":
        return (
          <FootballScoreboard
            data={{
              homeTeam: "Barcelona",
              awayTeam: "Real Madrid",
              homeScore: 1,
              awayScore: 2,
              minute: 67,
              date: "15/03/2024 • 09:00",
              location: "Sân vận động chính",
              tournament: "Giải Liên trường 2024",
              homeLogo: "https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png",
              awayLogo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png",
              events: [
                { minute: 12, team: "Barcelona", description: "ghi bàn" },
                { minute: 35, team: "Real Madrid", description: "ghi bàn" },
                { minute: 60, team: "Real Madrid", description: "ghi bàn" },
              ],
            }}
          />
        );
      case "volleyball":
        return (
          <VolleyballScoreboard
            data={{
              teamA: "Lớp 12A1",
              teamB: "Lớp 12A2",
              sets: [{ a: 25, b: 20 }, { a: 22, b: 25 }, { a: 15, b: 13 }],
              faultsA: 5,
              faultsB: 7,
              date: "15/03/2024 • 14:00",
              location: "Nhà thi đấu đa năng",
              tournament: "Giải bóng chuyền khối 12",
            }}
          />
        );
      case "badminton":
        return (
          <BadmintonScoreboard
            data={{
              playerA: "Trí - Nam",
              playerB: "Minh - Huy",
              sets: [{ a: 21, b: 18 }, { a: 17, b: 21 }, { a: 21, b: 19 }],
              faultsA: 2,
              faultsB: 3,
              date: "16/03/2024 • 10:00",
              location: "Sân cầu lông số 3",
              tournament: "Giải cầu lông đôi nam",
            }}
          />
        );
      case "race":
        return (
          <RaceRanking
            data={{
              eventName: "Chạy 100m nam",
              participants: [
                { name: "Nguyễn An", className: "12A1", time: "11.24s", rank: 1 },
                { name: "Trần Bình", className: "12A3", time: "11.40s", rank: 2 },
                { name: "Phạm Cường", className: "12A2", time: "11.73s", rank: 3 },
                { name: "Lê Đức", className: "11A5", time: "11.85s", rank: 4 },
                { name: "Hoàng Minh", className: "12A1", time: "12.01s", rank: 5 },
              ],
              date: "17/03/2024 • 08:00",
              location: "Sân vận động chính",
              tournament: "Hội thao Liên trường 2024",
            }}
          />
        );
      default:
        return null;
    }
  };

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {activity.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>ID: {activity.id}</span>
                    <Badge variant="secondary" className="capitalize">
                      Môn {activity.type}
                    </Badge>
                  </div>
                </div>
                <Button variant="orange" size="lg" className="w-full md:w-auto">
                  Đăng ký tham gia
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Cột trái: Nội dung chính */}
              <div className="lg:col-span-8 space-y-8">
                {/* Thông tin sự kiện */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin sự kiện</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-base">
                      Đây là trang chi tiết hoạt động. Nội dung mô tả, thể lệ tham gia và các thông tin chung sẽ hiển thị tại đây.
                      Bạn có thể cập nhật dữ liệu thực tế từ backend trong tương lai.
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        15/03 - 17/03/2024
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        Sân vận động FPT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tỉ số / Kết quả - Bọc trong card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  {renderScore()}
                </div>

                {/* Lịch thi đấu */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lịch thi đấu</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">15/03/2024 • 08:00 - 17:00</p>
                        <p className="text-sm text-gray-600 mt-1">Vòng bảng</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Sân vận động chính</p>
                        <p className="text-sm text-gray-600 mt-1">Địa điểm thi đấu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">8 đội tham gia</p>
                        <p className="text-sm text-gray-600 mt-1">Vòng bảng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Đội tham gia */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Đội tham gia</h3>
                  <div className="space-y-4">
                    {[
                      "Lớp 12A1",
                      "Lớp 12A2",
                      "Lớp 12A3",
                      "Lớp 11A5",
                    ].map((team) => (
                      <div
                        key={team}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <span className="text-sm font-medium text-gray-900">{team}</span>
                        <Badge variant="outline" className="text-xs">Học sinh</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trận sắp tới */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Trận sắp tới</h3>
                  <div className="space-y-4">
                    {UPCOMING_MATCHES.map((match) => (
                      <div
                        key={match.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <p className="font-semibold text-sm text-gray-900 mb-2">{match.title}</p>
                        <p className="text-xs text-gray-500 mb-1">{match.date}</p>
                        <p className="text-xs text-gray-500 mb-2">{match.location}</p>
                        <Badge variant="secondary" className="text-xs">
                          {match.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
