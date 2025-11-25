import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"
import { Checkbox } from "@/common/components/ui/checkbox"
import { ArrowLeft, Sparkles, Calendar, Clock, MapPin, Wand2, Download, Share2 } from "lucide-react"
import { toast } from "react-toastify"
import { ROUTES } from "@/common/constants/routes"
import { activityService } from "@/features/activities/services/activity.service"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { ClassGroupService } from "@/services/classgroup.service"

export default function AISchedule() {
  const params = useParams()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [classGroups, setClassGroups] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const [formData, setFormData] = useState({
    sportId: null,
    classGroupIds: [],
    startDate: "",
    endDate: "",
    matchDuration: "01:00",
    preferredStartTime: "08:00",
    preferredEndTime: "17:00",
    availableLocations: [],
    maxMatchesPerDay: 10,
    minGapBetweenMatches: 30,
    tournamentFormat: "SingleElimination",
    userNotes: "", // Ghi chú cho AI
  })

  // Load activity data
  useEffect(() => {
    const loadActivity = async () => {
      if (!params.id) return
      
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await executeApiCall(
          activityService.getActivityById.bind(activityService),
          [params.id, token],
          { setLoading }
        )
        
        if (response?.data) {
          setActivity(response.data)
          // Set default values from activity
          if (response.data.startDate) {
            setFormData(prev => ({
              ...prev,
              startDate: response.data.startDate.split("T")[0],
            }))
          }
          if (response.data.endDate) {
            setFormData(prev => ({
              ...prev,
              endDate: response.data.endDate.split("T")[0],
            }))
          }
          if (response.data.location) {
            setFormData(prev => ({
              ...prev,
              availableLocations: [response.data.location],
            }))
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin hoạt động")
        console.error("Error loading activity:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadActivity()
  }, [params.id])

  // Load class groups
  useEffect(() => {
    const loadClassGroups = async () => {
      setLoadingClasses(true)
      try {
        const token = localStorage.getItem("token")
        const response = await ClassGroupService.list({ pageNumber: 1, pageSize: 100 }, token)
        
        const data = response?.data?.data || response?.data || []
        const filtered = data.filter(c => !c.isDeleted)
        
        // Sort by grade first, then by name alphabetically
        const sorted = filtered.sort((a, b) => {
          // Sort by grade (null/undefined grades go last)
          const gradeA = a.grade ?? 999
          const gradeB = b.grade ?? 999
          if (gradeA !== gradeB) {
            return gradeA - gradeB
          }
          // If same grade, sort by name alphabetically
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        
        setClassGroups(sorted)
      } catch (error) {
        console.error("Error loading class groups:", error)
        toast.error("Không thể tải danh sách lớp")
      } finally {
        setLoadingClasses(false)
      }
    }
    
    loadClassGroups()
  }, [])

  const handleGenerate = async () => {
    if (!formData.sportId || formData.classGroupIds.length < 2) {
      toast.error("Vui lòng chọn môn thể thao và ít nhất 2 lớp")
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
      return
    }

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("token")
      
      // Parse time strings to TimeSpan format
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number)
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
      }

      const requestData = {
        activityId: parseInt(params.id),
        sportId: formData.sportId,
        classGroupIds: formData.classGroupIds,
        startDate: formData.startDate,
        endDate: formData.endDate,
        matchDuration: parseTime(formData.matchDuration),
        preferredStartTime: formData.preferredStartTime ? parseTime(formData.preferredStartTime) : null,
        preferredEndTime: formData.preferredEndTime ? parseTime(formData.preferredEndTime) : null,
        availableLocations: formData.availableLocations,
        maxMatchesPerDay: formData.maxMatchesPerDay,
        minGapBetweenMatches: formData.minGapBetweenMatches,
        tournamentFormat: formData.tournamentFormat,
        userNotes: formData.userNotes || null,
      }

      const response = await executeApiCall(
        activityService.generateTournamentSchedule.bind(activityService),
        [params.id, requestData, token],
        { setLoading: setIsGenerating }
      )

      if (response?.data?.success) {
        // Format response for display
        const formattedSchedule = formatScheduleForDisplay(response.data)
        setGeneratedSchedule(formattedSchedule)
        toast.success("AI đã tạo lịch thi đấu tối ưu cho bạn")
      } else {
        toast.error(response?.data?.explanation || "Không thể tạo lịch thi đấu")
      }
    } catch (error) {
      console.error("Error generating schedule:", error)
      toast.error(error?.message || "Có lỗi xảy ra khi tạo lịch thi đấu")
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to format time (remove AM/PM, ensure HH:mm format)
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return "00:00"
    // Remove AM/PM if present
    let time = timeStr.toString().replace(/\s*(AM|PM|am|pm)/gi, "").trim()
    // If format is HH:mm:ss, take only HH:mm
    if (time.includes(":")) {
      const parts = time.split(":")
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }
    return time
  }

  // Format API response to display format
  const formatScheduleForDisplay = (apiResponse) => {
    const matches = apiResponse.generatedMatches || []
    
    // Create a map of matchNumber -> match for quick lookup
    const matchMap = {}
    matches.forEach(match => {
      matchMap[match.matchNumber] = match
    })
    
    // Find matches that lead to a specific match (NextMatchId)
    // Handle both camelCase and PascalCase from API
    const findPreviousMatches = (targetMatchNumber) => {
      return matches.filter(m => {
        const nextMatchId = m.nextMatchId || m.NextMatchId
        return nextMatchId === targetMatchNumber
      })
    }
    
    // Group matches by date
    const matchesByDate = {}
    matches.forEach(match => {
      if (!match.matchDate) return
      const date = match.matchDate.split("T")[0]
      if (!matchesByDate[date]) {
        matchesByDate[date] = []
      }
      matchesByDate[date].push(match)
    })

    // Convert to days format
    const days = Object.keys(matchesByDate)
      .sort()
      .map(date => ({
        date,
        events: matchesByDate[date]
          .sort((a, b) => {
            const timeA = a.startTime || "00:00"
            const timeB = b.startTime || "00:00"
            return timeA.localeCompare(timeB)
          })
          .map(match => {
            let teamsText = match.notes || "Chờ kết quả vòng trước"
            const matchInfo = {
              previousMatches: [],
              nextMatch: null,
            }
            
            // Find previous matches that lead to this match
            const previousMatches = findPreviousMatches(match.matchNumber)
            
            if (match.classGroup1Id && match.classGroup2Id) {
              const class1Name = getClassName(match.classGroup1Id)
              const class2Name = getClassName(match.classGroup2Id)
              teamsText = `${class1Name} vs ${class2Name}`
            } else if (match.classGroup1Id) {
              teamsText = `${getClassName(match.classGroup1Id)} vs Chờ kết quả vòng trước`
            } else if (match.classGroup2Id) {
              teamsText = `Chờ kết quả vòng trước vs ${getClassName(match.classGroup2Id)}`
            }
            
            // Build previous matches info
            if (previousMatches.length > 0) {
              matchInfo.previousMatches = previousMatches.map(prevMatch => {
                const prevDate = prevMatch.matchDate ? prevMatch.matchDate.split("T")[0] : null
                const prevTime = formatTimeForDisplay(prevMatch.startTime)
                const prevRound = prevMatch.roundName || `Vòng ${prevMatch.round}`
                const prevTeams = prevMatch.classGroup1Id && prevMatch.classGroup2Id
                  ? `${getClassName(prevMatch.classGroup1Id)} vs ${getClassName(prevMatch.classGroup2Id)}`
                  : `Trận #${prevMatch.matchNumber}`
                
                return {
                  matchNumber: prevMatch.matchNumber,
                  round: prevRound,
                  teams: prevTeams,
                  date: prevDate,
                  time: prevTime,
                }
              })
            }
            
            // Find next match (where winner goes)
            const nextMatchId = match.nextMatchId || match.NextMatchId
            if (nextMatchId) {
              const nextMatch = matchMap[nextMatchId]
              if (nextMatch) {
                const nextDate = nextMatch.matchDate ? nextMatch.matchDate.split("T")[0] : null
                const nextTime = formatTimeForDisplay(nextMatch.startTime)
                const nextRound = nextMatch.roundName || `Vòng ${nextMatch.round}`
                matchInfo.nextMatch = {
                  matchNumber: nextMatchId,
                  round: nextRound,
                  date: nextDate,
                  time: nextTime,
                }
              }
            }
            
            return {
              time: formatTimeForDisplay(match.startTime),
              sport: match.roundName || `Round ${match.round}`,
              venue: match.location || "N/A",
              teams: teamsText,
              matchNumber: match.matchNumber,
              round: match.round,
              previousMatches: matchInfo.previousMatches,
              nextMatch: matchInfo.nextMatch,
              notes: match.notes,
            }
          }),
      }))

    return {
      days,
      stats: {
        totalEvents: apiResponse.totalMatches || 0,
        totalDays: days.length,
        averageEventsPerDay: days.length > 0 ? (apiResponse.totalMatches || 0) / days.length : 0,
        conflictsResolved: apiResponse.isOptimal ? apiResponse.totalMatches : 0,
      },
      rawData: apiResponse, // Keep raw data for applying
    }
  }

  const handleApplySchedule = () => {
    toast.success("Lịch thi đấu đã được áp dụng")
    navigate(`/activities/${params.id}`)
  }

  const handleSportSelect = (sportId) => {
    setFormData((prev) => ({
      ...prev,
      sportId: prev.sportId === sportId ? null : sportId,
    }))
  }

  // Helper function to get class name (grade + name)
  const getClassName = (classGroupId) => {
    const classGroup = classGroups.find(cg => {
      const id = typeof cg.id === 'number' ? cg.id : parseInt(cg.id)
      return id === classGroupId
    })
    if (!classGroup) return `Lớp ${classGroupId}`
    const grade = classGroup.grade ? `${classGroup.grade}` : ''
    const name = classGroup.name || ''
    return grade && name ? `${grade}${name}` : name || `Lớp ${classGroupId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link to={ROUTES.ADMIN.ACTIVITIES}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Tạo lịch thi đấu</h1>
          </div>
          <p className="text-gray-600 mt-1">Sử dụng AI để tự động tạo lịch thi đấu tối ưu</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Thông tin sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity && (
                <div>
                  <Label>Tên hoạt động</Label>
                  <Input
                    value={activity.title || "N/A"}
                    disabled
                    className="mt-2 bg-gray-50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Môn thể thao</Label>
                <div className="space-y-2">
                  {activity?.sports && activity.sports.length > 0 ? (
                    activity.sports.map((sport) => {
                      const sportId = typeof sport.id === 'number' ? sport.id : parseInt(sport.id)
                      const isSelected = formData.sportId === sportId
                      return (
                        <div key={sport.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`sport-${sport.id}`}
                            checked={isSelected}
                            onChange={(checked) => {
                              if (checked) {
                                handleSportSelect(sportId)
                              } else {
                                handleSportSelect(null)
                              }
                            }}
                          />
                          <Label htmlFor={`sport-${sport.id}`} className="cursor-pointer">
                            {sport.sportName}
                          </Label>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có môn thể thao nào. Vui lòng thêm môn thể thao vào hoạt động trước.</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Danh sách lớp tham gia</Label>
                {loadingClasses ? (
                  <p className="text-sm text-gray-500">Đang tải danh sách lớp...</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {classGroups.length > 0 ? (
                      <>
                        {/* Select All Checkbox */}
                        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-200">
                          <Checkbox
                            id="select-all-classes"
                            checked={formData.classGroupIds.length === classGroups.length && classGroups.length > 0}
                            onChange={(checked) => {
                              if (checked) {
                                const allIds = classGroups.map(cg => 
                                  typeof cg.id === 'number' ? cg.id : parseInt(cg.id)
                                )
                                setFormData(prev => ({
                                  ...prev,
                                  classGroupIds: allIds
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  classGroupIds: []
                                }))
                              }
                            }}
                          />
                          <Label htmlFor="select-all-classes" className="cursor-pointer font-semibold">
                            Chọn tất cả ({classGroups.length} lớp)
                          </Label>
                        </div>
                        
                        {/* Group by grade */}
                        {Object.entries(
                          classGroups.reduce((acc, classGroup) => {
                            const grade = classGroup.grade ?? 'Không xác định'
                            if (!acc[grade]) {
                              acc[grade] = []
                            }
                            acc[grade].push(classGroup)
                            return acc
                          }, {})
                        )
                          .sort(([gradeA], [gradeB]) => {
                            if (gradeA === 'Không xác định') return 1
                            if (gradeB === 'Không xác định') return -1
                            return parseInt(gradeA) - parseInt(gradeB)
                          })
                          .map(([grade, classes]) => (
                            <div key={grade} className="mb-3">
                              <div className="text-xs font-semibold text-gray-600 mb-1 px-1">
                                Khối {grade}
                              </div>
                              <div className="space-y-1 pl-2">
                                {classes.map((classGroup) => {
                                  const classId = typeof classGroup.id === 'number' ? classGroup.id : parseInt(classGroup.id)
                                  const isSelected = formData.classGroupIds.includes(classId)
                                  return (
                                    <div key={classGroup.id} className="flex items-center gap-2">
                                      <Checkbox
                                        id={`class-${classGroup.id}`}
                                        checked={isSelected}
                                        onChange={(checked) => {
                                          if (checked) {
                                            setFormData(prev => ({
                                              ...prev,
                                              classGroupIds: [...prev.classGroupIds, classId]
                                            }))
                                          } else {
                                            setFormData(prev => ({
                                              ...prev,
                                              classGroupIds: prev.classGroupIds.filter(id => id !== classId)
                                            }))
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`class-${classGroup.id}`} className="cursor-pointer flex-1 text-sm">
                                        {classGroup.grade ? `${classGroup.grade}${classGroup.name}` : classGroup.name}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Không có lớp nào</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Đã chọn: {formData.classGroupIds.length} lớp. Cần ít nhất 2 lớp để tạo lịch thi đấu.
                </p>
              </div>

              <div>
                <Label htmlFor="availableLocations">Địa điểm (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="availableLocations"
                  value={formData.availableLocations.join(", ")}
                  onChange={(e) => {
                    const locations = e.target.value
                      .split(",")
                      .map((loc) => loc.trim())
                      .filter((loc) => loc.length > 0)
                    setFormData({ ...formData, availableLocations: locations })
                  }}
                  rows={2}
                  placeholder="Sân bóng A, Sân bóng chuyền, Đường chạy 1"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="matchDuration">Thời lượng mỗi trận (giờ:phút)</Label>
                  <Input
                    id="matchDuration"
                    type="time"
                    value={formData.matchDuration}
                    onChange={(e) => setFormData({ ...formData, matchDuration: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="maxMatchesPerDay">Số trận tối đa mỗi ngày</Label>
                  <Input
                    id="maxMatchesPerDay"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxMatchesPerDay}
                    onChange={(e) => setFormData({ ...formData, maxMatchesPerDay: parseInt(e.target.value) || 10 })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredStartTime">Giờ bắt đầu ưu tiên</Label>
                  <Input
                    id="preferredStartTime"
                    type="time"
                    value={formData.preferredStartTime}
                    onChange={(e) => setFormData({ ...formData, preferredStartTime: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredEndTime">Giờ kết thúc ưu tiên</Label>
                  <Input
                    id="preferredEndTime"
                    type="time"
                    value={formData.preferredEndTime}
                    onChange={(e) => setFormData({ ...formData, preferredEndTime: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Định dạng giải đấu</Label>
                <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
                  Loại trực tiếp (Single Elimination)
                </div>
              </div>

              <div>
                <Label htmlFor="userNotes">
                  Ghi chú cho AI (tùy chọn)
                </Label>
                <Textarea
                  id="userNotes"
                  value={formData.userNotes}
                  onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
                  placeholder="Ví dụ: Ưu tiên buổi sáng, tránh giờ cao điểm, cuối tuần tốt hơn..."
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 AI sẽ đánh giá và ưu tiên các slot dựa trên ghi chú của bạn
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo lịch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo lịch với AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Schedule */}
        <div className="space-y-6">
          {!generatedSchedule ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Chưa có lịch thi đấu</h3>
                <p className="text-gray-600 text-sm">Điền thông tin bên trái và nhấn "Tạo lịch với AI" để bắt đầu</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">Tổng sự kiện</p>
                    <p className="text-2xl font-bold text-blue-600">{generatedSchedule.stats.totalEvents}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">Xung đột đã giải quyết</p>
                    <p className="text-2xl font-bold text-green-600">{generatedSchedule.stats.conflictsResolved}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lịch thi đấu đã tạo</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedSchedule.days.map((day, dayIdx) => (
                    <div key={dayIdx}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600 text-white">Ngày {dayIdx + 1}</Badge>
                        <span className="font-semibold">{day.date}</span>
                      </div>
                      <div className="space-y-2">
                        {day.events.map((event, eventIdx) => {
                          // Format date for display
                          const formatDate = (dateStr) => {
                            if (!dateStr) return ""
                            const date = new Date(dateStr)
                            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                          }
                          
                          return (
                            <div key={eventIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="bg-blue-600 text-white rounded px-2 py-1 text-sm font-semibold min-w-[60px] text-center">
                                {event.time}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{event.sport}</p>
                                  <Badge variant="outline" className="text-xs">
                                    Trận #{event.matchNumber}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.venue}
                                  </span>
                                  <span className="font-medium">{event.teams}</span>
                                </div>
                                
                                {/* Hiển thị thông tin về các trận trước đó */}
                                {event.previousMatches && event.previousMatches.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Thắng các trận sau sẽ đấu ở trận này:</p>
                                    {event.previousMatches.map((prevInfo, idx) => (
                                      <div key={idx} className="text-xs text-orange-600 flex items-start gap-1 mb-1">
                                        <span className="mt-0.5">⬅️</span>
                                        <span>
                                          <strong>Trận #{prevInfo.matchNumber}</strong> ({prevInfo.round}: {prevInfo.teams})
                                          {prevInfo.date && prevInfo.time && (
                                            <span> lúc <strong>{prevInfo.time}</strong> ngày <strong>{formatDate(prevInfo.date)}</strong></span>
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Hiển thị thông tin về trận tiếp theo */}
                                {event.nextMatch && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <div className="text-xs text-blue-600 flex items-start gap-1">
                                      <span className="mt-0.5">➡️</span>
                                      <span>
                                        <strong>Thắng</strong> sẽ vào <strong>{event.nextMatch.round}</strong> 
                                        {event.nextMatch.date && event.nextMatch.time && (
                                          <span> lúc <strong>{event.nextMatch.time}</strong> ngày <strong>{formatDate(event.nextMatch.date)}</strong></span>
                                        )}
                                        {" "}(Trận #{event.nextMatch.matchNumber})
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Hiển thị notes nếu có và không có previousMatches/nextMatch */}
                                {!event.previousMatches?.length && !event.nextMatch && event.notes && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-gray-500 italic">{event.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleApplySchedule}>
                  Áp dụng lịch này
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                  Tạo lại
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
