import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

export function ConfirmReportModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Báo cáo bình luận
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 text-sm mt-2">
          Bạn có chắc chắn muốn báo cáo bình luận này?  
          Hệ thống sẽ kiểm tra và xử lý theo quy định.
        </p>

        <DialogFooter className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
          >
            Báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
