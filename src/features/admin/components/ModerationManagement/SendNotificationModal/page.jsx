"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import { useEffect, useState } from "react";
import { useModerationApi } from "@/features/admin/hooks/useModerationApi";
import { X } from "lucide-react";
import { useToast } from "@/common/hooks/useToast";
export function SendNotificationModal({ open, onClose, selectedUser }) {
  const [message, setMessage] = useState("");
  const { createNotification } = useModerationApi();
  const toast = useToast()
  const templates = [
    "Em đã có hành vi không phù hợp trong quá trình tham gia hoạt động. Đề nghị em điều chỉnh lại hành xử phù hợp với nội quy.",
    "Nội dung em đăng tải đã vi phạm quy tắc cộng đồng. Vui lòng tránh sử dụng ngôn từ thiếu văn hoá hoặc mang tính xúc phạm.",
  ];
 
  const handleSend = async () => {
    try {
      const payload = { userId: selectedUser, contentText: message };
      await createNotification(payload);
      setMessage("")
      toast.showSuccess("Gửi thông báo thành công")
    } catch (error) {
      toast.showError("Gửi thông báo thất bại")
    } 
    finally{
      onClose()
    }
  };
  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xxl"
          aria-label="Đóng"
        >
          <X/>
        </button>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Gửi thông báo tới học sinh
          </DialogTitle>
        </DialogHeader>

        {/* Input */}
        <div>
          <label className="text-sm font-medium">Nội dung</label>

          <Textarea
            placeholder="Nhập nội dung thông báo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Template */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Mẫu thông báo:</p>

          <div className="grid gap-2">
            {templates.map((t, index) => (
              <button
                key={index}
                className="text-left text-sm p-2 border rounded-md hover:bg-gray-50 transition"
                onClick={() => setMessage(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <Button
          className="w-full mt-5 bg-red-600 text-white hover:bg-red-700"
          onClick={handleSend}
        >
          Gửi thông báo
        </Button>
      </DialogContent>
    </Dialog>
  );
}
