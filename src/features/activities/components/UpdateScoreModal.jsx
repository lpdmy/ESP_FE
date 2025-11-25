import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { useToast } from "@/common/hooks/useToast";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityMatchService } from "../services/activityMatch.service";

const MATCH_STATUS = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
};

export default function UpdateScoreModal({ match, isOpen, onClose, onSuccess, scoreboardType }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winnerId, setWinnerId] = useState(null);
  const [action, setAction] = useState("update"); // "start", "update", "end"

  useEffect(() => {
    if (match) {
      setScore1(match.score1 ?? 0);
      setScore2(match.score2 ?? 0);
      setWinnerId(match.winnerClassGroupId ?? null);
      
      // Xác định action dựa trên status
      const status = typeof match.status === "number" ? match.status : match.status;
      if (status === MATCH_STATUS.Pending || status === 0) {
        setAction("start");
      } else if (status === MATCH_STATUS.InProgress || status === 1) {
        setAction("update");
      } else {
        setAction("end");
      }
    }
  }, [match]);

  const handleStartMatch = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await executeApiCall(
        activityMatchService.updateMatch.bind(activityMatchService),
        [match.id, { Status: MATCH_STATUS.InProgress }, token],
        { setError: () => {} }
      );
      toast.showSuccess("Đã bắt đầu trận đấu");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Không thể bắt đầu trận đấu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async () => {
    if (!winnerId) {
      toast.error("Vui lòng chọn đội thắng");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await executeApiCall(
        activityMatchService.updateMatchResult.bind(activityMatchService),
        [
          match.id,
          {
            Score1: parseInt(score1, 10),
            Score2: parseInt(score2, 10),
            WinnerClassGroupId: parseInt(winnerId, 10),
          },
          token,
        ],
        { setError: () => {} }
      );
      toast.showSuccess("Đã cập nhật tỉ số");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật tỉ số");
    } finally {
      setLoading(false);
    }
  };

  const handleEndMatch = async () => {
    if (!winnerId) {
      toast.error("Vui lòng chọn đội thắng trước khi kết thúc trận đấu");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      // Cập nhật tỉ số và kết thúc trận đấu
      await executeApiCall(
        activityMatchService.updateMatchResult.bind(activityMatchService),
        [
          match.id,
          {
            Score1: parseInt(score1, 10),
            Score2: parseInt(score2, 10),
            WinnerClassGroupId: parseInt(winnerId, 10),
          },
          token,
        ],
        { setError: () => {} }
      );
      toast.showSuccess("Đã kết thúc trận đấu");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Không thể kết thúc trận đấu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (action === "start") {
      handleStartMatch();
    } else if (action === "end") {
      handleEndMatch();
    } else {
      handleUpdateScore();
    }
  };

  if (!match) return null;

  const team1Name = match.classGroup1Name || "Đội 1";
  const team2Name = match.classGroup2Name || "Đội 2";
  const team1Id = match.classGroup1Id;
  const team2Id = match.classGroup2Id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {action === "start" && "Bắt đầu trận đấu"}
            {action === "update" && "Cập nhật tỉ số"}
            {action === "end" && "Kết thúc trận đấu"}
          </DialogTitle>
          <DialogDescription>
            {action === "start" && "Xác nhận bắt đầu trận đấu này"}
            {action === "update" && "Cập nhật tỉ số trận đấu"}
            {action === "end" && "Kết thúc trận đấu và xác nhận kết quả"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hiển thị tên đội */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-900">{team1Name}</p>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-900">{team2Name}</p>
            </div>
          </div>

          {/* Nhập tỉ số */}
          {(action === "update" || action === "end") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score1">{team1Name}</Label>
                  <Input
                    id="score1"
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score2">{team2Name}</Label>
                  <Input
                    id="score2"
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Chọn đội thắng */}
              <div className="space-y-2">
                <Label>Đội thắng *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWinnerId(team1Id)}
                    disabled={loading || !team1Id}
                    className={`p-3 rounded-lg border-2 transition ${
                      winnerId === team1Id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!team1Id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p className="font-semibold text-sm">{team1Name}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinnerId(team2Id)}
                    disabled={loading || !team2Id}
                    className={`p-3 rounded-lg border-2 transition ${
                      winnerId === team2Id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!team2Id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p className="font-semibold text-sm">{team2Name}</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading
              ? "Đang xử lý..."
              : action === "start"
              ? "Bắt đầu"
              : action === "end"
              ? "Kết thúc"
              : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

