import React from "react";
import { Calendar, MapPin, Trophy, Medal } from "lucide-react";

export default function RaceRanking({ data }) {
  // data: { participants: [{name, className, time, rank, avatar}], date, location, tournament, eventName }
  const { participants = [], date, location, tournament, eventName } = data;
  const sorted = [...participants].sort((a, b) => a.rank - b.rank);

  // Tạo avatar từ tên (fallback nếu không có avatar)
  const getParticipantInitials = (name) => {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Màu cho huy chương
  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 via-yellow-500 to-yellow-600 ring-yellow-100";
    if (rank === 2) return "from-gray-300 via-gray-400 to-gray-500 ring-gray-100";
    if (rank === 3) return "from-orange-400 via-orange-500 to-orange-600 ring-orange-100";
    return "from-gray-200 via-gray-300 to-gray-400 ring-gray-50";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-600" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-500" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Kết quả xếp hạng</h3>
        {eventName && (
          <p className="text-lg text-gray-600 mb-6">{eventName}</p>
        )}

        {/* Thời gian - địa điểm - giải đấu */}
        {(date || location || tournament) && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 mb-6">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {date}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {location}
              </span>
            )}
            {tournament && (
              <span className="text-gray-500">{tournament}</span>
            )}
          </div>
        )}
      </div>

      {/* Bảng xếp hạng */}
      <div className="space-y-4">
        {sorted.map((participant, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              participant.rank <= 3
                ? "bg-gradient-to-r from-gray-50 to-white shadow-md border-2"
                : "bg-white shadow-sm border border-gray-100"
            }`}
          >
            {/* Hạng */}
            <div className="flex-shrink-0">
              {participant.rank <= 3 ? (
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${getRankColor(participant.rank)} flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg ring-4`}>
                  {getRankIcon(participant.rank) || participant.rank}
                </div>
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg md:text-xl">
                  {participant.rank}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {participant.avatar ? (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-gray-100 flex items-center justify-center">
                  <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md ring-2 ring-blue-100">
                  {getParticipantInitials(participant.name)}
                </div>
              )}
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-base md:text-lg mb-1">
                {participant.name}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{participant.className}</span>
                {participant.rank <= 3 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                    Top {participant.rank}
                  </span>
                )}
              </div>
            </div>

            {/* Thời gian */}
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl md:text-3xl font-black text-gray-900">
                {participant.time}
              </div>
              {participant.rank === 1 && (
                <div className="text-xs text-yellow-600 font-semibold mt-1">🏆 Nhất</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



