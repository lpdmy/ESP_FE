import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle, Eye, Search } from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
import { lazyLoadAllPages } from "../../utils/lazyLoadAll";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
export default function Grading() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { gradingSubmission, getJuryAssignNotGrade, getJuryAssignGrade } = useJuryApi();
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [criterias, setCriterias] = useState([]);
  const [grades, setGrades] = useState({});
  const [submissions,setSubmissions] =useState([])
  const [gradedSubmissions,setGradedSubmissions]=useState([])
  const [openConfirm,setOpenConfirm]=useState(false)
  const [openViewScores,setOpenViewScores]=useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const syncAssignments = async (shouldNavigate = false) => {
    try {
      setIsLoading(true);
      // Lấy tất cả assignment chưa chấm và đã chấm của user hiện tại
      // QUAN TRỌNG: Backend đã filter theo userId của user hiện tại rồi
      // Mỗi API call chỉ trả về assignments của chính user đó, không bao gồm assignments của giám khảo khác
      // Do đó, việc chấm điểm của các giám khảo khác KHÔNG ảnh hưởng đến danh sách này
      if (!params.id) {
        console.error("Activity ID không hợp lệ");
        return 0;
      }
      
      // Sử dụng Lazy Loading để load tất cả pages tự động
      // Load song song cả 2 danh sách để tối ưu performance
      const [ungradedList, gradedList] = await Promise.all([
        lazyLoadAllPages(
          (pageNumber, pageSize) => getJuryAssignNotGrade(params.id, "", pageSize, pageNumber),
          100 // PageSize hợp lý, không quá lớn
        ),
        lazyLoadAllPages(
          (pageNumber, pageSize) => getJuryAssignGrade(params.id, "", pageSize, pageNumber),
          100 // PageSize hợp lý, không quá lớn
        ),
      ]);
      
      console.log("📌 Loaded assignments - Chưa chấm:", ungradedList.length, "Đã chấm:", gradedList.length);
      
      // Lưu danh sách assignment đã chấm (theo assignmentId của user hiện tại, không phải submissionId)
      // Mỗi assignment là riêng biệt cho mỗi giám khảo, nên không có conflict
      setGradedSubmissions(gradedList);
      // Lưu danh sách assignment chưa chấm của user hiện tại
      setSubmissions(ungradedList);

      // Giữ current index hợp lệ sau khi danh sách thay đổi
      setCurrentSubmission((prev)=>{
        if(!ungradedList.length) return 0;
        return Math.min(prev, ungradedList.length - 1);
      });

      // Nếu đã chấm hết và cần điều hướng, quay lại trang danh sách
      if (shouldNavigate && ungradedList.length === 0) {
        navigate(`/jury/submission/${params.id}`);
      }

      return ungradedList.length;
    } catch (error) {
      console.error("❌ Lỗi khi load assignments:", error);
      // Hiển thị thông báo lỗi cho user
      toast.showError("Không thể tải danh sách bài chấm. Vui lòng thử lại.");
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dữ liệu khi vào trang hoặc khi activityId thay đổi
  useEffect(()=>{
    if(params.id) {
      syncAssignments();
    }
  },[params.id])
  //  Chuyển tiêu chí lấy từ backend thành dạng có key
  useEffect(() => {
    if (Array.isArray(submissions) && submissions.length > 0) {
      const raw = submissions[currentSubmission]?.criteria || [];
      const mapped = raw.map((label, index) => ({
        key: `criterion_${index}`,
        label,
      }));

      setCriterias(mapped);

      // Khởi tạo điểm theo tiêu chí
      const initial = {};
      mapped.forEach((c) => (initial[c.key] = 0));
      initial.comment = "";
      setGrades(initial);
    }
  }, [submissions, currentSubmission]);

  // 🟢 Tính điểm tổng hợp
  const overallScore = Math.round(
    criterias.reduce((sum, c) => sum + (grades[c.key] ?? 0), 0) /
      (criterias.length || 1)
  );

  // 🟢 Payload đúng chuẩn yêu cầu backend
  const buildGradePayload = () => {
    const scores = {};
    criterias.forEach((c) => {
      scores[c.label] = grades[c.key] ?? 0;
    });

    return {
      id: submissions[currentSubmission]?.id || 0,
      scores,
      comment: grades.comment || "",
      totalScore: overallScore,
    };
  };

  const handleSubmitGrade = async () => {
    const payload = buildGradePayload();
    console.log("📌 Payload gửi API:", payload);
    try {
      await gradingSubmission(payload);
      toast.showSuccess("Chấm điểm thành công");
    } catch (error) {
      if (error.statusCode == 400) {
        toast.showError(error.message);
      } else {
        toast.showError("Chấm điểm không thành công");
      }
    }
  };

  const handlePreviousSubmission = () => {
    if (currentSubmission > 0) {
      setCurrentSubmission((prev) => prev - 1);
    }
  };
  const handleOpenViewScores = async () => {
    await syncAssignments();
    setOpenViewScores(true);
  };

  const currentAssignmentId = submissions[currentSubmission]?.id;
  const currentSubmissionId =
    submissions[currentSubmission]?.submission?.id ??
    submissions[currentSubmission]?.id;
  const currentSubmissionData = submissions[currentSubmission];
  const hasPending = submissions.length > 0;
  
  // Kiểm tra xem assignment hiện tại (của user hiện tại) đã được chấm chưa
  // QUAN TRỌNG: Check dựa trên assignmentId của chính user này, KHÔNG phải submissionId
  // Mỗi giám khảo có assignment riêng cho mỗi bài, nên chỉ cần check assignment của chính họ
  // Các giám khảo khác chấm cùng bài KHÔNG ảnh hưởng đến việc chấm của user hiện tại
  const isCurrentAssignmentGraded = currentAssignmentId 
    ? gradedSubmissions.some((g) => g.id === currentAssignmentId)
    : false;
  const handleNextSubmission = () => {
  if (currentSubmission < submissions.length - 1) {
    setCurrentSubmission((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
  useEffect(() => {
    if (!criterias.length || !submissions.length) return;

    const payload = buildGradePayload();
    console.log("📌 Tracking Payload Real-time:", payload);
  }, [grades, criterias, currentSubmission]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Chấm điểm bài thi
              </h1>
              <p className="text-gray-600">
                {isLoading 
                  ? "Đang tải danh sách bài chấm..."
                  : hasPending
                  ? `Bài ${currentSubmission + 1}/${submissions.length}`
                  : "Không còn bài chờ chấm"}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/jury/submission/${params.id}`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bên trái - Ảnh & thông tin tác giả */}
          <Card>
            <CardHeader>
              <CardTitle>Tác phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSubmissionData?.submission?.attachments?.length > 0 ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                  {currentSubmissionData.submission.attachments[0].fileType === "image" ? (
                    <img
                      src={currentSubmissionData.submission.attachments[0].url}
                      alt={currentSubmissionData.submission.attachments[0].fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <a
                      href={currentSubmissionData.submission.attachments[0].url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center w-full h-full bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100"
                    >
                      <span className="text-orange-700 font-medium">
                        {currentSubmissionData.submission.attachments[0].fileName}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Tải xuống ({currentSubmissionData.submission.attachments[0].fileType})
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-400">Không có file đính kèm</p>
                </div>
              )}
              <h3 className="font-bold text-xl mb-1">
                {currentSubmissionData?.submission?.title ||
                  (hasPending ? "Không rõ" : "Đã chấm hết bài được giao")}
              </h3>
            </CardContent>
          </Card>

          {/* Bên phải - chấm điểm + nhận xét */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiêu chí chấm điểm</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Đang tải dữ liệu...
                  </p>
                )}
                {!isLoading && !hasPending && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      Bạn đã chấm hết các bài được phân công.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vui lòng quay lại trang danh sách để xem điểm hoặc chờ bài mới được phân công.
                    </p>
                  </div>
                )}
                {!isLoading && hasPending && criterias.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-semibold">{c.label}</Label>
                    <span className="text-2xl font-bold text-orange-600">
                        {grades[c.key]}
                      </span>
                    </div>

                  <div className="flex flex-col gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={grades[c.key] ?? 0}
                      className="w-24"
                      disabled={isCurrentAssignmentGraded || isLoading}
                      onChange={(e)=>{
                        const val = Number(e.target.value);
                        const safe = Math.min(100, Math.max(0, isNaN(val)?0:val));
                        setGrades({...grades,[c.key]: safe})
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grades[c.key] ?? 0}
                      disabled={isCurrentAssignmentGraded || isLoading}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [c.key]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-orange-600"
                    />
                  </div>
                  </div>
                ))}

                <div className="pt-4 border-t flex justify-between">
                  <Label className="font-semibold text-lg">Điểm tổng hợp</Label>
                  <span className="text-3xl font-bold text-orange-600">
                    {hasPending ? overallScore : "--"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Nhận xét */}
            <Card>
              <CardHeader>
                <CardTitle>Nhận xét</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Nhập nhận xét..."
                  value={grades.comment}
                  onChange={(e) =>
                    setGrades({ ...grades, comment: e.target.value })
                  }
                  rows={6}
                  disabled={!hasPending || isCurrentAssignmentGraded || isLoading}
                />
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gray-200"
                onClick={handlePreviousSubmission}
                disabled={currentSubmission === 0 || !hasPending}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Bài trước
              </Button>
              <Button
                onClick={()=>setOpenConfirm(true)}
                className="flex-1 bg-gradient-orange text-white"
                disabled={isCurrentAssignmentGraded || !hasPending || isLoading}
              >
                {hasPending 
                  ? (isCurrentAssignmentGraded ? "Đã chấm" : "Chấm điểm") 
                  : "Hết bài"}
              </Button>
              {hasPending && currentSubmission < submissions.length - 1 ? (
                <Button
                  onClick={handleNextSubmission}
                  className="flex-1 bg-gradient-orange text-white"
                >
                  Bài tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  disabled={hasPending && currentSubmission < submissions.length - 1} 
                  className="flex-1 bg-green-500 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Hoàn thành
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Confirm dialog */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chấm điểm</DialogTitle>
            <DialogDescription>
              Bạn sắp gửi điểm cho{" "}
              {submissions[currentSubmission]?.submission?.submissionCode
                ? `Mã bài ${submissions[currentSubmission]?.submission?.submissionCode}`
                : `Bài #${currentSubmission + 1}`}
              . Tổng điểm: <b>{overallScore}</b>. Bạn có chắc chắn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenConfirm(false)}>Hủy</Button>
            <Button
              className="bg-gradient-orange text-white"
              onClick={async ()=>{
                await handleSubmitGrade();
                setOpenConfirm(false);
                const remainingCount = await syncAssignments(true);
                if (remainingCount > 0) {
                  // Còn bài, scroll lên đầu trang
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View scores dialog */}
      <Dialog
        open={openViewScores}
        onOpenChange={(val)=>{
          setOpenViewScores(val);
          if(val) syncAssignments();
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Điểm đã chấm</DialogTitle>
            <DialogDescription>
              Danh sách bài bạn đã chấm kèm tổng điểm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {gradedSubmissions.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có bài nào.</p>
            )}
            {gradedSubmissions.map((item)=>(
              <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {item.submission?.submissionCode
                      ? `Mã bài: ${item.submission.submissionCode}`
                      : item.submission?.orderNumber
                      ? `Bài #${item.submission.orderNumber}`
                      : `Bài #${item.submission?.id || item.id}`}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.submission?.title || "Không rõ"}
                  </span>
                </div>
                <span className="text-xl font-bold text-orange-600">
                  {item.totalScore ?? 0}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenViewScores(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

