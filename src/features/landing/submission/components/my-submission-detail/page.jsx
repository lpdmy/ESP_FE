"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Download,
  Star,
  FileText,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { useSubmissionApi } from "../../hooks/useSubmissionApi";
export default function SubmissionDetail() {
  const { getSubmissionDetail } = useSubmissionApi();
  const params = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [submission, setSubmission] = useState({});
  const [juryAssignment, setJuryAssignment] = useState([]);

  useEffect(() => {
    handleLoadSubmission();
  }, []);

  const handleLoadSubmission = async () => {
    try {
      const response = await getSubmissionDetail(params.id);
      const rawAssignments = response.data.juryAssignments;

      const processedAssignments = rawAssignments.map((jury) => {
        let scores = {};
        try {
          scores = JSON.parse(jury.scoreTemp);
        } catch (error) {
          console.error("Lỗi parse scoreTemp:", error);
        }

        return {
          ...jury,
          scores,
          juryName: jury.juryName, // Nếu có tên thật thì dùng thay
          avatar: "/generic-placeholder-icon.png", // Cập nhật avatar nếu có
          comment: jury.comment ?? "", // nếu bạn có trường comment
          averageScore: jury.totalScore,
        };
      });

      setSubmission(response.data);
      setJuryAssignment(processedAssignments);

      console.log(processedAssignments);
    } catch (error) {
      console.log(error);
    }
  };
  function formatVietnamDate(date) {
    return new Date(date).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  const overallAverageScore = juryAssignment.length
    ? Math.round(
        juryAssignment.reduce((sum, jury) => sum + jury.averageScore, 0) /
          juryAssignment.length
      )
    : 0;
  useEffect(() => {
    handleLoadSubmission();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            {submission.title}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                  <img
                    src={submission.thumbnail}
                    alt={submission.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={submission.studentAvatar} />
                      <AvatarFallback>
                        {submission?.firstName?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{submission.student}</p>
                      <p className="text-sm text-muted-foreground">
                        Lớp {submission.studentClass}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatVietnamDate(submission.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="scores" className="space-y-6">
              <TabsContent value="scores" className="space-y-4">
                {juryAssignment.map((jury) => (
                  <Card key={jury.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={jury.avatar} />
                            <AvatarFallback>
                              {jury.juryName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{jury.juryName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            {jury.averageScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            /100
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Chi tiết điểm</h4>

                        {jury?.scores && Object.keys(jury.scores).length > 0 ? (
                          <div
                            className={`grid gap-4 grid-cols-${
                              Object.keys(jury.scores).length
                            }`}
                          >
                            {Object.entries(jury.scores).map(
                              ([label, value]) => (
                                <div
                                  key={label}
                                  className="bg-orange-50 p-3 rounded-lg"
                                >
                                  <p className="text-xs text-muted-foreground">
                                    {label}
                                  </p>
                                  <p className="text-2xl font-bold text-orange-600">
                                    {value}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Chưa chấm bài
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-300">
                        <h4 className="font-semibold mb-2">Nhận xét</h4>
                        <p className="text-muted-foreground italic">
                          {jury.comment?.trim()
                            ? `"${jury.comment}"`
                            : "Không có"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-center">Điểm trung bình</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  {overallAverageScore}
                </div>
                <p className="text-muted-foreground">/100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Giám khảo chấm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {juryAssignment.length}
                </div>
                <p className="text-xs text-muted-foreground">người chấm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Danh sách giám khảo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {juryAssignment.map((jury) => (
                  <div
                    key={jury.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={jury.avatar} />
                        <AvatarFallback>
                          {jury.juryName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {jury.juryName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {jury.averageScore}/100
                        </p>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
