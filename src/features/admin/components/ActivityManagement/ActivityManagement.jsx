import { useState } from "react"
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
} from "lucide-react"
import { ROUTES } from "@/common/constants/routes"

export default function ActivityManagement() {
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

  // Mock stats data
  const stats = [
    {
      title: "Đang diễn ra",
      value: "8",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+2 từ tuần trước",
    },
    {
      title: "Sắp tới",
      value: "15",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+5 hoạt động mới",
    },
    {
      title: "Đã hoàn thành",
      value: "42",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "Tháng này",
    },
    {
      title: "Chờ duyệt",
      value: "3",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "Cần xử lý",
    },
    {
      title: "Tổng người tham gia",
      value: "1,234",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+156 tuần này",
    },
  ]

  // Mock activities data
  const activities = [
    {
      id: 1,
      thumbnail: "/sports-festival.jpg",
      title: "Hội thao Liên trường 2024",
      category: "Activity",
      subType: "SportsFestival",
      startDate: "2024-03-15",
      endDate: "2024-03-17",
      status: "Active",
      participants: 342,
      maxParticipants: 500,
    },
    {
      id: 2,
      thumbnail: "/drawing-contest.jpg",
      title: "Cuộc thi vẽ tranh 'Mùa xuân'",
      category: "Event",
      subType: "DrawingContest",
      startDate: "2024-03-20",
      endDate: "2024-03-25",
      status: "Upcoming",
      participants: 67,
      maxParticipants: 100,
    },
    {
      id: 3,
      thumbnail: "/ai-seminar.jpg",
      title: "Hội thảo 'AI trong Giáo dục'",
      category: "Event",
      subType: "Seminar",
      startDate: "2024-03-18",
      endDate: "2024-03-18",
      status: "Upcoming",
      participants: 156,
      maxParticipants: 200,
    },
    {
      id: 4,
      thumbnail: "/writing-contest.jpg",
      title: "Cuộc thi sáng tác 'Tuổi trẻ và ước mơ'",
      category: "Event",
      subType: "CreativeWriting",
      startDate: "2024-03-22",
      endDate: "2024-04-05",
      status: "Pending",
      participants: 89,
      maxParticipants: 150,
    },
    {
      id: 5,
      thumbnail: "/football-tournament.jpg",
      title: "Giải bóng đá Khoa Công nghệ",
      category: "Activity",
      subType: "SportsFestival",
      startDate: "2024-02-20",
      endDate: "2024-02-28",
      status: "Ended",
      participants: 200,
      maxParticipants: 200,
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { label: "Đang diễn ra", className: "bg-green-100 text-green-700" },
      Upcoming: { label: "Sắp tới", className: "bg-orange-100 text-orange-700" },
      Ended: { label: "Đã kết thúc", className: "bg-gray-100 text-gray-700" },
      Pending: { label: "Chờ duyệt", className: "bg-red-100 text-red-700" },
    }
    const config = statusConfig[status] || statusConfig.Pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleSelectActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((activityId) => activityId !== id) : [...prev, id],
    )
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedActivities(activities.map((a) => a.id))
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

    // Simulate AI generation
    setTimeout(() => {
      const mockSchedule = [
        {
          date: "2025-11-10",
          time: "08:00 - 10:00",
          activity: "100m Run",
          participants: ["ClassA", "ClassB"],
          location: "Stadium",
        },
        {
          date: "2025-11-10",
          time: "10:30 - 12:00",
          activity: "Long Jump",
          participants: ["ClassC", "ClassD"],
          location: "Sports Hall",
        },
        {
          date: "2025-11-11",
          time: "13:00 - 15:00",
          activity: "Basketball",
          participants: ["ClassA", "ClassC"],
          location: "Basketball Court",
        },
        {
          date: "2025-11-11",
          time: "15:30 - 17:00",
          activity: "Volleyball",
          participants: ["ClassB", "ClassD"],
          location: "Volleyball Court",
        },
      ]

      setAiSchedule(mockSchedule)
      setAiGenerating(false)

      toast.success("AI đã tạo lịch thi đấu tối ưu cho bạn.")
    }, 2000)
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
    { value: "pending", label: "Chờ duyệt" },
  ]

  const activityTypeOptions = [
    { value: "SportsFestival", label: "Hội thao" },
    { value: "Seminar", label: "Hội thảo" },
    { value: "Contest", label: "Cuộc thi" },
  ]

  const subTypeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "SportsFestival", label: "Hội thao" },
    { value: "DrawingContest", label: "Cuộc thi vẽ" },
    { value: "CreativeWriting", label: "Sáng tác" },
    { value: "Seminar", label: "Hội thảo" },
    { value: "Workshop", label: "Workshop" },
    { value: "Other", label: "Khác" },
  ]

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

  return (
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <CardTitle>Danh sách hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tham gia</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="line-clamp-2">{activity.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.category}</Badge>
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
