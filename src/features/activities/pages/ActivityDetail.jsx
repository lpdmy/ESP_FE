import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "@/features/landing/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar, MapPin, Users, Clock, Play, Edit, Square } from "lucide-react";
import FootballScoreboard from "../components/live-score/FootballScoreboard";
import VolleyballScoreboard from "../components/live-score/VolleyballScoreboard";
import BadmintonScoreboard from "../components/live-score/BadmintonScoreboard";
import RaceRanking from "../components/live-score/RaceRanking";
import UpdateScoreModal from "../components/UpdateScoreModal";
import { LoadingCard } from "@/common/components/ui/loading";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "../services/activity.service";
import { activityMatchService } from "../services/activityMatch.service";
import { useActivityRegistration } from "../hooks/useActivityRegistration";
import { ROLE } from "@/common/constants/roles";

const MATCH_STATUS_LABELS = {
  Pending: "Sắp diễn ra",
  InProgress: "Đang diễn ra",
  Completed: "Đã kết thúc",
  Cancelled: "Đã hủy",
};

const STATUS_MAP = {
  0: "Pending",
  1: "InProgress",
  2: "Completed",
  3: "Cancelled",
};

const normalizeStatus = (status) => {
  if (typeof status === "number") return STATUS_MAP[status] ?? "Pending";
  if (typeof status === "string") return status;
  return "Pending";
};

const detectScoreboardType = (sportName = "") => {
  const name = sportName.toLowerCase();
  if (name.includes("chuyền")) return "volleyball";
  if (name.includes("cầu lông")) return "badminton";
  if (name.includes("chạy") || name.includes("marathon") || name.includes("race")) return "race";
  return "football";
};

