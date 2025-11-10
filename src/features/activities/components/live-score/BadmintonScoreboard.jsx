import React from "react";
import { Calendar, MapPin } from "lucide-react";

export default function BadmintonScoreboard({ data }) {
  // data: { playerA, playerB, sets: [{a,b}], faultsA, faultsB, playerALogo, playerBLogo, date, location, tournament }
  const { playerA, playerB, sets = [], faultsA = 0, faultsB = 0, playerALogo, playerBLogo, date, location, tournament } = data;
  const setsWonA = sets.filter(s => s.a > s.b).length;
  const setsWonB = sets.filter(s => s.b > s.a).length;

  // Tạo avatar từ tên cầu thủ (fallback nếu không có logo)
  const getPlayerInitials = (playerName) => {
    const parts = playerName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return playerName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tỉ số trận đấu</h3>
        
        {/* Header cầu thủ với avatar */}
        <div className="flex items-center justify-between gap-8 md:gap-12 mb-6 px-4">
          {/* Cầu thủ A */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="relative">
              {playerALogo ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-orange-100 flex items-center justify-center">
                  <img src={playerALogo} alt={playerA} className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl ring-4 ring-orange-100">
                  {getPlayerInitials(playerA)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900 text-center">{playerA}</div>
          </div>

          {/* Tỉ số sets - lớn và rộng */}
          <div className="flex flex-col items-center gap-2 px-6 md:px-8">
            <div className="flex items-center gap-6 md:gap-8">
              <span className="text-7xl md:text-8xl font-black text-gray-900 tracking-tight">
                {setsWonA}
              </span>
              <span className="text-4xl md:text-5xl font-bold text-gray-400">-</span>
              <span className="text-7xl md:text-8xl font-black text-gray-900 tracking-tight">
                {setsWonB}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sets</div>
          </div>

          {/* Cầu thủ B */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="relative">
              {playerBLogo ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-blue-100 flex items-center justify-center">
                  <img src={playerBLogo} alt={playerB} className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl ring-4 ring-blue-100">
                  {getPlayerInitials(playerB)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900 text-center">{playerB}</div>
          </div>
        </div>

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

      {/* Chi tiết các set */}
      {sets && sets.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Chi tiết các set</h4>
          <div className="grid grid-cols-3 gap-4">
            {sets.map((set, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Set {i + 1}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {set.a} - {set.b}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {set.a > set.b ? playerA : playerB} thắng
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thống kê lỗi */}
      {(faultsA > 0 || faultsB > 0) && (
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Thống kê lỗi</h4>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">{playerA}</div>
              <div className="text-2xl font-bold text-gray-900">{faultsA}</div>
            </div>
            <div className="text-gray-400">-</div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">{playerB}</div>
              <div className="text-2xl font-bold text-gray-900">{faultsB}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


