import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import dayjs from "dayjs"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
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
  GitBranchPlus,
  GitBranch,
  RefreshCcw,
} from "lucide-react"
import { ROUTES } from "@/common/constants/routes"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { activityMatchService } from "@/features/activities/services/activityMatch.service"
import { LoadingCard } from "@/common/components/ui/loading"
import UpdateScoreModal from "@/features/activities/components/UpdateScoreModal"

export default function ActivityManagement() {
  // Data state
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
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
  const [bracketModalOpen, setBracketModalOpen] = useState(false)
  const [bracketModalData, setBracketModalData] = useState({ activity: null, participants: [], sports: [] })
  const [bracketModalLoading, setBracketModalLoading] = useState(false)
  const [bracketSaving, setBracketSaving] = useState(false)
  const [bracketViewerOpen, setBracketViewerOpen] = useState(false)
  const [bracketViewerData, setBracketViewerData] = useState({ activity: null, participants: [], sports: [] })
  const [bracketViewerRefreshKey, setBracketViewerRefreshKey] = useState(0)
  const [scoreModalMatch, setScoreModalMatch] = useState(null)
  const [scoreModalOpen, setScoreModalOpen] = useState(false)
  
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

  // Stats data (calculated from activities)
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
  
  // Fetch activities from BE
  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("token")
      const search = searchDebounce.trim() || null
      
      const response = await executeApiCall(
        activityService.getAllActivities.bind(activityService),
        [pageNumber, pageSize, search, token],
        { setLoading, setError }
      )
      
      if (response?.data) {
        const paginationData = response.data
        const activitiesData = paginationData.data || []
        
        // Map BE data to FE format
        const mappedActivities = activitiesData.map(activity => ({
          id: activity.id,
          thumbnail: activity.thumbnailUrl || "",
          title: activity.title || "",
          category: activity.category === 1 ? "Activity" : "Event",
          subType: activity.subType || "",
          startDate: activity.startDate ? new Date(activity.startDate).toISOString().split("T")[0] : "",
          endDate: activity.endDate ? new Date(activity.endDate).toISOString().split("T")[0] : "",
          registerDate: activity.registerDate ? new Date(activity.registerDate).toISOString().split("T")[0] : "",
          endRegisterDate: activity.endRegisterDate ? new Date(activity.endRegisterDate).toISOString().split("T")[0] : "",
          status: getActivityStatus(activity),
          participants: activity.numberOfParticipants || 0,
          maxParticipants: activity.maxParticipants || 0,
          location: activity.location || "",
          organizer: activity.organizer || "",
          description: activity.description || "",
          onlyTeacherCanRegister: activity.onlyTeacherCanRegister || false,
          gradingSettings: activity.gradingSettings || null,
        }))
        
        setActivities(mappedActivities)
        setTotalCount(paginationData.totalCount || 0)
        setTotalPages(Math.ceil((paginationData.totalCount || 0) / pageSize))
        
        // Calculate stats
        const now = new Date()
        const activeCount = mappedActivities.filter(a => {
          const start = a.startDate ? new Date(a.startDate) : null
          const end = a.endDate ? new Date(a.endDate) : null
          return start && end && now >= start && now <= end
        }).length
        
        const upcomingCount = mappedActivities.filter(a => {
          const start = a.startDate ? new Date(a.startDate) : null
          return start && now < start
        }).length
        
        const endedCount = mappedActivities.filter(a => {
          const end = a.endDate ? new Date(a.endDate) : null
          return end && now > end
        }).length
        
        const totalParticipants = mappedActivities.reduce((sum, a) => sum + a.participants, 0)
        
        setStats([
          {
            title: "Đang diễn ra",
            value: activeCount.toString(),
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Sắp tới",
            value: upcomingCount.toString(),
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Đã hoàn thành",
            value: endedCount.toString(),
            icon: CheckCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "Tính từ dữ liệu",
          },
          {
            title: "Tổng người tham gia",
            value: totalParticipants.toLocaleString(),
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            trend: "Tính từ dữ liệu",
          },
        ])
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
  
  // Fetch activities when filters change
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

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

  const handleOpenBracketModal = async (activity) => {
    setBracketModalLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await executeApiCall(
        activityService.getActivityById.bind(activityService),
        [activity.id, token],
        { setError: () => {} },
      )
      const detail = response?.data?.data ?? response?.data
      const participants = mapParticipantsForBracket(detail?.participants ?? [])
      
      const sports = detail?.sports ?? []
      if (!sports.length) {
        toast.warn("Hoạt động chưa có môn thi đấu, không thể tạo bảng đấu.")
        return
      }
      setBracketModalData({ activity, participants, sports })
      setBracketModalOpen(true)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Không thể tải thông tin hoạt động.")
    } finally {
      setBracketModalLoading(false)
    }
  }

  const handleBracketSubmit = async ({ sportId, seededParticipants, grade }) => {
    if (!sportId) {
      toast.error("Vui lòng chọn môn thi đấu.")
      return
    }
    if (!seededParticipants?.length || seededParticipants.length < 2) {
      toast.error("Cần ít nhất 2 đội để tạo bảng đấu.")
      return
    }
    if (!bracketModalData.activity) return

    setBracketSaving(true)
    try {
      const token = localStorage.getItem("token")
      await activityMatchService
        .deleteBracket({ activityId: bracketModalData.activity.id, sportId }, token)
        .catch(() => Promise.resolve())
      await createMatchesForBracket({
        activityId: bracketModalData.activity.id,
        sportId,
        participants: seededParticipants,
        grade,
        token,
      })
      toast.success("Đã tạo bảng đấu thành công.")
      setBracketModalOpen(false)
      setBracketViewerRefreshKey((prev) => prev + 1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Không thể tạo bảng đấu.")
    } finally {
      setBracketSaving(false)
    }
  }

  const handleOpenBracketViewer = async (activity) => {
    setBracketModalLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await executeApiCall(
        activityService.getActivityById.bind(activityService),
        [activity.id, token],
        { setError: () => {} },
      )
      const detail = response?.data?.data ?? response?.data
      const participants = mapParticipantsForBracket(detail?.participants ?? [])
      const sports = detail?.sports ?? []
      if (!sports.length) {
        toast.warn("Hoạt động chưa có môn thi đấu, không thể xem bracket.")
        return
      }
      setBracketViewerData({ activity, participants, sports })
      setBracketViewerOpen(true)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Không thể tải thông tin hoạt động.")
    } finally {
      setBracketModalLoading(false)
    }
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
  const filteredActivities = activities.filter(activity => {
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
  })
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setPageNumber(1)
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hoạt động</h1>
          <p className="text-gray-600 mt-1">Tổng hợp và quản lý tất cả các hoạt động ngoại khóa</p>
        </div>
        <div className="flex gap-3">
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
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-medium">
                        ✓ AI đã tạo lịch thi đấu tối ưu với {aiSchedule.length} buổi
                      </p>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
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

            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link to={ROUTES.ADMIN.CREATE_ACTIVITY}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo hoạt động
              </Link>
            </Button>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
          ))}
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
            <div className="mt-4 pt-4 border-t border-gray-200">
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

          {selectedActivities.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">Đã chọn {selectedActivities.length} hoạt động</span>
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedActivities([])}>
                Bỏ chọn
              </Button>
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
          {loading ? (
            <LoadingCard text="Đang tải danh sách hoạt động..." />
          ) : error ? (
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
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow noHover>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedActivities.length === filteredActivities.length && filteredActivities.length > 0}
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedActivities(filteredActivities.map(a => a.id))
                            } else {
                              setSelectedActivities([])
                            }
                          }}
                        />
                      </TableHead>
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
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedActivities.includes(activity.id)}
                            onChange={() => handleSelectActivity(activity.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="line-clamp-2">{activity.title}</div>
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
                        {activity.participants}/{activity.maxParticipants}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${(activity.participants / activity.maxParticipants) * 100}%`,
                        }}
                      />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`${ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(':id', String(activity.id))}?isPreview=true`}>
                            <Eye className="w-4 h-4 text-blue-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={ROUTES.ADMIN.EDIT_ACTIVITY.replace(':id', String(activity.id))}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={ROUTES.ADMIN.AI_SCHEDULE.replace(':id', String(activity.id))}>
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenBracketModal(activity)}
                          disabled={bracketModalLoading}
                        >
                          <GitBranchPlus className="w-4 h-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenBracketViewer(activity)}
                          disabled={bracketModalLoading}
                        >
                          <GitBranch className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.success(`Đã xóa hoạt động "${activity.title}".`)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
                  />
                  <span className="text-sm text-gray-600">mục mỗi trang</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
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
                    disabled={pageNumber === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={() => {}}>
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

        <Card className="hover-lift cursor-pointer" onClick={() => {}}>
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

        <Card className="hover-lift cursor-pointer" onClick={() => {}}>
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

        <Card className="hover-lift cursor-pointer" onClick={() => {}}>
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
    </div>

      <BracketSetupModal
        open={bracketModalOpen}
        onClose={() => setBracketModalOpen(false)}
        activity={bracketModalData.activity}
        participants={bracketModalData.participants}
        sports={bracketModalData.sports}
        onSubmit={handleBracketSubmit}
        isSubmitting={bracketSaving}
      />
      <BracketViewerModal
        open={bracketViewerOpen}
        onClose={() => setBracketViewerOpen(false)}
        activity={bracketViewerData.activity}
        participants={bracketViewerData.participants}
        sports={bracketViewerData.sports}
        onManageMatch={(match) => {
          setScoreModalMatch(match)
          setScoreModalOpen(true)
        }}
        refreshKey={bracketViewerRefreshKey}
        onOpenSetup={() => bracketViewerData.activity && handleOpenBracketModal(bracketViewerData.activity)}
      />
      <UpdateScoreModal
        match={scoreModalMatch}
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        onSuccess={() => {
          setBracketViewerRefreshKey((prev) => prev + 1)
          setScoreModalOpen(false)
        }}
      />
    </>
  )
}

function mapParticipantsForBracket(participants = []) {
  const uniqueMap = new Map()
  participants.forEach((participant) => {
    const classGroupId = participant?.classGroupId || participant?.classGroup?.id
    if (!classGroupId || uniqueMap.has(classGroupId)) return

    const grade =
      participant?.grade ??
      participant?.classGroup?.grade ??
      participant?.classGroupGrade ??
      null

    const className =
      participant?.classGroup?.name ||
      participant?.classGroupName ||
      participant?.class ||
      participant?.className ||
      null

    const baseName =
      className ||
      participant?.user?.fullName ||
      participant?.name ||
      `Đội ${classGroupId}`

    const displayName = grade ? `Khối ${grade} - ${baseName}` : baseName

    uniqueMap.set(classGroupId, {
      id: participant?.id || classGroupId,
      classGroupId,
      name: displayName,
      grade,
      rawName: baseName,
    })
  })
  return Array.from(uniqueMap.values())
}

function getRoundLabelByMatchCount(matchCount) {
  if (matchCount === 1) return "Chung kết"
  if (matchCount === 2) return "Bán kết"
  if (matchCount === 4) return "Tứ kết"
  return `Vòng ${matchCount}`
}

function buildBracketStructure(participants) {
  const seeds = participants.map((participant) => ({ participant }))
  const totalSlots = Math.max(2, Math.pow(2, Math.ceil(Math.log2(seeds.length || 1))))
  while (seeds.length < totalSlots) {
    seeds.push({ participant: null })
  }

  const rounds = []
  let slots = seeds

  while (slots.length > 1) {
    const matches = []
    for (let i = 0; i < slots.length; i += 2) {
      matches.push({
        slot1: slots[i],
        slot2: slots[i + 1],
        nextRoundIndex: null,
        nextMatchIndex: null,
      })
    }
    rounds.push(matches)
    slots = matches.map((_, idx) => ({ matchRef: { roundIndex: rounds.length - 1, matchIndex: idx } }))
  }

  for (let i = 0; i < rounds.length - 1; i++) {
    rounds[i].forEach((match, idx) => {
      match.nextRoundIndex = i + 1
      match.nextMatchIndex = Math.floor(idx / 2)
    })
  }

  return rounds
}

async function createMatchesForBracket({ activityId, sportId, participants, grade, token }) {
  const rounds = buildBracketStructure(participants)
  if (!rounds.length) {
    throw new Error("Không thể tạo bảng đấu với dữ liệu hiện có.")
  }

  const matchIdMap = rounds.map(() => [])

  for (let roundIdx = rounds.length - 1; roundIdx >= 0; roundIdx--) {
    const roundMatches = rounds[roundIdx]
    const roundNumber = roundIdx + 1
    const roundLabel = getRoundLabelByMatchCount(roundMatches.length)

    for (let matchIdx = 0; matchIdx < roundMatches.length; matchIdx++) {
      const match = roundMatches[matchIdx]
      const classGroup1Id = match.slot1?.participant?.classGroupId || null
      const classGroup2Id = match.slot2?.participant?.classGroupId || null
      const isBye = Boolean(classGroup1Id) !== Boolean(classGroup2Id)

      const payload = {
        activityId,
        sportId,
        classGroup1Id,
        classGroup2Id,
        grade,
        round: roundNumber,
        roundName: roundLabel,
        matchNumber: matchIdx + 1,
        isBye,
      }

      const nextMatchId =
        match.nextRoundIndex !== null && match.nextRoundIndex !== undefined
          ? matchIdMap[match.nextRoundIndex]?.[match.nextMatchIndex]
          : null
      if (nextMatchId) {
        payload.nextMatchId = nextMatchId
      }

      const response = await activityMatchService.createMatch(payload, token)
      const createdMatch = response?.data?.data ?? response?.data
      const createdId = createdMatch?.id
      matchIdMap[roundIdx][matchIdx] = createdId

      if (isBye && createdId) {
        const winnerId = classGroup1Id || classGroup2Id
        if (winnerId) {
          await activityMatchService.updateMatchResult(
            createdId,
            {
              Score1: classGroup1Id ? 1 : 0,
              Score2: classGroup2Id ? 1 : 0,
              WinnerClassGroupId: winnerId,
            },
            token,
          )
        }
      }
    }
  }
}

function BracketSetupModal({ open, onClose, activity, participants, sports, onSubmit, isSubmitting }) {
  const [selectedSportId, setSelectedSportId] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [teamPool, setTeamPool] = useState([])
  const [slotAssignments, setSlotAssignments] = useState([])

  const normalizedParticipants = useMemo(() => {
    return (participants ?? [])
      .map((participant) => {
        const classGroupId = participant?.classGroupId || participant?.classGroup?.id || participant?.id
        if (!classGroupId) return null
        const grade =
          participant?.grade ??
          participant?.classGroup?.grade ??
          participant?.classGroupGrade ??
          null
        const className =
          participant?.classGroup?.name ||
          participant?.classGroupName ||
          participant?.name ||
          participant?.user?.fullName ||
          `Đội ${classGroupId}`
        const displayName = grade ? `Khối ${grade} - ${className}` : className

        return {
          key: String(classGroupId),
          classGroupId,
          grade,
          displayName,
          rawName: className,
        }
      })
      .filter(Boolean)
  }, [participants])

  const gradeOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedParticipants
          .map((participant) => participant.grade)
          .filter((grade) => grade !== null && grade !== undefined),
      ),
    ).sort((a, b) => a - b)
  }, [normalizedParticipants])

  useEffect(() => {
    if (open) {
      setSelectedSportId(sports?.[0]?.id ?? null)
      if (gradeOptions.length > 0) {
        setSelectedGrade((prev) => (prev !== null && gradeOptions.includes(prev) ? prev : gradeOptions[0]))
      } else {
        setSelectedGrade(null)
      }
    }
  }, [open, sports, gradeOptions])

  const filteredTeams = useMemo(() => {
    return normalizedParticipants.filter((participant) =>
      selectedGrade === null ? true : participant.grade === selectedGrade,
    )
  }, [normalizedParticipants, selectedGrade])

  useEffect(() => {
    if (!open) return
    const slotsNeeded = Math.max(2, Math.pow(2, Math.ceil(Math.log2(filteredTeams.length || 1))))
    const newSlots = Array.from({ length: slotsNeeded }, () => null)
    const pool = []

    filteredTeams.forEach((team, index) => {
      if (index < slotsNeeded) {
        newSlots[index] = team.key
      } else {
        pool.push(team.key)
      }
    })

    setSlotAssignments(newSlots)
    setTeamPool(pool)
  }, [filteredTeams, open])

  const teamMap = useMemo(() => {
    const map = new Map()
    filteredTeams.forEach((team) => map.set(team.key, team))
    return map
  }, [filteredTeams])

  const bracketPairs = useMemo(() => {
    const pairs = []
    for (let i = 0; i < slotAssignments.length; i += 2) {
      pairs.push([i, i + 1])
    }
    return pairs
  }, [slotAssignments])

  const parseSlotIndex = (droppableId) => {
    if (!droppableId.startsWith("slot-")) return null
    return Number(droppableId.replace("slot-", ""))
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceSlot = parseSlotIndex(source.droppableId)
    const destSlot = parseSlotIndex(destination.droppableId)

    if (source.droppableId === "teamPool" && destination.droppableId === "teamPool") {
      setTeamPool((prev) => reorder(prev, source.index, destination.index))
      return
    }

    if (sourceSlot !== null && destSlot !== null) {
      setSlotAssignments((prev) => {
        const next = [...prev]
        const temp = next[sourceSlot]
        next[sourceSlot] = next[destSlot]
        next[destSlot] = temp
        return next
      })
      return
    }

    if (source.droppableId === "teamPool" && destSlot !== null) {
      const displacedTeam = slotAssignments[destSlot]
      setSlotAssignments((prev) => {
        const next = [...prev]
        next[destSlot] = draggableId
        return next
      })
      setTeamPool((prev) => {
        const next = [...prev]
        next.splice(source.index, 1)
        if (displacedTeam) {
          next.splice(destination.index, 0, displacedTeam)
        }
        return next
      })
      return
    }

    if (sourceSlot !== null && destination.droppableId === "teamPool") {
      const movingTeam = slotAssignments[sourceSlot]
      if (!movingTeam) return
      setSlotAssignments((prev) => {
        const next = [...prev]
        next[sourceSlot] = null
        return next
      })
      setTeamPool((prev) => {
        const next = [...prev]
        next.splice(destination.index, 0, movingTeam)
        return next
      })
    }
  }

  const assignedTeams = slotAssignments
    .map((teamKey) => (teamKey ? teamMap.get(teamKey) : null))
    .filter(Boolean)

  const handleSubmit = () => {
    if (!selectedSportId) {
      toast.error("Vui lòng chọn môn thi đấu.")
      return
    }
    if (assignedTeams.length < 2) {
      toast.error("Cần ít nhất 2 đội trong cùng khối để tạo bảng đấu.")
      return
    }
    onSubmit({
      sportId: selectedSportId,
      grade: selectedGrade,
      seededParticipants: assignedTeams.map((team) => ({
        classGroupId: team.classGroupId,
        grade: team.grade,
        name: team.displayName,
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Tạo bảng đấu</DialogTitle>
          <DialogDescription>
            Kéo thả để sắp xếp hạt giống cho bracket loại trực tiếp. Chỉ tạo theo từng khối.
          </DialogDescription>
        </DialogHeader>

        {activity ? (
          <div className="space-y-5">
            <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700">
              <p className="font-medium">{activity.title}</p>
              <p>{activity.location}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Môn thi đấu</Label>
                <SimpleSelect
                  value={selectedSportId ? selectedSportId.toString() : undefined}
                  onValueChange={(value) => setSelectedSportId(Number(value))}
                  options={sports.map((sport) => ({
                    value: sport.id.toString(),
                    label: sport.sportName,
                  }))}
                  placeholder="Chọn môn thi đấu"
                />
              </div>
              {gradeOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Khối</Label>
                  <SimpleSelect
                    value={selectedGrade !== null ? selectedGrade.toString() : undefined}
                    onValueChange={(value) => setSelectedGrade(value ? Number(value) : null)}
                    options={gradeOptions.map((grade) => ({
                      value: grade.toString(),
                      label: `Khối ${grade}`,
                    }))}
                    placeholder="Chọn khối"
                  />
                </div>
              )}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Danh sách đội ({teamPool.length} đội chưa xếp)</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTeamPool((prev) => {
                          const shuffled = [...prev]
                          for (let i = shuffled.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1))
                            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
                          }
                          return shuffled
                        })
                      }
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Xáo trộn
                    </Button>
                  </div>
                  <Droppable droppableId="teamPool">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] rounded-lg border bg-white p-3 space-y-2 transition ${
                          snapshot.isDraggingOver ? "border-orange-400 bg-orange-50/60" : "border-gray-200"
                        }`}
                      >
                        {teamPool.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-6">Tất cả đội đã được gán vào bracket.</p>
                        )}
                        {teamPool.map((teamKey, index) => {
                          const team = teamMap.get(teamKey)
                          if (!team) return null
                          return (
                            <Draggable draggableId={teamKey} index={index} key={`pool-${teamKey}`}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`rounded-md border p-3 text-sm bg-white flex items-center justify-between ${
                                    dragSnapshot.isDragging ? "shadow-lg border-orange-400" : "border-gray-200"
                                  }`}
                                >
                                  <span className="font-semibold">{team.displayName}</span>
                                  {team.grade && (
                                    <span className="text-xs text-gray-500">Khối {team.grade}</span>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Bracket ({assignedTeams.length}/{slotAssignments.length} slot)</p>
                    <span className="text-xs text-gray-500">Kéo thả đội vào slot để xếp hạt giống</span>
                  </div>
                  <div className="space-y-4">
                    {bracketPairs.map((pair, matchIndex) => (
                      <div key={`match-${matchIndex}`} className="rounded-lg border p-4 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Trận {matchIndex + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pair.map((slotIndex) => {
                            if (slotIndex >= slotAssignments.length) return null
                            const teamKey = slotAssignments[slotIndex]
                            const team = teamKey ? teamMap.get(teamKey) : null
                            return (
                              <Droppable droppableId={`slot-${slotIndex}`} key={`slot-${slotIndex}`}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`h-20 rounded-md border border-dashed flex items-center justify-center text-sm transition ${
                                      snapshot.isDraggingOver ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {team ? (
                                      <Draggable draggableId={teamKey} index={0}>
                                        {(dragProvided, dragSnapshot) => (
                                          <div
                                            ref={dragProvided.innerRef}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
                                            className={`w-full h-full flex items-center justify-between px-3 rounded-md ${
                                              dragSnapshot.isDragging ? "bg-orange-100 shadow" : "bg-white"
                                            }`}
                                          >
                                            <span className="font-semibold">{team.displayName}</span>
                                            {team.grade && (
                                              <span className="text-xs text-gray-500">Khối {team.grade}</span>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ) : (
                                      <span className="text-xs text-gray-400">Kéo đội vào đây</span>
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DragDropContext>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Đang tải dữ liệu hoạt động...</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !activity}>
            {isSubmitting ? "Đang tạo..." : "Tạo bảng đấu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BracketViewerModal({
  open,
  onClose,
  activity,
  participants,
  sports,
  onManageMatch,
  refreshKey = 0,
  onOpenSetup,
}) {
  const [selectedSportId, setSelectedSportId] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const gradeOptions = useMemo(() => {
    return Array.from(
      new Set(
        (participants ?? [])
          .map((participant) => participant?.grade)
          .filter((grade) => grade !== null && grade !== undefined),
      ),
    ).sort((a, b) => a - b)
  }, [participants])

  useEffect(() => {
    if (!open) return
    setSelectedSportId((prev) => {
      if (prev && sports?.some((sport) => sport.id === prev)) {
        return prev
      }
      return sports?.[0]?.id ?? null
    })
    if (gradeOptions.length > 0) {
      setSelectedGrade((prev) => (prev !== null && gradeOptions.includes(prev) ? prev : gradeOptions[0]))
    } else {
      setSelectedGrade(null)
    }
  }, [open, sports, gradeOptions])

  useEffect(() => {
    if (!open || !activity || !selectedSportId) {
      setBracket(null)
      return
    }

    let isMounted = true
    const fetchBracket = async () => {
      setLoading(true)
      setErrorInfo(null)
      try {
        const token = localStorage.getItem("token")
        const response = await activityMatchService.getBracket(
          {
            activityId: activity.id,
            sportId: selectedSportId,
            grade: selectedGrade ?? undefined,
          },
          token,
        )
        const payload = response?.data?.data ?? response?.data
        if (isMounted) {
          setBracket(payload)
        }
      } catch (err) {
        if (!isMounted) return
        const statusCode = err?.statusCode ?? err?.StatusCode
        if (statusCode === 404) {
          setBracket(null)
          setErrorInfo({
            type: "not_found",
            message: "Chưa tìm thấy bracket cho môn và khối đã chọn.",
          })
        } else {
          setErrorInfo({
            type: "error",
            message: err?.message || err?.Message || "Không thể tải bracket.",
          })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBracket()
    return () => {
      isMounted = false
    }
  }, [open, activity, selectedSportId, selectedGrade, refreshKey])

  const statusConfigMap = {
    0: { label: "Chưa bắt đầu", className: "bg-gray-100 text-gray-700" },
    1: { label: "Đang diễn ra", className: "bg-blue-100 text-blue-700" },
    2: { label: "Đã kết thúc", className: "bg-green-100 text-green-700" },
    3: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
  }

  const statusValueMap = {
    Pending: 0,
    InProgress: 1,
    Completed: 2,
    Cancelled: 3,
  }

  const normalizeStatus = (status) => {
    if (typeof status === "number") return status
    return statusValueMap[status] ?? 0
  }

  const rounds = bracket?.rounds ?? []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Bracket đã tạo</DialogTitle>
          <DialogDescription>
            Theo dõi và cập nhật các trận đấu trực tiếp ngay trên giao diện quản trị.
          </DialogDescription>
        </DialogHeader>

        {!activity ? (
          <p className="text-sm text-gray-500">Chọn một hoạt động để xem bracket.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Môn thi đấu</Label>
                <SimpleSelect
                  value={selectedSportId ? selectedSportId.toString() : undefined}
                  onValueChange={(value) => setSelectedSportId(Number(value))}
                  options={sports.map((sport) => ({
                    value: sport.id.toString(),
                    label: sport.sportName,
                  }))}
                  placeholder="Chọn môn"
                />
              </div>
              {gradeOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Khối</Label>
                  <SimpleSelect
                    value={selectedGrade !== null ? selectedGrade.toString() : undefined}
                    onValueChange={(value) => setSelectedGrade(value ? Number(value) : null)}
                    options={gradeOptions.map((grade) => ({
                      value: grade.toString(),
                      label: `Khối ${grade}`,
                    }))}
                    placeholder="Chọn khối"
                  />
                </div>
              )}
            </div>

            {loading ? (
              <LoadingCard text="Đang tải bracket..." />
            ) : errorInfo ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-gray-600">{errorInfo.message}</p>
                {errorInfo.type === "not_found" && (
                  <Button onClick={onOpenSetup} variant="outline">
                    Tạo bảng đấu ngay
                  </Button>
                )}
              </div>
            ) : !rounds.length ? (
              <div className="text-center py-10 text-gray-500">
                Chưa có dữ liệu bracket cho lựa chọn này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-start gap-5 min-h-[320px]">
                  {rounds.map((round) => (
                    <div key={`round-${round.roundNumber}`} className="min-w-[220px] space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{round.roundName || `Vòng ${round.roundNumber}`}</p>
                        <p className="text-xs text-gray-500">
                          {round.matches?.length || 0} trận • Khối {round.matches?.[0]?.grade ?? selectedGrade ?? "-"}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {round.matches.map((match) => {
                          const statusValue = normalizeStatus(match.status)
                          const statusConfig = statusConfigMap[statusValue] || statusConfigMap[0]
                          const teamRows = [
                            {
                              id: match.classGroup1Id,
                              name: match.classGroup1Name || (match.isBye ? "Đội được quyền đi tiếp" : "Chưa xác định"),
                              score: match.score1,
                            },
                            {
                              id: match.classGroup2Id,
                              name: match.classGroup2Name || (match.isBye ? "BYE" : "Chưa xác định"),
                              score: match.score2,
                            },
                          ].filter((team, index) => team.id || index === 0 || !match.isBye)

                          const matchDate = match.matchDate ? dayjs(match.matchDate).format("DD/MM/YYYY") : null
                          const matchTime =
                            match.startTime && typeof match.startTime === "string"
                              ? match.startTime.slice(0, 5)
                              : null

                          const winnerId = match.winnerClassGroupId

                          return (
                            <div key={`match-${match.id}`} className="rounded-xl border bg-white shadow-sm space-y-3 p-3">
                              <div className="flex items-center justify-between">
                                <Badge className={`${statusConfig.className} text-[11px]`}>{statusConfig.label}</Badge>
                                <span className="text-xs text-gray-500">Trận {match.matchNumber}</span>
                              </div>
                              <div className="space-y-2">
                                {teamRows.map((team, index) => (
                                  <div
                                    key={`${match.id}-team-${index}`}
                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                      winnerId && team.id === winnerId
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    <span className="font-medium line-clamp-1">{team.name}</span>
                                    <span className="font-semibold text-gray-800">{team.score ?? "-"}</span>
                                  </div>
                                ))}
                                {match.isBye && (
                                  <p className="text-xs text-gray-500 italic">
                                    Trận bye - {teamRows[0]?.name} tự động vào vòng sau
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {matchDate}
                                  {matchTime ? ` • ${matchTime}` : ""}
                                </span>
                                {match.location && <span>{match.location}</span>}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => onManageMatch?.(match)}
                                disabled={match.isBye}
                              >
                                {match.isBye ? "Tự động xử lý" : "Cập nhật / Điều hành"}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
