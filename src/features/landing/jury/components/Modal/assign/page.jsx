import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/common/components/ui/avatar";
import { useState, useMemo, useEffect } from "react";
import { useJuryApi } from "../../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
export default function AssignDialog({
  title,
  student,
  juryList = [],
  defaultChecked = () => false,
  onConfirm,
  isOpen,
  onClose,
  id,
  assignedJuryIds = [],
}) {
  const { assignJury } = useJuryApi();
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState("");
  const [selectJury, setSelectJury] = useState([]);
  const filteredJury = useMemo(() => {
    return juryList.filter((jury) =>
      jury.userFullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [juryList, searchTerm]);

  const handleAssignJury = async () => {
    try {
      const payload = { userId: selectJury, submissionId: id };
      await assignJury(payload);
      toast.showSuccess("Phân công giám khảo thành công")
    } catch (error) {
      if(error.statusCode == 400){
        toast.showError(error.message)
      }else{
      toast.showError("Phân công giám khảo thất bại")
      console.log(error)
      }
    }finally{
      onClose()
    }
  };
  const toggleSelect = (teacherId) => {
    setSelectJury((prev) => {
      const next = prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId];
      return next;
    });
  };
  useEffect(() => {
    console.log(selectJury);
  }, [selectJury]);
  useEffect(() => {
  setSelectJury(assignedJuryIds || []);
}, [assignedJuryIds, isOpen]);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.(); // khi dialog đóng lại → gọi onClose
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Phân công giám khảo</DialogTitle>
          <DialogDescription>
            {title} – {student}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Tìm giám khảo..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredJury.map((jury) => (
              <div
                key={jury.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectJury.includes(jury.userId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(jury.userId);
                    }}
                    className="h-4 w-4"
                  />
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/generic-placeholder-graphic.png?height=48&width=48" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white font-semibold">
                      {jury.userFullName.split(" ").pop()?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium text-gray-900">
                    {jury.userFullName}
                  </div>
                </div>

                <Badge className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {jury.assigned} bài
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              handleAssignJury();
            }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
