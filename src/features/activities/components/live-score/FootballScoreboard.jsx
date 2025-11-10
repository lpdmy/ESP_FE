import React from "react";
import { Calendar, MapPin } from "lucide-react";

export default function FootballScoreboard({ data }) {
  // data: { homeTeam, awayTeam, homeScore, awayScore, minute, events[], date, location, tournament, homeLogo, awayLogo }
  const { homeTeam, awayTeam, homeScore, awayScore, minute, events = [], date, location, tournament, homeLogo, awayLogo } = data;

  // Tạo avatar từ tên đội (fallback nếu không có logo)
  const getTeamInitials = (teamName) => {
    const parts = teamName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return teamName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tỉ số trận đấu</h3>
        
        {/* Header đội tuyển với avatar - layout rộng hơn */}
        <div className="flex items-center justify-between gap-8 md:gap-12 mb-6 px-4">
          {/* Đội nhà */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="relative">
              {homeLogo ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-orange-100 flex items-center justify-center">
                  <img src={homeLogo} alt={homeTeam} className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl ring-4 ring-orange-100">
                  {getTeamInitials(homeTeam)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{homeTeam}</div>
          </div>

          {/* Tỉ số - lớn hơn và rộng hơn */}
          <div className="flex items-center gap-6 md:gap-8 px-6 md:px-8">
            <span className="text-7xl md:text-8xl font-black text-gray-900 tracking-tight">
              {homeScore}
            </span>
            <span className="text-4xl md:text-5xl font-bold text-gray-400">-</span>
            <span className="text-7xl md:text-8xl font-black text-gray-900 tracking-tight">
              {awayScore}
            </span>
          </div>

          {/* Đội khách */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="relative">
              {awayLogo ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-blue-100 flex items-center justify-center">
                  <img src={awayLogo} alt={awayTeam} className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl ring-4 ring-blue-100">
                  {getTeamInitials(awayTeam)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{awayTeam}</div>
          </div>
        </div>

        {/* Thời gian - địa điểm - giải đấu */}
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

        {minute && (
          <div className="text-sm font-medium text-orange-600 mb-4">
            Phút {minute}'
          </div>
        )}
      </div>

      {/* Timeline bàn thắng */}
      {events && events.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Bàn thắng</h4>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2.5"
              >
                <span className="text-lg">⚽</span>
                <span className="font-semibold text-gray-900">{event.minute}'</span>
                <span className="text-gray-600">–</span>
                <span className="font-medium text-gray-900">{event.team}</span>
                <span className="text-gray-500">{event.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
