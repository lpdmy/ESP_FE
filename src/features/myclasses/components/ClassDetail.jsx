import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Users,
  Calendar,
  BookOpen,
  ExternalLink,
  MessageSquare,
  Heart,
  Share2,
  Download,
  FileText,
  Video,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"

// Mock data cho lớp học
const classData = {
  id: "11a3",
  name: "11A3",
  grade: "11",
  homeroom_teacher: {
    name: "Cô Nguyễn Thị Lan",
    subject: "Toán học",
    avatar: "/teacher-avatar.png",
    email: "lan.nguyen@fptschool.edu.vn",
  },
  student_count: 32,
  schedule: "Thứ 2 - Thứ 6, 7:00 - 16:30",
  classroom: "Phòng A204",
  academic_year: "2024-2025",
}

const students = [
  { id: 1, name: "Nguyễn Văn An", avatar: "/student1.png", student_id: "HS240001" },
  { id: 2, name: "Trần Thị Bình", avatar: "/student2.png", student_id: "HS240002" },
  { id: 3, name: "Lê Hoàng Cường", avatar: "/student3.png", student_id: "HS240003" },
  { id: 4, name: "Phạm Thị Dung", avatar: "/student4.png", student_id: "HS240004" },
  { id: 5, name: "Hoàng Văn Em", avatar: "/student5.png", student_id: "HS240005" },
  { id: 6, name: "Vũ Thị Phương", avatar: "/student6.png", student_id: "HS240006" },
]

const teacherPosts = [
  {
    id: 1,
    title: "Thông báo lịch kiểm tra giữa kỳ môn Toán",
    content:
      "Các em chú ý lịch kiểm tra giữa kỳ môn Toán sẽ diễn ra vào thứ 3 tuần sau. Phạm vi ôn tập từ chương 1 đến chương 3.",
    date: "2024-01-15",
    time: "14:30",
    type: "announcement",
    attachments: [
      { name: "De_cuong_on_tap_toan.pdf", type: "pdf", url: "/files/de-cuong-toan.pdf" },
      { name: "Bai_tap_them.docx", type: "doc", url: "/files/bai-tap-them.docx" },
    ],
    links: [
      { title: "Video bài giảng chương 3", url: "https://youtube.com/watch?v=example1" },
      { title: "Tài liệu tham khảo", url: "https://drive.google.com/file/example" },
    ],
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "Kết quả thi học kỳ 1 và phương hướng học tập",
    content:
      "Chúc mừng các em đã hoàn thành tốt học kỳ 1. Kết quả chi tiết đã được cập nhật vào hệ thống. Học kỳ 2 chúng ta sẽ tập trung vào các chương nâng cao.",
    date: "2024-01-10",
    time: "09:15",
    type: "result",
    attachments: [{ name: "Bang_diem_hoc_ky_1.xlsx", type: "excel", url: "/files/bang-diem.xlsx" }],
    links: [
      { title: "Hệ thống tra cứu điểm", url: "https://student.fptschool.edu.vn" },
      { title: "Kế hoạch học tập học kỳ 2", url: "https://docs.google.com/document/example" },
    ],
    likes: 18,
    comments: 12,
  },
  {
    id: 3,
    title: "Hoạt động ngoại khóa - Cuộc thi Toán học sáng tạo",
    content:
      "Trường tổ chức cuộc thi Toán học sáng tạo dành cho học sinh khối 11. Các em quan tâm có thể đăng ký tham gia.",
    date: "2024-01-08",
    time: "16:45",
    type: "activity",
    attachments: [
      { name: "Thong_tin_cuoc_thi.pdf", type: "pdf", url: "/files/thong-tin-cuoc-thi.pdf" },
      { name: "Mau_don_dang_ky.docx", type: "doc", url: "/files/don-dang-ky.docx" },
    ],
    links: [
      { title: "Form đăng ký online", url: "https://forms.google.com/example" },
      { title: "Thể lệ cuộc thi chi tiết", url: "https://fptschool.edu.vn/cuoc-thi-toan" },
    ],
    likes: 31,
    comments: 15,
  },
]

const getPostTypeColor = (type) => {
  switch (type) {
    case "announcement":
      return "bg-red-100 text-red-800"
    case "result":
      return "bg-green-100 text-green-800"
    case "activity":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPostTypeLabel = (type) => {
  switch (type) {
    case "announcement":
      return "Thông báo"
    case "result":
      return "Kết quả"
    case "activity":
      return "Hoạt động"
    default:
      return "Khác"
  }
}

const getFileIcon = (type) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />
    case "doc":
    case "docx":
      return <FileText className="h-4 w-4 text-blue-500" />
    case "excel":
    case "xlsx":
      return <FileText className="h-4 w-4 text-green-500" />
    case "video":
      return <Video className="h-4 w-4 text-purple-500" />
    case "image":
      return <ImageIcon className="h-4 w-4 text-orange-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

export default function ClassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("posts")
  const [likedPosts, setLikedPosts] = useState([])

  // Handle like post (UI only)
  const handleLikePost = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId))
    } else {
      setLikedPosts([...likedPosts, postId])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lớp {classData.name}</h1>
            <p className="text-gray-600">Năm học {classData.academic_year}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Bài đăng của giáo viên</TabsTrigger>
                <TabsTrigger value="students">Danh sách học sinh</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-6 mt-6">
                {teacherPosts.map((post) => {
                  const isLiked = likedPosts.includes(post.id)
                  const currentLikes = isLiked ? post.likes + 1 : post.likes
                  
                  return (
                    <Card key={post.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={classData.homeroom_teacher.avatar} />
                              <AvatarFallback>GV</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{classData.homeroom_teacher.name}</p>
                              <p className="text-sm text-gray-500">
                                {post.date} • {post.time}
                              </p>
                            </div>
                          </div>
                          <Badge className={getPostTypeColor(post.type)}>{getPostTypeLabel(post.type)}</Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">{post.content}</p>

                        {/* Attachments */}
                        {post.attachments && post.attachments.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900">📎 Tệp đính kèm:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {post.attachments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  {getFileIcon(file.type)}
                                  <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => alert('Tải file: ' + file.name)}
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {post.links && post.links.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900">🔗 Liên kết hữu ích:</h4>
                            <div className="space-y-2">
                              {post.links.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                                >
                                  <ExternalLink className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm text-blue-700 group-hover:underline">{link.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`${isLiked ? 'text-red-600' : 'text-gray-600'} hover:text-red-600`}
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                            {currentLikes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-600 hover:text-blue-600"
                            onClick={() => alert('Chức năng bình luận đang phát triển')}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-600 hover:text-green-600"
                            onClick={() => alert('Chức năng chia sẻ đang phát triển')}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Chia sẻ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>

              <TabsContent value="students" className="space-y-4 mt-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Danh sách học sinh ({students.length}/{classData.student_count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.student_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Class Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Thông tin lớp học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={classData.homeroom_teacher.avatar} />
                    <AvatarFallback>GV</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{classData.homeroom_teacher.name}</p>
                    <p className="text-sm text-gray-600">Giáo viên chủ nhiệm</p>
                    <p className="text-sm text-gray-500">{classData.homeroom_teacher.subject}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{classData.student_count} học sinh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{classData.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{classData.classroom}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  onClick={() => alert('Chức năng liên hệ giáo viên đang phát triển')}
                >
                  Liên hệ giáo viên
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bài đăng tuần này</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tệp đính kèm</span>
                  <Badge variant="secondary">5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Liên kết hữu ích</span>
                  <Badge variant="secondary">6</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

