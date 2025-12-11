import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/common/components/ui/dialog";

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm rounded-2xl !bg-white shadow-none border border-gray-200 p-6 relative z-[9999]"
        style={{
          boxShadow: "none",
          background: "white",
        }}
      >
        <style>
          {`
            [data-state="open"] > .fixed.inset-0.bg-black\\/80 {
              background: transparent !important;
              backdrop-filter: none !important;
            }
          `}
        </style>

        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Xóa bình luận?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 mt-2">
          Bạn có chắc chắn muốn xóa bình luận này không? 
          Hành động này không thể hoàn tác.
        </p>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
