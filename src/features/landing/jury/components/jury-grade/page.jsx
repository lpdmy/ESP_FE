"use client";

import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Badge } from "@/common/components/ui/badge";
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react";

export default function Grading(JuryList) {
  const params = useParams();
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [grades, setGrades] = useState({
    creativity: 80,
    technique: 75,
    composition: 85,
    relevance: 90,
    comment: "",
  });

  const submissions = [
    {
      id: 1,
      title: "Mùa xuân rực rỡ",
      author: "Nguyễn Văn A",
      thumbnail: "/drawing-1.jpg",
    },
    {
      id: 2,
      title: "Hoa đào nở",
      author: "Trần Thị B",
      thumbnail: "/drawing-2.jpg",
    },
    {
      id: 3,
      title: "Sắc xuân",
      author: "Lê Văn C",
      thumbnail: "/drawing-3.jpg",
    },
  ];

  const criteria = [
    {
      key: "creativity",
      label: "Sáng tạo",
      description: "Tính độc đáo và sáng tạo",
    },
    {
      key: "technique",
      label: "Kỹ thuật",
      description: "Kỹ năng vẽ và sử dụng màu sắc",
    },
    {
      key: "composition",
      label: "Bố cục",
      description: "Cách sắp xếp và cân đối",
    },
    {
      key: "relevance",
      label: "Đúng chủ đề",
      description: "Phù hợp với chủ đề cuộc thi",
    },
  ];

  const handleSubmitGrade = () => {
    if (currentSubmission < submissions.length - 1) {
      setCurrentSubmission(currentSubmission + 1);
    } else {
      // router.push(`/activities/${params.id}`);
    }
  };

  const overallScore = Math.round(
    (grades.creativity +
      grades.technique +
      grades.composition +
      grades.relevance) /
      4
  );

  const getGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/activities/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Chấm điểm bài thi
          </h1>
          <p className="text-gray-600">
            Bài {currentSubmission + 1}/{submissions.length} - Cuộc thi vẽ tranh
            "Mùa xuân"
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tác phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={
                  submissions[currentSubmission].thumbnail || "/placeholder.svg"
                }
                alt={submissions[currentSubmission].title}
                className="w-full h-96 object-contain bg-gray-100 rounded-lg mb-4"
              />
              <div>
                <h3 className="font-bold text-xl mb-1">
                  {submissions[currentSubmission].title}
                </h3>
                <p className="text-gray-600">
                  Tác giả: {submissions[currentSubmission].author}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tiêu chí chấm điểm</CardTitle>
                  <Badge className="bg-gradient-orange text-white text-2xl px-4 py-2">
                    {getGrade(overallScore)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label className="font-semibold">
                          {criterion.label}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {criterion.description}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">
                        {grades[criterion.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={grades[criterion.key]}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [criterion.key]: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-2 accent-orange-600"
                    />
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-semibold text-lg">
                      Điểm tổng hợp
                    </Label>
                    <span className="text-3xl font-bold text-orange-600">
                      {overallScore}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhận xét</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Nhập nhận xét chi tiết về tác phẩm..."
                  value={grades.comment}
                  onChange={(e) =>
                    setGrades({ ...grades, comment: e.target.value })
                  }
                  rows={6}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </Button>
              <Button
                onClick={handleSubmitGrade}
                className="flex-1 bg-gradient-orange text-white"
              >
                {currentSubmission < submissions.length - 1 ? (
                  <>
                    Bài tiếp theo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Hoàn thành
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
