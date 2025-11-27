import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog"
import { useToast } from "@/common/hooks/useToast"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { activityParticipantService } from "@/features/activities/services/activityParticipant.service"
import { ClassGroupService } from "@/services/classgroup.service"
import { LoadingCard } from "@/common/components/ui/loading"
import { ROUTES } from "@/common/constants/routes"
import { Calendar, MapPin, Users, ArrowLeft, Trophy, Search, X, GripVertical } from "lucide-react"
import { jwtDecode } from "jwt-decode"

export default function ActivityRegisterForm() {
  const params = useParams()
  const toast = useToast()
  const toastRef = useRef(toast)
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentClass, setCurrentClass] = useState(null)
  const [classStudents, setClassStudents] = useState([])
  const [isClassLoading, setIsClassLoading] = useState(false)
  const [selectedSports, setSelectedSports] = useState({}) // { sportId: [studentIds] }
  const [searchQuery, setSearchQuery] = useState("") // Global search for class list
  const [draggedStudent, setDraggedStudent] = useState(null) // { id, name }
  const [dragOverSport, setDragOverSport] = useState(null) // sportId
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const decoded = jwtDecode(token)
      const normalizedRole =
        decoded?.UserRole ||
        decoded?.role ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      setCurrentUser({
        role: normalizedRole,
      })
    } catch (err) {
      console.warn("Cannot decode token", err)
    }
  }, [])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params.id) {
        navigate(ROUTES.ACTIVITY.LIST)
        return
      }
      try {
        const token = localStorage.getItem("token")
        const response = await executeApiCall(
          activityService.getActivityById.bind(activityService),
          [params.id, token],
          { setLoading }
        )
        const data = response?.data?.data || response?.data
        setActivity(data)
      } catch (err) {
        toastRef.current.error(err?.message || "Không thể tải thông tin hoạt động.")
        navigate(ROUTES.ACTIVITY.LIST)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, params.id])

  const ensureClassData = useCallback(async () => {
    if (isClassLoading) return
    if (currentClass && classStudents.length > 0) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.")
      return
    }

    setIsClassLoading(true)
    try {
      const classResponse = await ClassGroupService.getCurrentClass(token)
      const classData = classResponse?.data?.data || classResponse?.data || classResponse
      if (!classData) {
        toast.error("Không tìm thấy lớp học hiện tại của bạn.")
        return
      }

      setCurrentClass(classData)
      const classId = classData?.id || classData?.classGroupId
      if (!classId) return

      const studentsResponse = await ClassGroupService.getStudents(classId, token)
      const studentsData = studentsResponse?.data?.data || studentsResponse?.data || studentsResponse
      const normalizedStudents =
        (studentsData || []).map((student) => ({
          id: student?.id,
          fullName:
            student?.fullName ||
            `${student?.firstName || ""} ${student?.lastName || ""}`.replace(/\s+/g, " ").trim(),
          studentCode: student?.studentCode,
          email: student?.email,
        })) || []

      setClassStudents(normalizedStudents.filter((student) => student.id))
    } catch (err) {
      console.error("Không thể tải thông tin lớp học:", err)
      toast.error(err?.message || "Không thể tải thông tin lớp học của bạn.")
    } finally {
      setIsClassLoading(false)
    }
  }, [classStudents.length, currentClass, isClassLoading, toast])

  useEffect(() => {
    if (activity?.subType === "SportsFestival" && activity?.sports?.length > 0) {
      ensureClassData()
    }
  }, [activity?.subType, activity?.sports, ensureClassData])

  const summary = useMemo(() => {
    if (!activity) return null
    return {
      title: activity.title,
      description: activity.description,
      startDate: activity.startDate ? new Date(activity.startDate).toLocaleDateString("vi-VN") : "-",
      endDate: activity.endDate ? new Date(activity.endDate).toLocaleDateString("vi-VN") : "-",
      location: activity.location || "Đang cập nhật",
      participants: `${activity.numberOfParticipants || 0}/${activity.maxParticipants || "∞"}`,
      status: activity.activityStatus || activity.status || "Đang đăng ký",
      category: activity.category === 1 ? "Hoạt động" : "Sự kiện",
      subType: activity.subType,
      sports: activity.sports || [],
    }
  }, [activity])

  const isSportsFestival = summary?.subType === "SportsFestival"

  // Kiểm tra quyền đăng ký: Giáo viên chỉ được đăng ký hội thao, Học sinh chỉ được đăng ký các hoạt động khác
  const canRegister = useMemo(() => {
    if (!currentUser?.role || !activity) return true // Default allow if no role info
    const userRole = currentUser.role.toLowerCase()
    const isTeacher = userRole === "teacher" || userRole === "admin"
    const isStudent = userRole === "student"
    
    if (isTeacher) {
      // Giáo viên chỉ được đăng ký hội thao
      return isSportsFestival
    }
    if (isStudent) {
      // Học sinh chỉ được đăng ký các hoạt động ngoài hội thao
      return !isSportsFestival
    }
    return true // Default allow for other roles
  }, [currentUser?.role, activity, isSportsFestival])

  // Get selected students for a sport
  const getSelectedStudents = (sportId) => {
    const selectedIds = selectedSports[sportId] || []
    return classStudents.filter((student) => selectedIds.includes(student.id))
  }

  // Get sports that a student has joined
  const getStudentSports = (studentId) => {
    const sports = []
    Object.entries(selectedSports).forEach(([sportId, studentIds]) => {
      if (studentIds.includes(studentId)) {
        const sport = summary?.sports?.find((s) => s.id === Number(sportId))
        if (sport) {
          sports.push(sport.sportName || sport.name)
        }
      }
    })
    return sports
  }

  // Get available students (filtered by search only - students can join multiple sports)
  const getAvailableStudents = useMemo(() => {
    let available = classStudents

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      available = available.filter((student) => {
        const fullName = student.fullName?.toLowerCase() || ""
        const studentCode = student.studentCode?.toLowerCase() || ""
        const email = student.email?.toLowerCase() || ""
        return fullName.includes(query) || studentCode.includes(query) || email.includes(query)
      })
    }

    return available
  }, [classStudents, searchQuery])

  const handleAddStudent = (sportId, studentId) => {
    setSelectedSports((prev) => {
      const current = prev[sportId] || []
      const sport = summary?.sports?.find((s) => s.id === sportId)
      const maxMembers = sport?.maxMembers

      if (current.includes(studentId)) {
        return prev
      }

      if (maxMembers && current.length + 1 > maxMembers) {
        toast.error(`Môn ${sport?.sportName || "này"} chỉ được tối đa ${maxMembers} thành viên.`)
        return prev
      }

      return {
        ...prev,
        [sportId]: [...current, studentId],
      }
    })
  }

  const handleRemoveStudent = (sportId, studentId) => {
    setSelectedSports((prev) => {
      const current = prev[sportId] || []
      return {
        ...prev,
        [sportId]: current.filter((id) => id !== studentId),
      }
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (e, student) => {
    setDraggedStudent({ id: student.id, name: student.fullName })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", student.id.toString())
  }

  const handleDragOver = (e, sportId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverSport(sportId)
  }

  const handleDragLeave = () => {
    setDragOverSport(null)
  }

  const handleDrop = (e, sportId) => {
    e.preventDefault()
    setDragOverSport(null)

    if (!draggedStudent) return

    const studentId = draggedStudent.id
    handleAddStudent(sportId, studentId)
    setDraggedStudent(null)
  }

  const handleDragEnd = () => {
    setDraggedStudent(null)
    setDragOverSport(null)
  }

  const handleOpenConfirm = () => {
    if (isSportsFestival) {
      const hasAnySelection = Object.values(selectedSports).some((ids) => ids.length > 0)
      if (!hasAnySelection) {
        toast.error("Vui lòng thêm ít nhất một học sinh vào các môn thi đấu.")
        return
      }
    }
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    if (!params.id) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.")
      return
    }

    setSubmitting(true)
    try {
      if (isSportsFestival) {
        const classId = currentClass?.id || currentClass?.classGroupId
        if (!classId) {
          toast.error("Không tìm thấy thông tin lớp để đăng ký.")
          return
        }

        const registrations = Object.entries(selectedSports)
          .filter(([_, studentIds]) => studentIds.length > 0)
          .map(([sportId, studentIds]) => ({
            activityId: Number(params.id),
            sportId: Number(sportId),
            classGroupId: classId,
            memberIds: studentIds,
          }))

        if (registrations.length === 0) {
          toast.error("Vui lòng thêm ít nhất một học sinh vào các môn thi đấu.")
          return
        }

        for (const reg of registrations) {
          await activityParticipantService.registerSport(reg, token)
        }

        toast.showSuccess("Đăng ký hội thao thành công! Bạn có thể theo dõi trạng thái tại trang chi tiết.")
      } else {
        await activityParticipantService.registerForActivity(
          {
            activityId: Number(params.id),
          },
          token
        )
        toast.showSuccess("Đăng ký thành công! Bạn có thể theo dõi trạng thái tại trang chi tiết.")
      }

      navigate(ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", params.id))
    } catch (err) {
      console.error("Register failed:", err)
      toast.error(err?.message || "Không thể đăng ký hoạt động.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20">
        <LoadingCard text="Đang chuẩn bị biểu mẫu..." />
      </div>
    )
  }

  if (!activity) {
    return (
      <Card className="glass">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-gray-600">Không tìm thấy thông tin hoạt động.</p>
          <Button onClick={() => navigate(ROUTES.ACTIVITY.LIST)}>Quay lại danh sách</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-4 flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Đăng ký tham gia</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Biểu mẫu đăng ký hoạt động</h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            {isSportsFestival
              ? "Kéo thả học sinh từ danh sách lớp vào các môn thi đấu để đăng ký. Một học sinh có thể tham gia nhiều môn."
              : "Xác nhận thông tin và hoàn tất đăng ký để tham gia hoạt động này."}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex-shrink-0 mt-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {isSportsFestival ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Warning message if no permission */}
          {!canRegister && (
            <div className="col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
                  ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                  : "Học sinh không thể đăng ký tham gia hội thao."}
              </p>
            </div>
          )}
          {/* Left: Sports List */}
          <div className="space-y-6">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-2xl">Các môn thi đấu</CardTitle>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Kéo thả học sinh từ danh sách bên phải vào từng môn để đăng ký. Một học sinh có thể tham gia nhiều môn.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {summary.sports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Chưa có môn thi đấu nào được cấu hình.</p>
                  </div>
                ) : (
                  summary.sports.map((sport) => {
                    const selectedStudents = getSelectedStudents(sport.id)
                    const isDragOver = dragOverSport === sport.id

                    return (
                      <div
                        key={sport.id}
                        className={`border-2 rounded-xl overflow-hidden bg-white transition-all ${
                          !canRegister
                            ? "opacity-60 cursor-not-allowed"
                            : isDragOver
                            ? "border-orange-400 bg-orange-50 shadow-lg scale-[1.02]"
                            : "border-gray-200 hover:border-orange-200 hover:shadow-md"
                        }`}
                        onDragOver={canRegister ? (e) => handleDragOver(e, sport.id) : undefined}
                        onDragLeave={canRegister ? handleDragLeave : undefined}
                        onDrop={canRegister ? (e) => handleDrop(e, sport.id) : undefined}
                      >
                        <div className="p-5 space-y-4">
                          {/* Sport Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <h3 className="font-semibold text-gray-900 text-lg">{sport.sportName || sport.name}</h3>
                              </div>
                              {sport.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{sport.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {sport.maxMembers && (
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  Tối đa {sport.maxMembers}
                                </Badge>
                              )}
                              {selectedStudents.length > 0 && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  {selectedStudents.length}
                                  {sport.maxMembers ? `/${sport.maxMembers}` : ""}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Selected Students - Tags */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Học sinh đã đăng ký ({selectedStudents.length})
                            </Label>
                            {selectedStudents.length === 0 ? (
                              <div
                                className={`min-h-[80px] p-4 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                                  isDragOver
                                    ? "border-orange-400 bg-orange-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                <p className="text-sm text-gray-400 text-center">
                                  {isDragOver
                                    ? "Thả học sinh vào đây"
                                    : "Kéo học sinh từ danh sách bên phải vào đây"}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100 min-h-[60px]">
                                {selectedStudents.map((student) => (
                                  <div
                                    key={student.id}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-orange-200 text-sm shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <span className="font-medium text-gray-900">{student.fullName}</span>
                                    {student.studentCode && (
                                      <span className="text-xs text-gray-500">({student.studentCode})</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStudent(sport.id, student.id)}
                                      disabled={submitting || !canRegister}
                                      className="ml-1 hover:bg-red-50 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label={`Xóa ${student.fullName}`}
                                    >
                                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-orange-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 flex-1 leading-relaxed">
                    Bằng việc xác nhận, bạn đồng ý tuân thủ quy định của hoạt động.
                  </p>
                  <Button
                    type="button"
                    className="btn-primary min-w-[160px] h-11 text-base"
                    disabled={submitting || !canRegister}
                    onClick={handleOpenConfirm}
                  >
                    {submitting ? "Đang xử lý..." : "Đăng ký ngay"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Class Students List */}
          <div className="space-y-6">
            <Card className="border-orange-100 shadow-sm sticky top-4">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-xl">Danh sách lớp</CardTitle>
                </div>
                {currentClass && (
                  <p className="text-sm text-gray-600 mt-2">
                    {currentClass.className || currentClass.name || "Lớp của bạn"}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="class-search" className="text-sm font-semibold text-gray-700">
                    Tìm kiếm học sinh
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="class-search"
                      type="text"
                      placeholder="Nhập tên, mã số hoặc email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Students List */}
                {isClassLoading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Đang tải danh sách lớp...</p>
                  </div>
                ) : classStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Chưa có danh sách lớp học.</p>
                  </div>
                ) : getAvailableStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "Không tìm thấy học sinh phù hợp." : "Không có học sinh nào trong lớp."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Kéo thả vào môn thi đấu ({getAvailableStudents.length} học sinh)
                    </Label>
                    <div className="max-h-[600px] overflow-y-auto border rounded-lg divide-y divide-gray-100">
                      {getAvailableStudents.map((student) => {
                        const studentSports = getStudentSports(student.id)
                        return (
                          <div
                            key={student.id}
                            draggable={canRegister}
                            onDragStart={canRegister ? (e) => handleDragStart(e, student) : undefined}
                            onDragEnd={canRegister ? handleDragEnd : undefined}
                            className={`flex items-center gap-3 p-3 transition-colors group ${
                              canRegister
                                ? "hover:bg-orange-50 cursor-move"
                                : "opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{student.fullName}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {student.studentCode && (
                                  <span className="text-xs text-gray-500">Mã: {student.studentCode}</span>
                                )}
                                {student.email && <span className="text-xs text-gray-500">• {student.email}</span>}
                                {studentSports.length > 0 && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    • Đã tham gia: {studentSports.join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Activity Info Card */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="space-y-5 pb-6">
              <Badge className="bg-orange-100 text-orange-700 w-fit text-xs px-3 py-1">{summary.category}</Badge>
              <CardTitle className="text-2xl leading-tight">{summary.title}</CardTitle>
              <p className="text-base text-gray-600 leading-relaxed">{summary.description}</p>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="leading-relaxed">
                  {summary.startDate} - {summary.endDate}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="leading-relaxed">{summary.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="leading-relaxed">Tham gia: {summary.participants}</span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trạng thái</p>
                <Badge variant="outline" className="text-orange-700 border-orange-200 px-3 py-1">
                  {summary.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form Card */}
          <Card className="glass shadow-sm">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-2xl">Thông tin đăng ký</CardTitle>
              <p className="text-base text-gray-600 leading-relaxed">
                Xác nhận để hoàn tất đăng ký tham gia hoạt động.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {!canRegister && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
                      ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                      : "Học sinh không thể đăng ký tham gia hội thao."}
                  </p>
                </div>
              )}
              <div className="text-center py-12">
                <p className="text-base text-gray-600 leading-relaxed">
                  Bạn sẽ đăng ký tham gia hoạt động này. Nhấn nút bên dưới để xác nhận.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 flex-1 leading-relaxed">
                    Bằng việc xác nhận, bạn đồng ý tuân thủ quy định của hoạt động.
                  </p>
                  <Button
                    type="button"
                    className="btn-primary min-w-[160px] h-11 text-base"
                    disabled={submitting || !canRegister}
                    onClick={handleOpenConfirm}
                  >
                    {submitting ? "Đang xử lý..." : "Đăng ký ngay"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác nhận đăng ký</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-2">
              Bạn có chắc chắn muốn tham gia hoạt động này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={submitting}
              className="min-w-[100px]"
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit} className="btn-primary min-w-[100px]" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
