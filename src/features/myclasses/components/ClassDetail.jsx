import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Users,
  Calendar,
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
import { ClassGroupService } from "@/services/classgroup.service"
import { useToast } from "@/common/hooks/useToast"
import TeacherPosts from "./TeacherPosts"
import ClassStats from "./ClassStats"
import SimpleClassScheduleView from "@/features/admin/components/ClassManagement/SimpleClassScheduleView"
import { ROUTES } from "@/common/constants/routes"

// Loading state component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
)

export default function ClassDetail() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("posts")
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [academicYear, setAcademicYear] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [posts, setPosts] = useState([])

  // Function to handle posts update from TeacherPosts
  const handlePostsUpdate = (updatedPosts) => {
    setPosts(updatedPosts)
  }

  // Load data from API - Luôn lấy lớp học hiện tại của user
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        // Luôn lấy lớp học hiện tại của user trong niên khóa này
        const currentClass = await ClassGroupService.getCurrentClass(token)
        console.log('Current class response:', currentClass)
        console.log('Schedules in current class:', currentClass?.schedules)
        
        // Lưu user role từ response
        if (currentClass?.userRole) {
          setUserRole(currentClass.userRole)
        }
        
        // Set class data
        setClassData(currentClass)
        console.log('Set classData with schedules:', currentClass?.schedules)
        
        // Load students if we have class data
        if (currentClass?.id) {
          const studentsData = await ClassGroupService.getStudentsInClass(currentClass.id, token)
          setStudents(studentsData)
        }
        
        // Load current academic year
        const academicYearData = await ClassGroupService.getCurrentAcademicYear(token)
        setAcademicYear(academicYearData)
        
      } catch (error) {
        console.error('Error loading class data:', error)
        toast({
          title: "Lỗi",
          description: `Không thể tải dữ liệu lớp học: ${error.message}`,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy lớp học</h2>
            <p className="text-gray-600 mb-6">Bạn chưa được phân vào lớp học nào trong năm học này.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const showSidebar = userRole !== 'Teacher'

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lớp {classData.grade}{classData.name}</h1>
            <p className="text-gray-600">Năm học {academicYear?.name || 'N/A'}</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Main Content */}
          <div className={showSidebar ? "lg:col-span-2" : "lg:col-span-3"}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Bài đăng của giáo viên</TabsTrigger>
                <TabsTrigger value="students">Danh sách học sinh</TabsTrigger>
              </TabsList>

            <TabsContent value="posts" className="space-y-6 mt-6">
              <TeacherPosts
                classGroupId={classData.id}
                userRole={userRole}
                onPostsUpdate={handlePostsUpdate}
              />
            </TabsContent>

              <TabsContent value="students" className="space-y-4 mt-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Danh sách học sinh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(ROUTES.USER_PROFILE.PROFILEId.replace(":id", student.id))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              navigate(ROUTES.USER_PROFILE.PROFILEId.replace(":id", student.id))
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Xem hồ sơ của ${student.firstName} ${student.lastName}`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatarUrl} />
                            <AvatarFallback>{student.firstName?.charAt(0) || 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-500">{student.email || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - hidden for teacher role (no redeem/rewards) */}
          {showSidebar && (
            <div className="space-y-6">
              {/* Class Info */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Thông tin lớp học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={classData.homeroomTeacher?.avatarUrl} />
                      <AvatarFallback>GV</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {classData.homeroomTeacher?.firstName} {classData.homeroomTeacher?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Giáo viên chủ nhiệm</p>
                      <p className="text-sm text-gray-500">{classData.homeroomTeacher?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{classData.studentCount} học sinh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Khối {classData.grade}</span>
                    </div>
                  </div>

                  {userRole === 'Student' && (
                    <Button 
                      className="text-white w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                      onClick={() => alert('Chức năng liên hệ giáo viên đang phát triển')}
                    >
                      Liên hệ giáo viên
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Thời khóa biểu */}
              <SimpleClassScheduleView schedules={classData?.schedules ?? []} />

              {/* Quick Stats */}
              <ClassStats posts={posts} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

