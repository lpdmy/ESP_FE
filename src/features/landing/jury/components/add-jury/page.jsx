import { useState, useEffect } from "react";
import { useClubApi } from "@/features/landing/club/hooks/useClubApi";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
export default function TeacherSearchDialog({ isOpen, onClose, jury }) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const { getTeacher } = useClubApi();
  const { createJury } = useJuryApi();
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const role = 2;
    try {
      const response = await getTeacher(role, pageNumber, pageSize, searchTerm);
      const data = response.data.data;
      setResults(data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleAddJury = async () => {
    try {
      const payload = { juryId: selectedTeachers, activityId: 6 };
      toast.addJurySuccess();
      await createJury(payload);
    } catch (err) {
      console.log(err);
      if (err.statusCode == 400) {
        toast.showError(err.message);
      } else {
        toast.addJuryFail();
      }
    }
  };
  const toggleSelect = (teacherId) => {
    setSelectedTeachers((prev) => {
      const next = prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId];
      return next;
    });
  };
  useEffect(() => {
    if (searchTerm.trim()) {
      const delay = setTimeout(() => handleSearch(), 300); // debounce 300ms
      return () => clearTimeout(delay);
    } else {
      setResults([]);
    }
  }, [searchTerm]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Thêm giáo viên làm người chấm điểm
        </h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên giảng viên..."
          className="w-full border px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />

        {loading ? (
          <p className="text-sm text-gray-500">Đang tìm kiếm...</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {results.map((teacher) => {
              const isSelected = selectedTeachers.includes(teacher.id);
              return (
                <li
                  key={teacher.id}
                  className="p-2 rounded hover:bg-gray-100 cursor-pointer text-sm flex justify-between items-center"
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(teacher.id)}
                      className="h-4 w-4"
                    />

                    <span>{`${teacher.firstName} ${teacher.lastName}`}</span>
                  </label>

                  <span className="text-xs text-gray-400">{teacher.email}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end mt-4 gap-4">
          <button
            className="text-sm px-4 py-1 border border-black rounded-md "
            onClick={() => handleAddJury()}
          >
            Thêm
          </button>
          <button
            onClick={onClose}
            className="text-sm text-white px-4 py-1 border border-black bg-red-600 rounded-md "
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
