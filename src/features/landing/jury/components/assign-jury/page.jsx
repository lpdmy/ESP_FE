import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Shuffle,
  Save,
  Search,
  UserPlus,
  UserMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import AssignDialog from "../Modal/assign/page";
import { useJuryApi } from "../../hooks/useJuryApi";
import { Label } from "@/common/components/ui/label";
import { useEffect, useState } from "react";
import TeacherSearchDialog from "../add-jury/page";
import { useToast } from "@/common/hooks/useToast";
import { LoadingSubmission } from "@/common/components/ui/loading";
export default function AssignJury() {
  const params = useParams();
  const { getJuryByClubId, deleteJury, getSubmissionByAcitivty, assignJury } =
    useJuryApi();
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jury, setJury] = useState([]);
  const [isOpenAddJury, setIsOpenAddJury] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetJury, setTargetJury] = useState(null);
  const [submission, setSubmission] = useState([]);
  const [searchSubmission, setSearchSubmission] = useState(``);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialogAssign, setOpenDialogAssign] = useState(false);
  const [idSubmission, setIdSubmission] = useState(0);
  const [checkedJury, setCheckedJury] = useState([]);
  const toast = useToast();
  const hanldeOpenAddJury = () => {
    setIsOpenAddJury(true);
  };
  const handleLoadJury = async () => {
    try {
      const response = await getJuryByClubId(6, searchTerm);
      setJury(response.data);
      console.log(response.data);
    } catch (err) {
      toast.loadJuryListFail();
    }
  };
  const MAX_JURY_PER_SUBMISSION = 4;

  const handleRandomForAll = async () => {
    setIsAssigning(true);
    try {
      const updatedAssignments = [];
      const newSubmissionState = submission.map((sub) => {
        const current = sub.users || [];
        const need = MAX_JURY_PER_SUBMISSION - current.length;
        if (need <= 0) return sub;

        let available = jury.filter((j) => !current.includes(j.userId));
        available = [...available].sort((a, b) => a.assigned - b.assigned);

        const newPicked = [];
        for (let i = 0; i < Math.min(need, available.length); i++) {
          const topCandidates = available.slice(0, 4);
          const random =
            topCandidates[Math.floor(Math.random() * topCandidates.length)];
          newPicked.push(random.userId);

          random.assigned++;
          available = available.filter((j) => j.userId !== random.userId);
        }

        const finalUsers = [...current, ...newPicked];
        updatedAssignments.push({ submissionId: sub.id, userId: finalUsers });

        return { ...sub, users: finalUsers };
      });

      setSubmission(newSubmissionState);

      for (const assign of updatedAssignments) {
        await assignJury(assign);
      }

      toast.success("Phân công ngẫu nhiên thành công!");
      handleLoadSubmission();
    } catch (error) {
      toast.error("Phân công thất bại!");
      console.error(error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteJury = async (id) => {
    try {
      await deleteJury(id);
      toast.deleteJurySuccess();
      handleLoadJury();
    } catch (error) {
      console.log(error);
      toast.deleteClubFail();
    }
  };
  const handleLoadSubmission = async () => {
    try {
      setIsLoading(true);
      const response = await getSubmissionByAcitivty(
        6,
        searchSubmission,
        pageSize,
        pageNumber
      );
      const data = response.data.data;
      setSubmission(data);
      const total = response.data.totalCount || data.length;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleLoadJury();
  }, [searchTerm]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleLoadSubmission();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchSubmission, pageNumber]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/activities/${params}/manage`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại quản lý
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                Phân công giám khảo
              </h1>
              <p className="text-muted-foreground">Cuộc thi Lập trình 2024</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Shuffle className="h-4 w-4" />
                    Phân công tự động
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Phân công tự động</DialogTitle>
                    <DialogDescription>
                      Hệ thống sẽ tự động phân công giám khảo cho các bài nộp
                      chưa có giám khảo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Số giám khảo mỗi bài</Label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 giám khảo</SelectItem>
                          <SelectItem value="2">2 giám khảo</SelectItem>
                          <SelectItem value="3">3 giám khảo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phương pháp phân công</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanced">Cân bằng tải</SelectItem>
                          <SelectItem value="random">Ngẫu nhiên</SelectItem>
                          <SelectItem value="expertise">
                            Theo chuyên môn
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Hủy</Button>
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500">
                      Xác nhận
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                className="gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                onClick={handleRandomForAll}
              >
                <Shuffle className="h-4 w-4" />
                Phân công ngẫu nhiên toàn bộ
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng bài nộp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã phân công
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">32</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chưa phân công
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">13</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Giám khảo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jury.length}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Danh sách bài nộp</CardTitle>
                    <CardDescription>
                      Phân công giám khảo cho từng bài nộp
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm..."
                        className="pl-9 w-64"
                        onChange={(e) => setSearchSubmission(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      {/* <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="assigned">Đã phân công</SelectItem>
                        <SelectItem value="unassigned">
                          Chưa phân công
                        </SelectItem>
                      </SelectContent> */}
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                {/* Overlay loading */}
                <LoadingSubmission isLoading={isLoading} />
                <div>
                  {submission.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Không có bài nộp nào phù hợp.
                    </div>
                  ) : (
                    <>
                      {submission.map((submissionItem) => (
                        <Card
                          key={submissionItem.id}
                          className="hover:shadow-md transition-shadow p-2 mt-2"
                        >
                          <CardContent className="p-1 w-full relative">
                            <div className="flex items-start justify-between gap-4 w-full">
                              {/* Bên trái: thông tin bài nộp */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold truncate">
                                    {submissionItem.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{submissionItem.userFullName}</span>
                                  <span>•</span>
                                  <span>
                                    Lớp {submissionItem.class?.class || ""}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {submissionItem.numberJurys}/2 giám khảo
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0">
                                <button
                                  className="bg-blue-400 rounded-md text-white p-1"
                                  onClick={() => {
                                    setOpenDialogAssign(true);
                                    setIdSubmission(submissionItem.id);
                                    setCheckedJury(submissionItem.users);
                                  }}
                                >
                                  Phân công
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Phân trang */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            Trang {pageNumber} / {totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPageNumber(pageNumber - 1)}
                              disabled={pageNumber === 1}
                            >
                              Trước
                            </Button>

                            <div className="flex gap-1">
                              {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                  let pageNum;
                                  if (totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (pageNumber <= 3) {
                                    pageNum = i + 1;
                                  } else if (pageNumber >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                  } else {
                                    pageNum = pageNumber - 2 + i;
                                  }

                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        pageNumber === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setPageNumber(pageNum)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPageNumber(pageNumber + 1)}
                              disabled={pageNumber === totalPages}
                            >
                              Tiếp
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jury List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex gap-20">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Danh sách giám khảo
                  </CardTitle>
                  <button
                    className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-md hover:opacity-90 text-white"
                    onClick={() => hanldeOpenAddJury()}
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>

                <CardDescription>{jury.length} giám khảo</CardDescription>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardHeader>

              <CardContent className="space-y-3 max-h-[700px] overflow-y-auto pr-1 w-full max-w-[340.1px]">
                {jury.map((jury) => (
                  <Card
                    key={jury.id}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/generic-placeholder-icon.png?height=48&width=48`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white">
                            {jury.userFullName.split(" ").pop()?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">
                            {jury.userFullName}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Đã phân công
                              </span>
                              <span className="font-medium">
                                {jury.assigned}/{totalCount}
                              </span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (jury.assigned / totalCount) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setTargetJury(jury);
                            setShowConfirm(true);
                          }}
                          className="ml-auto text-white hover:text-red-500 transition bg-red-400 p-2 rounded-md"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa <b>{targetJury?.userFullName}</b> khỏi
              danh sách giám khảo không?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Hủy
              </button>

              <button
                onClick={() => {
                  handleDeleteJury(targetJury.id); // gọi API xóa của bạn
                  setShowConfirm(false);
                }}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <TeacherSearchDialog
        isOpen={isOpenAddJury}
        onClose={() => setIsOpenAddJury(false)}
        jury={jury}
      />
      <AssignDialog
        isOpen={openDialogAssign}
        onClose={() => setOpenDialogAssign(false)}
        onConfirm={() => {
          console.log("Đã phân công");
        }}
        title="Bài nộp số 2"
        student="Nguyễn Văn A"
        juryList={jury}
        id={idSubmission}
        assignedJuryIds={checkedJury}
      />
      {isAssigning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white shadow-lg px-6 py-4 rounded-lg flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-gray-700 font-semibold">
              Đang phân công, vui lòng chờ...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
