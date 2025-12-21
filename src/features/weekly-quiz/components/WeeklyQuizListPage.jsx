import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { weeklyQuizService } from "../services/weeklyQuiz.service";
import { ROUTES } from "@/common/constants/routes";

export default function WeeklyQuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await weeklyQuizService.getAllQuizzes(token);
        setQuizzes(res?.data ?? []);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Weekly Quiz</h1>
            <button
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all"
              onClick={() => navigate(ROUTES.WEEKLY_QUIZ.CREATE)}
            >
              + Tạo quiz
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-orange-100 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{q.title}</div>
                  <div className="text-sm text-gray-600 mb-1">
                    Tuần {q.weekNumber} - Năm {q.year}
                  </div>
                  <div className="text-sm text-gray-500">
                    Hạn: {new Date(q.deadline).toLocaleString("vi-VN")}
                  </div>
                  {q.description && (
                    <div className="text-sm text-gray-600 mt-2">{q.description}</div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg text-sm font-medium transition-all"
                    to={ROUTES.WEEKLY_QUIZ.DETAIL.replace(":id", q.id)}
                  >
                    Làm quiz
                  </Link>
                  <Link
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                    to={ROUTES.WEEKLY_QUIZ.MY_SUBMISSIONS}
                  >
                    Kết quả
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && !loading && (
            <div className="bg-white border border-orange-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">Chưa có quiz nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

