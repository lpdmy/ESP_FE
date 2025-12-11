import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/common/components/ui/dialog"; 
import { Button } from "@/common/components/ui/button";

export function LeaveClubDialogConfirm({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}
        className="!bg-white">
        <DialogHeader>
          <DialogTitle>Xác nhận rời câu lạc bộ</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn rời khỏi câu lạc bộ này? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded rounded-lg">
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
            className="!text-white rounded rounded-lg bg-red-500 hover:text-white hover:bg-red-700"
          >
            Xác nhận rời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
