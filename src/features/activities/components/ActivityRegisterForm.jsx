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
import { Calendar, MapPin, Users, ArrowLeft, Trophy, Search, X, GripVertical, ChevronDown, CheckCircle } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { useSearchApi } from "@/common/hooks/useSearchApi"
import { authService } from "@/features/auth/services/auth.service"

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
  // Group registration state for CreativeContest
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    memberIds: [],
    leaderId: null,
  })
  // Lưu thông tin đầy đủ của tất cả members đã thêm vào nhóm
  const [groupMembers, setGroupMembers] = useState([]) // [{ id, fullName, studentCode, email, className, ... }]
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [searchedUsers, setSearchedUsers] = useState([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [dragOverGroup, setDragOverGroup] = useState(false)
  const { searchUserByEmail } = useSearchApi()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
 
  // State để lưu error messages cho từng field
  const [errors, setErrors] = useState({
    general: "",
    sports: {}, // { sportId: "error message" }
    groupMembers: "",
    groupLeader: "",
    groupName: "",
    classId: "",
  })

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      
      try {
        // Decode token để lấy id và role
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

        // Fetch thông tin đầy đủ từ API
        try {
          const response = await authService.getMe(token)
          const userData = response?.data?.data || response?.data || response
          
          setCurrentUser({
            id: userId || userData?.id,
            role: normalizedRole || userData?.role,
            fullName: userData?.fullName || `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() || userData?.name || "",
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
            email: userData?.email || "",
            studentCode: userData?.studentCode || userData?.studentNumber || "",
            studentNumber: userData?.studentNumber || userData?.studentCode || "",
            className: userData?.className || userData?.classGroupName || "",
          })
        } catch (apiErr) {
          // Fallback: chỉ dùng thông tin từ token
          setCurrentUser({
            id: userId,
            role: normalizedRole,
          })
        }
      } catch (err) {
        // Token decode failed, continue without user info
      }
    }
    
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params.id) {
        navigate(ROUTES.ACTIVITY.LIST)
        return
      }
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        // Dùng getRegisterInfo thay vì getActivityById để tối ưu performance
        const response = await executeApiCall(
          activityService.getRegisterInfo.bind(activityService),
          [params.id, token],
          { setLoading: () => {} }
        )
        const data = response?.data?.data || response?.data
        
        setActivity(data)
        
        // Kiểm tra user đã đăng ký chưa
        if (data?.participants && currentUser?.id) {
          const userParticipation = data.participants.find(
            (p) => p.userId === currentUser.id && !p.isDeleted
          )
          setIsRegistered(Boolean(userParticipation))
        }
        
        setLoading(false)
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
      toastRef.current.error("Vui lòng đăng nhập để tiếp tục.")
      return
    }

    setIsClassLoading(true)
    try {
      const classResponse = await ClassGroupService.getCurrentClass(token)
      const classData = classResponse?.data?.data || classResponse?.data || classResponse
      if (!classData) {
        toastRef.current.error("Không tìm thấy lớp học hiện tại của bạn.")
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
      toastRef.current.error(err?.message || "Không thể tải thông tin lớp học của bạn.")
    } finally {
      setIsClassLoading(false)
    }
  }, [classStudents.length, currentClass, isClassLoading])

  useEffect(() => {
    // Chỉ tự động load class data cho SportsFestival
    // CreativeContest không cần load class trước, chỉ search khi user nhập email
    if (activity?.subType === "SportsFestival" && activity?.sports?.length > 0) {
      ensureClassData()
    }
  }, [activity?.subType, activity?.sports?.length, ensureClassData])

  // Initialize group form separately to avoid infinite loop
  useEffect(() => {
    if (activity?.subType === "CreativeContest" && currentUser?.id) {
      setGroupForm((prev) => {
        // Only initialize if not already set or if currentUser changed
        if (prev.memberIds.length === 0 || !prev.memberIds.includes(currentUser.id)) {
          return {
            groupName: "",
            memberIds: [currentUser.id],
            leaderId: currentUser.id,
          }
        }
        // Ensure currentUser is always a member and leader if not set
        if (!prev.memberIds.includes(currentUser.id)) {
          return {
            ...prev,
            memberIds: [currentUser.id, ...prev.memberIds.filter(id => id !== currentUser.id)],
            leaderId: prev.leaderId || currentUser.id,
          }
        }
        if (!prev.leaderId) {
          return {
            ...prev,
            leaderId: currentUser.id,
          }
        }
        return prev
      })

    }
  }, [activity?.subType, currentUser?.id])

  // Initialize groupMembers với currentUser (tách riêng để tránh dependency loop)
  useEffect(() => {
    if (activity?.subType === "CreativeContest" && currentUser?.id && currentUser?.fullName) {
      setGroupMembers((prev) => {
        // Chỉ thêm currentUser nếu chưa có
        if (!prev.find((m) => m.id === currentUser.id)) {
          return [
            {
              id: currentUser.id,
              fullName: currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.name || "",
              studentCode: currentUser.studentCode || currentUser.studentNumber || "",
              email: currentUser.email || "",
              className: currentUser.className || "",
            },
            ...prev.filter((m) => m.id !== currentUser.id), // Đảm bảo currentUser ở đầu
          ]
        }
        return prev
      })
    }
  }, [activity?.subType, currentUser?.id, currentUser?.fullName])

  // Sync groupMembers với groupForm.memberIds - đảm bảo tất cả members trong groupForm đều có trong groupMembers
  // Lưu ý: Không dùng getMemberInfo trong dependency để tránh infinite loop
  useEffect(() => {
    if (activity?.subType === "CreativeContest" && groupForm.memberIds.length > 0) {
      setGroupMembers((prev) => {
        const updated = [...prev]
        let hasChanges = false

        // Thêm members mới vào groupMembers nếu chưa có
        groupForm.memberIds.forEach((memberId) => {
          if (!updated.find((m) => m.id === memberId)) {
            // Tìm member info từ các nguồn (không dùng getMemberInfo để tránh dependency loop)
            let memberInfo = null
            
            // 1. Tìm trong groupMembers hiện tại
            memberInfo = updated.find((m) => m.id === memberId)
            
            // 2. Kiểm tra currentUser
            if (!memberInfo && currentUser && currentUser.id === memberId) {
              memberInfo = {
                id: currentUser.id,
                fullName: currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.name || "",
                studentCode: currentUser.studentCode || currentUser.studentNumber || "",
                email: currentUser.email || "",
                className: currentUser.className || "",
              }
            }
            
            // 3. Tìm trong searchedUsers
            if (!memberInfo) {
              memberInfo = searchedUsers.find((s) => s.id === memberId)
            }
            
            // 4. Tìm trong classStudents
            if (!memberInfo) {
              memberInfo = classStudents.find((s) => s.id === memberId)
            }
            
            if (memberInfo) {
              updated.push({
                id: memberId,
                fullName: memberInfo.fullName || `Thành viên #${memberId}`,
                studentCode: memberInfo.studentCode || "",
                email: memberInfo.email || "",
                className: memberInfo.className || "",
              })
              hasChanges = true
            }
          }
        })

        // Xóa members không còn trong groupForm (trừ currentUser)
        const membersToKeep = groupForm.memberIds
        const filtered = updated.filter((m) => {
          if (m.id === currentUser?.id) return true // Luôn giữ currentUser
          return membersToKeep.includes(m.id)
        })

        if (filtered.length !== updated.length) {
          hasChanges = true
        }

        return hasChanges ? filtered : prev
      })
    }
  }, [activity?.subType, groupForm.memberIds, currentUser, searchedUsers, classStudents])

  // Parse registration settings
  // BE returns RegistrationSettings as an object (already deserialized by AutoMapper)
  // But we need to handle both cases: object or string
  const parseRegistrationSettings = (settings) => {
    if (!settings) {
      return null
    }
    
    // If it's already an object (from BE deserialization), return as is
    if (typeof settings === "object" && !Array.isArray(settings)) {
      return settings
    }
    
    // If it's a string, parse it
    if (typeof settings === "string") {
      try {
        const parsed = JSON.parse(settings)
        return parsed
      } catch (err) {
        return null
      }
    }
    
    return null
  }

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Tìm kiếm user trong hệ thống - chỉ search khi nhấn nút hoặc Enter
  const handleSearchUsers = async () => {
    const trimmedQuery = groupSearchQuery?.trim()
    
    // Chỉ search khi nhập đúng email format
    if (!trimmedQuery || !isValidEmail(trimmedQuery)) {
      toast.showError("Vui lòng nhập đúng định dạng email (ví dụ: example@fpt.edu.vn)")
      return
    }

    setIsSearchingUsers(true)
    try {
      // Gọi API search user by email (chính xác)
      const response = await searchUserByEmail(trimmedQuery)
      

      // Parse response - backend trả về ResponseDto<UserSearchResultDto>
      let user = null
      if (response?.data?.data) {
        // Response structure: { data: { data: {...} } }
        user = response.data.data
      } else if (response?.data && typeof response.data === 'object') {
        // Response structure: { data: {...} }
        user = response.data
      } else if (typeof response === 'object' && response.id) {
        // Response structure: {...}
        user = response
      }

      if (!user) {
        toast.info("Không tìm thấy thành viên với email này")
        setSearchedUsers([])
        return
      }

      // Normalize user từ UserSearchResultDto
      const userId = user.id || user.userId
      if (!userId) {
        toast.showError("Không thể xác định ID của thành viên. Vui lòng thử lại.")
        setSearchedUsers([])
        return
      }

      const normalizedUser = {
        id: Number(userId) || userId, // Đảm bảo id là number hoặc giữ nguyên nếu không convert được
        fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
        studentCode: user.studentCode || user.studentNumber || "",
        email: user.email || "",
        role: user.role || "",
        className: user.className || user.classGroupName || "",
        avatarUrl: user.avatarUrl || "",
      }


      setSearchedUsers([normalizedUser])
      toast.success("Tìm thấy thành viên!")
    } catch (err) {
      if (err?.statusCode === 404) {
        toast.info("Không tìm thấy thành viên với email này")
      } else {
        toast.showError(err?.message || "Không thể tìm kiếm thành viên. Vui lòng thử lại.")
      }
      setSearchedUsers([])
    } finally {
      setIsSearchingUsers(false)
    }
  }

  // Handle Enter key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && !submitting) {
      e.preventDefault()
      handleSearchUsers()
    }
  }

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

  // Helper function to get group settings with defaults
  // This ensures we always have valid minMembers and maxMembers values
  const getGroupSettings = useMemo(() => {
    if (!activity) return null
    
    // Debug: Log raw registrationSettings (only once when activity changes)
    const parsed = parseRegistrationSettings(activity?.registrationSettings)
    
    // Try both camelCase and PascalCase property names (BE might return either)
    const groupReg = parsed?.groupRegistration || parsed?.GroupRegistration
    
    // If no groupRegistration, return defaults based on activity type
    if (!groupReg) {
      // For CreativeContest, default to minMembers = 1, maxMembers = null (unlimited)
      if (activity?.subType === "CreativeContest") {
        return {
          minMembers: 1,
          maxMembers: null,
          requireLeader: true,
        }
      }
      // For other types, return null (no group registration)
      return null
    }
    
    // Try both camelCase and PascalCase for properties
    const minMembersValue = groupReg.minMembers ?? groupReg.MinMembers
    const maxMembersValue = groupReg.maxMembers ?? groupReg.MaxMembers
    const requireLeaderValue = groupReg.requireLeader ?? groupReg.RequireLeader ?? false
    
    // Return parsed values with defaults
    return {
      minMembers: minMembersValue && minMembersValue > 0 ? minMembersValue : 1,
      maxMembers: maxMembersValue && maxMembersValue > 0 ? maxMembersValue : null,
      requireLeader: requireLeaderValue,
    }
  }, [activity?.registrationSettings, activity?.subType])

  // Extract minMembers and maxMembers from groupSettings
  const minMembers = getGroupSettings?.minMembers ?? 1
  const maxMembers = getGroupSettings?.maxMembers ?? null
  const isSportsFestival = summary?.subType === "SportsFestival"
  const isCreativeContest = summary?.subType === "CreativeContest"

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
        toast.showError(`Môn ${sport?.sportName || "này"} chỉ được tối đa ${maxMembers} thành viên.`)
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

  // Helper function để lấy thông tin member từ nhiều nguồn
  // Ưu tiên: groupMembers (đã lưu) > currentUser > searchedUsers > classStudents
  const getMemberInfo = useCallback((memberId) => {
    // 1. Tìm trong groupMembers trước (đã lưu, ưu tiên cao nhất)
    let member = groupMembers.find((m) => m.id === memberId)
    if (member) return member

    // 2. Kiểm tra currentUser
    if (currentUser && currentUser.id === memberId) {
      return {
        id: currentUser.id,
        fullName: currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.name || "",
        studentCode: currentUser.studentCode || currentUser.studentNumber || "",
        email: currentUser.email || "",
        className: currentUser.className || "",
      }
    }
    
    // 3. Tìm trong searchedUsers (kết quả search mới nhất)
    member = searchedUsers.find((s) => s.id === memberId)
    if (member) return member

    // 4. Tìm trong classStudents
    member = classStudents.find((s) => s.id === memberId)
    return member
  }, [currentUser, classStudents, searchedUsers, groupMembers])

  // Group registration handlers for CreativeContest
  const handleToggleGroupMember = (studentId, memberData = null) => {
    // Validate studentId
    if (!studentId || (typeof studentId !== 'number' && typeof studentId !== 'string')) {
      toast.showError("Không thể xác định thành viên. Vui lòng thử lại.")
      return
    }

    // Convert to number if needed
    const normalizedId = typeof studentId === 'string' ? Number(studentId) : studentId
    if (isNaN(normalizedId)) {
      toast.showError("ID thành viên không hợp lệ. Vui lòng thử lại.")
      return
    }

    // Lấy thông tin member: ưu tiên memberData (từ onClick), sau đó mới tìm từ các nguồn
    let memberInfo = memberData
    if (!memberInfo) {
      memberInfo = getMemberInfo(normalizedId)
    }
    
    // Nếu vẫn không tìm thấy memberInfo, báo lỗi
    if (!memberInfo) {
      console.error("Cannot find member info for ID:", normalizedId)
      toast.showError("Không thể tìm thấy thông tin thành viên. Vui lòng thử lại.")
      return
    }

    // Đảm bảo memberInfo có đầy đủ thông tin
    const normalizedMemberInfo = {
      id: normalizedId,
      fullName: memberInfo.fullName || `Thành viên #${normalizedId}`,
      studentCode: memberInfo.studentCode || "",
      email: memberInfo.email || "",
      className: memberInfo.className || "",
    }
    
    let wasAlreadySelected = false
    setGroupForm((prev) => {
      wasAlreadySelected = prev.memberIds.includes(normalizedId)
      const alreadySelected = wasAlreadySelected
      
      // Không cho phép xóa người đăng ký (currentUser) khỏi nhóm
      if (alreadySelected && normalizedId === currentUser?.id) {
        toast.showError("Bạn không thể xóa chính mình khỏi nhóm. Bạn phải là thành viên của nhóm.")
        return prev
      }

      let updatedMembers = alreadySelected
        ? prev.memberIds.filter((id) => id !== normalizedId)
        : [...prev.memberIds, normalizedId]

      // Validate maxMembers constraint
      if (!alreadySelected && maxMembers !== null && maxMembers > 0 && updatedMembers.length > maxMembers) {
        toast.showError(`Nhóm chỉ được phép tối đa ${maxMembers} thành viên.`)
        return prev
      }

      // Đảm bảo currentUser luôn là thành viên
      if (!updatedMembers.includes(currentUser?.id) && currentUser?.id) {
        updatedMembers = [currentUser.id, ...updatedMembers.filter(id => id !== currentUser.id)]
      }

      // Nếu leader bị xóa hoặc không có leader, đặt currentUser làm leader mặc định
      const nextLeader = updatedMembers.includes(prev.leaderId) 
        ? prev.leaderId 
        : (currentUser?.id && updatedMembers.includes(currentUser.id) ? currentUser.id : updatedMembers[0] || null)

      return {
        ...prev,
        memberIds: updatedMembers,
        leaderId: nextLeader,
      }
    })

    // Cập nhật groupMembers: thêm hoặc xóa member info
    // Luôn cập nhật groupMembers để đảm bảo thông tin được lưu
    setGroupMembers((prev) => {
      if (wasAlreadySelected) {
        // Xóa member khỏi groupMembers (nhưng giữ lại nếu là currentUser)
        if (normalizedId === currentUser?.id) {
          return prev // Không xóa currentUser
        }
        return prev.filter((m) => m.id !== normalizedId)
      } else {
        // Thêm member vào groupMembers nếu chưa có
        if (!prev.find((m) => m.id === normalizedId)) {
          return [...prev, normalizedMemberInfo]
        } else {
          // Cập nhật thông tin member nếu đã có (để đảm bảo thông tin mới nhất)
          return prev.map((m) => 
            m.id === normalizedId ? normalizedMemberInfo : m
          )
        }
      }
    })
  }

  const handleGroupLeaderChange = (value) => {
    setGroupForm((prev) => ({
      ...prev,
      leaderId: Number(value),
    }))
  }

  // Drag and Drop handlers for group registration
  const handleGroupDragStart = (e, student) => {
    setDraggedStudent({ id: student.id, name: student.fullName })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", student.id.toString())
  }

  const handleGroupDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverGroup(true)
  }

  const handleGroupDragLeave = () => {
    setDragOverGroup(false)
  }

  const handleGroupDrop = (e) => {
    e.preventDefault()
    setDragOverGroup(false)

    if (!draggedStudent) return

    const studentId = draggedStudent.id
    if (!groupForm.memberIds.includes(studentId)) {
      // Lấy thông tin member từ draggedStudent hoặc từ các nguồn
      const memberInfo = getMemberInfo(studentId)
      if (memberInfo && !groupMembers.find((m) => m.id === studentId)) {
        setGroupMembers((prev) => [...prev, memberInfo])
      }
      handleToggleGroupMember(studentId)
    }
    setDraggedStudent(null)
  }

  const handleGroupDragEnd = () => {
    setDraggedStudent(null)
    setDragOverGroup(false)
  }

  // Validation function để kiểm tra tất cả điều kiện trước khi submit
  // Trả về object { isValid: boolean, errors: object } thay vì toast
  const validateForm = useCallback(() => {
    const newErrors = {
      general: "",
      sports: {},
      groupMembers: "",
      groupLeader: "",
      groupName: "",
      classId: "",
    }

    // Kiểm tra activity có tồn tại không
    if (!activity) {
      newErrors.general = "Không tìm thấy thông tin hoạt động."
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Lấy summary và groupSettings
    const activitySubType = activity?.subType || summary?.subType
    const isSportsFestivalCheck = activitySubType === "SportsFestival"
    const isCreativeContestCheck = activitySubType === "CreativeContest"
    const groupSettings = getGroupSettings
    const minMembersCheck = groupSettings?.minMembers ?? 1
    const maxMembersCheck = groupSettings?.maxMembers ?? null

    // Kiểm tra activity ID
    if (!params.id) {
      newErrors.general = "Không tìm thấy thông tin hoạt động."
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Kiểm tra user đã đăng nhập
    if (!currentUser?.id) {
      newErrors.general = "Vui lòng đăng nhập để tiếp tục."
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Kiểm tra quyền đăng ký
    if (!canRegister) {
      newErrors.general = currentUser?.role?.toLowerCase() === "teacher" || currentUser?.role?.toLowerCase() === "admin"
        ? "Giáo viên chỉ được đăng ký tham gia hội thao."
        : "Học sinh không thể đăng ký tham gia hội thao."
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Kiểm tra user đã đăng ký chưa
    if (activity?.participants && currentUser?.id) {
      const isAlreadyRegistered = activity.participants.some(
        (p) => p.userId === currentUser.id && !p.isDeleted
      )
      if (isAlreadyRegistered) {
        newErrors.general = "Bạn đã đăng ký tham gia hoạt động này rồi."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }
    }

    // Kiểm tra thời gian đăng ký
    const now = new Date()
    const registerDate = activity.registerDate ? new Date(activity.registerDate) : null
    const endRegisterDate = activity.endRegisterDate ? new Date(activity.endRegisterDate) : null

    if (registerDate && now < registerDate) {
      newErrors.general = `Đăng ký chưa mở. Thời gian đăng ký bắt đầu từ ${new Date(activity.registerDate).toLocaleDateString("vi-VN")}.`
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    if (endRegisterDate && now > endRegisterDate) {
      newErrors.general = `Đăng ký đã đóng. Thời gian đăng ký kết thúc vào ${new Date(activity.endRegisterDate).toLocaleDateString("vi-VN")}.`
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Kiểm tra số lượng người tham gia đã đầy chưa
    // maxParticipants = null hoặc undefined → không giới hạn (vô hạn người)
    const currentParticipants = activity.numberOfParticipants || 0
    const maxParticipants = activity.maxParticipants
    if (maxParticipants !== null && maxParticipants !== undefined && maxParticipants > 0 && currentParticipants >= maxParticipants) {
      newErrors.general = "Hoạt động này đã đủ số lượng người tham gia."
      setErrors(newErrors)
      return { isValid: false, errors: newErrors }
    }

    // Validation cho SportsFestival
    if (isSportsFestivalCheck) {
      // Kiểm tra có môn nào được chọn không
      const hasAnySelection = Object.values(selectedSports).some((ids) => ids && ids.length > 0)
      if (!hasAnySelection) {
        newErrors.general = "Vui lòng thêm ít nhất một học sinh vào các môn thi đấu."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
    }

      // Đếm tổng số học sinh sẽ được thêm vào (loại bỏ trùng lặp)
      const uniqueStudentIds = new Set()
      let totalNewStudents = 0

      // Kiểm tra từng môn có đủ học sinh và không vượt quá maxMembers
      for (const [sportId, studentIds] of Object.entries(selectedSports)) {
        if (!studentIds || studentIds.length === 0) continue

        const sport = (summary?.sports || activity?.sports || []).find((s) => s.id === Number(sportId))
        if (!sport) {
          newErrors.sports[sportId] = "Không tìm thấy thông tin môn thi đấu."
          continue
        }

        // Kiểm tra maxMembers
        if (sport.maxMembers && sport.maxMembers > 0 && studentIds.length > sport.maxMembers) {
          newErrors.sports[sportId] = `Môn này chỉ được tối đa ${sport.maxMembers} thành viên.`
          continue
        }

        // Kiểm tra có ít nhất 1 học sinh
        if (studentIds.length < 1) {
          newErrors.sports[sportId] = "Cần ít nhất 1 học sinh."
          continue
        }

        // Đếm số học sinh mới (chưa có trong uniqueStudentIds)
        // Đồng thời kiểm tra xem học sinh đã đăng ký chưa
        studentIds.forEach(id => {
          if (!uniqueStudentIds.has(id)) {
            // Kiểm tra học sinh đã đăng ký chưa
            if (activity?.participants) {
              const isAlreadyRegistered = activity.participants.some(
                (p) => p.userId === id && !p.isDeleted
              )
              if (isAlreadyRegistered) {
                // Tìm tên học sinh để hiển thị error
                const student = classStudents.find(s => s.id === id) || 
                               groupMembers.find(m => m.id === id) ||
                               searchedUsers.find(s => s.id === id)
                const studentName = student?.fullName || "Học sinh"
                newErrors.sports[sportId] = `${studentName} đã đăng ký tham gia hoạt động này.`
        return
      }
            }
            uniqueStudentIds.add(id)
            totalNewStudents++
          }
        })
      }

      // Kiểm tra nếu có lỗi ở các môn
      if (Object.keys(newErrors.sports).length > 0) {
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra tổng số người tham gia sau khi đăng ký không vượt quá maxParticipants
      // maxParticipants = null hoặc undefined → không giới hạn (vô hạn người)
      const maxParticipantsCheck = activity.maxParticipants
      if (maxParticipantsCheck !== null && maxParticipantsCheck !== undefined && maxParticipantsCheck > 0 && (currentParticipants + totalNewStudents) > maxParticipantsCheck) {
        const remainingSlots = maxParticipantsCheck - currentParticipants
        newErrors.general = `Số lượng người tham gia vượt quá giới hạn. Chỉ còn ${remainingSlots} chỗ trống.`
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra classId
      const classId = currentClass?.id || currentClass?.classGroupId
      if (!classId) {
        newErrors.classId = "Không tìm thấy thông tin lớp để đăng ký. Vui lòng đảm bảo bạn đã được phân vào một lớp."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }
    }

    // Validation cho CreativeContest
    if (isCreativeContestCheck) {
      // Kiểm tra số lượng thành viên tối thiểu
      if (!groupForm.memberIds || groupForm.memberIds.length < minMembersCheck) {
        newErrors.groupMembers = `Nhóm cần ít nhất ${minMembersCheck} thành viên.`
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra số lượng thành viên tối đa
      if (maxMembersCheck !== null && maxMembersCheck > 0 && groupForm.memberIds.length > maxMembersCheck) {
        newErrors.groupMembers = `Nhóm chỉ được phép tối đa ${maxMembersCheck} thành viên.`
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra có nhóm trưởng không
      if (!groupForm.leaderId) {
        newErrors.groupLeader = "Vui lòng chọn nhóm trưởng."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra nhóm trưởng có trong danh sách thành viên không
      if (!groupForm.memberIds.includes(groupForm.leaderId)) {
        newErrors.groupLeader = "Nhóm trưởng phải là một trong các thành viên của nhóm."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra currentUser có trong nhóm không
      if (!groupForm.memberIds.includes(currentUser.id)) {
        newErrors.groupMembers = "Bạn phải là thành viên của nhóm."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra tất cả memberIds đều hợp lệ
      if (groupForm.memberIds.some(id => !id || (typeof id !== 'number' && typeof id !== 'string'))) {
        newErrors.groupMembers = "Danh sách thành viên có dữ liệu không hợp lệ. Vui lòng thử lại."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra không có memberId trùng lặp
      const uniqueMemberIds = new Set(groupForm.memberIds)
      if (uniqueMemberIds.size !== groupForm.memberIds.length) {
        newErrors.groupMembers = "Danh sách thành viên có thành viên bị trùng lặp. Vui lòng kiểm tra lại."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra các thành viên đã đăng ký chưa
      if (activity?.participants) {
        const alreadyRegisteredMembers = []
        groupForm.memberIds.forEach(memberId => {
          const isAlreadyRegistered = activity.participants.some(
            (p) => p.userId === memberId && !p.isDeleted
          )
          if (isAlreadyRegistered) {
            // Tìm tên thành viên để hiển thị error
            const member = groupMembers.find(m => m.id === memberId) ||
                          classStudents.find(s => s.id === memberId) ||
                          searchedUsers.find(s => s.id === memberId) ||
                          (memberId === currentUser?.id ? currentUser : null)
            const memberName = member?.fullName || "Thành viên"
            alreadyRegisteredMembers.push(memberName)
          }
        })
        
        if (alreadyRegisteredMembers.length > 0) {
          newErrors.groupMembers = `Các thành viên sau đã đăng ký tham gia hoạt động này: ${alreadyRegisteredMembers.join(", ")}`
          setErrors(newErrors)
          return { isValid: false, errors: newErrors }
    }
      }

      // Kiểm tra số lượng người tham gia sau khi đăng ký không vượt quá maxParticipants
      // Với CreativeContest, mỗi nhóm tính là 1 đăng ký, nhưng số người tham gia = số thành viên trong nhóm
      // maxParticipants = null hoặc undefined → không giới hạn (vô hạn người)
      const maxParticipantsCheck = activity.maxParticipants
      if (maxParticipantsCheck !== null && maxParticipantsCheck !== undefined && maxParticipantsCheck > 0 && (currentParticipants + groupForm.memberIds.length) > maxParticipantsCheck) {
        const remainingSlots = maxParticipantsCheck - currentParticipants
        newErrors.general = `Số lượng người tham gia vượt quá giới hạn. Chỉ còn ${remainingSlots} chỗ trống.`
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Note: Không bắt buộc classId cho CreativeContest vì members có thể từ các lớp khác nhau
      // Backend sẽ tự động xử lý classGroupId (có thể null hoặc lấy từ leader)

      // Bắt buộc đặt tên nhóm cho CreativeContest
      if (!groupForm.groupName || !groupForm.groupName.trim()) {
        newErrors.groupName = "Vui lòng đặt tên nhóm."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra độ dài tên nhóm
      if (groupForm.groupName.trim().length > 100) {
        newErrors.groupName = "Tên nhóm không được vượt quá 100 ký tự."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }

      // Kiểm tra tên nhóm không chứa ký tự đặc biệt nguy hiểm
      if (/[<>\"'&]/.test(groupForm.groupName)) {
        newErrors.groupName = "Tên nhóm không được chứa ký tự đặc biệt."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }
    }

    // Validation cho Simple Registration
    if (!isSportsFestivalCheck && !isCreativeContestCheck) {
      // Kiểm tra số lượng người tham gia sau khi đăng ký không vượt quá maxParticipants
      // maxParticipants = null hoặc undefined → không giới hạn (vô hạn người)
      const maxParticipantsCheck = activity.maxParticipants
      if (maxParticipantsCheck !== null && maxParticipantsCheck !== undefined && maxParticipantsCheck > 0 && (currentParticipants + 1) > maxParticipantsCheck) {
        newErrors.general = "Hoạt động này đã đủ số lượng người tham gia."
        setErrors(newErrors)
        return { isValid: false, errors: newErrors }
      }
    }

    // Clear errors nếu validation thành công
    setErrors({
      general: "",
      sports: {},
      groupMembers: "",
      groupLeader: "",
      groupName: "",
      classId: "",
    })
    return { isValid: true, errors: {} }
  }, [activity, params.id, currentUser, canRegister, summary, selectedSports, currentClass, groupForm, getGroupSettings, classStudents, groupMembers, searchedUsers])

  const handleOpenConfirm = () => {
    // Validate frontend trước
    const validation = validateForm()
    if (!validation || !validation.isValid) {
      // Errors đã được set trong validateForm, không cần làm gì thêm
      return
    }
    // Chỉ mở modal khi validate thành công
    setShowConfirmModal(true)
  }

  const handleCancelRegistration = async () => {
    if (!activity?.id) {
      toast.showError("Không tìm thấy thông tin hoạt động")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.showError("Vui lòng đăng nhập để tiếp tục.")
      return
    }

    setIsCancelling(true)
    try {
      await executeApiCall(
        activityParticipantService.cancelRegistration.bind(activityParticipantService),
        [activity.id, token],
        { setError: () => {} }
      )

      setIsRegistered(false)
      toast.showSuccess("Đã hủy đăng ký tham gia hoạt động.")
      
      const response = await executeApiCall(
        activityService.getRegisterInfo.bind(activityService),
        [activity.id, token],
        { setLoading: () => {} }
      )
      const data = response?.data?.data || response?.data
      setActivity(data)
      
      if (data?.participants && currentUser?.id) {
        const userParticipation = data.participants.find(
          (p) => p.userId === currentUser.id && !p.isDeleted
        )
        setIsRegistered(Boolean(userParticipation))
      }
    } catch (err) {
      console.error("Error cancelling registration:", err)
      toast.showError(err?.message || "Có lỗi xảy ra khi hủy đăng ký")
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancelRegistration = useMemo(() => {
    if (!activity?.endRegisterDate || !isRegistered) return false
    const now = new Date()
    const endRegisterDate = new Date(activity.endRegisterDate)
    return now <= endRegisterDate
  }, [activity?.endRegisterDate, isRegistered])

  const handleConfirmSubmit = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
    setShowConfirmModal(false)
      return
    }
   const currentParticipants = activity.numberOfParticipants || 0
    setShowConfirmModal(false)

    const token = localStorage.getItem("token")
    if (!token) {
      toast.showError("Vui lòng đăng nhập để tiếp tục.")
      return
    }

    setSubmitting(true)
    try {
      if (isSportsFestival) {
        const classId = currentClass?.id || currentClass?.classGroupId
        if (!classId) {
          toast.showError("Không tìm thấy thông tin lớp để đăng ký.")
          setSubmitting(false)
          return
        }

        const registrations = Object.entries(selectedSports)
          .filter(([_, studentIds]) => studentIds && studentIds.length > 0)
          .map(([sportId, studentIds]) => {
            const sport = summary?.sports?.find((s) => s.id === Number(sportId))
            // Validate lại maxMembers trước khi gửi
            if (sport?.maxMembers && studentIds.length > sport.maxMembers) {
              throw new Error(`Môn ${sport.sportName || sport.name} chỉ được tối đa ${sport.maxMembers} thành viên.`)
            }
            return {
            activityId: Number(params.id),
            sportId: Number(sportId),
            classGroupId: classId,
              memberIds: studentIds.filter(id => id != null), // Loại bỏ null/undefined
            }
          })

        if (registrations.length === 0) {
          toast.showError("Vui lòng thêm ít nhất một học sinh vào các môn thi đấu.")
          setSubmitting(false)
          return
        }

        // Gọi API đăng ký cho từng môn
        let successCount = 0
        let failedRegistrations = []

        for (const reg of registrations) {
          try {
          await activityParticipantService.registerSport(reg, token)
            successCount++
          } catch (err) {
            const sport = summary?.sports?.find((s) => s.id === reg.sportId)
            failedRegistrations.push(sport?.sportName || sport?.name || `Môn ID ${reg.sportId}`)
            console.error(`Failed to register for sport ${reg.sportId}:`, err)
          }
        }

        if (failedRegistrations.length > 0) {
          if (successCount > 0) {
            toast.showWarning(`Đăng ký thành công ${successCount} môn. Một số môn đăng ký thất bại: ${failedRegistrations.join(", ")}`)
          } else {
            throw new Error(`Đăng ký thất bại cho tất cả các môn: ${failedRegistrations.join(", ")}`)
          }
        } else {
        toast.showSuccess("Đăng ký hội thao thành công! Bạn có thể theo dõi trạng thái tại trang chi tiết.")
        setIsRegistered(true)
        }
      } else if (isCreativeContest) {
        if (!currentUser?.id) {
          toast.showError("Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.")
          setSubmitting(false)
          return
        }

        // Validate lại dữ liệu trước khi gửi
        if (groupForm.memberIds.length < minMembers) {
          toast.showError(`Nhóm cần ít nhất ${minMembers} thành viên.`)
          setSubmitting(false)
          return
        }

        if (maxMembers !== null && maxMembers > 0 && groupForm.memberIds.length > maxMembers) {
          toast.showError(`Nhóm chỉ được phép tối đa ${maxMembers} thành viên.`)
          setSubmitting(false)
          return
        }

        if (!groupForm.leaderId) {
          toast.showError("Vui lòng chọn nhóm trưởng.")
          setSubmitting(false)
          return
        }

        if (!groupForm.memberIds.includes(groupForm.leaderId)) {
          toast.showError("Nhóm trưởng phải là một trong các thành viên của nhóm.")
          setSubmitting(false)
          return
        }

        // Chuẩn bị dữ liệu đăng ký nhóm
        // Note: classGroupId là optional - backend sẽ tự động lấy class của leader nếu không có
        // Members có thể từ các lớp khác nhau (school-wide registration)
        const groupRegistrationData = {
            activityId: Number(params.id),
          leaderId: Number(groupForm.leaderId),
          memberIds: groupForm.memberIds
            .map(id => {
              const numId = typeof id === 'string' ? Number(id) : id
              return isNaN(numId) ? null : numId
            })
            .filter(id => id != null), // Loại bỏ null/NaN
          // classGroupId là optional - không bắt buộc cho CreativeContest
          // Backend sẽ tự động xử lý (có thể null hoặc lấy từ leader nếu cần)
          // Không gửi classGroupId nếu không có, để backend tự xử lý
          ...(currentClass?.id || currentClass?.classGroupId ? { classGroupId: (currentClass?.id || currentClass?.classGroupId) } : {}),
            requestedByUserId: currentUser.id,
        }

        // Thêm groupName nếu có
        if (groupForm.groupName && groupForm.groupName.trim().length > 0) {
          groupRegistrationData.groupName = groupForm.groupName.trim()
        }

        // Validate lại memberIds trước khi gửi
        if (groupRegistrationData.memberIds.length < minMembers) {
          toast.showError(`Nhóm cần ít nhất ${minMembers} thành viên.`)
          setSubmitting(false)
          return
        }

        if (maxMembers !== null && maxMembers > 0 && groupRegistrationData.memberIds.length > maxMembers) {
          toast.showError(`Nhóm chỉ được phép tối đa ${maxMembers} thành viên.`)
          setSubmitting(false)
          return
        }

        // Gọi API đăng ký nhóm
        await activityParticipantService.registerGroup(groupRegistrationData, token)
        toast.showSuccess("Đăng ký nhóm thành công! Bạn có thể theo dõi trạng thái tại trang chi tiết.")
        setIsRegistered(true)
      } else {
        // Simple registration
        if (!currentUser?.id) {
          toast.showError("Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.")
          setSubmitting(false)
          return
        }

        // Kiểm tra số lượng người tham gia sau khi đăng ký không vượt quá maxParticipants
        // maxParticipants = null hoặc undefined → không giới hạn (vô hạn người)
        const maxParticipants = activity?.maxParticipants
        if (maxParticipants !== null && maxParticipants !== undefined && maxParticipants > 0 && (currentParticipants + 1) > maxParticipants) {
          toast.showError("Hoạt động này đã đủ số lượng người tham gia.")
          setSubmitting(false)
          return
        }

        // Gọi API đăng ký đơn
        await activityParticipantService.registerForActivity(
          {
            activityId: Number(params.id),
            userId: currentUser.id,
          },
          token
        )
        toast.showSuccess("Đăng ký thành công! Bạn có thể theo dõi trạng thái tại trang chi tiết.")
        setIsRegistered(true)
      }

      // Navigate đến trang chi tiết sau khi đăng ký thành công
      navigate(ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", params.id))
    } catch (err) {
      console.error("Register failed:", err)
      // Hiển thị lỗi chi tiết hơn
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể đăng ký hoạt động. Vui lòng thử lại."
      toast.showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center py-20">
        <LoadingCard isLoading={true} text="Đang chuẩn bị biểu mẫu..." />
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
    <div className="space-y-12 py-6">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-8">
        <div className="space-y-5 flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Đăng ký tham gia</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Biểu mẫu đăng ký hoạt động</h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            {isSportsFestival
              ? "Kéo thả học sinh từ danh sách lớp vào các môn thi đấu để đăng ký. Một học sinh có thể tham gia nhiều môn."
              : isCreativeContest
              ? "Kéo thả hoặc click để thêm thành viên vào nhóm. Có thể tìm kiếm trong lớp hoặc toàn hệ thống. Nhóm trưởng sẽ đại diện nhận thông báo."
              : "Xác nhận thông tin và hoàn tất đăng ký để tham gia hoạt động này."}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex-shrink-0 mt-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">{errors.general}</p>
        </div>
      )}

      {isCreativeContest ? (
        <div className="grid gap-12 lg:grid-cols-[1.65fr_1fr]">
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

          {/* Left: Group Registration Form */}
          <div className="space-y-8">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-2xl">Tạo nhóm tham gia</CardTitle>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Kéo thả hoặc click để thêm thành viên vào nhóm. Có thể tìm kiếm trong lớp hoặc toàn hệ thống.
                </p>
                {isCreativeContest && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Yêu cầu:</strong> Nhóm tối thiểu {minMembers} thành viên
                      {maxMembers && maxMembers > 0 ? `, tối đa ${maxMembers} thành viên` : ""}.
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Tên nhóm <span className="text-red-500">*</span></Label>
                  <Input
                    id="groupName"
                    placeholder="Nhập tên nhóm (bắt buộc)"
                    value={groupForm.groupName}
                    onChange={(e) => {
                      setGroupForm((prev) => ({
                        ...prev,
                        groupName: e.target.value,
                      }))
                      // Clear error khi user nhập
                      if (errors.groupName) {
                        setErrors(prev => ({ ...prev, groupName: "" }))
                    }
                    }}
                    disabled={submitting}
                    className={errors.groupName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.groupName && (
                    <p className="text-sm text-red-600 mt-1">{errors.groupName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Thành viên nhóm ({groupForm.memberIds.length}
                    {maxMembers && maxMembers > 0 ? `/${maxMembers}` : ""})
                  </Label>
                  <div
                    className={`border-2 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto transition-colors ${
                      errors.groupMembers
                        ? "border-red-500 bg-red-50"
                        : dragOverGroup
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200"
                    }`}
                    onDragOver={canRegister ? handleGroupDragOver : undefined}
                    onDragLeave={canRegister ? handleGroupDragLeave : undefined}
                    onDrop={canRegister ? handleGroupDrop : undefined}
                  >
                    {groupForm.memberIds.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-gray-400">
                        <Users className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">Kéo thả học sinh vào đây để thêm vào nhóm</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {groupForm.memberIds.map((memberId) => {
                          // Tìm member từ groupMembers trước (đã lưu), sau đó mới tìm từ các nguồn khác
                          let member = groupMembers.find((m) => m.id === memberId)
                          if (!member) {
                            // Nếu không tìm thấy trong groupMembers, tìm từ các nguồn khác
                            member = getMemberInfo(memberId)
                          }
                          const isLeader = groupForm.leaderId === memberId
                          return (
                            <div
                              key={memberId}
                              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-900 truncate">
                                    {member?.fullName || "Thành viên"}
                                  </span>
                                  {isLeader && (
                                    <Badge variant="secondary" className="text-xs">
                                      Trưởng nhóm
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {member?.studentCode && (
                                    <span className="text-xs text-gray-500">Mã: {member.studentCode}</span>
                                  )}
                                  {member?.className && (
                                    <span className="text-xs text-gray-500">• Lớp: {member.className}</span>
                                  )}
                                  {member?.email && (
                                    <span className="text-xs text-gray-500">• {member.email}</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => handleToggleGroupMember(memberId)}
                                disabled={submitting || memberId === currentUser?.id}
                                title={memberId === currentUser?.id ? "Bạn không thể xóa chính mình khỏi nhóm" : "Xóa khỏi nhóm"}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {errors.groupMembers && (
                    <p className="text-sm text-red-600 mt-1 font-medium">{errors.groupMembers}</p>
                  )}
                </div>

                {groupForm.memberIds.length > 0 && (
                  <div className="space-y-2">
                    <Label>Nhóm trưởng</Label>
                    <LeaderSelect
                      value={groupForm.leaderId ? String(groupForm.leaderId) : ""}
                      onChange={handleGroupLeaderChange}
                      memberIds={groupForm.memberIds}
                      classStudents={classStudents}
                      searchedUsers={searchedUsers}
                      groupMembers={groupMembers}
                      currentUser={currentUser}
                      disabled={submitting}
                    />
                    {errors.groupLeader && (
                      <p className="text-sm text-red-600 mt-1 font-medium">{errors.groupLeader}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-orange-100 shadow-sm">
              <CardContent className="p-6">
                {isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã đăng ký tham gia</span>
                    </div>
                    {canCancelRegistration && (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        disabled={isCancelling}
                        onClick={handleCancelRegistration}
                      >
                        {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
                      </Button>
                    )}
                    {!canCancelRegistration && (
                      <p className="text-sm text-gray-500 text-center">
                        Đã hết thời hạn hủy đăng ký
                      </p>
                    )}
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Class Students List / Search */}
          <div className="space-y-6">
            <Card className="border-orange-100 shadow-sm sticky top-4">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-xl">Tìm kiếm thành viên</CardTitle>
                </div>
                {currentClass && (
                  <p className="text-sm text-gray-600 mt-2">
                    {currentClass.className || currentClass.name || "Lớp của bạn"}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search - Đơn giản hóa */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="group-search"
                        type="email"
                        placeholder="Nhập email để tìm kiếm"
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                        disabled={submitting || isSearchingUsers}
                      />
                      {groupSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setGroupSearchQuery("")
                            setSearchedUsers([])
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Xóa"
                          disabled={submitting || isSearchingUsers}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleSearchUsers}
                      disabled={submitting || isSearchingUsers || !groupSearchQuery?.trim() || !isValidEmail(groupSearchQuery.trim())}
                      className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isSearchingUsers ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {groupSearchQuery && !isValidEmail(groupSearchQuery.trim()) && (
                    <p className="text-xs text-red-600">
                      Vui lòng nhập đúng định dạng email
                    </p>
                  )}
                </div>

                {/* Students List - Chỉ hiển thị khi có kết quả hoặc đang tìm kiếm */}
                {(searchedUsers.length > 0 || isSearchingUsers) && (
                  <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto bg-white shadow-sm">
                    {isSearchingUsers ? (
                      // Đang tìm kiếm
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-3">Đang tìm kiếm...</p>
                      </div>
                    ) : searchedUsers.length > 0 ? (
                      // Hiển thị kết quả tìm kiếm
                      <div className="space-y-2">
                        {searchedUsers.map((user) => {
                          const isAlreadyAdded = user?.id && groupForm.memberIds.includes(user.id)
                          return (
                            <div
                              key={user.id}
                              className={`flex items-center gap-3 p-3 transition-colors rounded-lg border ${
                                isAlreadyAdded
                                  ? "bg-gray-50 border-gray-200 opacity-60"
                                  : canRegister && !submitting
                                  ? "hover:bg-orange-50 hover:border-orange-200 bg-white border-gray-200"
                                  : "opacity-60 cursor-not-allowed bg-gray-50"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium truncate ${
                                    isAlreadyAdded ? "text-gray-400" : "text-gray-900"
                                  }`}>
                                    {user.fullName}
                                  </p>
                                  {user.className && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {user.className}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {user.studentCode && (
                                    <span className="text-xs text-gray-500">Mã: {user.studentCode}</span>
                                  )}
                                  {user.email && (
                                    <span className="text-xs text-gray-500">• {user.email}</span>
                                  )}
                                </div>
                              </div>
                              {!isAlreadyAdded && canRegister && !submitting ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleGroupMember(user.id, user)
                                  }}
                                  className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs flex-shrink-0"
                                >
                                  <span className="mr-1">+</span> Thêm
                                </Button>
                              ) : isAlreadyAdded ? (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                  Đã thêm
                                </Badge>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      // Không tìm thấy kết quả
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">Không tìm thấy thành viên</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : isSportsFestival ? (
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
                            : errors.sports[sport.id]
                            ? "border-red-400 bg-red-50"
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
                                  errors.sports[sport.id]
                                    ? "border-red-400 bg-red-50"
                                    : isDragOver
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
                              <div className={`flex flex-wrap gap-2 p-3 rounded-lg border min-h-[60px] ${
                                errors.sports[sport.id]
                                  ? "bg-red-50 border-red-200"
                                  : "bg-orange-50 border-orange-100"
                              }`}>
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
                            {errors.sports[sport.id] && (
                              <p className="text-sm text-red-600 mt-1 font-medium">{errors.sports[sport.id]}</p>
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
                {isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã đăng ký tham gia</span>
                    </div>
                    {canCancelRegistration && (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        disabled={isCancelling}
                        onClick={handleCancelRegistration}
                      >
                        {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
                      </Button>
                    )}
                    {!canCancelRegistration && (
                      <p className="text-sm text-gray-500 text-center">
                        Đã hết thời hạn hủy đăng ký
                      </p>
                    )}
                  </div>
                ) : (
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
                )}
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
                {errors.classId && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">{errors.classId}</p>
                  </div>
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
                {isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã đăng ký tham gia</span>
                    </div>
                    {canCancelRegistration && (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        disabled={isCancelling}
                        onClick={handleCancelRegistration}
                      >
                        {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
                      </Button>
                    )}
                    {!canCancelRegistration && (
                      <p className="text-sm text-gray-500 text-center">
                        Đã hết thời hạn hủy đăng ký
                      </p>
                    )}
                  </div>
                ) : (
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
                )}
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

// LeaderSelect component - Custom dropdown for selecting group leader
function LeaderSelect({ value, onChange, memberIds, classStudents, searchedUsers, groupMembers, currentUser, disabled }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get member info - ưu tiên groupMembers (đã lưu) > currentUser > searchedUsers > classStudents
  const getMemberInfo = (memberId) => {
    // 1. Tìm trong groupMembers trước (đã lưu, ưu tiên cao nhất)
    let member = groupMembers?.find((m) => m.id === memberId)
    if (member) return member

    // 2. Kiểm tra currentUser
    if (currentUser && currentUser.id === memberId) {
      return {
        id: currentUser.id,
        fullName: currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.name || "",
        studentCode: currentUser.studentCode || currentUser.studentNumber || "",
        email: currentUser.email || "",
        className: currentUser.className || "",
      }
    }
    
    // 3. Tìm trong searchedUsers
    member = searchedUsers?.find((s) => s.id === memberId)
    if (member) return member

    // 4. Tìm trong classStudents
    member = classStudents?.find((s) => s.id === memberId)
    return member
  }

  const selectedMember = getMemberInfo(Number(value))
  const selectedLabel = selectedMember?.fullName || "Chọn nhóm trưởng"

  return (
    <div ref={containerRef} className="relative z-10">
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${
          open ? "border-orange-400 ring-2 ring-orange-500" : "border-gray-200 hover:border-orange-300"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-orange-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-orange-100 bg-white shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
          {memberIds.map((memberId) => {
            const member = getMemberInfo(memberId)
            const isSelected = value === String(memberId)
            return (
              <button
                type="button"
                key={memberId}
                onClick={() => {
                  onChange(String(memberId))
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? "bg-orange-50 font-semibold text-orange-600"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member?.fullName || "Thành viên"}</span>
                  {member?.studentCode && (
                    <span className="text-xs text-gray-500">({member.studentCode})</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
