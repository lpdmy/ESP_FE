import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import { Tooltip } from "@/common/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog"
import { SimpleSelect } from "@/common/components/ui/select"
import { Label } from "@/common/components/ui/label"
import { Checkbox } from "@/common/components/ui/checkbox"
import { toast } from "react-toastify"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Calendar,
  Users,
  Lock,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Download,
  Trophy,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { ROUTES } from "@/common/constants/routes"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { LoadingCard } from "@/common/components/ui/loading"

const parseRegistrationSettings = (settings) => {
  if (!settings) return null
  if (typeof settings === "string") {
    try {
      return JSON.parse(settings)
    } catch (error) {
      console.warn("Không thể parse registration settings:", error)
      return null
    }
  }
  return settings
}

export default function ActivityManagement() {
  // Data state
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState(null)
  

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedActivities, setSelectedActivities] = useState([])
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSchedule, setAiSchedule] = useState([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Advanced filters
  const [subTypeFilter, setSubTypeFilter] = useState("")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [minParticipantsFilter, setMinParticipantsFilter] = useState("")
  const [maxParticipantsFilter, setMaxParticipantsFilter] = useState("")
  const [organizerFilter, setOrganizerFilter] = useState("")

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("")

  // AI Form State
  const [aiForm, setAiForm] = useState({
    activityType: "",
    participants: [],
    dateRange: { start: "", end: "" },
    constraints: {
      avoidClassTime: true,
      avoidLunch: true,
      maxSessionsPerDay: 3,
    },
  })
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false)
  const selectedGroupRegistrations = useMemo(
    () => (selectedActivity ? getGroupRegistrations(selectedActivity) : []),
    [selectedActivity]
  )
  const selectedSportRosters = useMemo(
    () => (selectedActivity ? getSportRosters(selectedActivity) : []),
    [selectedActivity]
  )
  const selectedParticipants = selectedActivity?.participantDetails || []

  // Stats data (from API)
  const [stats, setStats] = useState([
    {
      title: "Đang diễn ra",
      value: "0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "Tính từ dữ liệu",
    },
    {
      title: "Sắp tới",
      value: "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "Tính từ dữ liệu",
    },
    {
      title: "Đã hoàn thành",
      value: "0",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "Tính từ dữ liệu",
    },
    {
      title: "Tổng người tham gia",
      value: "0",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Tính từ dữ liệu",
    },
  ])
  const [statsLoading, setStatsLoading] = useState(true)

  // Calculate activity status based on dates
  const getActivityStatus = (activity) => {
    const now = new Date()
    const startDate = activity.startDate ? new Date(activity.startDate) : null
    const endDate = activity.endDate ? new Date(activity.endDate) : null

    // If missing dates, consider as Upcoming (not Pending)
    if (!startDate || !endDate) return "Upcoming"

    // Check current status based on dates
    if (now >= startDate && now <= endDate) {
      return "Active" // Đang diễn ra
    }

    if (now > endDate) {
      return "Ended" // Đã kết thúc
    }

    // If now < startDate, it's upcoming
    return "Upcoming" // Sắp tới
  }

  const isActivityLocked = (activity) =>
    activity.status === "Active" || activity.status === "Ended"

  // Fetch activities from BE
  const fetchActivities = useCallback(async () => {
    // Đảm bảo set loading ngay lập tức, không phụ thuộc vào executeApiCall
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const search = searchDebounce.trim() || null

      // Không truyền setLoading vào executeApiCall để tránh conflict
      // Chúng ta tự quản lý loading state
      const response = await executeApiCall(
        activityService.getAllActivities.bind(activityService),
        [pageNumber, pageSize, search, token],
        { setLoading: () => {}, setError }
      )

      if (response?.data) {
        const paginationData = response.data
        const activitiesData = paginationData.data || []

        // Map BE data to FE format - optimize performance
        // Tính toán status inline thay vì gọi function để tăng tốc
        const now = new Date()
        const mappedActivities = activitiesData.map(activity => {
          // Tính status một lần thay vì gọi function
          let status = "Upcoming"
          if (activity.startDate && activity.endDate) {
            const startDate = new Date(activity.startDate)
            const endDate = new Date(activity.endDate)
            if (now >= startDate && now <= endDate) {
              status = "Active"
            } else if (now > endDate) {
              status = "Ended"
            }
          }
          
          // Parse dates một lần và tái sử dụng
          const startDate = activity.startDate ? new Date(activity.startDate) : null
          const endDate = activity.endDate ? new Date(activity.endDate) : null
          const registerDate = activity.registerDate ? new Date(activity.registerDate) : null
          const endRegisterDate = activity.endRegisterDate ? new Date(activity.endRegisterDate) : null
          
          return {
            id: activity.id,
            thumbnail: activity.thumbnailUrl || "",
            title: activity.title || "",
            category: activity.category === 1 ? "Activity" : "Event",
            subType: activity.subType || "",
            startDate: startDate ? startDate.toISOString().split("T")[0] : "",
            endDate: endDate ? endDate.toISOString().split("T")[0] : "",
            registerDate: registerDate ? registerDate.toISOString().split("T")[0] : "",
            endRegisterDate: endRegisterDate ? endRegisterDate.toISOString().split("T")[0] : "",
            status: status,
            participants: activity.numberOfParticipants || 0,
            maxParticipants: activity.maxParticipants ?? null,
            location: activity.location || "",
            organizer: activity.organizer || "",
            description: activity.description || "",
            onlyTeacherCanRegister: activity.onlyTeacherCanRegister || false,
            gradingSettings: activity.gradingSettings || null,
            registrationSettings: parseRegistrationSettings(activity.registrationSettings),
            sports: activity.sports || [],
            participantDetails: activity.participants || [],
            isDeleted: activity.isDeleted || false,
          }
        })

        setActivities(mappedActivities)
        setTotalCount(paginationData.totalCount || 0)
        setTotalPages(Math.ceil((paginationData.totalCount || 0) / pageSize))
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
      toast.error(err?.message || "Không thể tải danh sách hoạt động")
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, searchDebounce])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery)
      setPageNumber(1) // Reset to first page when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch statistics from API
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await executeApiCall(
        activityService.getActivityStatistics.bind(activityService),
        [token],
        { setError: () => {} }
      )

      if (response?.data) {
        const statistics = response.data
        setStats([
          {
            title: "Đang diễn ra",
            value: statistics.ongoingCount?.toString() || "0",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Sắp tới",
            value: statistics.upcomingCount?.toString() || "0",
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Đã hoàn thành",
            value: statistics.completedCount?.toString() || "0",
            icon: CheckCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Tổng người tham gia",
            value: statistics.totalParticipants?.toLocaleString() || "0",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            trend: "Tính từ dữ liệu",
          },
        ])
      }
    } catch (err) {
      console.error("Error fetching statistics:", err)
      toast.error(err?.message || "Không thể tải thống kê")
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch activities when filters change
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])


  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { label: "Đang diễn ra", className: "bg-green-100 text-green-700" },
      Upcoming: { label: "Sắp tới", className: "bg-orange-100 text-orange-700" },
      Ended: { label: "Đã kết thúc", className: "bg-gray-100 text-gray-700" },
    }
    const config = statusConfig[status] || statusConfig.Upcoming
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleSelectActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((activityId) => activityId !== id) : [...prev, id],
    )
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedActivities(filteredActivities.map((a) => a.id))
    } else {
      setSelectedActivities([])
    }
  }

  const handleDeleteSelected = () => {
    toast.success(`Đã xóa ${selectedActivities.length} hoạt động.`)
    setSelectedActivities([])
  }

  const handleDeleteClick = (activity) => {
    setActivityToDelete(activity)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return

    const token = localStorage.getItem("token")
    setDeletingIds(prev => new Set(prev).add(activityToDelete.id))

    try {
      await executeApiCall(
        activityService.updateActivity.bind(activityService),
        [
          {
            id: activityToDelete.id,
            isDeleted: true,
          },
          token
        ],
        { setLoading: () => {}, setError: () => {} }
      )
      
      // Update local state immediately for instant UI feedback
      setActivities(prevActivities =>
        prevActivities.map(a =>
          a.id === activityToDelete.id ? { ...a, isDeleted: true } : a
        )
      )
      
      toast.success(`Đã xóa hoạt động "${activityToDelete.title}".`)
      
      // Refresh from server to ensure consistency
      fetchActivities()
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setActivityToDelete(null)
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error(err?.message || "Không thể xóa hoạt động.")
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(activityToDelete.id)
        return next
      })
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setActivityToDelete(null)
  }

  const handleGenerateSchedule = () => {
    setAiGenerating(true)

    // TODO: Implement actual AI schedule generation API call
    // For now, show message that feature is not yet implemented
    setTimeout(() => {
      setAiGenerating(false)
      toast.info("Tính năng AI tạo lịch thi đấu đang được phát triển. Vui lòng quay lại sau.")
    }, 1000)
  }

  const handleApproveSchedule = () => {
    toast.success("Lịch thi đấu đã được lưu vào hệ thống.")
    setShowAIModal(false)
    setAiSchedule([])
  }

  // Options for filters
  const categoryOptions = [
    { value: "all", label: "Tất cả" },
    { value: "activity", label: "Hoạt động" },
    { value: "event", label: "Sự kiện" },
  ]

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang diễn ra" },
    { value: "upcoming", label: "Sắp tới" },
    { value: "ended", label: "Đã kết thúc" },
  ]

  const activityTypeOptions = [
    { value: "SportsFestival", label: "Hội thao" },
    { value: "Seminar", label: "Hội thảo" },
    { value: "Contest", label: "Cuộc thi" },
  ]

  const subTypeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "SportsFestival", label: "Hội thao" },
    { value: "CreativeContest", label: "Cuộc thi sáng tạo" },
    { value: "SeminarWorkshop", label: "Hội thảo / Workshop" },
    { value: "Other", label: "Khác" },
  ]

  // Map SubType to Vietnamese label
  const getSubTypeLabel = (subType) => {
    const subTypeMap = {
      "SportsFestival": "Hội thao",
      "CreativeContest": "Cuộc thi sáng tạo",
      "SeminarWorkshop": "Hội thảo / Workshop",
      "Other": "Khác",
    }
    return subTypeMap[subType] || subType || "-"
  }

  const handleResetFilters = () => {
    setCategoryFilter("")
    setStatusFilter("")
    setSubTypeFilter("")
    setDateFromFilter("")
    setDateToFilter("")
    setMinParticipantsFilter("")
    setMaxParticipantsFilter("")
    setOrganizerFilter("")
    setSearchQuery("")
  }

  const hasActiveFilters = () => {
    return (
      categoryFilter ||
      statusFilter ||
      subTypeFilter ||
      dateFromFilter ||
      dateToFilter ||
      minParticipantsFilter ||
      maxParticipantsFilter ||
      organizerFilter ||
      searchQuery
    )
  }

  // Filter activities on client side (since BE only supports search by title)
  // Note: Search is done on BE, but other filters are done on client side
  // Optimize với useMemo để tránh re-filter mỗi lần render
  const filteredActivities = useMemo(() => activities.filter(activity => {
    // Soft delete filter - only show activities that are not deleted
    // Hide activities where isDeleted is explicitly true
    if (activity.isDeleted === true || activity.isDeleted === "true") return false

    // Category filter
    if (categoryFilter && categoryFilter !== "all") {
      const categoryMatch = categoryFilter === "activity"
        ? activity.category === "Activity"
        : activity.category === "Event"
      if (!categoryMatch) return false
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      const statusMap = {
        "active": "Active",
        "upcoming": "Upcoming",
        "ended": "Ended"
      }
      if (activity.status !== statusMap[statusFilter]) return false
    }

    // SubType filter
    if (subTypeFilter && subTypeFilter !== "all") {
      if (activity.subType !== subTypeFilter) return false
    }

    // Date filters
    if (dateFromFilter && activity.startDate && activity.startDate < dateFromFilter) return false
    if (dateToFilter && activity.endDate && activity.endDate > dateToFilter) return false

    // Participants filters
    if (minParticipantsFilter && activity.participants < parseInt(minParticipantsFilter)) return false
    if (maxParticipantsFilter && activity.participants > parseInt(maxParticipantsFilter)) return false

    // Organizer filter (client-side search)
    if (organizerFilter && activity.organizer && !activity.organizer.toLowerCase().includes(organizerFilter.toLowerCase())) return false

    return true
  }), [activities, categoryFilter, statusFilter, subTypeFilter, dateFromFilter, dateToFilter, minParticipantsFilter, maxParticipantsFilter, organizerFilter])

  function getGroupRegistrations(activity) {
    if (!activity || !activity.participantDetails) return []
    const map = new Map()
    activity.participantDetails
      .filter((p) => p.groupCode)
      .forEach((p) => {
        if (!map.has(p.groupCode)) {
          map.set(p.groupCode, {
            code: p.groupCode,
            name: p.registrationMetadata || "",
            members: [],
          })
        }
        map.get(p.groupCode).members.push(p)
      })
    return Array.from(map.values())
  }

  function getSportRosters(activity) {
    if (!activity || !activity.participantDetails) return []
    const sportMap = new Map()
    activity.participantDetails
      .filter((p) => p.sportId)
      .forEach((p) => {
        if (!sportMap.has(p.sportId)) {
          const sportMeta = activity.sports?.find((sport) => sport.id === p.sportId)
          sportMap.set(p.sportId, {
            sportId: p.sportId,
            sportName: p.sportName || sportMeta?.sportName || "Môn thi đấu",
            classes: new Map(),
          })
        }
        const entry = sportMap.get(p.sportId)
        const className = p.classGroupName || "Chưa rõ lớp"
        if (!entry.classes.has(className)) {
          entry.classes.set(className, [])
        }
        entry.classes.get(className).push(p)
      })

    return Array.from(sportMap.values()).map((sport) => ({
      sportId: sport.sportId,
      sportName: sport.sportName,
      rosters: Array.from(sport.classes.entries()).map(([className, members]) => ({
        className,
        members,
      })),
    }))
  }

  // Handle pagination với loading state
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      // Set loading ngay lập tức khi user click paging
      setLoading(true)
      setPageNumber(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageSizeChange = (newSize) => {
    if (!loading) {
      // Set loading ngay lập tức khi user thay đổi page size
      setLoading(true)
      setPageSize(newSize)
      setPageNumber(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hoạt động</h1>
          <p className="text-gray-600 mt-1">Tổng hợp và quản lý tất cả các hoạt động ngoại khóa</p>
        </div>
        <div className="flex gap-3">
          {/* Chỉ hiển thị nút AI nếu có ít nhất 1 hội thao trong danh sách */}
          {filteredActivities.some(a => a.subType === "SportsFestival" || (a.sports && a.sports.length > 0)) && (
            <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Tạo lịch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Schedule Assistant
                  </DialogTitle>
                  <DialogDescription>
                    Sử dụng AI để tạo lịch thi đấu tối ưu, tránh trùng lịch học và giờ nghỉ
                  </DialogDescription>
                </DialogHeader>

                {aiSchedule.length === 0 ? (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Loại hoạt động</Label>
                        <SimpleSelect
                          value={aiForm.activityType}
                          onValueChange={(value) => setAiForm({ ...aiForm, activityType: value })}
                          placeholder="Chọn loại hoạt động"
                          options={activityTypeOptions}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Số buổi tối đa/ngày</Label>
                        <Input
                          type="number"
                          value={aiForm.constraints.maxSessionsPerDay}
                          onChange={(e) =>
                            setAiForm({
                              ...aiForm,
                              constraints: {
                                ...aiForm.constraints,
                                maxSessionsPerDay: Number.parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ngày bắt đầu</Label>
                        <Input
                          type="date"
                          value={aiForm.dateRange.start}
                          onChange={(e) =>
                            setAiForm({
                              ...aiForm,
                              dateRange: { ...aiForm.dateRange, start: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ngày kết thúc</Label>
                        <Input
                          type="date"
                          value={aiForm.dateRange.end}
                          onChange={(e) =>
                            setAiForm({
                              ...aiForm,
                              dateRange: { ...aiForm.dateRange, end: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Ràng buộc</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="avoidClassTime"
                            checked={aiForm.constraints.avoidClassTime}
                            onChange={(checked) =>
                              setAiForm({
                                ...aiForm,
                                constraints: {
                                  ...aiForm.constraints,
                                  avoidClassTime: checked,
                                },
                              })
                            }
                          />
                          <Label htmlFor="avoidClassTime" className="cursor-pointer">
                            Tránh giờ học
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="avoidLunch"
                            checked={aiForm.constraints.avoidLunch}
                            onChange={(checked) =>
                              setAiForm({
                                ...aiForm,
                                constraints: {
                                  ...aiForm.constraints,
                                  avoidLunch: checked,
                                },
                              })
                            }
                          />
                          <Label htmlFor="avoidLunch" className="cursor-pointer">
                            Tránh giờ nghỉ trưa
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="mb-4 p-4 bg-green-50  border-green-200 rounded-lg">
                      <p className="text-green-700 font-medium">
                        ✓ AI đã tạo lịch thi đấu tối ưu với {aiSchedule.length} buổi
                      </p>
                    </div>

                    <div className=" rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Hoạt động</TableHead>
                            <TableHead>Người tham gia</TableHead>
                            <TableHead>Địa điểm</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiSchedule.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.time}</TableCell>
                              <TableCell className="font-medium">{item.activity}</TableCell>
                              <TableCell>{item.participants.join(", ")}</TableCell>
                              <TableCell>{item.location}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {aiSchedule.length === 0 ? (
                    <>
                      <Button variant="outline" onClick={() => setShowAIModal(false)}>
                        Hủy
                      </Button>
                      <Button
                        onClick={handleGenerateSchedule}
                        disabled={aiGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {aiGenerating ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Tạo lịch
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setAiSchedule([])}>
                        Tạo lại
                      </Button>
                      <Button onClick={handleApproveSchedule} className="bg-green-600 hover:bg-green-700 text-white">
                        Lưu lịch
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to={ROUTES.ADMIN.CREATE_ACTIVITY}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo hoạt động
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          // Loading state for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover-lift">
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
          <Card key={index} className="hover-lift">
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
              <div className="text-xs text-gray-500">{stat.trend}</div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <SimpleSelect
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder="Loại hoạt động"
              options={categoryOptions}
              className="w-full md:w-48"
            />
            <SimpleSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Trạng thái"
              options={statusOptions}
              className="w-full md:w-48"
            />
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Lọc
              {hasActiveFilters() && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4  border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 block">Phân loại</Label>
                  <SimpleSelect
                    value={subTypeFilter}
                    onValueChange={setSubTypeFilter}
                    placeholder="Chọn phân loại"
                    options={subTypeOptions}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Ngày bắt đầu từ</Label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Ngày kết thúc đến</Label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Đơn vị tổ chức</Label>
                  <Input
                    placeholder="Tìm đơn vị tổ chức..."
                    value={organizerFilter}
                    onChange={(e) => setOrganizerFilter(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Số người tham gia tối thiểu</Label>
                  <Input
                    type="number"
                    placeholder="VD: 10"
                    value={minParticipantsFilter}
                    onChange={(e) => setMinParticipantsFilter(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Số người tham gia tối đa</Label>
                  <Input
                    type="number"
                    placeholder="VD: 500"
                    value={maxParticipantsFilter}
                    onChange={(e) => setMaxParticipantsFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách hoạt động</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Tổng: {totalCount} hoạt động</span>
              <span>•</span>
              <span>Trang {pageNumber}/{totalPages || 1}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[400px]">
            {/* Loading overlay với backdrop blur - hiển thị khi loading */}
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Đang tải danh sách hoạt động...</p>
                </div>
              </div>
            )}
            
            {/* Ẩn hoặc làm mờ nội dung cũ khi đang loading */}
            <div className={loading ? "opacity-30 pointer-events-none transition-opacity duration-200" : "opacity-100 transition-opacity duration-200"}>
            {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchActivities} variant="outline">
                Thử lại
              </Button>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy hoạt động nào</p>
              {hasActiveFilters() && (
                <Button onClick={handleResetFilters} variant="outline" className="mt-4">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Làm mờ table khi loading */}
              <div className={`rounded-lg overflow-hidden transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Phân loại</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Ngày kết thúc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Người tham gia</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={activity.title}>
                            {activity.title && activity.title.length > 50
                              ? `${activity.title.substring(0, 50)}...`
                              : activity.title
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getSubTypeLabel(activity.subType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.startDate}</TableCell>
                        <TableCell>{activity.endDate}</TableCell>
                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {activity.maxParticipants != null && activity.maxParticipants > 0
                              ? `${activity.participants}/${activity.maxParticipants}`
                              : "Không giới hạn"
                            }
                          </div>
                          {activity.maxParticipants != null && activity.maxParticipants > 0 && (
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-green-600 h-1.5 rounded-full"
                              style={{
                                  width: `${Math.min((activity.participants / activity.maxParticipants) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(activity.subType === "SportsFestival" || (activity.sports && activity.sports.length > 0)) && (
                              <Tooltip content="AI Tạo lịch">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link to={ROUTES.ADMIN.AI_SCHEDULE.replace(':id', String(activity.id))}>
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                  </Link>
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip content="Xem trước trang">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link to={`${ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(':id', String(activity.id))}?isPreview=true`}>
                                  <Eye className="w-4 h-4 text-blue-500" />
                                </Link>
                                </Button>
                              </Tooltip>
                            <Tooltip content={activity.subType === "CreativeContest" ? "Giám khảo" : "Chỉ cuộc thi sáng tạo mới có giám khảo"}>
                              {activity.subType === "CreativeContest" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link to={ROUTES.JURY.ASSIGN_JURY.replace(':id', String(activity.id))}>
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trophy className="w-4 h-4 text-gray-400" />
                                </Button>
                              )}
                            </Tooltip>
                            {isActivityLocked(activity) ? (
                              <Tooltip content="Hoạt động đang diễn ra/đã kết thúc - không thể chỉnh sửa">
                                <span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="opacity-60"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Lock className="w-4 h-4" />
                                  </Button>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip content="Chỉnh sửa">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link to={ROUTES.ADMIN.EDIT_ACTIVITY.replace(':id', String(activity.id))}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip content="Xóa sự kiện">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(activity)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 ">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Hiển thị:</Label>
                    <SimpleSelect
                      value={pageSize.toString()}
                      onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                      options={[
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                      ]}
                      className="w-20"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600">mục mỗi trang</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber - 1)}
                      disabled={pageNumber === 1 || loading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pageNumber <= 3) {
                          pageNum = i + 1
                        } else if (pageNumber >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = pageNumber - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNumber === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px]"
                            disabled={loading}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber + 1)}
                      disabled={pageNumber === totalPages || loading}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={participantsDrawerOpen}
        onOpenChange={(open) => {
          setParticipantsDrawerOpen(open)
          if (!open) {
            setSelectedActivity(null)
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đăng ký</DialogTitle>
            <DialogDescription>
              {selectedActivity ? selectedActivity.title : "Chọn một hoạt động để xem chi tiết"}
            </DialogDescription>
          </DialogHeader>
          {selectedActivity ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-orange-50 border-orange-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Loại hoạt động</p>
                    <p className="text-lg font-semibold">
                      {getSubTypeLabel(selectedActivity.subType)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Số người tham gia</p>
                    <p className="text-lg font-semibold">
                      {selectedActivity.maxParticipants != null && selectedActivity.maxParticipants > 0
                        ? `${selectedParticipants.length}/${selectedActivity.maxParticipants}`
                        : "Không giới hạn"
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Đăng ký mở đến</p>
                    <p className="text-lg font-semibold">
                      {selectedActivity.endRegisterDate || "-"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {selectedActivity.registrationSettings?.groupRegistration && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt đăng ký theo nhóm</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Số thành viên tối thiểu</p>
                      <p className="font-semibold">
                        {selectedActivity.registrationSettings.groupRegistration.minMembers || 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số thành viên tối đa</p>
                      <p className="font-semibold">
                        {selectedActivity.registrationSettings.groupRegistration.maxMembers
                          ? selectedActivity.registrationSettings.groupRegistration.maxMembers
                          : "Không giới hạn"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yêu cầu nhóm trưởng</p>
                      <p className="font-semibold">
                        {selectedActivity.registrationSettings.groupRegistration.requireLeader ? "Có" : "Không"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedGroupRegistrations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nhóm tham gia ({selectedGroupRegistrations.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedGroupRegistrations.map((group, index) => (
                      <div key={group.code || index} className=" rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-base">{group.name || `Nhóm ${index + 1}`}</p>
                            <p className="text-sm text-gray-500">{group.members.length} thành viên</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {group.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{member.userFullName || member.fullName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {member.classGroupName || "Chưa rõ lớp"}
                                </span>
                                {member.isLeader && (
                                  <Badge className="bg-blue-50 text-blue-700">Nhóm trưởng</Badge>
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

              {selectedSportRosters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Đội hình hội thao</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSportRosters.map((sport) => (
                      <div key={sport.sportId} className=" rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold text-base">{sport.sportName}</p>
                          {selectedActivity.sports
                            ?.find((item) => item.id === sport.sportId)
                            ?.maxMembers && (
                              <span className="text-xs text-gray-500">
                                Giới hạn{" "}
                                {selectedActivity.sports.find((item) => item.id === sport.sportId).maxMembers} người
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
                                    {member.userFullName || member.fullName}
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

              <Card>
                <CardHeader>
                  <CardTitle>Tất cả người tham gia ({selectedParticipants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có thành viên nào đăng ký.</p>
                  ) : (
                    <div className="space-y-2 pr-2">
                      {selectedParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between py-2  last:"
                        >
                          <div>
                            <p className="font-medium">{participant.userFullName || participant.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {participant.classGroupName || "Chưa rõ lớp"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {participant.groupCode && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Nhóm
                              </Badge>
                            )}
                            {participant.sportName && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {participant.sportName}
                              </Badge>
                            )}
                            <Badge
                              className={
                                participant.status?.toLowerCase() === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {participant.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa chọn hoạt động nào.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={() => { }}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold">Xem lịch</p>
              <p className="text-sm text-gray-600">Calendar view</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => { }}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Bảng xếp hạng</p>
              <p className="text-sm text-gray-600">Scoreboard</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => { }}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Quản lý CLB</p>
              <p className="text-sm text-gray-600">Clubs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => { }}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">AI Tools</p>
              <p className="text-sm text-gray-600">Smart features</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa hoạt động
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa hoạt động này không? Hành động này không thể hoàn tác.
              {activityToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">Tiêu đề:</p>
                  <p className="text-sm text-gray-700 mt-1">{activityToDelete.title}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-6">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deletingIds.has(activityToDelete?.id)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingIds.has(activityToDelete?.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingIds.has(activityToDelete?.id) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa vĩnh viễn
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}