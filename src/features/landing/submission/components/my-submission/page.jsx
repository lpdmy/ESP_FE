import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { ArrowLeft, Eye, Edit, Trash2 } from "lucide-react";
import { useSubmissionApi } from "../../hooks/useJuryApi";

export default function MySubmissions() {
  const { getSubmissionByUser } = useSubmissionApi();
  const [submissions, setSubmissions] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  //   const submissions = [
  //     {
  //       id: 1,
  //       title: "Mùa xuân rực rỡ",
  //       activity: "Cuộc thi vẽ tranh 'Mùa xuân'",
  //       thumbnail: "/drawing-1.jpg",
  //       submittedDate: "2024-03-10",
  //       status: "Đã chấm",
  //       score: "A",
  //     },
  //     {
  //       id: 2,
  //       title: "Tuổi trẻ và ước mơ",
  //       activity: "Cuộc thi sáng tác",
  //       thumbnail: "/writing-1.jpg",
  //       submittedDate: "2024-03-08",
  //       status: "Đang chấm",
  //       score: null,
  //     },
  //   ];

  const handleLoadSubmission = async () => {
    try {
      const response = await getSubmissionByUser(
        searchTerm,
        pageSize,
        pageNumber
      );
      setSubmissions(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã chấm":
        return "bg-green-100 text-green-700";
      case "Đang chấm":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  useState(() => {
    handleLoadSubmission();
  }, [pageNumber]);
  function formatVietnamDate(date) {
    return new Date(date).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/activities">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>

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

          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    {/* Score Line */}
                    {submission.score && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Điểm:
                        </span>
                        <div className="w-9 h-9 flex items-center justify-center bg-yellow-400 text-white text-sm font-bold rounded-full shadow">
                          {submission.score}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <Badge
                      className={`${getStatusColor(
                        submission.status
                      )} px-3 py-1 text-xs shadow`}
                    >
                      {submission.status}
                    </Badge>
                  </div>

                  {/* Title - Activity */}
                  <CardTitle className="text-base font-semibold text-gray-800 leading-tight">
                    {submission.title}
                  </CardTitle>

                  <p className="text-sm text-gray-600">
                    {submission.activityName}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Nộp ngày: {formatVietnamDate(submission.createdAt)}
                  </p>

                  {/* View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
