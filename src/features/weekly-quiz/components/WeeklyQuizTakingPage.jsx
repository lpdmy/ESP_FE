import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { weeklyQuizService } from "../services/weeklyQuiz.service";
import { ROUTES } from "@/common/constants/routes";

export default function WeeklyQuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await weeklyQuizService.getQuizById(id, token);
        setQuiz(res?.data);
      } catch (err) {
        setError(err?.message || "Không thể tải quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        quizId: quiz.id,
        answers: quiz.questions.map((q) => ({
          questionId: q.questionId,
          answer: answers[q.questionId] ?? "",
        })),
        startedAt: new Date().toISOString(),
        timeSpentSeconds: quiz.timeLimitMinutes * 60,
      };
      await weeklyQuizService.submitQuiz(payload, token);
      navigate(ROUTES.WEEKLY_QUIZ.MY_SUBMISSIONS);
    } catch (err) {
      setError(err?.message || "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Tuần {quiz.weekNumber} - Năm {quiz.year} • Thời gian:{" "}
                {quiz.timeLimitMinutes} phút
              </p>
              {quiz.description && (
                <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions?.map((q, idx) => (
            <div key={q.questionId} className="bg-white border border-orange-100 rounded-lg p-4 space-y-3">
              <div className="font-semibold text-gray-800 mb-2">
                Câu {idx + 1}. {q.questionText}
              </div>
              {q.questionType === "MultipleChoice" && (
                <div className="space-y-2">
                  {q.options?.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50/30 cursor-pointer transition-all"
                    >
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold text-xs">
                        {optIdx}
                      </div>
                      <input
                        type="radio"
                        name={`q-${q.questionId}`}
                        value={optIdx}
                        checked={answers[q.questionId] === String(optIdx)}
                        onChange={(e) =>
                          handleChange(q.questionId, e.target.value)
                        }
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="flex-1 text-gray-700">{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === "TrueFalse" && (
                <div className="space-y-2">
                  {["true", "false"].map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50/30 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name={`q-${q.questionId}`}
                        value={val}
                        checked={answers[q.questionId] === val}
                        onChange={(e) =>
                          handleChange(q.questionId, e.target.value)
                        }
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="text-gray-700 font-medium">{val === "true" ? "Đúng" : "Sai"}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === "ShortAnswer" && (
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nhập câu trả lời..."
                  value={answers[q.questionId] || ""}
                  onChange={(e) => handleChange(q.questionId, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
            onClick={() => navigate(ROUTES.WEEKLY_QUIZ.LIST)}
          >
            Quay lại
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  );
}

