import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { weeklyQuizService } from "../services/weeklyQuiz.service";
import { ROUTES } from "@/common/constants/routes";

const emptyQuestion = (order = 1) => ({
  questionText: "",
  questionType: "MultipleChoice",
  options: [
    { text: "" },
    { text: "" },
  ],
  correctAnswer: "0",
  points: 1,
  order,
});

export default function WeeklyQuizFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    weekNumber: 1,
    year: new Date().getFullYear(),
    deadline: "",
    timeLimitMinutes: 20,
    maxScore: 10,
    questions: [emptyQuestion()],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await weeklyQuizService.getQuizById(id, token);
        const q = res?.data;
        if (q) {
          setForm({
            title: q.title,
            description: q.description || "",
            weekNumber: q.weekNumber,
            year: q.year,
            deadline: q.deadline?.slice(0, 16) || "",
            timeLimitMinutes: q.timeLimitMinutes,
            maxScore: q.maxScore,
            questions: q.questions.map((qq) => ({
              questionText: qq.questionText,
              questionType: qq.questionType,
              options: (qq.options || []).map((opt) => ({ text: opt.text })),
              correctAnswer: qq.correctAnswer ?? "",
              points: qq.points,
              order: qq.order,
            })),
          });
        }
      } catch (err) {
        setError(err?.message || "Không thể tải quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, isEdit]);

  const handleQuestionChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      const options = updated[qIdx].options ? [...updated[qIdx].options] : [];
      if (options[optIdx]) {
        options[optIdx] = { ...options[optIdx], text: value };
      }
      updated[qIdx].options = options;
      return { ...prev, questions: updated };
    });
  };

  const addOption = (qIdx) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      const options = updated[qIdx].options ? [...updated[qIdx].options] : [];
      options.push({ text: "" });
      updated[qIdx].options = options;
      return { ...prev, questions: updated };
    });
  };

  const removeOption = (qIdx, optIdx) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      const options = updated[qIdx].options ? [...updated[qIdx].options] : [];
      if (options.length > 2) {
        options.splice(optIdx, 1);
        updated[qIdx].options = options;
        // Reset correctAnswer if it's out of bounds
        const correctIdx = parseInt(updated[qIdx].correctAnswer);
        if (correctIdx >= options.length) {
          updated[qIdx].correctAnswer = "0";
        }
      }
      return { ...prev, questions: updated };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.questions.length + 1)],
    }));
  };

  const removeQuestion = (idx) => {
    setForm((prev) => {
      const updated = prev.questions.filter((_, i) => i !== idx);
      return { ...prev, questions: updated };
    });
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        weekNumber: Number(form.weekNumber),
        year: Number(form.year),
        timeLimitMinutes: Number(form.timeLimitMinutes),
        maxScore: Number(form.maxScore),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : "",
        questions: form.questions.map((q) => ({
          ...q,
          options: q.questionType === "MultipleChoice" 
            ? (q.options || []).map((opt, idx) => ({ index: idx, text: opt.text }))
            : null,
        })),
      };
      if (isEdit) {
        await weeklyQuizService.updateQuiz(id, { ...payload, id }, token);
      } else {
        await weeklyQuizService.createQuiz(payload, token);
      }
      navigate(ROUTES.WEEKLY_QUIZ.LIST);
    } catch (err) {
      setError(err?.message || "Lưu quiz thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isEdit ? "Chỉnh sửa quiz" : "Tạo quiz mới"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Tiêu đề
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Tuần
              <input
                type="number"
                min={1}
                max={52}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Năm
              <input
                type="number"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Deadline
              <input
                type="datetime-local"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Thời gian làm bài (phút)
              <input
                type="number"
                min={1}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.timeLimitMinutes}
                onChange={(e) =>
                  setForm({ ...form, timeLimitMinutes: e.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Điểm tối đa
              <input
                type="number"
                min={1}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
              Mô tả
              <textarea
                rows={3}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Câu hỏi</h2>
            <button
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg transition-all"
              onClick={addQuestion}
            >
              + Thêm câu hỏi
            </button>
          </div>

          {form.questions.map((q, idx) => (
            <div key={idx} className="border border-orange-100 rounded-lg p-4 space-y-3 bg-orange-50/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Câu {idx + 1}</span>
                {form.questions.length > 1 && (
                  <button
                    className="text-red-600 text-sm hover:text-red-700 font-medium"
                    onClick={() => removeQuestion(idx)}
                  >
                    Xóa
                  </button>
                )}
              </div>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Nội dung câu hỏi
                <input
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(idx, "questionText", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Loại câu hỏi
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  value={q.questionType}
                  onChange={(e) =>
                    handleQuestionChange(idx, "questionType", e.target.value)
                  }
                >
                  <option value="MultipleChoice">Multiple Choice</option>
                  <option value="TrueFalse">True / False</option>
                  <option value="ShortAnswer">Short Answer</option>
                </select>
              </label>
              {q.questionType === "MultipleChoice" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Đáp án (chọn đáp án đúng bên dưới)</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                      onClick={() => addOption(idx)}
                    >
                      + Thêm đáp án
                    </button>
                  </div>
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex gap-2 items-center">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold text-sm">
                        {optIdx}
                      </span>
                      <input
                        className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        placeholder={`Đáp án ${optIdx}`}
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionChange(idx, optIdx, e.target.value)
                        }
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700 px-2"
                          onClick={() => removeOption(idx, optIdx)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Đáp án đúng (chọn số thứ tự)
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(idx, "correctAnswer", e.target.value)
                      }
                    >
                      {q.options?.map((_, optIdx) => (
                        <option key={optIdx} value={String(optIdx)}>
                          Đáp án {optIdx}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {q.questionType === "TrueFalse" && (
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Đáp án đúng
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(idx, "correctAnswer", e.target.value)
                    }
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </label>
              )}
              {q.questionType === "ShortAnswer" && (
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Đáp án đúng
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(idx, "correctAnswer", e.target.value)
                    }
                  />
                </label>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Điểm
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    value={q.points}
                    onChange={(e) =>
                      handleQuestionChange(idx, "points", Number(e.target.value))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Thứ tự
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    value={q.order}
                    onChange={(e) =>
                      handleQuestionChange(idx, "order", Number(e.target.value))
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
            onClick={() => navigate(ROUTES.WEEKLY_QUIZ.LIST)}
          >
            Hủy
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

