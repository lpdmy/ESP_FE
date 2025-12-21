import { useEffect, useState } from "react";
import { weeklyQuizService } from "../services/weeklyQuiz.service";
import { ROUTES } from "@/common/constants/routes";
import { Link } from "react-router-dom";

export default function WeeklyQuizMySubmissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await weeklyQuizService.getMySubmissions(token);
        setItems(res?.data ?? []);
      } catch (err) {
        setError(err?.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kết quả quiz của tôi</h1>
        <Link
          className="text-blue-600 hover:underline text-sm"
          to={ROUTES.WEEKLY_QUIZ.LIST}
        >
          Về danh sách quiz
        </Link>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {items.map((s) => (
        <div key={s.id} className="border rounded p-3">
          <div className="font-medium">{s.quizTitle || "Weekly Quiz"}</div>
          <div className="text-sm text-gray-600">
            Tuần {s.weekNumber} - Năm {s.year}
          </div>
          <div className="text-sm text-gray-700">
            Điểm: {s.score}/{s.maxScore} ({s.percentage?.toFixed(1)}%)
          </div>
          <div className="text-xs text-gray-500">
            Nộp lúc: {new Date(s.submittedAt).toLocaleString()}
          </div>
        </div>
      ))}

      {items.length === 0 && !loading && (
        <p className="text-sm text-gray-600">Bạn chưa có kết quả nào.</p>
      )}
    </div>
  );
}

