"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { ArrowLeft, Heart, MessageCircle, Eye, Download, Star, FileText } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"

export default function SubmissionDetail() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(false)

  const submission = {
    id: 1,
    title: "Website quản lý thư viện",
    student: "Nguyễn Văn A",
    studentClass: "11A3",
    studentAvatar: "/student1.png",
    thumbnail: "/website-library-management.jpg",
    description:
      "Hệ thống quản lý thư viện trường học với đầy đủ tính năng mượn trả sách, quản lý độc giả, thống kê...",
    submittedAt: "2024-01-15 14:30",
    likes: 45,
    comments: 12,
    views: 234,
    files: ["source-code.zip", "documentation.pdf", "demo-video.mp4"],
  }

  const juryScores = [
    {
      id: 1,
      juryName: "TS. Nguyễn Văn X",
      expertise: "Web Development",
      avatar: "/generic-placeholder-icon.png",
      scores: {
        creativity: 85,
        technique: 90,
        composition: 88,
        relevance: 92,
      },
      comment: "Tác phẩm có ý tưởng sáng tạo, kỹ thuật thực hiện tốt, phù hợp với yêu cầu đề bài.",
      averageScore: 89,
      grade: "A",
    },
    {
      id: 2,
      juryName: "ThS. Trần Thị Y",
      expertise: "UI/UX Design",
      avatar: "/generic-placeholder-graphic.png",
      scores: {
        creativity: 88,
        technique: 85,
        composition: 90,
        relevance: 87,
      },
      comment: "Giao diện đẹp, trải nghiệm người dùng tốt. Thiết kế theo chuẩn modern web.",
      averageScore: 88,
      grade: "A",
    },
    {
      id: 3,
      juryName: "TS. Lê Văn Z",
      expertise: "Database",
      avatar: "/generic-placeholder-icon.png",
      scores: {
        creativity: 80,
        technique: 88,
        composition: 85,
        relevance: 90,
      },
      comment: "Cơ sở dữ liệu được thiết kế tốt, truy vấn hiệu quả. Đáp ứng tốt các yêu cầu chức năng.",
      averageScore: 86,
      grade: "B+",
    },
  ]

  const criteria = [
    { key: "creativity", label: "Sáng tạo", description: "Tính độc đáo và sáng tạo" },
    { key: "technique", label: "Kỹ thuật", description: "Kỹ năng thực hiện" },
    { key: "composition", label: "Bố cục", description: "Cách tổ chức và cấu trúc" },
    { key: "relevance", label: "Đúng chủ đề", description: "Phù hợp với yêu cầu" },
  ]

  const overallAverageScore = Math.round(
    juryScores.reduce((sum, item) => sum + item.averageScore, 0) / juryScores.length
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href={`/activities/${params.id}/gallery`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại gallery
            </Button>
          </Link>
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
                      <AvatarFallback>{submission.student.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{submission.student}</p>
                      <p className="text-sm text-muted-foreground">Lớp {submission.studentClass}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{submission.submittedAt}</p>
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    {submission.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {submission.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    {submission.views}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsContent value="scores" className="space-y-4">
                {juryScores.map((jury) => (
                  <Card key={jury.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={jury.avatar} />
                            <AvatarFallback>{jury.juryName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{jury.juryName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{jury.averageScore}</div>
                            <div className="text-xs text-muted-foreground">/100</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Chi tiết điểm</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {criteria.map((c) => (
                            <div key={c.key} className="bg-orange-50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">{c.label}</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {jury.scores[c.key]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Nhận xét</h4>
                        <p className="text-muted-foreground italic">"{jury.comment}"</p>
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

                <p className="text-2xl font-bold text-orange-600 border-t pt-4">
                  {overallAverageScore >= 90
                    ? "A"
                    : overallAverageScore >= 80
                    ? "B+"
                    : overallAverageScore >= 70
                    ? "B"
                    : "C"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Giám khảo chấm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{juryScores.length}</div>
                <p className="text-xs text-muted-foreground">người chấm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Danh sách giám khảo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {juryScores.map((jury) => (
                  <div key={jury.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={jury.avatar} />
                        <AvatarFallback>{jury.juryName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{jury.juryName}</p>
                        <p className="text-xs text-muted-foreground">{jury.averageScore}/100</p>
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
  )
}
