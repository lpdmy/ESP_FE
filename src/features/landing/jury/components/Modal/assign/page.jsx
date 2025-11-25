import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";

import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/common/components/ui/avatar";
import { useToast } from "@/common/hooks/useToast";
import { useJuryApi } from "../../../hooks/useJuryApi";

import { useState, useMemo, useEffect } from "react";

export default function AssignDialog({
  isOpen,
  onClose,
  juryList = [],
  assignedJuryIds = [],
  setAssignedJuryIds,
  submissionId,
  refreshSubmissionList, // 🔥 từ parent truyền xuống để reload submissions
  refreshJuryList,       // 🔥 từ parent truyền xuống để reload juries (nếu cần)
}) {
  const toast = useToast();
  const { assignJury } = useJuryApi();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Search filter local
  const filteredJury = useMemo(() => {
    if (!juryList) return [];
    return juryList.filter((jury) =>
      jury.userFullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [juryList, searchTerm]);

  // Sync assigned from parent when open dialog
  useEffect(() => {
    if (isOpen) setAssignedJuryIds(assignedJuryIds || []);
  }, [isOpen, assignedJuryIds]);

  // Toggle chọn
  const toggleSelectJury = (userId) => {
    setAssignedJuryIds((prev) =>
      prev.includes(userId)
        ? prev.filter((x) => x !== userId)
        : [...prev, userId]
    );
  };

  // 🚀 Submit tại đây luôn!
  const handleAssign = async () => {
    if (!submissionId) return;
    if (assignedJuryIds.length === 0) {
      toast.showError("Vui lòng chọn ít nhất 1 giám khảo!");
      return;
    }

    try {
      setLoading(true);

      await assignJury({
        submissionId,
        UserId: assignedJuryIds,
      });

      toast.showSuccess("Phân công giám khảo thành công!");
      refreshSubmissionList?.(); // reload submissions
      // refreshJuryList?.(); // reload juries nếu cần

      onClose();
    } catch (err) {
      toast.showError("Phân công thất bại!");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
    console.log(juryList)
  },[juryList])
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Phân công giám khảo</DialogTitle>
          <DialogDescription>Chọn giám khảo để chấm bài</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <input
            type="text"
            placeholder="Tìm giám khảo..."
            className="w-full px-3 py-2 border rounded-md focus:ring-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Danh sách giám khảo */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
            {filteredJury.map((jury) => (
              <div
                key={jury.userId}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border transition"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={assignedJuryIds.includes(jury.userId)}
                    onChange={() => toggleSelectJury(jury.userId)}
                  />

                  <Avatar className="h-11 w-11">
                    <AvatarImage src={jury.avatar} />
                    <AvatarFallback className="bg-blue-500">
                      {jury.userFullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="font-medium text-sm">
                    {jury.userFullName}
                  </span>
                </div>

                <Badge className="text-xs  text-orange-800">
                  {jury.assigned} bài
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading}
            className="border border-black "
          >
            {loading ? "Đang lưu..." : "Lưu phân công"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
