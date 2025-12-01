import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useJuryApi } from "../../hooks/useJuryApi";
import { useToast } from "@/common/hooks/useToast";
export default function Grading() {
  const params = useParams();
  const location = useLocation();
  const toast = useToast();
  const { gradingSubmission,getJuryAssignNotGrade } = useJuryApi();
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [criterias, setCriterias] = useState([]);
  const [grades, setGrades] = useState({});
  const [submissions,setSubmissions] =useState([])

  const hanldeLoadJurySubmissionNotGrade = async() => {
      try {
        const response = await getJuryAssignNotGrade(params.id,"",100000,1)
        setSubmissions(response.data.data)
        console.log(response.data.data)
      } catch (error) {
        console.log(error)
      }
  }
useEffect(()=>{
hanldeLoadJurySubmissionNotGrade()  
},[])
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
      toast.showSuccess("chấm điểm Thành công");
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

  if (!submissions.length) {
    return <p className="text-center text-gray-600 p-6">Không có bài nộp.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-4">
          <Link to={`/jury/submission/${params}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Chấm điểm bài thi
          </h1>
          <p className="text-gray-600">
            Bài {currentSubmission + 1}/{submissions.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bên trái - Ảnh & thông tin tác giả */}
          <Card>
            <CardHeader>
              <CardTitle>Tác phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={
                  submissions[currentSubmission]?.fileUrl || "/placeholder.svg"
                }
                alt={submissions[currentSubmission]?.submission?.title}
                className="w-full h-96 object-contain bg-gray-100 rounded-lg mb-4"
              />
              <h3 className="font-bold text-xl mb-1">
                {submissions[currentSubmission]?.submission?.title ||
                  "Không rõ"}
              </h3>
              <p className="text-gray-600">
                Tác giả:{" "}
                {submissions[currentSubmission]?.submission?.userFullName ||
                  "Không rõ"}
              </p>
            </CardContent>
          </Card>

          {/* Bên phải - chấm điểm + nhận xét */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiêu chí chấm điểm</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {criterias.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-semibold">{c.label}</Label>
                      <span className="text-2xl font-bold text-orange-600">
                        {grades[c.key]}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grades[c.key] ?? 0}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [c.key]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-orange-600"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t flex justify-between">
                  <Label className="font-semibold text-lg">Điểm tổng hợp</Label>
                  <span className="text-3xl font-bold text-orange-600">
                    {overallScore}
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
                />
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gray-200"
                onClick={handlePreviousSubmission}
                disabled={currentSubmission === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Bài trước
              </Button>
              <Button
                onClick={handleSubmitGrade}
                className="flex-1 bg-gradient-orange text-white"
              >
                Chấm điểm
              </Button>
              {currentSubmission < submissions.length - 1 ? (
                <Button
                  onClick={handleNextSubmission}
                  className="flex-1 bg-gradient-orange text-white"
                >
                  Bài tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button disabled className="flex-1 bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" /> Hoàn thành
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
