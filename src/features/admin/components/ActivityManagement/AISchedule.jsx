import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"
import { Checkbox } from "@/common/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog"
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Wand2,
  Download,
  Share2,
  Upload,
  FileText,
  X,
  List,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Plus,
  Minus,
  AlertTriangle,
  Info,
} from "lucide-react"
import { toast } from "react-toastify"
import { ROUTES } from "@/common/constants/routes"
import { activityService } from "@/features/activities/services/activity.service"
import { activityMatchService } from "@/services/activityMatch.service"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { ClassGroupService } from "@/services/classgroup.service"
import { timetableService } from "@/services/timetable.service"
import { AcademicYearService } from "@/services/academicyear.service"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { BracketTree } from "./BracketTree"

// Viewer riêng cho bracket chính thức, được memo hóa để tránh re-render không cần thiết
const OfficialBracketViewer = memo(
  ({ matches, official, onMatchClick, getClassNameById }) => {
    if (!matches || !matches.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Sparkles className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm">Chưa có lịch thi đấu chính thức.</p>
        </div>
      )
    }

    return (
      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 h-[700px]">
        <TransformWrapper
          initialScale={0.8}
          minScale={0.5}
          maxScale={2.5}
          centerOnInit={true}
          limitToBounds={false}
          // Tắt zoom bằng con lăn để tránh lag, chỉ dùng nút + / - cho zoom
          wheel={{ disabled: true }}
          // Panning đơn giản, không velocity animation để kéo thả mượt
          panning={{
            disabled: false,
            excluded: ["button", "input", "select"],
          }}
          alignmentAnimation={{ animationTime: 0 }}
          velocityAnimation={{ animationTime: 0 }}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <div className="relative w-full h-full">
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white shadow-md border border-slate-200 rounded-lg p-1.5">
                <Button size="icon" variant="ghost" onClick={() => zoomIn(0.12)}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => zoomOut(0.12)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => centerView()}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => resetTransform()}
                  className="text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                }}
              >
                <BracketTree
                  matches={matches}
                  official={official}
                  onMatchClick={onMatchClick}
                  getClassNameById={getClassNameById}
                />
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      </div>
    )
  },
  (prev, next) => prev.matches === next.matches && prev.official === next.official
)

