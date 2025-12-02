import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

export default function ConfirmDeleteAssignDialog({
  isOpen,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Xác nhận xoá phân công
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ xoá <b>tất cả phân công giám khảo</b> của cuộc thi.
            Bạn có chắc chắn muốn tiếp tục?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
