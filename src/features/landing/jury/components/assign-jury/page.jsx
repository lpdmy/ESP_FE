import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Users, UserMinus, UserPlus, Shuffle, Trash } from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
import TeacherSearchDialog from "../add-jury/page";
import RandomAssignDialog from "../Modal/auto-assign/page";
import ImprovedRandomAssignDialog from "../Modal/improved-auto-assign/page";
import ConfirmDeleteAssignDialog from "../Modal/delete/page";
import AssignDialog from "../Modal/assign/page";

export default function AssignJurySection({ activityId }) {
  const {
    getJuryByClubId,
    getSubmissionByAcitivty,
    deleteJury,
    ramdomAssignJury,
    improvedRandomAssign,
    deleteRandomAssign,
  } = useJuryApi();
  const toast = useToast();

  const [jury, setJury] = useState([]);
  const [submission, setSubmission] = useState([]);

  const [isOpenAddJury, setIsOpenAddJury] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [openRandomDialog, setOpenRandomDialog] = useState(false);
  const [openImprovedRandomDialog, setOpenImprovedRandomDialog] = useState(false);
  const [openDeleteRandomDialog, setOpenDeleteRandomDialog] = useState(false);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchSubmission, setSearchSubmission] = useState("");

  // Assign Jury
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const [checkedJuryIds, setCheckedJuryIds] = useState([]);
  // Loading state
  const [loadingJury, setLoadingJury] = useState(true);
  const [loadingSubmission, setLoadingSubmission] = useState(true);

  const handleLoadJury = async () => {
    try {
      setLoadingJury(true);
      const response = await getJuryByClubId(activityId, searchTerm);
      setJury(response.data || []);
    } catch {
      toast.showError("Không thể tải danh sách giám khảo");
    } finally {
      setLoadingJury(false);
    }
  };

  const handleLoadSubmission = async () => {
    try {
      setLoadingSubmission(true);
      const response = await getSubmissionByAcitivty(
        activityId,
        searchSubmission,
        pageSize,
        pageNumber
      );
      // Đảm bảo data là mảng rỗng nếu không có dữ liệu
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      
      // Chỉ set totalCount nếu có dữ liệu hợp lệ từ response
      const total = response?.data?.totalCount ?? 0;
      setSubmission(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || "Không thể tải danh sách bài nộp";
      // Đảm bảo set state về rỗng khi có lỗi
      setSubmission([]);
      setTotalCount(0);
      setTotalPages(0);
      // toast.showError(errorMessage);
    } finally {
      setLoadingSubmission(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      handleLoadJury();
    }
  }, [activityId, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleLoadSubmission();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchSubmission, pageNumber]);

  const handleRandomForAll = async (numberOfJury) => {
    try {
      await ramdomAssignJury({ activityId, numberOfJury });
      toast.showSuccess("Phân công ngẫu nhiên thành công!");
      handleLoadSubmission();
      handleLoadJury(); // Reload danh sách giám khảo để cập nhật số lượng assigned
    } catch (error) {
      if(error.statusCode == 400){
        toast.showError(error.message)
      } else {
        toast.showError("Phân công thất bại");
      }
    }
  };

  const handleImprovedRandomForAll = async (numberOfJury) => {
    try {
      await improvedRandomAssign({ activityId, numberOfJury });
      toast.showSuccess("Phân công ngẫu nhiên thành công!");
      handleLoadSubmission();
      handleLoadJury();
    } catch (error) {
      if(error.statusCode == 400){
        toast.showError(error.message)
      } else {
        toast.showError("Phân công thất bại");
      }
    }
  };

  const handleDeleteRandom = async () => {
    try {
      await deleteRandomAssign(activityId);
      toast.showSuccess("Xóa phân công thành công");
      handleLoadSubmission();
      handleLoadJury(); // Reload danh sách giám khảo để cập nhật số lượng assigned
    } catch {
      toast.showError("Xóa thất bại");
    }
  };

  const handleDeleteJury = async (jId) => {
    try {
      await deleteJury(jId);
      toast.showSuccess("Xóa giám khảo thành công");
      // Reload danh sách giám khảo sau khi xóa thành công
      handleLoadJury();
    } catch(err) {
      if(err.statusCode === 400){
        toast.showError(err.message)
      } else {
        toast.showError("Xóa giám khảo thất bại");
      }
    }
  };

  const openDialogForSubmission = (submissionItem) => {
    setCurrentSubmissionId(submissionItem.id);
    const assignedIds = submissionItem.users || [];
    setCheckedJuryIds(assignedIds);
    setOpenAssignDialog(true);
  };

  return (
    <div className="grid grid-cols-10 gap-6">
      {/* Bài nộp 70% */}
      <div className="col-span-10 lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Danh sách bài nộp ({totalCount})
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border !border-blue-400 bg-blue-50 hover:bg-blue-100"
                  onClick={() => setOpenImprovedRandomDialog(true)}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Phân công ngẫu nhiên
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenDeleteRandomDialog(true)}
                className="border !border-gray-300"
              >
                <Trash className="w-4 h-4 mr-2" />
                Xóa phân công
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Submission Skeleton */}
            {loadingSubmission ? (
              [...Array(7)].map((_, i) => (
                <div key={i} className="animate-pulse p-3 border rounded bg-gray-100">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : submission.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Chưa có dữ liệu bài nộp được gán</p>
                <p className="text-xs mt-2 text-gray-400">
                  Danh sách sẽ hiển thị khi có bài nộp được gán cho giám khảo
                </p>
              </div>
            ) : (
              submission.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-3 border !border-gray-300 rounded bg-white"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-gray-500">
                      {s.submissionCode
                        ? `Mã bài: ${s.submissionCode}`
                        : s.orderNumber
                        ? `Bài #${s.orderNumber}`
                        : `Bài #${s.id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {s.numberJurys || 0} giám khảo
                    </span>
                    <Button className=" border !border-blue-400" variant="outline" size="sm" onClick={() => openDialogForSubmission(s)}>
                      Phân công
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {!loadingSubmission && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm">
                  Trang {pageNumber} / {totalPages}
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPageNumber((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={pageNumber === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPageNumber((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={pageNumber === totalPages}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Giám khảo 30% */}
      <div className="col-span-10 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Giám khảo ({jury.length})
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border !border-gray-300"
                onClick={() => setIsOpenAddJury(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Tìm kiếm giám khảo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Jury Skeleton */}
            {loadingJury
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 border rounded bg-gray-100 animate-pulse"
                  >
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="w-10 h-4 bg-gray-300 rounded"></div>
                  </div>
                ))
              : jury.map((j) => (
                  <div
                    key={j.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded border !border-gray-300"
                  >
                    <div>
                      <p className="font-semibold">{j.userFullName}</p>
                      <p className="text-sm text-gray-500">
                        Đã phân công: {j.assigned}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteJury(j.id)}
                    >
                      <UserMinus className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <TeacherSearchDialog
        isOpen={isOpenAddJury}
        onClose={() => setIsOpenAddJury(false)}
        jury={jury}
        activityId={activityId}
        onSuccess={handleLoadJury}
      />
      <AssignDialog
        isOpen={openAssignDialog}
        onClose={() => {
          setOpenAssignDialog(false);
          setCurrentSubmissionId(null);
          setCheckedJuryIds([]);
        }}
        juryList={jury}
        assignedJuryIds={checkedJuryIds}
        setAssignedJuryIds={setCheckedJuryIds}
        submissionId={currentSubmissionId}
        refreshSubmissionList={handleLoadSubmission}
        refreshJuryList={handleLoadJury}
      />
      <RandomAssignDialog
        isOpen={openRandomDialog}
        onClose={() => setOpenRandomDialog(false)}
        onConfirm={handleRandomForAll}
      />
      <ImprovedRandomAssignDialog
        isOpen={openImprovedRandomDialog}
        onClose={() => setOpenImprovedRandomDialog(false)}
        onConfirm={handleImprovedRandomForAll}
      />
      <ConfirmDeleteAssignDialog
        isOpen={openDeleteRandomDialog}
        onClose={() => setOpenDeleteRandomDialog(false)}
        onConfirm={handleDeleteRandom}
      />
    </div>
  );
}
