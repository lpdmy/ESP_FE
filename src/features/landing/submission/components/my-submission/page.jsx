import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { Eye } from "lucide-react";
import { useSubmissionApi } from "../../hooks/useSubmissionApi";

export default function MySubmissions() {
  const { getSubmissionByUser } = useSubmissionApi();
  const [submissions, setSubmissions] = useState([]);
  const [pageSize] = useState(10);
  const [pageNumber] = useState(1);
  const [searchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    handleLoadSubmission();
  }, []);

  const handleLoadSubmission = async () => {
    try {
      const response = await getSubmissionByUser(
        searchTerm,
        pageSize,
        pageNumber
      );
      setSubmissions(response.data.data);
    } catch (error) {
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã chấm xong":
        return "bg-green-100 text-green-700";
      case "Đang chấm":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatVietnamDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const renderSubmissionGrid = (list) => {
    if (!list.length)
      return (
        <p className="text-gray-500 italic mt-4">
          Không có bài nộp nào trong mục này.
        </p>
      );

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {list.map((submission) => (
          <Card
            key={submission.id}
            className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <Badge
                className={`${getStatusColor(
                  submission.status
                )} px-3 py-1 text-xs shadow`}
              >
                {submission.status}
              </Badge>
            </div>

            <CardTitle className="text-base font-semibold text-gray-800 leading-tight mt-2">
              {submission.title}
            </CardTitle>

            <p className="text-sm text-gray-600">{submission.activityName}</p>

            <p className="text-xs text-gray-500 mt-1">
              Nộp ngày: {formatVietnamDate(submission.createdAt)}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              onClick={() =>
                navigate(`/submission/my-submission/detail/${submission.id}`)
              }
            >
              <Eye className="w-4 h-4" />
              Xem
            </Button>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Bài nộp của tôi
        </h1>
        <p className="text-gray-600 mb-6">
          Quản lý các bài nộp tham gia hoạt động
        </p>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="approved">Đã chấm</TabsTrigger>
            <TabsTrigger value="grading">Đang chấm</TabsTrigger>
          </TabsList>

          {/* TẤT CẢ */}
          <TabsContent value="all" className="mt-6">
            {renderSubmissionGrid(submissions)}
          </TabsContent>

          {/* ĐÃ CHẤM */}
          <TabsContent value="approved" className="mt-6">
            {renderSubmissionGrid(
              submissions.filter((s) => s.status === "Đã chấm xong")
            )}
          </TabsContent>

          {/* ĐANG CHẤM */}
          <TabsContent value="grading" className="mt-6">
            {renderSubmissionGrid(
              submissions.filter((s) => s.status === "Đang chấm")
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
