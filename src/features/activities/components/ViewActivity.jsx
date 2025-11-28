import { useState, useEffect } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
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
import { LoadingCard } from "@/common/components/ui/loading"
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
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationReason, setRegistrationReason] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { isOpen, toggleMenu, closeMenu } = useDropdownMenu()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isPreview = queryParams.get("isPreview") === "true"

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!params.id) {
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

        if (response?.data) {
          // Handle nested data structure: response.data.data or response.data
          const activityData = response.data?.data || response.data
          if (!activityData) {
            setError("Không tìm thấy dữ liệu hoạt động")
            setLoading(false)
            return
          }
          
          const now = new Date()
          
          // Calculate status based on dates
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
          
          // Calculate timeline status
          const getTimelineStatus = (date) => {
            if (!date) return "upcoming"
            const dateObj = new Date(date)
            return now >= dateObj ? "completed" : "upcoming"
          }
          
          // Map API response to component state with null checks
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
            currentParticipants: activityData?.numberOfParticipants || 0,
            status: status,
            sportsCategories: activityData?.sports?.map(s => s?.sportName).filter(Boolean) || [],
            competitionType: activityData?.activityDetail?.competitionType || "",
            rules: activityData?.rules || [],
            timeline: [
              { 
                date: activityData?.registerDate ? new Date(activityData.registerDate).toISOString().split("T")[0] : "", 
                title: "Mở đăng ký", 
                status: getTimelineStatus(activityData?.registerDate) 
              },
              { 
                date: activityData?.endRegisterDate ? new Date(activityData.endRegisterDate).toISOString().split("T")[0] : "", 
                title: "Đóng đăng ký", 
                status: getTimelineStatus(activityData?.endRegisterDate) 
              },
              { 
                date: activityData?.startDate ? new Date(activityData.startDate).toISOString().split("T")[0] : "", 
                title: "Khai mạc", 
                status: getTimelineStatus(activityData?.startDate) 
              },
              { 
                date: activityData?.endDate ? new Date(activityData.endDate).toISOString().split("T")[0] : "", 
                title: "Bế mạc & Trao giải", 
                status: getTimelineStatus(activityData?.endDate) 
              },
            ],
            awards: activityData?.awards?.map(a => ({
              rank: a?.name || a?.rank || "",
              prize: `${a?.starPoints || a?.points || 0} điểm`
            })).filter(Boolean) || [],
            speakers: activityData?.speakers || [],
            programs: activityData?.programs || [],
            participants: activityData?.participants || [],
            onlyTeacherCanRegister: activityData?.onlyTeacherCanRegister || false,
            gradingSettings: activityData?.gradingSettings || null,
            registrationReward: activityData?.registrationReward || null,
          })
          
          // Check if user is already registered
          // TODO: Check from participants list or separate API call
        }
      } catch (err) {
        console.error("Error fetching activity:", err)
        toast.error(err?.message || "Không thể tải thông tin hoạt động")
        if (err?.statusCode === 404) {
          navigate("/activities")
        }
      }
    }

    fetchActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isPreview])

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
          // Refresh activity data to update participant count
          // TODO: Refresh activity data
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
      // TODO: Get participationId from current user's participation
      const participationId = null // Need to get from participants list
      if (!participationId) {
        toast.error("Không tìm thấy thông tin đăng ký")
        return
      }

      const token = localStorage.getItem("token")
      setIsCancelling(true)
      try {
        await executeApiCall(
          activityParticipantService.cancelRegistration.bind(activityParticipantService),
          [participationId, token],
          { setError }
        )

        setIsRegistered(false)
        toast.showSuccess("Đã hủy đăng ký tham gia hoạt động.")
        // Refresh activity data
        // TODO: Refresh activity data
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

  // Use participants from activity data or empty array
  const participants = activity?.participants || []

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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cover Image */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <img
            src={activity.thumbnail || "/placeholder.svg"}
            alt={activity.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-3 mb-2">
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
            <h1 className="text-4xl font-bold mb-2">{activity.title}</h1>
            <p className="text-lg opacity-90">{activity.organizer}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                          width: `${(activity.currentParticipants / activity.maxParticipants) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {!isRegistered ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full btn-primary" disabled={isPreview}>
                          Đăng ký tham gia
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Đăng ký tham gia hoạt động</DialogTitle>
                          <DialogDescription>
                            Vui lòng cho biết lý do bạn muốn tham gia hoạt động này
                          </DialogDescription>
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
                          <Button variant="outline" disabled={isRegistering}>Hủy</Button>
                          <Button onClick={handleRegister} className="btn-primary" disabled={isPreview || isRegistering}>
                            {isRegistering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
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
                  )}

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

              <TabsContent value="overview" className="space-y-4">
                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Giới thiệu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{activity.description}</p>
                  </CardContent>
                </Card>

                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Môn thi đấu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-3">
                      {activity.sportsCategories.map((sport, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                          <Trophy className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{sport}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover-lift">
                  <CardHeader>
                    <CardTitle>Quy định tham gia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activity.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rule}</span>
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
                              <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{participant.name}</p>
                              <p className="text-sm text-gray-600">Lớp {participant.class}</p>
                            </div>
                          </div>
                          <Badge
                            className={
                              participant.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {participant.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                          </Badge>
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

