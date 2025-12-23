import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/common/components/ui/dialog"; 
import { Button } from "@/common/components/ui/button";
import { AlertCircle } from "lucide-react";

export function LeaveClubDialogConfirm({ open, onOpenChange, onConfirm, isPresident = false }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}
        className="!bg-white">
        <DialogHeader>
          <DialogTitle>Xác nhận rời câu lạc bộ</DialogTitle>
          {isPresident ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <DialogDescription className="text-red-800 font-semibold mb-2">
                    Bạn đang là Chủ nhiệm của câu lạc bộ này.
                  </DialogDescription>
                  <DialogDescription className="text-red-700">
                    Vui lòng chuyển chức vụ Chủ nhiệm cho thành viên khác trước khi rời khỏi câu lạc bộ. 
                    Bạn có thể chuyển chức vụ trong trang Quản lý câu lạc bộ.
                  </DialogDescription>
                </div>
              </div>
            </div>
          ) : (
            <DialogDescription>
              Bạn có chắc chắn muốn rời khỏi câu lạc bộ này? Hành động này không thể hoàn tác.
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded rounded-lg">
            {isPresident ? "Đóng" : "Hủy"}
          </Button>
          {!isPresident && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
