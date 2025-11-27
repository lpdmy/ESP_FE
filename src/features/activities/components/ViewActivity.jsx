import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Input } from "@/common/components/ui/input"
import { Checkbox } from "@/common/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { useToast } from "@/common/hooks/useToast"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { activityParticipantService } from "@/features/activities/services/activityParticipant.service"
import { ROUTES } from "@/common/constants/routes"
import { LoadingCard } from "@/common/components/ui/loading"
import { ClassGroupService } from "@/services/classgroup.service"
import { jwtDecode } from "jwt-decode"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Award,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
  Trophy,
  MoreHorizontal,
  Info,
} from "lucide-react"

export default function ViewActivity() {
  const params = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const toastRef = useRef(toast)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationReason, setRegistrationReason] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentClass, setCurrentClass] = useState(null)
  const [classStudents, setClassStudents] = useState([])
  const [isClassLoading, setIsClassLoading] = useState(false)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    memberIds: [],
    leaderId: null,
  })
  const [groupSubmitting, setGroupSubmitting] = useState(false)
  const [selectedSportId, setSelectedSportId] = useState(null)
  const [selectedSportMembers, setSelectedSportMembers] = useState([])
  const [sportSubmitting, setSportSubmitting] = useState(false)
  const { isOpen, toggleMenu, closeMenu } = useDropdownMenu()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isPreview = queryParams.get("isPreview") === "true"

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const decoded = jwtDecode(token)
      const normalizedRole =
        decoded?.UserRole ||
        decoded?.role ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      const userId =
        parseInt(
          decoded?.Id ||
            decoded?.id ||
            decoded?.sub ||
            decoded?.nameid ||
            decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            0
        ) || null
      setCurrentUser({
        id: userId,
        role: normalizedRole,
      })
    } catch (err) {
      console.warn("Cannot decode token", err)
    }
  }, [])

  const parseRegistrationSettings = (settings) => {
    if (!settings) return null
    if (typeof settings === "string") {
      try {
        return JSON.parse(settings)
      } catch (err) {
        console.warn("Không thể parse registration settings", err)
        return null
      }
    }
    return settings
  }

  const normalizeParticipants = (list) => {
    if (!Array.isArray(list)) return []
    return list.map((participant) => ({
      id: participant?.id,
      userId: participant?.userId,
      fullName: participant?.userFullName || participant?.userName || "Người tham gia",
      className: participant?.classGroupName || "Chưa rõ lớp",
      status: participant?.status || "pending",
      groupCode: participant?.groupCode || null,
      isLeader: participant?.isLeader || false,
      sportId: participant?.sportId || null,
      sportName: participant?.sportName || null,
      registrationMetadata: participant?.registrationMetadata || "",
      avatar: participant?.userAvatarUrl,
    }))
  }

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const fetchActivity = useCallback(async () => {
      if (!params.id) {
      setError("Không tìm thấy hoạt động để hiển thị")
        setLoading(false)
        return
      }

      const token = localStorage.getItem("token")
      try {
        const response = await executeApiCall(
          activityService.getActivityById.bind(activityService),
          [params.id, token],
          { setLoading, setError }
        )

      if (!response?.data) {
        setError("Không tìm thấy dữ liệu hoạt động")
        setLoading(false)
        return
      }

          const activityData = response.data?.data || response.data
          if (!activityData) {
            setError("Không tìm thấy dữ liệu hoạt động")
            setLoading(false)
            return
          }
          
          const now = new Date()
          const startDate = activityData.startDate ? new Date(activityData.startDate) : null
          const endDate = activityData.endDate ? new Date(activityData.endDate) : null
          const registerDate = activityData.registerDate ? new Date(activityData.registerDate) : null
          const endRegisterDate = activityData.endRegisterDate ? new Date(activityData.endRegisterDate) : null
          
          let status = "Đang đăng ký"
          if (startDate && endDate) {
            if (now >= startDate && now <= endDate) {
              status = "Đang diễn ra"
            } else if (now > endDate) {
              status = "Đã kết thúc"
            } else if (now >= registerDate && now < startDate) {
              status = "Sắp tới"
            }
          }
          
          const getTimelineStatus = (date) => {
            if (!date) return "upcoming"
            const dateObj = new Date(date)
            return now >= dateObj ? "completed" : "upcoming"
          }
          
      const normalizedParticipants = normalizeParticipants(activityData?.participants)
      const sports = (activityData?.sports || []).map((sport) => ({
        id: sport?.id,
        name: sport?.sportName,
        maxMembers: sport?.maxMembers,
      }))

          const activityDetail = activityData?.activityDetail || {}
          
          setActivity({
            id: activityData?.id || 0,
            title: activityData?.title || "",
            description: activityData?.description || "",
            category: activityData?.category === 1 ? "Activity" : "Event",
            subType: activityData?.subType || "",
            thumbnail: activityData?.thumbnailUrl || "",
            startDate: activityData?.startDate ? new Date(activityData.startDate).toISOString().split("T")[0] : "",
            endDate: activityData?.endDate ? new Date(activityData.endDate).toISOString().split("T")[0] : "",
            registerDate: activityData?.registerDate ? new Date(activityData.registerDate).toISOString().split("T")[0] : "",
            endRegisterDate: activityData?.endRegisterDate ? new Date(activityData.endRegisterDate).toISOString().split("T")[0] : "",
            location: activityData?.location || "",
            organizer: activityData?.organizer || "",
            maxParticipants: activityData?.maxParticipants || 0,
        currentParticipants: activityData?.numberOfParticipants || normalizedParticipants.length || 0,
        status,
        sportsCategories: sports.map((sport) => sport.name).filter(Boolean),
        sports,
            competitionType: activityDetail?.competitionType || "",
            // CreativeContest fields
            theme: activityDetail?.theme || "",
            genre: activityDetail?.genre || "",
            paperSize: activityDetail?.paperSize || "",
            drawingMedium: activityDetail?.drawingMedium || "",
            timeLimit: activityDetail?.timeLimit || "",
            submissionFormat: activityDetail?.submissionFormat || "",
            rules: activityData?.rules || [],
            timeline: [
              { 
                date: activityData?.registerDate ? new Date(activityData.registerDate).toISOString().split("T")[0] : "", 
                title: "Mở đăng ký", 
            status: getTimelineStatus(activityData?.registerDate),
              },
              { 
                date: activityData?.endRegisterDate ? new Date(activityData.endRegisterDate).toISOString().split("T")[0] : "", 
                title: "Đóng đăng ký", 
            status: getTimelineStatus(activityData?.endRegisterDate),
              },
              { 
                date: activityData?.startDate ? new Date(activityData.startDate).toISOString().split("T")[0] : "", 
                title: "Khai mạc", 
            status: getTimelineStatus(activityData?.startDate),
              },
              { 
                date: activityData?.endDate ? new Date(activityData.endDate).toISOString().split("T")[0] : "", 
                title: "Bế mạc & Trao giải", 
            status: getTimelineStatus(activityData?.endDate),
              },
            ],
        awards:
          activityData?.awards
            ?.map((a) => ({
              rank: a?.name || a?.rank || "",
              prize: `${a?.starPoints || a?.points || 0} điểm`,
            }))
            .filter(Boolean) || [],
            speakers: activityData?.speakers || [],
            programs: activityData?.programs || activityData?.programItems || [],
        participants: normalizedParticipants,
            onlyTeacherCanRegister: activityData?.onlyTeacherCanRegister || false,
            gradingSettings: activityData?.gradingSettings || null,
            registrationReward: activityData?.registrationReward || null,
        registrationSettings: parseRegistrationSettings(activityData?.registrationSettings),
          })
      setLoading(false)
      } catch (err) {
        console.error("Error fetching activity:", err)
      toastRef.current.error(err?.message || "Không thể tải thông tin hoạt động")
        if (err?.statusCode === 404) {
        navigate(ROUTES.ACTIVITY.LIST)
      }
      setLoading(false)
    }
  }, [navigate, params.id])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

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
        })) || []

      setClassStudents(normalizedStudents.filter((student) => student.id))
    } catch (err) {
      console.error("Không thể tải thông tin lớp học:", err)
      toast.error(err?.message || "Không thể tải thông tin lớp học của bạn.")
    } finally {
      setIsClassLoading(false)
    }
  }, [classStudents.length, currentClass, isClassLoading, toast])

  const handleOpenGroupDialog = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để đăng ký.")
      return
    }
    await ensureClassData()
    setGroupForm({
      groupName: "",
      memberIds: currentUser?.id ? [currentUser.id] : [],
      leaderId: currentUser?.id || null,
    })
    setIsGroupDialogOpen(true)
  }

  const handleToggleGroupMember = (studentId) => {
    setGroupForm((prev) => {
      const alreadySelected = prev.memberIds.includes(studentId)
      let updatedMembers = alreadySelected
        ? prev.memberIds.filter((id) => id !== studentId)
        : [...prev.memberIds, studentId]

      const groupSettings = activity?.registrationSettings?.groupRegistration
      const maxMembers = groupSettings?.maxMembers
      if (!alreadySelected && maxMembers && updatedMembers.length > maxMembers) {
        toast.error(`Nhóm chỉ được phép tối đa ${maxMembers} thành viên.`)
        return prev
      }

      if (!updatedMembers.length && currentUser?.id) {
        updatedMembers = [currentUser.id]
      }

      const nextLeader = updatedMembers.includes(prev.leaderId) ? prev.leaderId : updatedMembers[0] || null

      return {
        ...prev,
        memberIds: updatedMembers,
        leaderId: nextLeader,
      }
    })
  }

  const handleGroupLeaderChange = (value) => {
    setGroupForm((prev) => ({
      ...prev,
      leaderId: Number(value),
    }))
  }

  const handleSubmitGroupRegistration = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để tiếp tục.")
      return
    }
    const groupSettings = activity?.registrationSettings?.groupRegistration
    const minMembers = groupSettings?.minMembers || 1
    if (groupForm.memberIds.length < minMembers) {
      toast.error(`Nhóm cần ít nhất ${minMembers} thành viên.`)
      return
    }
    if (!groupForm.leaderId) {
      toast.error("Vui lòng chọn nhóm trưởng.")
      return
    }
    const classId = currentClass?.id || currentClass?.classGroupId
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp để đăng ký.")
      return
    }
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Vui lòng đăng nhập.")
      return
    }

    setGroupSubmitting(true)
    try {
      await activityParticipantService.registerGroup(
        {
          activityId: Number(params.id),
          leaderId: groupForm.leaderId,
          memberIds: groupForm.memberIds,
          classGroupId: classId,
          groupName: groupForm.groupName?.trim() || undefined,
          requestedByUserId: currentUser.id,
        },
        token
      )
      toast.showSuccess("Đăng ký nhóm thành công!")
      setIsGroupDialogOpen(false)
      setGroupForm({ groupName: "", memberIds: [], leaderId: null })
    fetchActivity()
    } catch (err) {
      console.error("Group registration failed:", err)
      toast.error(err?.message || "Không thể đăng ký nhóm.")
    } finally {
      setGroupSubmitting(false)
    }
  }

  const handleToggleSportMember = (studentId) => {
    setSelectedSportMembers((prev) => {
      const alreadySelected = prev.includes(studentId)
      const currentSport = activity?.sports?.find((sport) => sport.id === Number(selectedSportId))
      const maxMembers = currentSport?.maxMembers

      if (!alreadySelected) {
        if (maxMembers && prev.length + 1 > maxMembers) {
          toast.error(`Mỗi môn chỉ được tối đa ${maxMembers} thành viên.`)
          return prev
        }
        return [...prev, studentId]
      }

      return prev.filter((id) => id !== studentId)
    })
  }

  const handleSubmitSportRegistration = async () => {
    if (!selectedSportId) {
      toast.error("Vui lòng chọn môn thi đấu.")
      return
    }
    if (!selectedSportMembers.length) {
      toast.error("Vui lòng chọn ít nhất một học sinh.")
      return
    }
    await ensureClassData()
    const classId = currentClass?.id || currentClass?.classGroupId
    if (!classId) {
      toast.error("Không tìm thấy thông tin lớp để đăng ký.")
      return
    }
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Vui lòng đăng nhập.")
      return
    }

    setSportSubmitting(true)
    try {
      await activityParticipantService.registerSport(
        {
          activityId: Number(params.id),
          sportId: Number(selectedSportId),
          classGroupId: classId,
          memberIds: selectedSportMembers,
          requestedByUserId: currentUser?.id,
        },
        token
      )
      toast.showSuccess("Đăng ký hội thao thành công!")
      setSelectedSportMembers([])
      fetchActivity()
    } catch (err) {
      console.error("Sport registration failed:", err)
      toast.error(err?.message || "Không thể đăng ký môn thi đấu.")
    } finally {
      setSportSubmitting(false)
    }
  }

  useEffect(() => {
    setSelectedSportMembers([])
  }, [selectedSportId])

  const userSimpleParticipation = useMemo(() => {
    if (!activity?.participants || !currentUser?.id) return null
    return activity.participants.find(
      (participant) =>
        participant.userId === currentUser.id && !participant.groupCode && !participant.sportId
    )
  }, [activity?.participants, currentUser?.id])

  useEffect(() => {
    setIsRegistered(Boolean(userSimpleParticipation))
  }, [userSimpleParticipation])

  const handleAction = (action) => {
    if (isPreview) {
      toast.showWarning("Bạn đang ở chế độ xem trước, không thể thực hiện hành động này.")
      return
    }
    action()
  }

  const handleRegister = async () => {
    handleAction(async () => {
      if (!registrationReason.trim()) {
        toast.error("Vui lòng nhập lý do tham gia")
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.")
        return
      }

      setIsRegistering(true)
      try {
        const response = await executeApiCall(
          activityParticipantService.registerForActivity.bind(activityParticipantService),
          [{ activityId: parseInt(params.id), reason: registrationReason }, token],
          { setError }
        )

        if (response?.data) {
          setIsRegistered(true)
          setRegistrationReason("")
          toast.showSuccess("Đăng ký thành công! Yêu cầu đăng ký của bạn đang chờ phê duyệt.")
          fetchActivity()
        }
      } catch (err) {
        console.error("Error registering for activity:", err)
        toast.error(err?.message || "Có lỗi xảy ra khi đăng ký")
      } finally {
        setIsRegistering(false)
      }
    })
  }

  const handleCancelRegister = async () => {
    handleAction(async () => {
      const participationId = userSimpleParticipation?.id
      if (!participationId) {
        toast.error("Không tìm thấy thông tin đăng ký")
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.")
        return
      }

      setIsCancelling(true)
      try {
        await executeApiCall(
          activityParticipantService.cancelRegistration.bind(activityParticipantService),
          [participationId, token],
          { setError }
        )

        setIsRegistered(false)
        toast.showSuccess("Đã hủy đăng ký tham gia hoạt động.")
        fetchActivity()
      } catch (err) {
        console.error("Error cancelling registration:", err)
        toast.error(err?.message || "Có lỗi xảy ra khi hủy đăng ký")
      } finally {
        setIsCancelling(false)
      }
    })
  }

  const handleShare = () => {
    handleAction(() => {
      navigator.clipboard.writeText(window.location.href)
      toast.showSuccess("Đã sao chép link hoạt động vào clipboard.")
    })
  }

  const handleMessage = () => {
    handleAction(() => {
      toast.showInfo("Tính năng gửi tin nhắn sẽ được mở sớm.")
    })
  }

  const renderSimpleRegistration = () => (
    <div className="space-y-3">
      {!canRegister && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
              ? "Giáo viên chỉ được đăng ký tham gia hội thao."
              : "Học sinh không thể đăng ký tham gia hội thao."}
          </p>
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full btn-primary" disabled={isPreview || !canRegister}>
            Đăng ký tham gia
          </Button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đăng ký tham gia hoạt động</DialogTitle>
          <DialogDescription>Vui lòng cho biết lý do bạn muốn tham gia hoạt động này</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do tham gia</Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Tôi muốn rèn luyện sức khỏe và giao lưu với bạn bè..."
              value={registrationReason}
              onChange={(e) => setRegistrationReason(e.target.value)}
              rows={4}
              disabled={isPreview}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={isRegistering}>
            Hủy
          </Button>
          <Button onClick={handleRegister} className="btn-primary" disabled={isPreview || isRegistering || !canRegister}>
            {isRegistering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )

  const renderGroupRegistration = () => {
    const minMembers = groupSettings?.minMembers || 1
    const maxMembers = groupSettings?.maxMembers

    return (
      <div className="space-y-3">
        {!canRegister && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}
        <Button className="w-full btn-primary" disabled={isPreview || !canRegister} onClick={handleOpenGroupDialog}>
          Đăng ký theo nhóm
        </Button>
        <p className="text-sm text-gray-600 text-center">
          Nhóm tối thiểu {minMembers}
          {maxMembers ? ` - tối đa ${maxMembers}` : ""} thành viên, cần chỉ định nhóm trưởng.
        </p>
        <Dialog open={isGroupDialogOpen} onOpenChange={(open) => setIsGroupDialogOpen(open)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo nhóm tham gia</DialogTitle>
              <DialogDescription>
                Chọn học sinh trong lớp để tạo nhóm dự thi. Nhóm trưởng sẽ đại diện nhận thông báo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Tên nhóm (tuỳ chọn)</Label>
                <Input
                  id="groupName"
                  placeholder="Nhập tên nhóm"
                  value={groupForm.groupName}
                  onChange={(e) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      groupName: e.target.value,
                    }))
                  }
                  disabled={groupSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Thành viên</Label>
                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {isClassLoading ? (
                    <p className="text-sm text-gray-500">Đang tải danh sách lớp...</p>
                  ) : classStudents.length ? (
                    classStudents.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={groupForm.memberIds.includes(student.id)}
                          onCheckedChange={() => handleToggleGroupMember(student.id)}
                          disabled={groupSubmitting}
                        />
                        <span className="font-medium">{student.fullName}</span>
                        {student.studentCode && (
                          <span className="text-gray-500">({student.studentCode})</span>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      Chưa có danh sách lớp.{" "}
                      <button className="text-orange-600 underline" onClick={ensureClassData}>
                        Tải lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {groupForm.memberIds.length > 0 && (
                <div className="space-y-2">
                  <Label>Nhóm trưởng</Label>
                  <Select
                    value={groupForm.leaderId ? String(groupForm.leaderId) : ""}
                    onValueChange={handleGroupLeaderChange}
                    disabled={groupSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm trưởng" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupForm.memberIds.map((memberId) => {
                        const student = classStudents.find((s) => s.id === memberId)
                        return (
                          <SelectItem key={memberId} value={String(memberId)}>
                            {student?.fullName || `Thành viên #${memberId}`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)} disabled={groupSubmitting}>
                Hủy
              </Button>
              <Button className="btn-primary" onClick={handleSubmitGroupRegistration} disabled={groupSubmitting || !canRegister}>
                {groupSubmitting ? "Đang gửi..." : "Xác nhận đăng ký"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const renderSportRegistration = () => {
    const currentSport = activity?.sports?.find((sport) => sport.id === Number(selectedSportId))

    return (
      <div className="space-y-3">
        {!canRegister && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
                ? "Giáo viên chỉ được đăng ký tham gia hội thao."
                : "Học sinh không thể đăng ký tham gia hội thao."}
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label>Chọn môn thi đấu</Label>
          <Select
            value={selectedSportId ? String(selectedSportId) : ""}
            onValueChange={(value) => setSelectedSportId(Number(value))}
            disabled={isPreview || !canRegister}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn môn thi đấu" />
            </SelectTrigger>
            <SelectContent>
              {(activity?.sports || []).map((sport) => (
                <SelectItem key={sport.id} value={String(sport.id)}>
                  {sport.name}
                  {sport.maxMembers ? ` (tối đa ${sport.maxMembers})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentSport?.maxMembers && (
            <p className="text-xs text-gray-500">Mỗi môn tối đa {currentSport.maxMembers} thành viên.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Chọn học sinh của lớp</Label>
          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
            {isClassLoading ? (
              <p className="text-sm text-gray-500">Đang tải danh sách lớp...</p>
            ) : classStudents.length ? (
              classStudents.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedSportMembers.includes(student.id)}
                    onCheckedChange={() => handleToggleSportMember(student.id)}
                    disabled={sportSubmitting || !canRegister}
                  />
                  <span className="font-medium">{student.fullName}</span>
                  {student.studentCode && <span className="text-gray-500">({student.studentCode})</span>}
                </label>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                Chưa có danh sách lớp.{" "}
                <button className="text-orange-600 underline" onClick={ensureClassData}>
                  Tải lại
                </button>
              </div>
            )}
          </div>
        </div>
        <Button
          className="w-full btn-primary"
          onClick={handleSubmitSportRegistration}
          disabled={
            isPreview || sportSubmitting || !selectedSportId || selectedSportMembers.length === 0 || isClassLoading || !canRegister
          }
        >
          {sportSubmitting ? "Đang đăng ký..." : "Đăng ký môn thi đấu"}
        </Button>
      </div>
    )
  }

  const renderRegisteredStatus = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Đã đăng ký</span>
      </div>
      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={handleCancelRegister}
        disabled={isPreview || isCancelling}
      >
        {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
      </Button>
    </div>
  )

  const renderRegistrationActions = () => {
    const isSimpleRegistration = !isSportsFestival && !isCreativeContest
    if (isSportsFestival) {
      return renderSportRegistration()
    }
    if (isCreativeContest) {
      return renderGroupRegistration()
    }
    return isRegistered ? renderRegisteredStatus() : renderSimpleRegistration()
  }

  // Use participants from activity data or empty array
  const participants = activity?.participants || []
  const isCreativeContest = activity?.subType === "CreativeContest"
  const isSportsFestival = activity?.subType === "SportsFestival"
  const groupSettings = activity?.registrationSettings?.groupRegistration
  const participantProgress =
    activity && activity.maxParticipants
      ? Math.min((activity.currentParticipants / activity.maxParticipants) * 100, 100)
      : 0

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

  const groupRegistrations = useMemo(() => {
    if (!activity?.participants) return []
    const map = new Map()
    activity.participants
      .filter((participant) => participant.groupCode)
      .forEach((participant) => {
        const key = participant.groupCode
        if (!map.has(key)) {
          map.set(key, {
            code: key,
            name: participant.registrationMetadata || "",
            members: [],
          })
        }
        map.get(key).members.push(participant)
      })

    return Array.from(map.values()).map((group, index) => ({
      ...group,
      name: group.name || `Nhóm ${index + 1}`,
    }))
  }, [activity])

  const sportRegistrations = useMemo(() => {
    if (!activity?.participants) return []
    const map = new Map()
    activity.participants
      .filter((participant) => participant.sportId)
      .forEach((participant) => {
        const sportId = participant.sportId
        if (!map.has(sportId)) {
          const sportMeta = activity?.sports?.find((sport) => sport.id === sportId)
          map.set(sportId, {
            sportId,
            sportName: participant.sportName || sportMeta?.name || "Môn thi đấu",
            classes: new Map(),
          })
        }
        const entry = map.get(sportId)
        const className = participant.className || "Chưa rõ lớp"
        if (!entry.classes.has(className)) {
          entry.classes.set(className, [])
        }
        entry.classes.get(className).push(participant)
      })

    return Array.from(map.values()).map((entry) => ({
      sportId: entry.sportId,
      sportName: entry.sportName,
      rosters: Array.from(entry.classes.entries()).map(([className, members]) => ({
        className,
        members,
      })),
    }))
  }, [activity])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <LoadingCard text="Đang tải thông tin hoạt động..." />
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Không tìm thấy hoạt động"}</p>
            <Button onClick={() => navigate("/activities")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {isPreview && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-800">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              Bạn đang ở chế độ xem trước. Các hành động sẽ không được thực hiện.
            </span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cover Image */}
        <div className="relative mb-10 rounded-xl overflow-hidden">
          <img
            src={activity.thumbnail || "/placeholder.svg"}
            alt={activity.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-orange-500">{activity.category}</Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                {activity.subType}
              </Badge>
              {activity.onlyTeacherCanRegister && (
                <Badge variant="outline" className="bg-blue-500/20 text-white border-white/30">
                  Chỉ giáo viên
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">{activity.title}</h1>
            <p className="text-lg opacity-90 leading-relaxed">{activity.organizer}</p>
          </div>
          <div className="absolute top-6 right-6 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={handleShare}
              disabled={isPreview}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={toggleMenu}
                data-dropdown-trigger
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  disabled={isPreview}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                isOpen={isOpen}
                onClose={closeMenu}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    handleAction(() => {
                      toast.showInfo("Tính năng báo cáo sẽ được mở sớm.")
                    })
                  }}
                >
                  Báo cáo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>Chia sẻ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Activity Info */}
          <div className="lg:col-span-3">
            <div className="top-6 space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    <CardTitle>Thông tin hoạt động</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thời gian</p>
                        <p className="font-semibold text-sm">
                          {activity.startDate} - {activity.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Địa điểm</p>
                        <p className="font-semibold text-sm">{activity.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Người tham gia</p>
                        <p className="font-semibold text-sm">
                          {activity.currentParticipants}/{activity.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Đăng ký đến</p>
                        <p className="font-semibold text-sm">{activity.endRegisterDate}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Phân loại</h4>
                    <Badge className="bg-orange-100 text-orange-800">{activity.category}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Card */}
              <Card className="glass sticky top-6 !bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {activity.currentParticipants}/{activity.maxParticipants}
                    </div>
                    <p className="text-sm text-gray-600">Người tham gia</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                        width: `${participantProgress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {renderRegistrationActions()}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={handleShare}
                      disabled={isPreview}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleAction(() => {
                          toast.showInfo("Tính năng yêu thích sẽ được mở sớm.")
                        })
                      }}
                      disabled={isPreview}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center Content - Tabs */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="participants">Người tham gia</TabsTrigger>
                <TabsTrigger value="timeline">Lịch trình</TabsTrigger>
                <TabsTrigger value="awards">Giải thưởng</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="glass hover-lift">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Giới thiệu</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 leading-relaxed text-base">{activity.description}</p>
                  </CardContent>
                </Card>

                {/* SportsFestival: Môn thi đấu */}
                {isSportsFestival && activity.sportsCategories.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">Môn thi đấu</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        {activity.sportsCategories.map((sport, index) => {
                          const sportConfig = activity.sports?.find((s) => s.name === sport)
                          return (
                            <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900">{sport}</span>
                              </div>
                              {sportConfig?.maxMembers && (
                                <Badge variant="outline" className="text-xs bg-white">
                                  Tối đa {sportConfig.maxMembers}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {activity.competitionType && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Hình thức thi đấu:</span>
                            <Badge className="bg-blue-100 text-blue-700">
                              {activity.competitionType === "Individual" ? "Cá nhân" : 
                               activity.competitionType === "Team" ? "Đồng đội" : 
                               activity.competitionType === "Mixed" ? "Kết hợp" : activity.competitionType}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* CreativeContest: Thông tin cuộc thi */}
                {isCreativeContest && (
                  <Card className="glass hover-lift">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">Thông tin cuộc thi</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {activity.theme && (
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-semibold text-gray-700">Chủ đề</span>
                          </div>
                          <p className="text-base font-medium text-gray-900">{activity.theme}</p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        {activity.genre && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Loại hình sáng tạo</p>
                            <p className="font-medium text-gray-900">{activity.genre}</p>
                          </div>
                        )}
                        {activity.paperSize && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Kích thước / Độ dài</p>
                            <p className="font-medium text-gray-900">{activity.paperSize}</p>
                          </div>
                        )}
                        {activity.drawingMedium && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Chất liệu / Thể loại</p>
                            <p className="font-medium text-gray-900">{activity.drawingMedium}</p>
                          </div>
                        )}
                        {activity.timeLimit && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Thời gian làm bài</p>
                            <p className="font-medium text-gray-900">{activity.timeLimit}</p>
                          </div>
                        )}
                      </div>
                      {activity.submissionFormat && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Format nộp bài</p>
                          <p className="font-medium text-gray-900">{activity.submissionFormat}</p>
                        </div>
                      )}
                      {activity.registrationSettings?.groupRegistration && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Cài đặt đăng ký theo nhóm</p>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Số thành viên tối thiểu</p>
                              <p className="font-semibold text-orange-700">
                                {activity.registrationSettings.groupRegistration.minMembers || 1} người
                              </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Số thành viên tối đa</p>
                              <p className="font-semibold text-orange-700">
                                {activity.registrationSettings.groupRegistration.maxMembers
                                  ? `${activity.registrationSettings.groupRegistration.maxMembers} người`
                                  : "Không giới hạn"}
                              </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Yêu cầu nhóm trưởng</p>
                              <p className="font-semibold text-orange-700">
                                {activity.registrationSettings.groupRegistration.requireLeader ? "Có" : "Không"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* SeminarWorkshop: Diễn giả */}
                {(activity.subType === "SeminarWorkshop" || activity.subType === "Seminar") && activity.speakers && activity.speakers.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Diễn giả
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {activity.speakers.map((speaker, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {speaker.imageUrl || speaker.image ? (
                              <img
                                src={speaker.imageUrl || speaker.image}
                                alt={speaker.name}
                                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                  e.target.nextSibling.style.display = "flex"
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ${
                                speaker.imageUrl || speaker.image ? "hidden" : ""
                              }`}
                            >
                              <Users className="w-8 h-8 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base text-gray-900">{speaker.name || "Chưa có tên"}</p>
                              {speaker.title && (
                                <p className="text-sm text-gray-600 mt-1">{speaker.title}</p>
                              )}
                              {speaker.bio && (
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{speaker.bio}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SeminarWorkshop: Chương trình */}
                {(activity.subType === "SeminarWorkshop" || activity.subType === "Seminar") && activity.programs && activity.programs.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Chương trình
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {activity.programs
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((item, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">{item.time || "Chưa có giờ"}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base text-gray-900">{item.title || "Chưa có tiêu đề"}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="glass hover-lift">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Quy định tham gia</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {activity.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Grading Settings */}
                {activity.gradingSettings && activity.gradingSettings.criteria && activity.gradingSettings.criteria.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        Cài đặt chấm điểm
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-2">Tiêu chí chấm điểm:</p>
                        {activity.gradingSettings.criteria.map((criterion, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <span className="text-blue-600">•</span>
                            <span className="text-sm text-gray-700">{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Registration Settings */}
                {activity.onlyTeacherCanRegister && (
                  <Card className="glass hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Cài đặt đăng ký
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          Chỉ giáo viên chủ nhiệm mới được đăng ký đại diện lớp
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                {isCreativeContest && groupRegistrations.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader>
                      <CardTitle>Danh sách nhóm tham gia ({groupRegistrations.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {groupRegistrations.map((group, index) => (
                        <div key={group.code || index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-base">{group.name}</p>
                              <p className="text-sm text-gray-500">{group.members.length} thành viên</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {group.members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{member.fullName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">{member.className}</span>
                                  {member.isLeader && (
                                    <Badge className="bg-blue-100 text-blue-700">Nhóm trưởng</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {isSportsFestival && sportRegistrations.length > 0 && (
                  <Card className="glass hover-lift">
                    <CardHeader>
                      <CardTitle>Đội hình từng môn ({sportRegistrations.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sportRegistrations.map((sport) => (
                        <div key={sport.sportId} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="font-semibold text-base">{sport.sportName}</p>
                            {activity?.sports?.find((s) => s.id === sport.sportId)?.maxMembers && (
                              <span className="text-xs text-gray-500">
                                Giới hạn {activity.sports.find((s) => s.id === sport.sportId).maxMembers} người
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {sport.rosters.map((roster, rosterIndex) => (
                              <div key={`${sport.sportId}-${rosterIndex}`} className="bg-gray-50 rounded-lg p-3">
                                <p className="font-medium text-sm mb-2">Lớp {roster.className}</p>
                                <div className="flex flex-wrap gap-2">
                                  {roster.members.map((member) => (
                                    <Badge key={member.id} variant="outline" className="bg-white">
                                      {member.fullName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Danh sách người tham gia ({participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {participant.fullName ? participant.fullName.charAt(0).toUpperCase() : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{participant.fullName}</p>
                              <p className="text-sm text-gray-600">
                                Lớp {participant.className || "Chưa rõ"}
                              </p>
                              {participant.groupCode && (
                                <p className="text-xs text-orange-600">
                                  Nhóm: {participant.registrationMetadata || participant.groupCode}
                                </p>
                              )}
                              {participant.sportName && (
                                <p className="text-xs text-blue-600">Môn: {participant.sportName}</p>
                              )}
                            </div>
                          </div>
                          {(() => {
                            const status = participant.status?.toLowerCase()
                            const approved = status === "approved" || status === "joined"
                            return (
                          <Badge
                            className={
                                  approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }
                          >
                                {approved ? "Đã duyệt" : "Chờ duyệt"}
                          </Badge>
                            )
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Lịch trình hoạt động</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.timeline.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              milestone.status === "completed" ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {milestone.status === "completed" ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-sm text-gray-600">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="awards" className="space-y-4">
                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Giải thưởng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.awards.map((award, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-orange-600" />
                            <span className="font-semibold">{award.rank}</span>
                          </div>
                          <span className="text-gray-700">{award.prize}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Organizer & Contact */}
          <div className="lg:col-span-3">
            <div className="top-6 space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Đơn vị tổ chức
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">ĐT</span>
                    </div>
                    <div>
                      <p className="font-semibold">{activity.organizer}</p>
                      <p className="text-sm text-gray-600">FPT School</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass !bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-500" />
                    Liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={handleMessage}
                    disabled={isPreview}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Gửi tin nhắn
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

