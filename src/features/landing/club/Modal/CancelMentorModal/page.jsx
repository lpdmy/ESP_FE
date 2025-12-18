import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

export default function CancelMentorInviteDialog({
  open,
  onClose,
  onConfirm,
  mentorName,
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Hủy lời mời mentor
          </DialogTitle>
          <DialogDescription>
            {mentorName ? (
              <>
                Bạn có chắc chắn muốn hủy lời mời gửi đến mentor{" "}
                <strong>{mentorName}</strong>?
              </>
            ) : (
              "Bạn có chắc chắn muốn hủy lời mời mentor này?"
            )}
            <br />
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Không
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
          >
            {loading ? "Đang hủy..." : "Hủy mời"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
