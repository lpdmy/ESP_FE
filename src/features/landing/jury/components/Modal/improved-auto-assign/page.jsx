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
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import { useState } from "react";

export default function ImprovedRandomAssignDialog({ isOpen, onClose, onConfirm }) {
  const [count, setCount] = useState("");

  const handleConfirm = () => {
    const num = parseInt(count);
    if (!num || num <= 0) {
      return;
    }

    onConfirm(num);
    setCount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Phân công giám khảo ngẫu nhiên</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động phân công giám khảo với các quy tắc thông minh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Số giám khảo mỗi bài nộp</label>
            <Input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Ví dụ: 2"
              className="w-full"
            />
          </div>

          {/* Rules Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <strong>Quy tắc A:</strong> Giám khảo đã chấm bài sẽ được giữ nguyên,
                    không bị thay thế.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <strong>Quy tắc B:</strong> Phân phối đồng đều - ưu tiên giám khảo đang
                    tham gia ít hoạt động nhất.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <strong>Quy tắc C:</strong> Không phân công trùng lặp - mỗi giám khảo chỉ
                    được phân công một lần cho mỗi bài nộp.
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600"
            onClick={handleConfirm}
            disabled={!count || parseInt(count) <= 0}
          >
            Phân công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

