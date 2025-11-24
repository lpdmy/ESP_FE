import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
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
} from "lucide-react"
import { ROUTES } from "@/common/constants/routes"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { LoadingCard } from "@/common/components/ui/loading"

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
          )}

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
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        {/* Chỉ hiển thị nút AI cho hội thao */}
                        {(activity.subType === "SportsFestival" || (activity.sports && activity.sports.length > 0)) && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={ROUTES.ADMIN.AI_SCHEDULE.replace(':id', String(activity.id))}>
                              <Sparkles className="w-4 h-4 text-purple-500" />
                            </Link>
                          </Button>
                        )}
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
  )
}
