"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  useDialog
} from "@/common/components/ui/dialog"; // Đường dẫn có thể thay đổi tuỳ vào vị trí bạn import

export default function JoinClubModal({ open, onClose, onSubmit }) {
  const [reasonToJoin, setReason] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = () => {
    if (!reasonToJoin.trim() || !experience.trim()) {
      alert("Vui lòng điền đầy đủ lý do và kinh nghiệm.");
      return;
    }
    onSubmit({ reasonToJoin, experience });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="!bg-white flex flex-col items-center justify-center mx-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed"
      >
        <DialogHeader>
          <DialogTitle>Tham gia Câu lạc bộ</DialogTitle>
          <DialogDescription>
            Vui lòng chia sẻ lý do bạn muốn tham gia và kinh nghiệm liên quan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4 w-full max-w-md">
          <div>
            <label className="block font-medium mb-1">Lý do tham gia</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              value={reasonToJoin}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tôi muốn tham gia vì..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Kinh nghiệm</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Tôi đã từng tham gia..."
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end w-full max-w-md">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 ml-2"
          >
            Gửi yêu cầu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
