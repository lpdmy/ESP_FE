import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useState } from "react";

export default function RandomAssignDialog({ isOpen, onClose, onConfirm }) {
  const [count, setCount] = useState("");

  const handleConfirm = () => {
    const num = parseInt(count);
    if (!num || num <= 0) return;

    onConfirm(num); // trả số lượng về parent
    setCount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Phân công ngẫu nhiên</DialogTitle>
          <DialogDescription>
            Nhập số lượng giám khảo muốn phân cho mỗi bài nộp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <label className="text-sm font-medium">Số giám khảo mỗi bài</label>
          <Input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Ví dụ: 2"
            className="w-full"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-500 text-white"
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
