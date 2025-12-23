import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/common/components/ui/dialog"; 
import { Button } from "@/common/components/ui/button";
import { CheckCircle, X } from "lucide-react";

export function RespondMentorInvitationModal({ open, onOpenChange, onAccept, onReject }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}
        className="!bg-white">
        <DialogHeader>
          <DialogTitle>Phản hồi lời mời làm cố vấn</DialogTitle>
          <DialogDescription>
            Bạn đã nhận được lời mời làm cố vấn cho câu lạc bộ này. Bạn muốn chấp nhận hay từ chối lời mời này?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              onReject?.();
              onOpenChange(false);
            }} 
            className="rounded rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Từ chối
          </Button>
          <Button
            onClick={() => {
              onAccept?.();
              onOpenChange(false);
            }}
            className="rounded rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Chấp nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

