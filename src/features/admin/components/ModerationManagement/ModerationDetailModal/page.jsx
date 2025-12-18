import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { XCircle, AlertTriangle, User, Calendar, BookOpen ,X } from "lucide-react";
import { useEffect } from "react";

// Modal chỉ nhận props, KHÔNG tự quản lý state
export default function ModerationModal({ open, onClose,data }) {
  if (!open) return null;

  const mockData = {
    title: "Báo cáo vi phạm",
    description: "Học sinh đã vi phạm nội quy lớp học trong quá trình tham gia hoạt động.",
    violator: {
      name: "Nguyễn Văn A",
      studentId: "SV20231234",
      className: "11B4",
    },
    violation: {
      type: "Hành vi không phù hợp",
      detail: "Sử dụng ngôn từ không phù hợp trong thảo luận nhóm.",
      date: "10/12/2025",
    },
    moderator: "Phúc NDH",
    status: "Đang chờ xử lý",
  };
  useEffect(()=>{
  },[data])
  function formatDate(dateString, format = "dd/MM/yyyy") {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (format === "dd/MM/yyyy HH:mm") {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-xl rounded-2xl shadow-xl animate-in fade-in zoom-in">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> {mockData.title}
            </h2>
            <button onClick={onClose}>
              <X className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <p className="text-sm text-gray-600">{mockData.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-1">
                <User size={16} /> Thông tin người vi phạm
              </h3>
              <p className="text-sm">Tên: {data.authorName}</p>
              <p className="text-sm">Lớp: {mockData.violator.className}</p>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-1">
                <BookOpen size={16} /> Chi tiết vi phạm
              </h3>
              <p className="text-sm">Nội dung: {data.contentText}</p>
              <p className="text-sm flex items-center gap-1">
                <Calendar size={14} /> {formatDate(data.reportedAt)}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