export default function AISchedule() {
  const params = useParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [classGroups, setClassGroups] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [aiViewMode, setAiViewMode] = useState("list") // "list" or "bracket" for AI output
  const [isFormCollapsed, setIsFormCollapsed] = useState(false) // Collapse form when schedule is generated
  const [editedMatches, setEditedMatches] = useState({})
  const [isApplyingSchedule, setIsApplyingSchedule] = useState(false)
  const [publishSchedule, setPublishSchedule] = useState(false)
  const [officialBracket, setOfficialBracket] = useState(null)
  const [loadingOfficialBracket, setLoadingOfficialBracket] = useState(false)
  const [matchResults, setMatchResults] = useState({})
  const [officialViewCollapsed, setOfficialViewCollapsed] = useState(false)
  const [selectedBracketMatch, setSelectedBracketMatch] = useState(null) // match được click trong cây
  // Main tabs: ai-output (AI proposals) vs official match management
  const [activeTab, setActiveTab] = useState("ai") // "ai" | "match"
  const [officialViewMode, setOfficialViewMode] = useState("bracket") // "bracket" | "list" for official tab
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [slotWarningsDialogOpen, setSlotWarningsDialogOpen] = useState(false)
  const [slotWarnings, setSlotWarnings] = useState([])
  const [slotConflicts, setSlotConflicts] = useState([])
  const [dateValidationErrors, setDateValidationErrors] = useState({})
  const handleBracketMatchClick = useCallback((match) => setSelectedBracketMatch(match), [])
  const [formData, setFormData] = useState({
    sportId: null,
    classGroupIds: [],
    startDate: "",
    endDate: "",
    matchDuration: "01:00",
    preferredStartTime: "08:00",
    preferredEndTime: "17:00",
    availableLocations: [],
    availableLocationsRaw: "", // Lưu raw string để user có thể gõ dấu phẩy
    maxMatchesPerDay: 10,
    minGapBetweenMatches: 30,
    tournamentFormat: "SingleElimination",
    userNotes: "", // Ghi chú cho AI
  })

  // Timetable upload state
  const [timetableFile, setTimetableFile] = useState(null)
  const [isUploadingTimetable, setIsUploadingTimetable] = useState(false)
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null)
  const [timetableUploaded, setTimetableUploaded] = useState(false)

  const memoizedOfficialMatches = useMemo(() => {
    if (!officialBracket?.rounds?.length) return []
    // Lấy toàn bộ matches của bracket chính thức (full bracket)
    return officialBracket.rounds.flatMap((round) => round.matches || [])
  }, [officialBracket])

  const officialRounds = useMemo(() => officialBracket?.rounds || [], [officialBracket])

  const resolveClassName = useCallback(
    (id) => {
      if (!id || !classGroups?.length) return null
      const cg = classGroups.find((c) => {
        const cid = typeof c.id === "number" ? c.id : parseInt(c.id)
        return cid === id
      })
      if (!cg) return null
      const grade = cg.grade ? `${cg.grade}` : ""
      const name = cg.name || ""
      return grade && name ? `${grade}${name}` : name || null
    },
    [classGroups]
  )

  const normalizeDateString = (dateStr) => {
    if (!dateStr) return ""
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr
  }

  // Validate dates and times inline
  const validateDatesAndTimes = (data) => {
    const errors = {}
    
    // Validate ngày bắt đầu và ngày kết thúc
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      
      // Ngày bắt đầu phải <= ngày kết thúc
      if (startDate > endDate) {
        errors.startDate = "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc"
        errors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"
      }
      
      // Nếu cùng ngày, validate giờ
      if (startDate.toDateString() === endDate.toDateString()) {
        const parseTimeToMinutes = (timeStr) => {
          if (!timeStr) return null
          const [h, m] = timeStr.split(":").map(Number)
          if (Number.isNaN(h) || Number.isNaN(m)) return null
          return h * 60 + m
        }

        const startMinutes = parseTimeToMinutes(data.preferredStartTime)
        const endMinutes = parseTimeToMinutes(data.preferredEndTime)

        if (startMinutes != null && endMinutes != null) {
          if (endMinutes <= startMinutes) {
            errors.preferredStartTime = "Giờ bắt đầu phải trước giờ kết thúc (cùng ngày)"
            errors.preferredEndTime = "Giờ kết thúc phải sau giờ bắt đầu (cùng ngày)"
          }
        } else {
          // Nếu cùng ngày nhưng thiếu giờ
          if (startMinutes == null) {
            errors.preferredStartTime = "Khi ngày bắt đầu và kết thúc trùng nhau, cần nhập giờ bắt đầu"
          }
          if (endMinutes == null) {
            errors.preferredEndTime = "Khi ngày bắt đầu và kết thúc trùng nhau, cần nhập giờ kết thúc"
          }
        }
      }
      // Nếu không cùng ngày, không validate giờ (không set errors cho time fields)
    }
    
    return errors
  }

  const normalizeTimeString = (timeStr) => {
    if (!timeStr) return ""
    const time = timeStr.toString().replace(/\s*(AM|PM|am|pm)/gi, "").trim()
    const parts = time.split(":")
    const hours = (parts[0] ?? "00").padStart(2, "0")
    const minutes = (parts[1] ?? "00").padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // Cộng thêm duration (ví dụ formData.matchDuration) vào một giờ HH:mm
  const addDurationToTime = (timeStr, durationStr) => {
    const base = normalizeTimeString(timeStr || "00:00")
    const duration = normalizeTimeString(durationStr || "00:00")

    const [h1, m1] = base.split(":").map((v) => parseInt(v || "0", 10))
    const [h2, m2] = duration.split(":").map((v) => parseInt(v || "0", 10))

    if (Number.isNaN(h1) || Number.isNaN(m1) || Number.isNaN(h2) || Number.isNaN(m2)) {
      // Fallback an toàn
      return base
    }

    const totalMinutes = h1 * 60 + m1 + h2 * 60 + m2
    const outH = Math.floor(totalMinutes / 60) % 24
    const outM = totalMinutes % 60

    return `${outH.toString().padStart(2, "0")}:${outM.toString().padStart(2, "0")}`
  }

  const toBackendTimeSpan = (timeStr) => {
    if (!timeStr) return null
    return `${normalizeTimeString(timeStr)}:00`
  }

  const buildEditedMatchMap = useCallback(
    (matches = []) => {
      const map = {}
      matches.forEach((match) => {
        const baseStartTime =
          normalizeTimeString(match.startTime) ||
          normalizeTimeString(formData.preferredStartTime) ||
          "08:00"

        const baseEndTime =
          normalizeTimeString(match.endTime) ||
          addDurationToTime(baseStartTime, formData.matchDuration) ||
          "09:00"

        map[match.matchNumber] = {
          matchDate: normalizeDateString(match.matchDate) || formData.startDate || "",
          startTime: baseStartTime,
          endTime: baseEndTime,
          location: match.location || formData.availableLocations[0] || "",
        }
      })
      return map
    },
    [formData.startDate, formData.preferredStartTime, formData.matchDuration, formData.availableLocations]
  )

  // Load activity data - dùng endpoint tối ưu chỉ lấy các trường cần thiết
  const loadActivity = useCallback(async () => {
      if (!params.id) return
      
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        // Dùng getScheduleInfo thay vì getActivityById để tối ưu performance
        const response = await executeApiCall(
          activityService.getScheduleInfo.bind(activityService),
          [params.id, token],
          { setLoading }
        )
        
        if (response?.data) {
          setActivity(response.data)
          if (response.data.startDate) {
          setFormData((prev) => ({
              ...prev,
              startDate: response.data.startDate.split("T")[0],
            }))
          }
          if (response.data.endDate) {
          setFormData((prev) => ({
              ...prev,
              endDate: response.data.endDate.split("T")[0],
            }))
          }
          if (response.data.location) {
          setFormData((prev) => ({
              ...prev,
              availableLocations: [response.data.location],
            availableLocationsRaw: response.data.location,
          }))
        }
        // Tự động chọn môn thể thao đầu tiên để load bracket chính thức
        if (response.data.sports && response.data.sports.length > 0) {
          const firstSport = response.data.sports[0]
          const firstSportId =
            typeof firstSport.id === "number" ? firstSport.id : parseInt(firstSport.id)
          setFormData((prev) => ({
            ...prev,
            sportId: prev.sportId ?? firstSportId,
            }))
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin hoạt động")
        console.error("Error loading activity:", error)
      } finally {
        setLoading(false)
      }
  }, [params.id])
    
  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  // Validate dates and times khi formData thay đổi
  useEffect(() => {
    setDateValidationErrors(validateDatesAndTimes(formData))
  }, [formData.startDate, formData.endDate, formData.preferredStartTime, formData.preferredEndTime])

  const fetchOfficialBracket = useCallback(
    async (sportId) => {
      if (!params.id || !sportId) return

      setLoadingOfficialBracket(true)
      try {
        const token = localStorage.getItem("token")
        const response = await executeApiCall(
          activityMatchService.getBracket.bind(activityMatchService),
          [params.id, sportId, null, token],
          { setLoading: setLoadingOfficialBracket }
        )

        if (response?.data) {
          setOfficialBracket(response.data)
        } else {
          setOfficialBracket(null)
        }
      } catch (error) {
        const status = error?.statusCode ?? error?.status ?? error?.response?.status
        if (status === 404) {
          setOfficialBracket(null)
        } else {
          setOfficialBracket(null)
          // Optionally show toast for real errors:
          // toast.error("Không thể tải lịch thi đấu chính thức")
        }
      } finally {
        setLoadingOfficialBracket(false)
      }
    },
    [params.id]
  )

  useEffect(() => {
    if (!activity || !formData.sportId) {
      setOfficialBracket(null)
      return
    }
    fetchOfficialBracket(formData.sportId)
  }, [activity, formData.sportId, fetchOfficialBracket])

  useEffect(() => {
    if (!officialBracket?.rounds) {
      setMatchResults({})
      return
    }

    const initialResults = {}
    officialBracket.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        initialResults[match.id] = {
          score1: match.score1 ?? 0,
          score2: match.score2 ?? 0,
          winnerClassGroupId: match.winnerClassGroupId ?? "",
          markAsCompleted: match.status === 2,
        }
      })
    })
    setMatchResults(initialResults)
  }, [officialBracket])

  // Nếu đã có officialBracket mà chưa có generatedSchedule, ưu tiên tab "Quản lý giải đấu"
  useEffect(() => {
    if (officialBracket?.rounds?.length && !generatedSchedule) {
      setActiveTab("match")
    }
  }, [officialBracket, generatedSchedule])

  // Load current academic year
  useEffect(() => {
    const loadAcademicYear = async () => {
      try {
        const token = localStorage.getItem("token")
        const academicYear = await AcademicYearService.getCurrent(token)
        setCurrentAcademicYear(academicYear)
      } catch (error) {
        console.error("Error loading academic year:", error)
      }
    }
    
    loadAcademicYear()
  }, [])

  // Load class groups - chỉ lấy các lớp đã đăng ký tham gia activity (ưu tiên đúng niên khóa hiện tại)
  useEffect(() => {
    const loadClassGroups = async () => {
      if (!activity || !activity.participants || activity.participants.length === 0) {
        setClassGroups([])
        setLoadingClasses(false)
        return
      }

      setLoadingClasses(true)
      try {
        const token = localStorage.getItem("token")

        // Lấy danh sách ClassGroupId duy nhất từ participants
        const registeredClassGroupIds = new Set()
        activity.participants.forEach(participant => {
          if (participant.classGroupId && !participant.isDeleted) {
            registeredClassGroupIds.add(participant.classGroupId)
          }
        })

        if (registeredClassGroupIds.size === 0) {
          setClassGroups([])
          setLoadingClasses(false)
          return
        }

        // Lấy thông tin đầy đủ của các lớp đã đăng ký
        // pageSize được scale theo số lớp tham gia để hạn chế thiếu dữ liệu nhưng vẫn giữ hiệu năng
        const pageSize = Math.max(registeredClassGroupIds.size, 50)
        const allClassesResponse = await ClassGroupService.list(
          { pageNumber: 1, pageSize },
          token
        )
        let allClasses = allClassesResponse?.data?.data || allClassesResponse?.data || []

        // Nếu backend trả về cấu trúc phân trang chuẩn, cố gắng lấy thêm trang khi cần
        if (allClassesResponse?.data?.totalCount > allClasses.length) {
          const total = allClassesResponse.data.totalCount
          const pages = Math.ceil(total / pageSize)
          const extraRequests = []
          for (let page = 2; page <= pages; page++) {
            extraRequests.push(
              ClassGroupService.list({ pageNumber: page, pageSize }, token)
            )
          }

          const extraResponses = await Promise.all(extraRequests)
          extraResponses.forEach((res) => {
            const items = res?.data?.data || res?.data || []
            allClasses = allClasses.concat(items)
          })
        }
        
        // Lọc chỉ các lớp đã đăng ký
        let registeredClasses = allClasses.filter(c => 
          !c.isDeleted && 
          registeredClassGroupIds.has(typeof c.id === 'number' ? c.id : parseInt(c.id))
        )

        // Nếu đã có currentAcademicYear, chỉ giữ các lớp đúng niên khóa để tránh lỗi BE
        if (currentAcademicYear?.id) {
          registeredClasses = registeredClasses.filter(c => {
            // backend có thể dùng academicYearId hoặc AcademicYearId
            const academicYearId = c.academicYearId ?? c.AcademicYearId
            return academicYearId == null || academicYearId === currentAcademicYear.id
          })
        }
        
        // Sort by grade first, then by name alphabetically
        const sorted = registeredClasses.sort((a, b) => {
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
        toast.error("Không thể tải danh sách lớp đã đăng ký")
        setClassGroups([])
      } finally {
        setLoadingClasses(false)
      }
    }
    
    // Chỉ load khi đã có activity data
    if (activity) {
      loadClassGroups()
    }
  }, [activity])

  // Handle timetable file upload
  const handleTimetableFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedExtensions = ['.csv', '.xlsx', '.xls']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Chỉ chấp nhận file CSV hoặc Excel (.csv, .xlsx, .xls)")
      e.target.value = ''
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File không được vượt quá 10MB")
      e.target.value = ''
      return
    }

    setTimetableFile(file)
    setTimetableUploaded(false)
  }

  // Upload timetable file
  const handleUploadTimetable = async () => {
    if (!timetableFile) {
      toast.error("Vui lòng chọn file thời khóa biểu")
      return
    }

    if (!currentAcademicYear?.id) {
      toast.error("Không tìm thấy niên khóa hiện tại")
      return
    }

    setIsUploadingTimetable(true)
    try {
      const token = localStorage.getItem("token")
      
      // Upload file - import cho tất cả lớp trong niên khóa (classGroupId = null)
      const response = await executeApiCall(
        timetableService.importTimetable.bind(timetableService),
        [timetableFile, currentAcademicYear.id, null, true, token],
        { setLoading: setIsUploadingTimetable }
      )

      if (response?.data) {
        const result = response.data.data || response.data
        if (result.importedCount > 0) {
          toast.success(`Đã import thành công ${result.importedCount} bản ghi thời khóa biểu`)
          setTimetableUploaded(true)
          setTimetableFile(null) // Clear file after successful upload
        } else {
          toast.warning(result.message || "Không có dữ liệu nào được import")
        }
        if (result.failedCount > 0) {
          toast.warning(`${result.failedCount} bản ghi lỗi. Vui lòng kiểm tra lại file.`)
        }
      }
    } catch (error) {
      console.error("Error uploading timetable:", error)
      toast.error(error?.message || "Có lỗi xảy ra khi upload file thời khóa biểu")
    } finally {
      setIsUploadingTimetable(false)
    }
  }

  const handleRemoveTimetableFile = () => {
    setTimetableFile(null)
    setTimetableUploaded(false)
  }

  const handleGenerate = async () => {
    // Validation đầy đủ trước khi generate
    const validationErrors = []
    
    // Kiểm tra date validation errors trước
    const dateErrors = validateDatesAndTimes(formData)
    if (Object.keys(dateErrors).length > 0) {
      setDateValidationErrors(dateErrors)
      toast.error(Object.values(dateErrors)[0])
      return
    }

    if (!formData.sportId) {
      validationErrors.push("Vui lòng chọn môn thể thao")
    }
    
    if (!formData.classGroupIds || formData.classGroupIds.length < 2) {
      validationErrors.push("Cần ít nhất 2 lớp để tạo lịch thi đấu")
    }
    
    if (!formData.startDate) {
      validationErrors.push("Vui lòng chọn ngày bắt đầu")
    }
    
    if (!formData.endDate) {
      validationErrors.push("Vui lòng chọn ngày kết thúc")
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Ngày bắt đầu phải SAU ngày hiện tại
      if (startDate <= today) {
        validationErrors.push("Ngày bắt đầu phải sau ngày hiện tại")
      }
      
      if (startDate > endDate) {
        validationErrors.push("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc")
      }

      // Nếu startDate và endDate trùng nhau → bắt buộc kiểm tra giờ
      if (startDate.toDateString() === endDate.toDateString()) {
        const parseTimeToMinutes = (timeStr) => {
          if (!timeStr) return null
          const [h, m] = timeStr.split(":").map(Number)
          if (Number.isNaN(h) || Number.isNaN(m)) return null
          return h * 60 + m
        }

        const startMinutes = parseTimeToMinutes(formData.preferredStartTime)
        const endMinutes = parseTimeToMinutes(formData.preferredEndTime)

        if (startMinutes == null || endMinutes == null) {
          validationErrors.push("Khi ngày bắt đầu và kết thúc trùng nhau, cần nhập cả giờ bắt đầu và giờ kết thúc")
        } else {
          if (endMinutes <= startMinutes) {
            validationErrors.push("Giờ kết thúc phải sau giờ bắt đầu")
          } else if (formData.matchDuration) {
            const [mh, mm] = formData.matchDuration.split(":").map(Number)
            if (!Number.isNaN(mh) && !Number.isNaN(mm)) {
              const matchMinutes = mh * 60 + mm
              if (endMinutes - startMinutes < matchMinutes) {
                validationErrors.push("Khoảng thời gian trong một ngày chưa đủ để xếp ít nhất 1 trận (theo thời lượng trận đấu)")
              }
            }
          }
        }
      }
    }
    
    if (!formData.availableLocations || formData.availableLocations.length === 0) {
      validationErrors.push("Vui lòng nhập ít nhất 1 sân thi đấu")
    }
    
    if (formData.maxMatchesPerDay < 1 || formData.maxMatchesPerDay > 50) {
      validationErrors.push("Số trận tối đa mỗi ngày phải từ 1 đến 50")
    }
    
    if (formData.minGapBetweenMatches < 0 || formData.minGapBetweenMatches > 120) {
      validationErrors.push("Khoảng cách giữa các trận phải từ 0 đến 120 phút")
    }
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      if (validationErrors.length > 1) {
        console.warn("Các lỗi validation khác:", validationErrors.slice(1))
      }
      return
    }

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("token")
      
      // Upload timetable file nếu có (trước khi generate schedule)
      if (timetableFile && !timetableUploaded) {
        if (!currentAcademicYear?.id) {
          toast.error("Không tìm thấy niên khóa hiện tại")
          setIsGenerating(false)
          return
        }

        try {
          const uploadResponse = await executeApiCall(
            timetableService.importTimetable.bind(timetableService),
            [timetableFile, currentAcademicYear.id, null, true, token],
            { setLoading: () => {} }
          )

          if (uploadResponse?.data) {
            const result = uploadResponse.data.data || uploadResponse.data
            if (result.importedCount > 0) {
              toast.success(`Đã import ${result.importedCount} bản ghi thời khóa biểu trước khi tạo lịch`)
              setTimetableUploaded(true)
            }
          }
        } catch (uploadError) {
          console.error("Error uploading timetable before generate:", uploadError)
          toast.warning("Có lỗi khi upload thời khóa biểu, nhưng vẫn tiếp tục tạo lịch...")
        }
      }
      
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
        setEditedMatches(buildEditedMatchMap(response.data.generatedMatches))
        setIsFormCollapsed(true) // Collapse form when schedule is generated successfully
        
        // Parse warnings và conflicts từ response
        const warnings = parseSlotWarnings(response.data, formData)
        const conflicts = response.data.slotConflicts || []
        
        // Nếu có warnings hoặc conflicts → hiển thị dialog
        if (warnings.length > 0 || conflicts.length > 0) {
          setSlotWarnings(warnings)
          setSlotConflicts(conflicts)
          setSlotWarningsDialogOpen(true)
        }
      } else {
        // Parse warnings và conflicts từ explanation khi failed
        const warnings = parseSlotWarnings(response?.data, formData)
        const conflicts = response?.data?.slotConflicts || []
        
        // Nếu backend không trả warnings/conflicts, vẫn tạo 1 warning tổng quát từ explanation
        let finalWarnings = warnings
        if (warnings.length === 0 && conflicts.length === 0) {
          const explanation = response?.data?.explanation || "Không thể tạo lịch thi đấu"
          finalWarnings = [{
            warningType: "GeneralError",
            title: "Không thể tạo lịch thi đấu",
            description: explanation,
            currentValue: "",
            recommendedValue: "",
            solution: "",
            severity: "High",
            field: ""
          }]
        }

        setSlotWarnings(finalWarnings)
        setSlotConflicts(conflicts)
        setSlotWarningsDialogOpen(true)
        console.error("Generate schedule failed:", response?.data)
      }
    } catch (error) {
      console.error("Error generating schedule:", error)
      
      // Thử đọc warnings/conflicts từ backend (trường hợp API trả về 400/500 kèm data)
      const serverData = error?.response?.data?.data || error?.response?.data
      let backendWarnings = []
      let backendConflicts = []

      if (serverData) {
        try {
          backendWarnings = parseSlotWarnings(serverData, formData)
          backendConflicts = serverData?.slotConflicts || serverData?.SlotConflicts || []
        } catch (parseErr) {
          console.error("Error parsing backend slotWarnings/slotConflicts from error response:", parseErr)
        }
      }

      if (backendWarnings.length > 0 || backendConflicts.length > 0) {
        setSlotWarnings(backendWarnings)
        setSlotConflicts(backendConflicts)
        setSlotWarningsDialogOpen(true)
      } else {
        // Fallback: message thân thiện, không lộ chi tiết hệ thống
        const errorMessage = error?.response?.data?.message || 
                            error?.data?.message || 
                            error?.message || 
                            "Có lỗi xảy ra khi tạo lịch thi đấu"

        console.error("Generate schedule error detail:", errorMessage)

        setSlotWarnings([{
          warningType: "SystemError",
          title: "Không thể tạo lịch thi đấu",
          description: "Hệ thống không thể tạo lịch thi đấu với cấu hình hiện tại. Vui lòng kiểm tra lại khoảng ngày, giờ thi đấu, số sân và số lớp tham gia rồi thử lại.",
          currentValue: "",
          recommendedValue: "",
          solution: "",
          severity: "High",
          field: ""
        }])
        setSlotConflicts([])
        setSlotWarningsDialogOpen(true)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Parse slot warnings từ response data
  const parseSlotWarnings = (responseData, currentFormData) => {
    const warnings = []
    
    // Nếu có slotWarnings từ backend, dùng trực tiếp (backend đã format đầy đủ)
    if (responseData?.slotWarnings && Array.isArray(responseData.slotWarnings) && responseData.slotWarnings.length > 0) {
      // Map field names từ backend sang frontend format nếu cần
      return responseData.slotWarnings.map(w => ({
        warningType: w.warningType || w.WarningType,
        title: w.title || w.Title,
        description: w.description || w.Description,
        currentValue: w.currentValue || w.CurrentValue,
        recommendedValue: w.recommendedValue || w.RecommendedValue,
        solution: w.solution || w.Solution,
        severity: w.severity || w.Severity,
        field: w.field || w.Field || ""
      }))
    }
    
    // Parse từ explanation nếu không có slotWarnings
    const explanation = responseData?.explanation || ""
    if (!explanation) return warnings
    
    // Parse các warnings từ explanation text
    // Format: "⚠️ CẢNH BÁO: Chỉ có X slots available (cần Y slots)..."
    const slotMatch = explanation.match(/Chỉ có (\d+) slots available.*?cần (\d+) slots/)
    if (slotMatch) {
      const availableSlots = parseInt(slotMatch[1])
      const neededSlots = parseInt(slotMatch[2])
      
      warnings.push({
        warningType: "INSUFFICIENT_SLOTS",
        title: "Không đủ slots để tạo lịch thi đấu",
        description: `Hệ thống chỉ tìm thấy ${availableSlots} slots khả dụng, nhưng cần tối thiểu ${neededSlots} slots để tạo đủ các trận đấu.`,
        currentValue: `${availableSlots} slots`,
        recommendedValue: `≥ ${neededSlots} slots`,
        solution: "Mở rộng khoảng thời gian (startDate, endDate) hoặc giảm conflicts với lịch học/hoạt động khác. Kiểm tra lại availableLocations và preferredStartTime/preferredEndTime.",
        severity: "High",
        field: "startDate, endDate, availableLocations, preferredStartTime, preferredEndTime"
      })
    }
    
    // Parse conflicts với activities khác - cải thiện regex để catch nhiều format hơn
    const conflictMatch = explanation.match(/(\d+)\s*conflicts?\s*với\s*activities?\s*khác|(\d+)\s*conflicts?\s*với\s*participants?/i)
    if (conflictMatch) {
      const conflictCount = parseInt(conflictMatch[1] || conflictMatch[2])
      
      warnings.push({
        warningType: "ACTIVITY_CONFLICTS",
        title: "Xung đột với hoạt động khác",
        description: `Phát hiện ${conflictCount} xung đột với các hoạt động khác mà participants đã tham gia trong cùng khoảng thời gian.`,
        currentValue: `${conflictCount} conflicts`,
        recommendedValue: "0 conflicts",
        solution: "Mở rộng khoảng thời gian (startDate, endDate) hoặc kiểm tra lại lịch tham gia của các lớp (classGroupIds). Có thể cần điều chỉnh preferredStartTime/preferredEndTime.",
        severity: "Medium",
        field: "startDate, endDate, classGroupIds, preferredStartTime, preferredEndTime"
      })
    }
    
    // Parse matches created vs expected - cải thiện regex
    const matchesMatch = explanation.match(/Chỉ tạo được\s*(\d+)\s*\/\s*(\d+)\s*matches?|Đã tạo\s*(\d+)\s*\/\s*(\d+)\s*matches?/i)
    if (matchesMatch) {
      const createdMatches = parseInt(matchesMatch[1] || matchesMatch[3])
      const expectedMatches = parseInt(matchesMatch[2] || matchesMatch[4])
      
      warnings.push({
        warningType: "INCOMPLETE_MATCHES",
        title: "Không tạo đủ số trận đấu",
        description: `Chỉ tạo được ${createdMatches}/${expectedMatches} trận đấu. Thiếu ${expectedMatches - createdMatches} trận so với yêu cầu.`,
        currentValue: `${createdMatches} matches`,
        recommendedValue: `${expectedMatches} matches`,
        solution: "Mở rộng khoảng thời gian (startDate, endDate) hoặc giảm số lớp tham gia (classGroupIds). Kiểm tra lại maxMatchesPerDay và minGapBetweenMatches.",
        severity: "High",
        field: "startDate, endDate, classGroupIds, maxMatchesPerDay, minGapBetweenMatches"
      })
    }
    
    // Parse weekend requirement
    if (explanation.includes("thứ 7") || explanation.includes("chủ nhật") || explanation.includes("cuối tuần")) {
      warnings.push({
        warningType: "WEEKEND_REQUIRED",
        title: "Cần thêm ngày cuối tuần",
        description: "Cần thêm ngày thứ 7, chủ nhật để đảm bảo sức khỏe học sinh cho trận chung kết giữa 2 nhóm. Lý do: Nhóm A (học sáng) chỉ đá được chiều, Nhóm B (học chiều) chỉ đá được sáng.",
        currentValue: "Chỉ có ngày thường",
        recommendedValue: "Bao gồm thứ 7, chủ nhật",
        solution: "Mở rộng khoảng thời gian (endDate) để bao gồm cuối tuần. Điều chỉnh để khoảng thời gian bao gồm ít nhất 1 ngày thứ 7 hoặc chủ nhật.",
        severity: "Medium",
        field: "endDate"
      })
    }
    
    // Parse không optimal
    if (explanation.includes("không tối ưu") || explanation.includes("không optimal") || (!responseData?.isOptimal && responseData?.success)) {
      warnings.push({
        warningType: "NOT_OPTIMAL",
        title: "Lịch thi đấu chưa tối ưu",
        description: "Lịch đã được tạo nhưng có thể không tối ưu do một số constraints không được thỏa mãn hoàn toàn.",
        currentValue: "Lịch đã tạo nhưng chưa tối ưu",
        recommendedValue: "Lịch tối ưu hoàn toàn",
        solution: "Xem các cảnh báo khác để điều chỉnh thông tin đầu vào. Có thể cần mở rộng khoảng thời gian, điều chỉnh availableLocations, hoặc giảm conflicts.",
        severity: "Low",
        field: "startDate, endDate, availableLocations, maxMatchesPerDay"
      })
    }
    
    // Nếu không có warnings cụ thể nhưng có explanation và không success, tạo warning chung
    if (warnings.length === 0 && explanation && !responseData?.success) {
      warnings.push({
        warningType: "GENERAL_WARNING",
        title: "Không thể tạo lịch thi đấu",
        description: explanation,
        currentValue: "Không tạo được lịch",
        recommendedValue: "Tạo được lịch thi đấu",
        solution: "Vui lòng kiểm tra lại tất cả các thông tin đã nhập: sportId, classGroupIds (ít nhất 2 lớp), startDate, endDate, availableLocations, và các thông số khác.",
        severity: "High",
        field: "sportId, classGroupIds, startDate, endDate, availableLocations, matchDuration, preferredStartTime, preferredEndTime, maxMatchesPerDay, minGapBetweenMatches"
      })
    }
    
    return warnings
  }

  const handleMatchFieldChange = (matchNumber, field, value) => {
    setEditedMatches((prev) => {
      const nextValue =
        field === "startTime" || field === "endTime" ? normalizeTimeString(value) : value
      return {
        ...prev,
        [matchNumber]: {
          ...(prev[matchNumber] || {}),
          [field]: nextValue,
        },
      }
    })
  }

  const handleResultFieldChange = (matchId, field, value) => {
    setMatchResults((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [field]: field === "markAsCompleted" ? value : value,
      },
    }))
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

  // Helper function to format date as dd/mm/yyyy
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch (error) {
      return dateStr
    }
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
            
            // QUAN TRỌNG: Thay Nhóm A, Nhóm B thành "Thắng trận X vs Thắng trận Y"
            if (match.classGroup1Id && match.classGroup2Id) {
              const class1Name = getClassName(match.classGroup1Id)
              const class2Name = getClassName(match.classGroup2Id)
              teamsText = `${class1Name} vs ${class2Name}`
            } else if (match.classGroup1Id) {
              teamsText = `${getClassName(match.classGroup1Id)} vs Chờ kết quả vòng trước`
            } else if (match.classGroup2Id) {
              teamsText = `Chờ kết quả vòng trước vs ${getClassName(match.classGroup2Id)}`
            } else if (previousMatches.length > 0) {
              // Nếu không có classGroupId, hiển thị "Thắng trận X vs Thắng trận Y"
              if (previousMatches.length >= 2) {
                teamsText = `Thắng trận #${previousMatches[0].matchNumber} vs Thắng trận #${previousMatches[1].matchNumber}`
              } else if (previousMatches.length === 1) {
                teamsText = `Thắng trận #${previousMatches[0].matchNumber} vs Chờ đối thủ`
              }
            }
            
            // Build previous matches info
            if (previousMatches.length > 0) {
              matchInfo.previousMatches = previousMatches.map(prevMatch => {
                const prevDate = prevMatch.matchDate ? prevMatch.matchDate.split("T")[0] : null
                const prevTime = formatTimeForDisplay(prevMatch.startTime)
                const prevRound = (prevMatch.roundName || `Vòng ${prevMatch.round}`).replace("Chung kết nhánh", "Bán kết")
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
                const nextRound = (nextMatch.roundName || `Vòng ${nextMatch.round}`).replace("Chung kết nhánh", "Bán kết")
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
              endTime: formatTimeForDisplay(match.endTime),
              sport: (match.roundName || `Round ${match.round}`).replace("Chung kết nhánh", "Bán kết"),
              venue: match.location || "N/A",
              teams: teamsText,
              matchNumber: match.matchNumber,
              classGroup1Id: match.classGroup1Id,
              classGroup2Id: match.classGroup2Id,
              round: match.round,
              rawMatchDate: match.matchDate,
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

  const buildMatchesPayload = () => {
    if (!generatedSchedule?.rawData?.generatedMatches) return []

    return generatedSchedule.rawData.generatedMatches.map((match) => {
      const overrides = editedMatches[match.matchNumber] || {}
      const matchDate = overrides.matchDate || normalizeDateString(match.matchDate) || formData.startDate

      return {
        sportId: match.sportId || formData.sportId,
        classGroup1Id:
          overrides.classGroup1Id != null && overrides.classGroup1Id !== ""
            ? Number(overrides.classGroup1Id)
            : match.classGroup1Id,
        classGroup2Id:
          overrides.classGroup2Id != null && overrides.classGroup2Id !== ""
            ? Number(overrides.classGroup2Id)
            : match.classGroup2Id,
        grade: match.grade,
        matchDate,
        startTime: toBackendTimeSpan(overrides.startTime || match.startTime),
        endTime: toBackendTimeSpan(overrides.endTime || match.endTime),
        location: (overrides.location ?? match.location ?? "").trim(),
        status: match.status ?? 0,
        score1: match.score1 ?? 0,
        score2: match.score2 ?? 0,
        winnerClassGroupId: match.winnerClassGroupId ?? null,
        round: match.round,
        roundName: match.roundName,
        matchNumber: match.matchNumber,
        nextMatchNumber: match.nextMatchId || match.NextMatchId || null,
        isBye: match.isBye,
        notes: match.notes,
      }
    })
  }

  const handleApplySchedule = async () => {
    if (!generatedSchedule?.rawData?.generatedMatches?.length) {
      toast.error("Không có trận nào để áp dụng")
      return
    }

    const matchesPayload = buildMatchesPayload()
    if (!matchesPayload.length) {
      toast.error("Không thể chuẩn hóa dữ liệu trận đấu")
      return
    }

    // Validation đầy đủ trước khi apply
    const validationErrors = []
    
    // Validate: tất cả trận phải có sân thi đấu rõ ràng
    const invalidLocation = matchesPayload.find(
      (m) => !m.location || m.location.trim().length === 0
    )
    if (invalidLocation) {
      validationErrors.push(`Thiếu sân thi đấu ở match #${invalidLocation.matchNumber}`)
    }
    
    // Validate: tất cả trận phải có MatchDate
    const invalidDate = matchesPayload.find(
      (m) => !m.matchDate
    )
    if (invalidDate) {
      validationErrors.push(`Thiếu ngày thi đấu ở match #${invalidDate.matchNumber}`)
    }
    
    // Validate: tất cả trận phải có StartTime và EndTime
    const invalidTime = matchesPayload.find(
      (m) => !m.startTime || !m.endTime
    )
    if (invalidTime) {
      validationErrors.push(`Thiếu thời gian thi đấu ở match #${invalidTime.matchNumber}`)
    }
    
    // Validate: StartTime < EndTime
    const invalidTimeRange = matchesPayload.find(
      (m) => m.startTime && m.endTime && m.startTime >= m.endTime
    )
    if (invalidTimeRange) {
      validationErrors.push(`Thời gian không hợp lệ ở match #${invalidTimeRange.matchNumber} (StartTime phải < EndTime)`)
    }
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      if (validationErrors.length > 1) {
        console.warn("Các lỗi validation khác:", validationErrors.slice(1))
      }
      return
    }

    setPendingPayload({
      matches: matchesPayload,
      isPublished: publishSchedule,
    })
    setConfirmDialogOpen(true)
  }

  const doApplySchedule = async () => {
    if (!pendingPayload) return
    setConfirmDialogOpen(false)
    setIsApplyingSchedule(true)
    try {
      const token = localStorage.getItem("token")
      await executeApiCall(
        activityService.applyTournamentSchedule.bind(activityService),
        [params.id, pendingPayload, token],
        { setLoading: setIsApplyingSchedule }
      )

      toast.success("Đã áp dụng lịch thi đấu")
      await loadActivity()
      if (formData.sportId) {
        await fetchOfficialBracket(formData.sportId)
      }
      setActiveTab("match")
    } catch (error) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status
      const conflictPayload =
        error?.data?.data?.conflicts ||
        error?.data?.conflicts ||
        error?.response?.data?.data?.conflicts

      if (status === 409 && Array.isArray(conflictPayload) && conflictPayload.length > 0) {
        console.error("Schedule conflicts from backend:", conflictPayload)
        
        // Hiển thị conflicts chi tiết
        const conflictMessages = conflictPayload.map(c => {
          const matchInfo = `Match #${c.matchNumber} (${c.matchDate} ${c.startTime}-${c.endTime})`
          return `${matchInfo}: ${c.message}`
        })
        
        toast.error(
          `Phát hiện ${conflictPayload.length} xung đột lịch thi đấu:\n${conflictMessages.slice(0, 3).join('\n')}${conflictMessages.length > 3 ? `\n... và ${conflictMessages.length - 3} xung đột khác` : ''}`,
          { autoClose: 10000 }
        )
        
        // Log tất cả conflicts để debug
        console.error("All conflicts:", conflictPayload)
      } else {
        const message =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          error?.error ||
          "Có lỗi xảy ra khi áp dụng lịch thi đấu"
        toast.error(message)
        
        // Log chi tiết để debug
        if (error?.response?.data) {
          console.error("Error details:", error.response.data)
        }
      }
    } finally {
      setIsApplyingSchedule(false)
      setPendingPayload(null)
    }
  }

  const handleSportSelect = (sportId) => {
    setFormData((prev) => ({
      ...prev,
      sportId: prev.sportId === sportId ? null : sportId,
    }))
  }

  const handleSubmitMatchResult = async (match, overrideState = null) => {
    const current = overrideState || matchResults[match.id] || {}
    
    // Tự động set markAsCompleted = true khi có winnerClassGroupId
    const hasWinner = current.winnerClassGroupId != null
    const markAsCompleted = hasWinner ? true : !!current.markAsCompleted
    
    const payload = {
      score1: Number(current.score1 ?? 0),
      score2: Number(current.score2 ?? 0),
      markAsCompleted: markAsCompleted,
      winnerClassGroupId: current.winnerClassGroupId ? Number(current.winnerClassGroupId) : null,
      // Nếu backend hỗ trợ, các field dưới có thể được map thêm
      penaltyScore1: current.penaltyScore1 ?? null,
      penaltyScore2: current.penaltyScore2 ?? null,
      penaltySummary: current.penaltySummary ?? null,
    }

    if (payload.markAsCompleted && !payload.winnerClassGroupId) {
      toast.error("Vui lòng chọn đội thắng trước khi hoàn tất trận đấu")
      return
    }

    try {
      const token = localStorage.getItem("token")
      await executeApiCall(
        activityMatchService.updateMatchResult.bind(activityMatchService),
        [match.id, payload, token],
        {}
      )
      toast.success(`Đã cập nhật kết quả trận #${match.matchNumber}`)
      // Refresh bracket để hiển thị đội thắng vào vòng trong
      if (formData.sportId) {
        await fetchOfficialBracket(formData.sportId)
      }
    } catch (error) {
      const message =
        error?.message ||
        error?.error ||
        error?.data?.message ||
        "Có lỗi xảy ra khi cập nhật kết quả"
      toast.error(message)
    }
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

  // Build bracket hierarchy from matches (group by round, enrich team names & linkage)
  const buildBracketHierarchy = (matches) => {
    if (!matches || matches.length === 0) return null

    // Group matches by round
    const matchesByRound = {}
    matches.forEach(match => {
      const round = match.round || 1
      if (!matchesByRound[round]) {
        matchesByRound[round] = []
      }
      matchesByRound[round].push(match)
    })

    // Sort rounds
    const sortedRounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b)

    // Build hierarchy structure
    const rounds = sortedRounds.map(roundNum => {
      const roundMatches = matchesByRound[roundNum]
        .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0))

      return {
        round: roundNum,
        roundName: (roundMatches[0]?.roundName || `Vòng ${roundNum}`).replace("Chung kết nhánh", "Bán kết"),
        matches: roundMatches.map(match => {
          // Find previous matches that lead to this match
          const prevMatches = matches.filter(m => {
            const nextId = m.nextMatchId || m.NextMatchId
            return nextId === match.matchNumber
          })
          
          // Determine team names: Use class names if available, otherwise use "Thắng trận X"
          let team1 = null
          let team2 = null
          
          if (match.classGroup1Id) {
            team1 = getClassName(match.classGroup1Id)
          } else if (prevMatches.length > 0) {
            team1 = `Thắng trận #${prevMatches[0].matchNumber}`
          }
          
          if (match.classGroup2Id) {
            team2 = getClassName(match.classGroup2Id)
          } else if (prevMatches.length > 1) {
            team2 = `Thắng trận #${prevMatches[1].matchNumber}`
          } else if (prevMatches.length === 1 && !match.classGroup1Id) {
            // If only one previous match and no classGroup1Id, team2 is the winner
            team2 = `Thắng trận #${prevMatches[0].matchNumber}`
          }
          
          return {
          matchNumber: match.matchNumber,
            team1: team1,
            team2: team2,
          team1Id: match.classGroup1Id,
          team2Id: match.classGroup2Id,
          nextMatchId: match.nextMatchId || match.NextMatchId,
            previousMatches: prevMatches.map(m => m.matchNumber),
          date: match.matchDate ? match.matchDate.split("T")[0] : null,
          time: formatTimeForDisplay(match.startTime),
          location: match.location,
            notes: (match.notes || "").replace(/Nhóm A/g, prevMatches.length > 0 ? `Thắng trận #${prevMatches[0].matchNumber}` : "Nhóm A")
                                      .replace(/Nhóm B/g, prevMatches.length > 1 ? `Thắng trận #${prevMatches[1].matchNumber}` : "Nhóm B"),
          isBye: match.isBye,
          }
        })
      }
    })

    return rounds
  }

  // Transform flat matches to tree structure (root = final match, children = previous matches)
  // Dùng cho layout dạng cây kim tự tháp (Final ở trên, Round 1 ở dưới)
  const transformToTreeStructure = (matches = []) => {
    if (!matches || matches.length === 0) return null

    // Map theo matchNumber để dễ lookup
    const nodeMap = new Map()
    matches.forEach((m) => {
      nodeMap.set(m.matchNumber, {
        match: m,
        children: [],
      })
    })

    // Gắn children: mỗi match là "cha" của những match có nextMatchId = match.matchNumber
    matches.forEach((m) => {
      const parentNode = nodeMap.get(m.matchNumber)
      const children = matches.filter(
        (c) => (c.nextMatchId || c.NextMatchId) === m.matchNumber
      )
      children.forEach((child) => {
        const childNode = nodeMap.get(child.matchNumber)
        if (childNode) {
          parentNode.children.push(childNode)
        }
      })
    })

    // Root = match không có nextMatchId (thường là Chung kết)
    let root = null
    for (const node of nodeMap.values()) {
      const nextId = node.match.nextMatchId || node.match.NextMatchId
      if (!nextId) {
        root = node
        break
      }
    }

    // Fallback: lấy match có round lớn nhất nếu không xác định được root rõ ràng
    if (!root) {
      root = [...nodeMap.values()].reduce((max, curr) =>
        (curr.match.round || 0) > (max.match.round || 0) ? curr : max
      )
    }

    return root
  }

  // Modal hiển thị / chỉnh sửa kết quả trận đấu từ bracket
  const MatchDetailModal = ({ match, onClose }) => {
  if (!match) return null

  const baseState = matchResults[match.id] || {
    score1: match.score1 ?? 0,
    score2: match.score2 ?? 0,
    markAsCompleted: match.status === 2,
  }

  const [localScore1, setLocalScore1] = useState(Number(baseState.score1 ?? 0))
  const [localScore2, setLocalScore2] = useState(Number(baseState.score2 ?? 0))
  const [localPenalty1, setLocalPenalty1] = useState(0)
  const [localPenalty2, setLocalPenalty2] = useState(0)

  const team1Name = match.classGroup1Name || `Lớp ${match.classGroup1Id || "?"}`
  const team2Name = match.classGroup2Name || `Lớp ${match.classGroup2Id || "?"}`

  let winnerId = null
  let winnerLabel = "Chưa xác định"
  let isMainDraw = false
  let isPenaltyDraw = false

  // MAIN SCORE LOGIC
  if (localScore1 > localScore2 && match.classGroup1Id) {
    winnerId = match.classGroup1Id
    winnerLabel = team1Name
  } else if (localScore2 > localScore1 && match.classGroup2Id) {
    winnerId = match.classGroup2Id
    winnerLabel = team2Name
  } else if (localScore1 === localScore2) {
    // CHỈ CẦN BẰNG NHAU (kể cả 0-0) là hòa lượt chính
    isMainDraw = true

    // Nếu đã nhập luân lưu, dùng luân lưu để quyết định
    if (localPenalty1 > localPenalty2 && match.classGroup1Id) {
      winnerId = match.classGroup1Id
      winnerLabel = `${team1Name} (thắng luân lưu)`
    } else if (localPenalty2 > localPenalty1 && match.classGroup2Id) {
      winnerId = match.classGroup2Id
      winnerLabel = `${team2Name} (thắng luân lưu)`
    } else if (
      (localPenalty1 !== 0 || localPenalty2 !== 0) &&
      localPenalty1 === localPenalty2
    ) {
      isPenaltyDraw = true
      winnerLabel = "Hòa cả luân lưu - cần cập nhật tỉ số phân định thắng thua"
    } else {
      winnerLabel = "Hòa - cần nhập tỉ số luân lưu để phân định thắng thua"
    }
  }

  const showPenaltySection =
    isMainDraw || localPenalty1 > 0 || localPenalty2 > 0

  const handleSave = async () => {
    if (!winnerId || isPenaltyDraw) {
      toast.error("Vui lòng nhập tỉ số (kể cả luân lưu nếu cần) sao cho có đội thắng rõ ràng.")
      return
    }

    let penaltySummary = null
    if (showPenaltySection && (localPenalty1 > 0 || localPenalty2 > 0)) {
      penaltySummary = `(Luân lưu: ${localPenalty1}-${localPenalty2})`
    }

    const overrideState = {
      score1: localScore1,
      score2: localScore2,
      winnerClassGroupId: winnerId,
      markAsCompleted: true, // Tự động đánh dấu hoàn thành khi có winner
      penaltyScore1: localPenalty1,
      penaltyScore2: localPenalty2,
      penaltySummary,
    }

    setMatchResults((prev) => ({
      ...prev,
      [match.id]: {
        ...(prev[match.id] || {}),
        ...overrideState,
      },
    }))

    await handleSubmitMatchResult(match, overrideState)
    onClose()
    // Refresh bracket để hiển thị đội thắng vào vòng trong
    if (formData.sportId) {
      await fetchOfficialBracket(formData.sportId)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Trận #{match.matchNumber} • {match.roundName || `Vòng ${match.round}`}
        </h3>

        {/* VS Banner */}
        <div className="mb-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 text-right">
            <p className="text-xs text-slate-500">Đội 1</p>
            <p className="font-semibold text-slate-800 truncate">{team1Name}</p>
          </div>
          <div className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            VS
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Đội 2</p>
            <p className="font-semibold text-slate-800 truncate">{team2Name}</p>
          </div>
        </div>

        {/* Điểm chính */}
        <div className="grid md:grid-cols-3 gap-4 mb-3">
          <div>
            <Label className="text-xs text-slate-500">Điểm đội 1</Label>
            <Input
              type="number"
              min="0"
              value={localScore1}
              onChange={(e) => {
                const val = Number(e.target.value || 0)
                setLocalScore1(val)
                handleResultFieldChange(match.id, "score1", val)
              }}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Điểm đội 2</Label>
            <Input
              type="number"
              min="0"
              value={localScore2}
              onChange={(e) => {
                const val = Number(e.target.value || 0)
                setLocalScore2(val)
                handleResultFieldChange(match.id, "score2", val)
              }}
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="text-xs">
              <p className="text-slate-500 mb-1">🏆 Đội thắng (tính tự động)</p>
              <p
                className={`font-semibold ${
                  isPenaltyDraw || isMainDraw
                    ? "text-amber-600"
                    : winnerId
                    ? "text-emerald-700"
                    : "text-slate-400"
                }`}
              >
                {winnerLabel}
              </p>
            </div>
          </div>
        </div>

        {isMainDraw && (
          <p className="text-xs text-amber-600 mb-2">
            Tỉ số đang hòa. Bạn có thể nhập tỉ số luân lưu để phân định thắng thua.
          </p>
        )}

        {/* Vùng Luân lưu với animation */}
        <div
          className={`
            transition-all duration-300 ease-in-out origin-top
            ${showPenaltySection ? "max-h-[200px] opacity-100 scale-y-100 mt-2" : "max-h-0 opacity-0 scale-y-95"}
            overflow-hidden
          `}
        >
          <div className="mt-1 p-3 rounded-md bg-orange-50 border border-orange-200 grid md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600">Luân lưu Đội 1</Label>
              <Input
                type="number"
                min="0"
                value={localPenalty1}
                onChange={(e) => {
                  const val = Number(e.target.value || 0)
                  setLocalPenalty1(val)
                }}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-600">Luân lưu Đội 2</Label>
              <Input
                type="number"
                min="0"
                value={localPenalty2}
                onChange={(e) => {
                  const val = Number(e.target.value || 0)
                  setLocalPenalty2(val)
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            Lưu kết quả
          </Button>
        </div>
      </div>
    </div>
  )
}

  const renderOfficialBracketCard = () => {
    if (!officialBracket || !formData.sportId) return null

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Lịch đã áp dụng (Sport #{formData.sportId})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={() => setOfficialViewCollapsed(!officialViewCollapsed)}
              >
                {officialViewCollapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Mở rộng
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Thu gọn
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                disabled={loadingOfficialBracket}
                onClick={() => fetchOfficialBracket(formData.sportId)}
              >
                <Download className="w-4 h-4 mr-1" />
                Tải lại
              </Button>
                      </div>
          </div>
          <p className="text-xs text-gray-500">
            Tổng {officialBracket.totalMatches} trận • {officialBracket.totalRounds} vòng đấu
          </p>
        </CardHeader>
        {!officialViewCollapsed && (
          <CardContent className="space-y-4">
            {loadingOfficialBracket ? (
              <p className="text-sm text-gray-500">Đang tải lịch chính thức...</p>
            ) : (
              officialBracket.rounds.map((round) => (
                <div key={round.roundNumber} className="space-y-3 border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      {round.roundName || `Vòng ${round.roundNumber}`}
                    </h4>
                    <span className="text-xs text-gray-500">{round.matches.length} trận</span>
                  </div>
                  <div className="space-y-3">
                    {round.matches.map((match) => {
                      const resultState = matchResults[match.id] || {
                        score1: match.score1 ?? 0,
                        score2: match.score2 ?? 0,
                        winnerClassGroupId: match.winnerClassGroupId ?? "",
                        markAsCompleted: match.status === 2,
                      }

                      const statusLabel =
                        match.status === 0
                          ? "Chờ đấu"
                          : match.status === 1
                          ? "Đang diễn ra"
                          : match.status === 2
                          ? "Hoàn thành"
                          : "Đã hủy"

                      return (
                        <div key={match.id} className="bg-white border rounded-md p-3 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Trận #{match.matchNumber}</Badge>
                              <span className="text-sm text-gray-600">
                                {match.matchDate
                                  ? formatDateDDMMYYYY(match.matchDate.split("T")[0])
                                  : "Chưa lên lịch"}
                              </span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
                              {statusLabel}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {match.classGroup1Name || `Lớp ${match.classGroup1Id || "?"}`}
                              </span>
                              <span className="text-gray-500">vs</span>
                              <span className="font-semibold">
                                {match.classGroup2Name || `Lớp ${match.classGroup2Id || "?"}`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              {match.matchDate && match.startTime && (
                                <span>
                                  <Calendar className="inline w-3 h-3 mr-1" />
                                  {formatDateDDMMYYYY(match.matchDate.split("T")[0])} -{" "}
                                  {formatTimeForDisplay(match.startTime)}
                                </span>
                              )}
                              {match.location && (
                                <span>
                                  <MapPin className="inline w-3 h-3 mr-1" />
                                  {match.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="grid md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">Điểm đội 1</Label>
                              <Input
                                type="number"
                                min="0"
                                value={resultState.score1}
                                onChange={(e) =>
                                  handleResultFieldChange(match.id, "score1", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Điểm đội 2</Label>
                              <Input
                                type="number"
                                min="0"
                                value={resultState.score2}
                                onChange={(e) =>
                                  handleResultFieldChange(match.id, "score2", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Đội thắng</Label>
                              <select
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={resultState.winnerClassGroupId || ""}
                                onChange={(e) =>
                                  handleResultFieldChange(
                                    match.id,
                                    "winnerClassGroupId",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Chưa xác định</option>
                                {match.classGroup1Id && (
                                  <option value={match.classGroup1Id}>
                                    {match.classGroup1Name || `Lớp ${match.classGroup1Id}`}
                                  </option>
                                )}
                                {match.classGroup2Id && (
                                  <option value={match.classGroup2Id}>
                                    {match.classGroup2Name || `Lớp ${match.classGroup2Id}`}
                                  </option>
                                )}
                              </select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`mark-complete-${match.id}`}
                                  checked={!!resultState.markAsCompleted}
                                  onCheckedChange={(checked) =>
                                    handleResultFieldChange(
                                      match.id,
                                      "markAsCompleted",
                                      !!checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`mark-complete-${match.id}`}
                                  className="text-xs text-gray-600"
                                >
                                  Kết thúc trận
                                </Label>
                              </div>
                              <Button size="sm" onClick={() => handleSubmitMatchResult(match)}>
                                Cập nhật kết quả
                              </Button>
                            </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
              ))
            )}
          </CardContent>
        )}
      </Card>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Tạo lịch thi đấu tự động</h1>
          </div>
          <p className="text-gray-600 mt-1">Sử dụng AI để tự động tạo lịch thi đấu tối ưu</p>
        </div>
      </div>

      {/* Tabs chế độ */}
      <div className="mt-4 border-b flex gap-2 grade-primary classname-tab-control">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "ai"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("ai")}
        >
          Kết quả AI
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "match"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("match")}
        >
          Quản lý Trận đấu
        </button>
      </div>

      {activeTab === "ai" ? (
        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          {/* Input Form */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              isFormCollapsed ? "lg:w-64" : "lg:w-[420px]"
            }`}
            data-slot="schedule-form"
          >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Thông tin sự kiện
              </CardTitle>
                {generatedSchedule && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="h-8 w-8 p-0"
                  >
                    {isFormCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {!isFormCollapsed && (
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
                    onChange={(e) => {
                      const newData = { ...formData, startDate: e.target.value }
                      setFormData(newData)
                      setDateValidationErrors(validateDatesAndTimes(newData))
                    }}
                    className={`mt-2 ${dateValidationErrors.startDate ? 'border-red-500' : ''}`}
                  />
                  {dateValidationErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1">{dateValidationErrors.startDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      const newData = { ...formData, endDate: e.target.value }
                      setFormData(newData)
                      setDateValidationErrors(validateDatesAndTimes(newData))
                    }}
                    className={`mt-2 ${dateValidationErrors.endDate ? 'border-red-500' : ''}`}
                  />
                  {dateValidationErrors.endDate && (
                    <p className="text-xs text-red-600 mt-1">{dateValidationErrors.endDate}</p>
                  )}
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
                <Label className="mb-3 block">
                  Danh sách lớp tham gia
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (Chỉ hiển thị các lớp đã đăng ký)
                  </span>
                </Label>
                {loadingClasses ? (
                  <p className="text-sm text-gray-500">Đang tải danh sách lớp...</p>
                ) : classGroups.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Chưa có lớp nào đăng ký tham gia hoạt động này. 
                      Vui lòng đợi các lớp đăng ký trước khi tạo lịch thi đấu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
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
                  value={formData.availableLocationsRaw}
                  onChange={(e) => {
                    // QUAN TRỌNG: Lưu raw value để user có thể gõ dấu phẩy tự do
                    const inputValue = e.target.value
                    
                    // Lưu raw value
                    setFormData(prev => ({
                      ...prev,
                      availableLocationsRaw: inputValue
                    }))
                    
                    // Parse thành array (loại bỏ phần tử rỗng) nhưng vẫn giữ raw value
                    if (!inputValue || inputValue.trim() === "") {
                      setFormData(prev => ({
                        ...prev,
                        availableLocationsRaw: inputValue,
                        availableLocations: []
                      }))
                      return
                    }
                    
                    // Tách bằng dấu phẩy (hỗ trợ cả dấu phẩy tiếng Việt và tiếng Anh)
                    const locations = inputValue
                      .split(/[,，]/) // Hỗ trợ cả dấu phẩy tiếng Anh (,) và tiếng Việt (，)
                      .map((loc) => loc.trim())
                      .filter((loc) => loc.length > 0)
                    
                    setFormData(prev => ({
                      ...prev,
                      availableLocationsRaw: inputValue,
                      availableLocations: locations
                    }))
                  }}
                  onBlur={(e) => {
                    // Khi blur (mất focus), parse lại và loại bỏ các phần tử rỗng
                    const inputValue = e.target.value
                    if (!inputValue || inputValue.trim() === "") {
                      setFormData(prev => ({
                        ...prev,
                        availableLocationsRaw: "",
                        availableLocations: []
                      }))
                      return
                    }
                    
                    const locations = inputValue
                      .split(/[,，]/)
                      .map((loc) => loc.trim())
                      .filter((loc) => loc.length > 0)
                    
                    // Cập nhật raw value (loại bỏ dấu phẩy thừa ở cuối)
                    const cleanedValue = locations.join(", ")
                    
                    setFormData(prev => ({
                      ...prev,
                      availableLocationsRaw: cleanedValue,
                      availableLocations: locations
                    }))
                  }}
                  rows={2}
                  placeholder="Sân bóng A, Sân bóng chuyền, Đường chạy 1"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Nhập các địa điểm, phân cách bằng dấu phẩy. Ví dụ: "Sân bóng A, Sân bóng chuyền, Đường chạy 1"
                </p>
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
                    onChange={(e) => {
                      const newData = { ...formData, preferredStartTime: e.target.value }
                      setFormData(newData)
                      setDateValidationErrors(validateDatesAndTimes(newData))
                    }}
                    className={`mt-2 ${dateValidationErrors.preferredStartTime ? 'border-red-500' : ''}`}
                  />
                  {dateValidationErrors.preferredStartTime && (
                    <p className="text-xs text-red-600 mt-1">{dateValidationErrors.preferredStartTime}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="preferredEndTime">Giờ kết thúc ưu tiên</Label>
                  <Input
                    id="preferredEndTime"
                    type="time"
                    value={formData.preferredEndTime}
                    onChange={(e) => {
                      const newData = { ...formData, preferredEndTime: e.target.value }
                      setFormData(newData)
                      setDateValidationErrors(validateDatesAndTimes(newData))
                    }}
                    className={`mt-2 ${dateValidationErrors.preferredEndTime ? 'border-red-500' : ''}`}
                  />
                  {dateValidationErrors.preferredEndTime && (
                    <p className="text-xs text-red-600 mt-1">{dateValidationErrors.preferredEndTime}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Định dạng giải đấu</Label>
                <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
                  Loại trực tiếp (Single Elimination)
                </div>
              </div>


              <Button
                onClick={handleGenerate}
                disabled={isGenerating || Object.keys(dateValidationErrors).length > 0}
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
              {Object.keys(dateValidationErrors).length > 0 && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Vui lòng sửa các lỗi ngày/giờ trước khi tạo lịch
                </p>
              )}
            </CardContent>
            )}
          </Card>
        </div>

          {/* Generated Schedule / Empty State (chỉ hiển thị AI generate, không show official ở tab này) */}
        <div className="flex-1 space-y-6">
        {generatedSchedule ? (
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

              {/* Schedule (AI preview) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lịch thi đấu đã tạo</CardTitle>
                    <div className="flex gap-2">
                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-50 grade-secondary classname-view-toggle">
                        <Button
                          size="sm"
                          variant={aiViewMode === "list" ? "default" : "ghost"}
                          onClick={() => setAiViewMode("list")}
                          className="h-7 px-3"
                        >
                          <List className="w-4 h-4 mr-1" />
                          Danh sách
                        </Button>
                        <Button
                          size="sm"
                          variant={aiViewMode === "bracket" ? "default" : "ghost"}
                          onClick={() => setAiViewMode("bracket")}
                          className="h-7 px-3"
                        >
                          <GitBranch className="w-4 h-4 mr-1" />
                          Sơ đồ
                        </Button>
                      </div>
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
                  {formData.availableLocations?.length > 0 && (
                    <datalist id="available-locations-list">
                      {formData.availableLocations.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  )}
                  {aiViewMode === "bracket" ? (
                    // Bracket View (preview từ lịch AI, không edit)
                    <div className="py-4 grade-content classname-bracket-view">
                      {generatedSchedule?.rawData?.generatedMatches?.length ? (
                        <BracketTree
                          matches={generatedSchedule.rawData.generatedMatches}
                          official={null}
                          onMatchClick={() => {}}
                          getClassNameById={resolveClassName}
                        />
                      ) : (
                        <p className="text-sm text-gray-500">
                          Chưa có dữ liệu để hiển thị sơ đồ.
                        </p>
                      )}
                    </div>
                  ) : (
                    // List View (existing code)
                    <>
                  {generatedSchedule.days.map((day, dayIdx) => (
                    <div key={dayIdx}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600 text-white">Ngày {dayIdx + 1}</Badge>
                        <span className="font-semibold">{formatDateDDMMYYYY(day.date)}</span>
                      </div>
                      <div className="space-y-2">
                        {day.events.map((event, eventIdx) => {
                          const editable =
                            editedMatches[event.matchNumber] || {
                              matchDate: event.rawMatchDate ? normalizeDateString(event.rawMatchDate) : day.date,
                              startTime: event.time,
                              endTime: event.endTime || "",
                              location: event.venue || "",
                              classGroup1Id: event.classGroup1Id ?? null,
                              classGroup2Id: event.classGroup2Id ?? null,
                          }
                          
                          return (
                            <div
                              key={eventIdx}
                              className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-start gap-3">
                              <div className="bg-blue-600 text-white rounded px-2 py-1 text-sm font-semibold min-w-[60px] text-center">
                                  {editable.startTime || event.time}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{event.sport}</p>
                                  <Badge variant="outline" className="text-xs">
                                    Trận #{event.matchNumber}
                                  </Badge>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {editable.location || "N/A"}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <select
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                                        disabled
                                        value={
                                          editable.classGroup1Id ??
                                          event.classGroup1Id ??
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleMatchFieldChange(
                                            event.matchNumber,
                                            "classGroup1Id",
                                            e.target.value === "" ? null : e.target.value
                                          )
                                        }
                                      >
                                        <option value="">
                                          {event.classGroup1Id ? "Chờ kết quả" : "Chọn lớp"}
                                        </option>
                                        {classGroups.map((cg) => {
                                          const id =
                                            typeof cg.id === "number"
                                              ? cg.id
                                              : parseInt(cg.id)
                                          const label = cg.grade
                                            ? `${cg.grade}${cg.name}`
                                            : cg.name
                                          return (
                                            <option key={cg.id} value={id}>
                                              {label}
                                            </option>
                                          )
                                        })}
                                      </select>
                                      <select
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                                        disabled
                                        value={
                                          editable.classGroup2Id ??
                                          event.classGroup2Id ??
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleMatchFieldChange(
                                            event.matchNumber,
                                            "classGroup2Id",
                                            e.target.value === "" ? null : e.target.value
                                          )
                                        }
                                      >
                                        <option value="">
                                          {event.classGroup2Id ? "Chờ kết quả" : "Chọn lớp"}
                                        </option>
                                        {classGroups.map((cg) => {
                                          const id =
                                            typeof cg.id === "number"
                                              ? cg.id
                                              : parseInt(cg.id)
                                          const label = cg.grade
                                            ? `${cg.grade}${cg.name}`
                                            : cg.name
                                          return (
                                            <option key={cg.id} value={id}>
                                              {label}
                                            </option>
                                          )
                                        })}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                
                                  <div className="grid md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                      <Label className="text-xs text-gray-500">Ngày thi đấu</Label>
                                      <Input
                                        type="date"
                                        value={editable.matchDate || ""}
                                        onChange={(e) =>
                                          handleMatchFieldChange(event.matchNumber, "matchDate", e.target.value)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Giờ bắt đầu</Label>
                                      <Input
                                        type="time"
                                        value={editable.startTime || ""}
                                        onChange={(e) =>
                                          handleMatchFieldChange(event.matchNumber, "startTime", e.target.value)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Giờ kết thúc</Label>
                                      <Input
                                        type="time"
                                        value={editable.endTime || ""}
                                        onChange={(e) =>
                                          handleMatchFieldChange(event.matchNumber, "endTime", e.target.value)
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <Label className="text-xs text-gray-500">Địa điểm</Label>
                                    <Input
                                      list="available-locations-list"
                                      placeholder="Nhập tên sân"
                                      value={editable.location || ""}
                                      onChange={(e) =>
                                        handleMatchFieldChange(event.matchNumber, "location", e.target.value)
                                      }
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">
                                      Thay đổi sẽ áp dụng khi bạn nhấn "Áp dụng lịch"
                                    </p>
                                  </div>

                                {event.previousMatches && event.previousMatches.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Thắng các trận sau sẽ đấu ở trận này:</p>
                                    {event.previousMatches.map((prevInfo, idx) => (
                                      <div key={idx} className="text-xs text-orange-600 flex items-start gap-1 mb-1">
                                        <span className="mt-0.5">⬅️</span>
                                        <span>
                                          <strong>Trận #{prevInfo.matchNumber}</strong> ({prevInfo.round}: {prevInfo.teams})
                                          {prevInfo.date && prevInfo.time && (
                                            <span>
                                              {" "}
                                              lúc <strong>{prevInfo.time}</strong> ngày{" "}
                                              <strong>{formatDateDDMMYYYY(prevInfo.date)}</strong>
                                            </span>
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
                                          <span>
                                            {" "}
                                            lúc <strong>{event.nextMatch.time}</strong> ngày{" "}
                                            <strong>{formatDateDDMMYYYY(event.nextMatch.date)}</strong>
                                          </span>
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
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="publishSchedule"
                      checked={publishSchedule}
                      onCheckedChange={(checked) => setPublishSchedule(!!checked)}
                    />
                    <Label htmlFor="publishSchedule" className="text-sm text-gray-600">
                      Đánh dấu là đã công bố lịch chính thức
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApplySchedule}
                    disabled={isApplyingSchedule}
                  >
                    {isApplyingSchedule ? "Đang áp dụng..." : "Áp dụng lịch này"}
                </Button>
                  <Button variant="outline" className="flex-1" onClick={handleGenerate} disabled={isGenerating}>
                  Tạo lại
                </Button>
                </div>
              </div>
            </>
          ) : (
            // Empty state hoàn toàn
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Chưa có lịch thi đấu</h3>
                <p className="text-gray-600 text-sm">
                  Điền thông tin bên trái và nhấn "Tạo lịch với AI" để bắt đầu
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      ) : (
        // Tab "Quản lý Trận đấu" – dữ liệu chính thức trong DB
        <div className="mt-4">
          {officialBracket && formData.sportId ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý Trận đấu (Sport #{formData.sportId})</CardTitle>
                    <p className="text-xs text-gray-500">
                      Tổng {officialBracket.totalMatches} trận • {officialBracket.totalRounds} vòng đấu
                    </p>
                  </div>
                  <div className="flex items-center gap-2 grade-secondary classname-view-toggle">
                    <Button
                      size="sm"
                      variant={officialViewMode === "list" ? "default" : "ghost"}
                      className="h-8 px-3"
                      onClick={() => setOfficialViewMode("list")}
                    >
                      <List className="w-4 h-4 mr-1" />
                      Danh sách
                    </Button>
                    <Button
                      size="sm"
                      variant={officialViewMode === "bracket" ? "default" : "ghost"}
                      className="h-8 px-3"
                      onClick={() => setOfficialViewMode("bracket")}
                    >
                      <GitBranch className="w-4 h-4 mr-1" />
                      Sơ đồ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      disabled={loadingOfficialBracket}
                      onClick={() => fetchOfficialBracket(formData.sportId)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Tải lại
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {officialViewMode === "bracket" ? (
                  <div className="grade-content classname-bracket-view">
                    <OfficialBracketViewer
                      matches={memoizedOfficialMatches}
                      official={officialBracket}
                      onMatchClick={handleBracketMatchClick}
                      getClassNameById={resolveClassName}
                    />
                  </div>
                ) : (
                  <div className="p-4 space-y-4 grade-content classname-list-view">
                    {officialRounds.map((round) => (
                      <div key={round.round} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-gray-800">
                            {round.roundName || `Vòng ${round.round}`}
                          </h4>
                          <span className="text-xs text-gray-500">{round.matches?.length || 0} trận</span>
                        </div>
                        <div className="space-y-2">
                          {(round.matches || []).map((match) => (
                            <div
                              key={match.id || match.matchNumber}
                              className="border border-gray-200 rounded-md p-3 bg-white grade-item classname-match-card"
                            >
                          <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    Trận #{match.matchNumber}
                                  </Badge>
                                  <span className="text-sm font-semibold text-gray-800">
                                    {(resolveClassName(match.classGroup1Id) || match.classGroup1Name || "Chờ kết quả")}{" "}
                                    vs{" "}
                                    {(resolveClassName(match.classGroup2Id) || match.classGroup2Name || "Chờ kết quả")}
                                  </span>
                                </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                                  {match.matchDate && match.startTime && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(match.matchDate).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })}
                                      {" • "}
                                      {match.startTime?.toString().slice(0, 5)}
                                    </span>
                                  )}
                                  {match.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {match.location}
                                    </span>
                                  )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-3"
                                onClick={() => setSelectedBracketMatch(match)}
                              >
                                Cập nhật tỉ số
                              </Button>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                                {match.score1 != null && match.score2 != null ? (
                                  <span className="font-semibold">
                                    {match.score1} - {match.score2}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">Chưa có kết quả</span>
                                )}
                                {match.status === 2 && (
                                  <Badge className="bg-green-100 text-green-700">Đã kết thúc</Badge>
                                )}
                                {match.status === 1 && (
                                  <Badge className="bg-blue-100 text-blue-700">Đang diễn ra</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardContent className="p-6 text-center text-sm text-gray-500">
                Chưa có lịch thi đấu chính thức. Hãy tạo lịch và áp dụng ở tab "Kết quả AI".
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Modal quản lý kết quả trận đấu cho bracket – đặt ngoài viewer để không ảnh hưởng pan/zoom */}
      {selectedBracketMatch && (
        <MatchDetailModal
          match={selectedBracketMatch}
          onClose={() => setSelectedBracketMatch(null)}
        />
      )}

      {/* Dialog cảnh báo về slots */}
      <Dialog open={slotWarningsDialogOpen} onOpenChange={setSlotWarningsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Cảnh báo về lịch thi đấu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                {slotConflicts.length > 0 
                  ? `Hệ thống không thể tạo lịch thi đấu do phát hiện ${slotConflicts.length} xung đột. Vui lòng xem chi tiết bên dưới và điều chỉnh các thông tin.`
                  : "Hệ thống đã tạo lịch thi đấu nhưng phát hiện một số vấn đề cần lưu ý. Vui lòng xem chi tiết bên dưới và điều chỉnh các thông tin để có lịch thi đấu tối ưu hơn."
                }
              </p>
            </div>

            {/* Hiển thị conflicts chi tiết dưới dạng bullet points */}
            {slotConflicts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Chi tiết các xung đột:
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <ul className="space-y-2 list-disc list-inside">
                    {slotConflicts.map((conflict, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">
                          {conflict.slot?.matchDate 
                            ? `${new Date(conflict.slot.matchDate).toLocaleDateString('vi-VN')} ${conflict.slot.startTime}-${conflict.slot.endTime}`
                            : 'Slot không xác định'
                          }
                          {conflict.slot?.location && ` tại ${conflict.slot.location}`}
                        </span>
                        {': '}
                        <span>{conflict.reason}</span>
                        {conflict.matchConflict && (
                          <div className="ml-6 mt-1 text-xs text-gray-600">
                            → Trùng với Match #{conflict.matchConflict.matchNumber} 
                            ({conflict.matchConflict.classGroup1Id && conflict.matchConflict.classGroup2Id 
                              ? `Lớp ${conflict.matchConflict.classGroup1Id} vs ${conflict.matchConflict.classGroup2Id}`
                              : 'Match đã có'
                            })
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {slotWarnings.length > 0 && (
              <div className="space-y-3">
                {slotWarnings.map((warning, index) => {
                  const severityColors = {
                    High: "bg-red-50 border-red-200",
                    Medium: "bg-orange-50 border-orange-200",
                    Low: "bg-yellow-50 border-yellow-200"
                  }
                  
                  const severityIcons = {
                    High: "🔴",
                    Medium: "🟠",
                    Low: "🟡"
                  }

                  const severityColor = severityColors[warning.severity] || severityColors.Medium
                  const severityIcon = severityIcons[warning.severity] || "🟠"

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${severityColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{severityIcon}</span>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {warning.title}
                            {warning.severity === "High" && (
                              <Badge variant="destructive" className="text-xs">Quan trọng</Badge>
                            )}
                          </h4>
                          
                          <p className="text-sm text-gray-700">{warning.description}</p>
                          
                          {(warning.currentValue || warning.recommendedValue) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {warning.currentValue && warning.currentValue.trim() && (
                                <div className="bg-white rounded-md p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Info className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs font-medium text-gray-600">Giá trị hiện tại:</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900">{warning.currentValue}</p>
                                </div>
                              )}
                              
                              {warning.recommendedValue && warning.recommendedValue.trim() && (
                                <div className="bg-white rounded-md p-3 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-600">Khuyến nghị:</span>
                                  </div>
                                  <p className="text-sm font-semibold text-blue-600">{warning.recommendedValue}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {warning.field && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-gray-600">Các trường cần kiểm tra:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {warning.field.split(',').map((field, fieldIdx) => (
                                      <Badge
                                        key={fieldIdx}
                                        variant="outline"
                                        className="text-xs bg-white"
                                      >
                                        {field.trim()}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {warning.solution && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-start gap-2">
                                <Wand2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-gray-600">Giải pháp đề xuất:</span>
                                  <p className="text-sm text-gray-700 mt-1">{warning.solution}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSlotWarningsDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={() => {
                setSlotWarningsDialogOpen(false)
                // Scroll to form để user có thể điều chỉnh
                const formElement = document.querySelector('[data-slot="schedule-form"]')
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setIsFormCollapsed(false)
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Điều chỉnh thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận áp dụng lịch */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận áp dụng lịch thi đấu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn áp dụng lịch thi đấu này không? Hành động này sẽ tạo các trận đấu trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          {pendingPayload && (
            <div className="space-y-2 py-4">
              <p className="text-sm text-gray-600">
                Số trận đấu sẽ được tạo: <strong>{pendingPayload.matches?.length || 0}</strong>
              </p>
              {pendingPayload.isPublished && (
                <p className="text-sm text-orange-600">
                  ⚠️ Lịch sẽ được đánh dấu là đã công bố chính thức
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingPayload(null)
              }}
              disabled={isApplyingSchedule}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={doApplySchedule}
              disabled={isApplyingSchedule}
            >
              {isApplyingSchedule ? "Đang áp dụng..." : "Xác nhận áp dụng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