const formatDate = (value, withTime = false) => {
  if (!value) return "Chưa xác định";
  try {
    const date = new Date(value);
    return withTime ? date.toLocaleString("vi-VN") : date.toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

const buildScoreboardData = (match, type, context) => {
  if (!match) return null;
  const baseDate = formatDate(match.matchDate, true);
  const baseLocation = match.location || context?.location || "Đang cập nhật";
  const tournament = context?.title ?? "Hoạt động thể thao";
  const teamA = match.classGroup1Name ?? "Chưa xác định";
  const teamB = match.classGroup2Name ?? "Chưa xác định";
  const score1 = match.score1 ?? 0;
  const score2 = match.score2 ?? 0;
  const buildSets = () => [{ a: score1, b: score2 }];
  const raceParticipants = () => {
    const participants = [];
    if (teamA) {
      participants.push({
        name: teamA,
        className: match.grade ? `Khối ${match.grade}` : "",
        time: score1 ? `${score1} đ` : "--",
        rank: match.winnerClassGroupId === match.classGroup1Id ? 1 : 2,
      });
    }
    if (teamB) {
      participants.push({
        name: teamB,
        className: match.grade ? `Khối ${match.grade}` : "",
        time: score2 ? `${score2} đ` : "--",
        rank: match.winnerClassGroupId === match.classGroup2Id ? 1 : participants.length + 1,
      });
    }
    return participants.map((participant, index) => ({
      ...participant,
      rank: participant.rank ?? index + 1,
    }));
  };

  switch (type) {
    case "volleyball":
      return {
        teamA,
        teamB,
        sets: buildSets(),
        faultsA: 0,
        faultsB: 0,
        date: baseDate,
        location: baseLocation,
        tournament,
      };
    case "badminton":
      return {
        playerA: teamA,
        playerB: teamB,
        sets: buildSets(),
        faultsA: 0,
        faultsB: 0,
        date: baseDate,
        location: baseLocation,
        tournament,
      };
    case "race":
      return {
        eventName: tournament,
        participants: raceParticipants(),
        date: baseDate,
        location: baseLocation,
        tournament,
      };
    default:
      return {
        homeTeam: teamA,
        awayTeam: teamB,
        homeScore: score1,
        awayScore: score2,
        minute: null,
        date: baseDate,
        location: baseLocation,
        tournament,
        events: [],
      };
  }
};

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.user?.user);
  const isAdmin = user?.role === ROLE.ADMIN || user?.role === ROLE.TEACHER;
  
  const [activity, setActivity] = useState(null);
  const [selectedSportId, setSelectedSportId] = useState(null);
  const [scoreboardMatch, setScoreboardMatch] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [participatingClasses, setParticipatingClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bracketLoading, setBracketLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bracketError, setBracketError] = useState(null);
  const [showUpdateScoreModal, setShowUpdateScoreModal] = useState(false);
  const {
    register: registerActivity,
    registeringId,
    canRegisterActivity,
    isTeacher,
  } = useActivityRegistration();

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
      
      // Logic: Nếu có 2+ môn và chưa có sportId trong URL, redirect đến sports view
      if (detail?.sports?.length > 1) {
        const sportIdFromUrl = searchParams.get("sportId");
        if (!sportIdFromUrl) {
          navigate(`/activities/${id}/sports`, { replace: true });
          return;
        }
        setSelectedSportId(parseInt(sportIdFromUrl, 10));
      } else if (detail?.sports?.length === 1) {
        setSelectedSportId(detail.sports[0].id);
      } else {
        setSelectedSportId(null);
      }
    } catch (fetchError) {
      console.error("Failed to fetch activity detail", fetchError);
    }
  }, [id, navigate, searchParams]);

  useEffect(() => {
    if (id) {
      loadActivity();
    }
  }, [id, loadActivity]);

  useEffect(() => {
    if (!activity || !selectedSportId) {
      setScoreboardMatch(null);
      setUpcomingMatches([]);
      setParticipatingClasses([]);
      return;
    }

    const token = localStorage.getItem("token");

    const loadBracket = async () => {
      try {
        const response = await executeApiCall(
          activityMatchService.getBracket.bind(activityMatchService),
          [{ activityId: activity.id, sportId: selectedSportId }, token],
          { setLoading: setBracketLoading, setError: setBracketError }
        );
        const data = response?.data;
        const rounds = data?.rounds ?? [];
        const matches = rounds.flatMap((round) =>
          (round.matches ?? []).map((match) => ({
            ...match,
            roundName: round.roundName,
            roundNumber: round.roundNumber,
          }))
        );

        const uniqueClasses = new Set();
        matches.forEach((match) => {
          if (match.classGroup1Name) uniqueClasses.add(match.classGroup1Name);
          if (match.classGroup2Name) uniqueClasses.add(match.classGroup2Name);
        });
        setParticipatingClasses(Array.from(uniqueClasses));

        const prioritizedMatch =
          matches.find((match) => normalizeStatus(match.status) === "InProgress") ||
          matches.find((match) => normalizeStatus(match.status) === "Pending") ||
          matches.find((match) => normalizeStatus(match.status) === "Completed") ||
          null;
        setScoreboardMatch(prioritizedMatch);
        setUpcomingMatches(
          matches.filter((match) => normalizeStatus(match.status) === "Pending").slice(0, 3)
        );
      } catch (fetchError) {
        console.error("Failed to fetch bracket", fetchError);
      }
    };

    loadBracket();
  }, [activity, selectedSportId]);

  const selectedSport = useMemo(() => {
    if (!activity?.sports?.length || !selectedSportId) return null;
    return activity.sports.find((sport) => sport.id === selectedSportId) ?? activity.sports[0];
  }, [activity, selectedSportId]);

  const scoreboardType = detectScoreboardType(selectedSport?.sportName ?? activity?.subType ?? "");
  const scoreboardData = useMemo(
    () => buildScoreboardData(scoreboardMatch, scoreboardType, activity),
    [activity, scoreboardMatch, scoreboardType]
  );

  const renderScore = () => {
    if (bracketLoading) {
      return <div className="text-center text-gray-500">Đang tải dữ liệu thi đấu...</div>;
    }

    if (!scoreboardData) {
      return (
        <div className="text-center text-gray-500">
          {bracketError ? "Chưa có bracket cho môn thi đấu này" : "Chưa có dữ liệu trận đấu"}
        </div>
      );
    }

    switch (scoreboardType) {
      case "volleyball":
        return <VolleyballScoreboard data={scoreboardData} />;
      case "badminton":
        return <BadmintonScoreboard data={scoreboardData} />;
      case "race":
        return <RaceRanking data={scoreboardData} />;
      default:
        return <FootballScoreboard data={scoreboardData} />;
    }
  };

  const handleRegister = useCallback(async () => {
    if (!activity?.id) return;
    try {
      await registerActivity({ activityId: activity.id, activitySubType: activity.subType });
      await loadActivity();
    } catch (registerError) {
      console.error("Register activity failed", registerError);
    }
  }, [activity?.id, loadActivity, registerActivity]);

  const canRegister = canRegisterActivity(activity);
  const isSportsFestival =
    (activity?.subType ?? activity?.SubType ?? "").toLowerCase() === "sportsfestival";

  const renderUpcomingMatches = () => {
    if (bracketLoading) {
      return <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!upcomingMatches.length) {
      return <div className="text-sm text-gray-500">Chưa có trận sắp tới</div>;
    }

    return upcomingMatches.map((match) => (
      <div key={match.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
        <p className="font-semibold text-sm text-gray-900 mb-1">
          {match.classGroup1Name || "Đang cập nhật"} vs {match.classGroup2Name || "Đang cập nhật"}
        </p>
        <p className="text-xs text-gray-500 mb-1">{formatDate(match.matchDate, true)}</p>
        <p className="text-xs text-gray-500 mb-2">{match.location || activity?.location || "Đang cập nhật"}</p>
        <Badge variant="secondary" className="text-xs">
          {MATCH_STATUS_LABELS[normalizeStatus(match.status)] ?? "Sắp diễn ra"}
        </Badge>
      </div>
    ));
  };

  if (!activity && loading) {
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
                      {selectedSport?.sportName || activity.subType || "Hoạt động"}
                    </Badge>
                  </div>
                </div>
                {canRegister ? (
                  <Button
                    variant="orange"
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={handleRegister}
                    disabled={registeringId === activity.id}
                  >
                    {registeringId === activity.id ? "Đang đăng ký..." : "Đăng ký tham gia"}
                  </Button>
                ) : (
                  isSportsFestival && (
                    <div className="text-sm text-gray-500">
                      Chỉ giáo viên chủ nhiệm mới có thể đăng ký hoạt động Hội thao.
                    </div>
                  )
                )}
              </div>
              {activity.sports?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {activity.sports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => setSelectedSportId(sport.id)}
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        sport.id === selectedSportId
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      {sport.sportName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Cột trái: Nội dung chính */}
              <div className="lg:col-span-8 space-y-8">
                {/* Thông tin sự kiện */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin sự kiện</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-base">
                      {activity.description || "Ban tổ chức sẽ cập nhật mô tả chi tiết trong thời gian tới."}
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {activity.location || "Đang cập nhật"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {activity.numberOfParticipants ?? 0}/{activity.maxParticipants ?? 0} người tham gia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tỉ số / Kết quả - Bọc trong card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Tỉ số trận đấu</h2>
                    {isAdmin && scoreboardMatch && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowUpdateScoreModal(true)}
                        >
                          {normalizeStatus(scoreboardMatch.status) === "Pending" ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Bắt đầu
                            </>
                          ) : normalizeStatus(scoreboardMatch.status) === "InProgress" ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Cập nhật tỉ số
                            </>
                          ) : (
                            <>
                              <Square className="h-4 w-4 mr-2" />
                              Kết thúc
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {renderScore()}
                </div>

                {/* Lịch thi đấu */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lịch thi đấu</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(activity.startDate)} • {formatDate(activity.endDate)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.activityDetail?.competitionType || "Thời gian thi đấu chính"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">{activity.location || "Đang cập nhật"}</p>
                        <p className="text-sm text-gray-600 mt-1">Địa điểm thi đấu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {participatingClasses.length || "--"} đội tham gia
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Số đội đã bốc thăm</p>
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
                    {participatingClasses.length > 0 ? (
                      participatingClasses.map((team) => (
                        <div
                          key={team}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                        >
                          <span className="text-sm font-medium text-gray-900">{team}</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedSport?.sportName || "Thể thao"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có đội nào được xếp lịch thi đấu.</p>
                    )}
                  </div>
                </div>

                {/* Trận sắp tới */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Trận sắp tới</h3>
                  <div className="space-y-4">
                    {renderUpcomingMatches()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Score Modal */}
      {scoreboardMatch && (
        <UpdateScoreModal
          match={scoreboardMatch}
          isOpen={showUpdateScoreModal}
          onClose={() => setShowUpdateScoreModal(false)}
          onSuccess={() => {
            // Reload bracket data
            const token = localStorage.getItem("token");
            if (activity && selectedSportId) {
              executeApiCall(
                activityMatchService.getBracket.bind(activityMatchService),
                [{ activityId: activity.id, sportId: selectedSportId }, token],
                { setLoading: setBracketLoading, setError: setBracketError }
              ).then((response) => {
                const data = response?.data;
                const rounds = data?.rounds ?? [];
                const matches = rounds.flatMap((round) =>
                  (round.matches ?? []).map((match) => ({
                    ...match,
                    roundName: round.roundName,
                    roundNumber: round.roundNumber,
                  }))
                );
                const prioritizedMatch =
                  matches.find((match) => normalizeStatus(match.status) === "InProgress") ||
                  matches.find((match) => normalizeStatus(match.status) === "Pending") ||
                  matches.find((match) => normalizeStatus(match.status) === "Completed") ||
                  null;
                setScoreboardMatch(prioritizedMatch);
                setUpcomingMatches(
                  matches.filter((match) => normalizeStatus(match.status) === "Pending").slice(0, 3)
                );
              });
            }
          }}
          scoreboardType={scoreboardType}
        />
      )}
    </div>
  );
}
