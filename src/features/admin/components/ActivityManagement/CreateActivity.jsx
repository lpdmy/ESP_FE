import { useState, useRef, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"
import { SimpleSelect } from "@/common/components/ui/select"
import { Checkbox } from "@/common/components/ui/checkbox"
import { Switch } from "@/common/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog"
import { toast } from "react-toastify"
import { ArrowLeft, ArrowRight, Save, Upload, Plus, X, CheckCircle, Star, Trophy, Eye, Calendar, MapPin, Users, User, Clock, Edit2, Trash2, Info, FileText } from "lucide-react"
import { ROUTES } from "@/common/constants/routes"
import { uploadImage } from "@/common/utils/upload"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { GradingCriteriaSection } from "./GradingCriteriaSection"
import { vnTimeToUTC } from "@/common/utils/dateUtils"
import { LoadingCard, LoadingOverlay } from "@/common/components/ui/loading"
import dayjs from "dayjs"

export default function CreateActivity() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode") // "manual" or "template"
  const [currentStep, setCurrentStep] = useState(1)
  const [templateChecklist, setTemplateChecklist] = useState([]) // Checklist from template
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSpeakerDialogOpen, setIsSpeakerDialogOpen] = useState(false)
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState(null)
  const [editingProgramIndex, setEditingProgramIndex] = useState(null)
  const [speakerForm, setSpeakerForm] = useState({ name: "", title: "", bio: "", image: "" })
  const [speakerImageFile, setSpeakerImageFile] = useState(null)
  const [speakerImagePreview, setSpeakerImagePreview] = useState("")
  const [isUploadingSpeakerImage, setIsUploadingSpeakerImage] = useState(false)
  const speakerImageInputRef = useRef(null)
  const [programForm, setProgramForm] = useState({ title: "", time: "", description: "" })
  const [customSportInput, setCustomSportInput] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState(null) // Lưu file object chưa upload
  const [thumbnailPreview, setThumbnailPreview] = useState("") // URL preview từ local file
  const [gradingEnabled, setGradingEnabled] = useState(false) // Bật/tắt chấm điểm
  const [gradingCriteria, setGradingCriteria] = useState([]) // Danh sách tiêu chí chấm điểm
  const [onlyTeacherCanRegister, setOnlyTeacherCanRegister] = useState(false) // Chỉ giáo viên mới được đăng ký
  const [registrationType, setRegistrationType] = useState("individual") // "individual" or "group"
  const [dateErrors, setDateErrors] = useState({
    startDate: "",
    endDate: "",
    registerDate: "",
    endRegisterDate: "",
    submissionDeadline: "",
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subType: "",
    location: "",
    organizer: "",
    thumbnail: "",
    startDate: "",
    endDate: "",
    registerDate: "",
    endRegisterDate: "",
    maxParticipants: "",
    sportsCategories: [],
    sportsConfigurations: [],
    competitionType: "",
    theme: "",
    // CreativeContest fields (gộp DrawingContest và CreativeWriting)
    paperSize: "",
    drawingMedium: "",
    submissionFormat: "",
    genre: "",
    wordLimit: "",
    writingFormat: "",
    // Problem/Submission fields - chỉ áp dụng cho CreativeContest
    problemText: "",
    problemFileUrl: "",
    submissionDeadline: "",
    rules: [""],
    speakers: [], // [{ name: "", title: "", bio: "", image: "" }]
    programItems: [], // [{ title: "", time: "", description: "" }]
    starPointRewards: {
      registration: "", // Điểm khi đăng ký tham gia
      awards: [
        // { name: "Giải Nhất", points: "" },
        // { name: "Giải Nhì", points: "" },
      ],
    },
    registrationSettings: {
      groupRegistration: {
        minMembers: 3,
        maxMembers: 6,
        requireLeader: true,
      },
    },
  })

  const steps = [
    { number: 1, title: "Thông tin cơ bản", description: "Tiêu đề, mô tả, địa điểm" },
    { number: 2, title: "Lịch trình", description: "Thời gian diễn ra và đăng ký" },
    { number: 3, title: "Chi tiết hoạt động", description: "Phân loại và thông tin chuyên biệt" },
    { number: 4, title: "Quy định", description: "Quy định và yêu cầu tham gia" },
    { number: 5, title: "Xem lại & Xuất bản", description: "Kiểm tra và xuất bản" },
  ]

  const categories = [
    { value: "activity", label: "Hoạt động ngoại khóa" },
    { value: "event", label: "Sự kiện" },
  ]

  const subTypes = [
    { value: "SportsFestival", label: "Hội thao" },
    { value: "CreativeContest", label: "Cuộc thi sáng tạo" },
    { value: "SeminarWorkshop", label: "Hội thảo / Workshop" },
    { value: "Other", label: "Khác" },
  ]

  const competitionTypes = [
    { value: "Individual", label: "Cá nhân" },
    { value: "Team", label: "Đồng đội" },
    { value: "Mixed", label: "Kết hợp" },
  ]

  const sportsOptions = [
    "Chạy 100m",
    "Chạy 400m",
    "Nhảy cao",
    "Nhảy xa",
    "Ném bóng",
    "Bóng đá",
    "Bóng chuyền",
    "Bóng rổ",
  ]

  // State for save as template dialog
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateChecklistItems, setTemplateChecklistItems] = useState([""])

  // State for template selection (when mode=template)
  const [templates, setTemplates] = useState([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateList, setShowTemplateList] = useState(mode === "template") // Show list if mode=template

  // Helper: Get SubType label
  const getSubTypeLabel = (subType) => {
    const subTypeMap = {
      SportsFestival: "Hội thao",
      CreativeContest: "Cuộc thi sáng tạo",
      SeminarWorkshop: "Hội thảo",
      Other: "Khác"
    }
    return subTypeMap[subType] || subType
  }

  // Helper: Deep merge objects recursively
  const deepMerge = (target, source) => {
    if (!source || typeof source !== 'object') return target
    if (!target || typeof target !== 'object') return source

    const output = { ...target }
    
    Object.keys(source).forEach(key => {
      const sourceValue = source[key]
      const targetValue = target[key]
      
      if (Array.isArray(sourceValue)) {
        // Arrays: replace entirely (no merge)
        output[key] = [...sourceValue]
      } else if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        // Nested objects: recursive merge
        output[key] = deepMerge(targetValue || {}, sourceValue)
      } else if (sourceValue !== undefined && sourceValue !== null) {
        // Primitives: replace
        output[key] = sourceValue
      }
      // If sourceValue is null/undefined, keep target value
    })
    
    return output
  }

  // Helper: Convert formData to template DTO
  const formDataToTemplateDto = (templateName, templateDescription, checklist, formDataOverride = null) => {
    // Sử dụng formDataOverride nếu được truyền vào (để dùng formData đã cập nhật thumbnail)
    const dataToUse = formDataOverride || formData
    
    // Convert category string to enum number: "activity" -> 1 (Activity), "event" -> 2 (Event)
    const categoryMap = {
      "activity": 1, // ActivityType.Activity
      "event": 2    // ActivityType.Event
    };
    const categoryValue = categoryMap[dataToUse.category] || 1; // Default to Activity (1)
    
    return {
      templateName: templateName || dataToUse.title || "Mẫu hoạt động",
      templateDescription: templateDescription || dataToUse.description || null,
      subType: dataToUse.subType,
      title: dataToUse.title,
      description: dataToUse.description,
      category: categoryValue,
      location: dataToUse.location,
      organizer: dataToUse.organizer,
      thumbnailUrl: dataToUse.thumbnail,
      startDate: dataToUse.startDate || null,
      endDate: dataToUse.endDate || null,
      registerDate: dataToUse.registerDate || null,
      endRegisterDate: dataToUse.endRegisterDate || null,
      maxParticipants: dataToUse.maxParticipants || null,
      competitionType: dataToUse.competitionType || null,
      theme: dataToUse.theme || null,
      genre: dataToUse.genre || null,
      paperSize: dataToUse.paperSize || null,
      drawingMedium: dataToUse.drawingMedium || null,
      submissionFormat: dataToUse.submissionFormat || null,
      problemText: dataToUse.problemText || null,
      problemFileUrl: dataToUse.problemFileUrl || null,
      submissionDeadline: dataToUse.submissionDeadline || null,
      isGrade: gradingEnabled,
      gradingSettings: gradingEnabled && gradingCriteria.length > 0
        ? JSON.stringify({ criteria: gradingCriteria })
        : null,
      registrationSettings: dataToUse.registrationSettings
        ? JSON.stringify(dataToUse.registrationSettings)
        : null,
      onlyTeacherCanRegister: onlyTeacherCanRegister,
      starPointRewards: dataToUse.starPointRewards
        ? JSON.stringify(dataToUse.starPointRewards)
        : null,
      rules: dataToUse.rules?.filter(r => r && r.trim()) || [],
      sportsCategories: dataToUse.sportsCategories || [],
      sportsConfigurations: dataToUse.sportsConfigurations || [],
      speakers: dataToUse.speakers || [],
      programItems: dataToUse.programItems || [],
      checklist: checklist?.filter(c => c && c.trim()) || [],
    }
  }

  // Load templates when mode=template
  useEffect(() => {
    if (mode === "template") {
      const loadTemplates = async () => {
        setIsLoadingTemplates(true)
        try {
          const token = localStorage.getItem("token")
          const response = await executeApiCall(
            activityService.getTemplates.bind(activityService),
            [token],
            { setLoading: setIsLoadingTemplates, setError: () => {} }
          )
          
          // Response format từ handleApiResponse: { statusCode: 200, message: "...", data: [...] }
          // handleApiResponse trả về response.json() nên response là object trực tiếp
          let templatesData = []
          
          if (response?.data && Array.isArray(response.data)) {
            // Case 1: response.data is the array (đúng format)
            templatesData = response.data
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            // Case 2: response.data.data is the array (nếu wrap thêm một lớp)
            templatesData = response.data.data
          } else if (Array.isArray(response)) {
            // Case 3: response is directly the array
            templatesData = response
          }
          
          setTemplates(templatesData)
          setShowTemplateList(true)
          setSelectedTemplate(null) // Ensure no template is selected initially
      } catch (error) {
          toast.error(error?.message || "Không thể tải danh sách mẫu. Vui lòng thử lại.")
          setTemplates([])
          setShowTemplateList(true)
        } finally {
          setIsLoadingTemplates(false)
        }
      }
      loadTemplates()
    }
  }, [mode])


  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ""] })
  }

  const handleRemoveRule = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index)
    setFormData({ ...formData, rules: newRules })
  }

  const handleRuleChange = (index, value) => {
    const newRules = [...formData.rules]
    newRules[index] = value
    setFormData({ ...formData, rules: newRules })
  }

  const handleSportToggle = (sport) => {
    setFormData((prev) => {
      const isSelected = prev.sportsCategories.includes(sport)
      const newSports = isSelected
        ? prev.sportsCategories.filter((s) => s !== sport)
        : [...prev.sportsCategories, sport]

      let newConfigs = prev.sportsConfigurations
      if (isSelected) {
        newConfigs = prev.sportsConfigurations.filter((cfg) => cfg.sportName !== sport)
      } else if (!prev.sportsConfigurations.some((cfg) => cfg.sportName === sport)) {
        newConfigs = [...prev.sportsConfigurations, { sportName: sport, maxMembers: "" }]
      }

      return {
        ...prev,
        sportsCategories: newSports,
        sportsConfigurations: newConfigs,
      }
    })
  }

  const handleAddCustomSport = () => {
    const sportName = customSportInput.trim()
    if (!sportName) {
      toast.error("Vui lòng nhập tên môn thể thao")
      return
    }
    if (formData.sportsCategories.includes(sportName)) {
      toast.error("Môn thể thao này đã được thêm")
      return
    }
    if (sportsOptions.includes(sportName)) {
      toast.error("Môn thể thao này đã có trong danh sách")
      return
    }
    setFormData((prev) => ({
      ...prev,
      sportsCategories: [...prev.sportsCategories, sportName],
      sportsConfigurations: prev.sportsConfigurations.some((cfg) => cfg.sportName === sportName)
        ? prev.sportsConfigurations
        : [...prev.sportsConfigurations, { sportName, maxMembers: "" }],
    }))
    setCustomSportInput("")
    toast.success("Đã thêm môn thể thao")
  }

  const handleRemoveCustomSport = (sport) => {
    setFormData((prev) => ({
      ...prev,
      sportsCategories: prev.sportsCategories.filter((s) => s !== sport),
      sportsConfigurations: prev.sportsConfigurations.filter((cfg) => cfg.sportName !== sport),
    }))
    toast.success("Đã xóa môn thể thao")
  }

  const handleSportMaxMembersChange = (sportName, value) => {
    const sanitizedValue = value === "" ? "" : Math.max(1, parseInt(value, 10) || 0)
    setFormData((prev) => ({
      ...prev,
      sportsConfigurations: prev.sportsConfigurations.map((cfg) =>
        cfg.sportName === sportName ? { ...cfg, maxMembers: sanitizedValue } : cfg
      ),
    }))
  }

  const getSportMaxMembers = (sportName) => {
    const cfg = formData.sportsConfigurations.find((item) => item.sportName === sportName)
    return cfg?.maxMembers ?? ""
  }

  const handleAddAward = () => {
    setFormData({
      ...formData,
      starPointRewards: {
        ...formData.starPointRewards,
        awards: [...formData.starPointRewards.awards, { name: "", points: "" }],
      },
    })
  }

  const handleRemoveAward = (index) => {
    const newAwards = formData.starPointRewards.awards.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      starPointRewards: {
        ...formData.starPointRewards,
        awards: newAwards,
      },
    })
  }

  const handleAwardChange = (index, field, value) => {
    const newAwards = [...formData.starPointRewards.awards]
    newAwards[index] = { ...newAwards[index], [field]: value }
    setFormData({
      ...formData,
      starPointRewards: {
        ...formData.starPointRewards,
        awards: newAwards,
      },
    })
  }

  // Handler cho Diễn giả
  const handleOpenSpeakerDialog = (index = null) => {
    if (index !== null) {
      setEditingSpeakerIndex(index)
      const speaker = formData.speakers[index]
      setSpeakerForm({ ...speaker })
      setSpeakerImagePreview(speaker.image || "")
      setSpeakerImageFile(null)
    } else {
      setEditingSpeakerIndex(null)
      setSpeakerForm({ name: "", title: "", bio: "", image: "" })
      setSpeakerImagePreview("")
      setSpeakerImageFile(null)
    }
    setIsSpeakerDialogOpen(true)
  }

  const handleSpeakerImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB")
      return
    }

    setSpeakerImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setSpeakerImagePreview(previewUrl)
  }

  const handleSaveSpeaker = async () => {
    if (!speakerForm.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả")
      return
    }

    try {
      let imageUrl = speakerForm.image

      // Upload ảnh nếu có file mới
      if (speakerImageFile) {
        setIsUploadingSpeakerImage(true)
        try {
          imageUrl = await uploadImage(speakerImageFile)
          if (!imageUrl) {
            toast.error("Không thể upload ảnh. Vui lòng thử lại.")
            setIsUploadingSpeakerImage(false)
            return
          }
          // Cleanup preview URL sau khi upload thành công
          if (speakerImagePreview && speakerImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(speakerImagePreview)
          }
        } catch (error) {
          toast.error(error.message || "Có lỗi xảy ra khi upload ảnh")
          setIsUploadingSpeakerImage(false)
          return
        } finally {
          setIsUploadingSpeakerImage(false)
        }
      }

      const speakerData = {
        ...speakerForm,
        image: imageUrl,
      }

    const newSpeakers = [...formData.speakers]
    if (editingSpeakerIndex !== null) {
        newSpeakers[editingSpeakerIndex] = speakerData
    } else {
        newSpeakers.push(speakerData)
    }
    setFormData({ ...formData, speakers: newSpeakers })
    setIsSpeakerDialogOpen(false)
    setSpeakerForm({ name: "", title: "", bio: "", image: "" })
      setSpeakerImagePreview("")
      setSpeakerImageFile(null)
    setEditingSpeakerIndex(null)
    toast.success(editingSpeakerIndex !== null ? "Cập nhật diễn giả thành công" : "Thêm diễn giả thành công")
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu diễn giả")
    }
  }

  const handleRemoveSpeaker = (index) => {
    const newSpeakers = formData.speakers.filter((_, i) => i !== index)
    setFormData({ ...formData, speakers: newSpeakers })
    toast.success("Đã xóa diễn giả")
  }

  // Handler cho Mục chương trình
  const handleOpenProgramDialog = (index = null) => {
    if (index !== null) {
      setEditingProgramIndex(index)
      setProgramForm({ ...formData.programItems[index] })
    } else {
      setEditingProgramIndex(null)
      setProgramForm({ title: "", time: "", description: "" })
    }
    setIsProgramDialogOpen(true)
  }

  const handleSaveProgram = () => {
    if (!programForm.title.trim()) {
      toast.error("Vui lòng nhập tên mục chương trình")
      return
    }
    const newPrograms = [...formData.programItems]
    if (editingProgramIndex !== null) {
      newPrograms[editingProgramIndex] = { ...programForm }
    } else {
      newPrograms.push({ ...programForm })
    }
    setFormData({ ...formData, programItems: newPrograms })
    setIsProgramDialogOpen(false)
    setProgramForm({ title: "", time: "", description: "" })
    setEditingProgramIndex(null)
    toast.success(editingProgramIndex !== null ? "Cập nhật mục chương trình thành công" : "Thêm mục chương trình thành công")
  }

  const handleRemoveProgram = (index) => {
    const newPrograms = formData.programItems.filter((_, i) => i !== index)
    setFormData({ ...formData, programItems: newPrograms })
    toast.success("Đã xóa mục chương trình")
  }

  // Validate dates with proper order: Now ≤ RegisterDate ≤ EndRegisterDate ≤ StartDate ≤ EndDate
  // Rule for submissionDeadline: StartDate ≤ SubmissionDeadline < EndDate
  const validateDates = (dates) => {
    const errors = {
      registerDate: "",
      endRegisterDate: "",
      startDate: "",
      endDate: "",
      submissionDeadline: "",
    }

    const now = dayjs().startOf("day")
    const registerDate = dates.registerDate ? dayjs(dates.registerDate) : null
    const endRegisterDate = dates.endRegisterDate ? dayjs(dates.endRegisterDate) : null
    const startDate = dates.startDate ? dayjs(dates.startDate) : null
    const endDate = dates.endDate ? dayjs(dates.endDate) : null
    const submissionDeadline = dates.submissionDeadline ? dayjs(dates.submissionDeadline) : null

    // Rule 1: Now ≤ RegisterDate
    if (registerDate && registerDate.isBefore(now, "day")) {
      errors.registerDate = "Ngày mở đăng ký không được trước ngày hiện tại"
    }

    // Rule 2: RegisterDate ≤ EndRegisterDate
    if (registerDate && endRegisterDate && endRegisterDate.isBefore(registerDate, "day")) {
      errors.endRegisterDate = "Ngày đóng đăng ký không được trước ngày mở đăng ký"
    }

    // Rule 3: EndRegisterDate ≤ StartDate
    if (endRegisterDate && startDate && startDate.isBefore(endRegisterDate, "day")) {
      errors.startDate = "Ngày bắt đầu hoạt động không được trước ngày đóng đăng ký"
    }

    // Rule 4: StartDate ≤ EndDate
    if (startDate && endDate && endDate.isBefore(startDate, "day")) {
      errors.endDate = "Ngày kết thúc hoạt động không được trước ngày bắt đầu hoạt động"
    }

    // Rule 5: SubmissionDeadline phải sau StartDate và trước EndDate (chỉ validate nếu có submissionDeadline)
    if (submissionDeadline && dates.subType === "CreativeContest") {
      if (startDate && submissionDeadline.isBefore(startDate, "day")) {
        errors.submissionDeadline = "Hạn cuối nộp bài phải sau hoặc bằng ngày bắt đầu hoạt động"
      }
      if (endDate && (submissionDeadline.isAfter(endDate, "day") || submissionDeadline.isSame(endDate, "day"))) {
        errors.submissionDeadline = "Hạn cuối nộp bài phải trước ngày kết thúc hoạt động"
      }
    }

    return errors
  }

  // Get min date for each field based on chain
  const getMinDate = (field) => {
    const now = dayjs().startOf("day").format("YYYY-MM-DD")
    
    switch (field) {
      case "registerDate":
        return now // Can't be before today
      case "endRegisterDate":
        return formData.registerDate || now // Can't be before registerDate
      case "startDate":
        return formData.endRegisterDate || formData.registerDate || now // Can't be before endRegisterDate
      case "endDate":
        return formData.startDate || formData.endRegisterDate || formData.registerDate || now // Can't be before startDate
      default:
        return now
    }
  }

  const handleDateChange = (field, label) => (e) => {
    const value = e.target.value

    // Validate date value before processing
    try {
      if (value && !dayjs(value).isValid()) {
        toast.error(`Giá trị ngày không hợp lệ cho ${label}`)
        return
      }
    } catch (error) {
      console.error(`Error validating date for ${field}:`, error)
      toast.error(`Lỗi xử lý ngày cho ${label}`)
      return
    }

    // Update form data
    const updatedFormData = {
      ...formData,
      [field]: value,
    }

    // Auto-reset dates in the chain that become invalid
    if (field === "registerDate" && value) {
      // If registerDate changes, reset endRegisterDate, startDate, endDate if they become invalid
      try {
        const newRegisterDate = dayjs(value)
        if (formData.endRegisterDate && dayjs(formData.endRegisterDate).isValid() && dayjs(formData.endRegisterDate).isBefore(newRegisterDate, "day")) {
          updatedFormData.endRegisterDate = ""
        }
        if (formData.startDate && dayjs(formData.startDate).isValid() && dayjs(formData.startDate).isBefore(newRegisterDate, "day")) {
          updatedFormData.startDate = ""
        }
        if (formData.endDate && dayjs(formData.endDate).isValid() && dayjs(formData.endDate).isBefore(newRegisterDate, "day")) {
          updatedFormData.endDate = ""
        }
      } catch (error) {
        console.error("Error processing registerDate change:", error)
      }
    } else if (field === "endRegisterDate" && value) {
      // If endRegisterDate changes, reset startDate, endDate if they become invalid
      try {
        const newEndRegisterDate = dayjs(value)
        if (formData.startDate && dayjs(formData.startDate).isValid() && dayjs(formData.startDate).isBefore(newEndRegisterDate, "day")) {
          updatedFormData.startDate = ""
        }
        if (formData.endDate && dayjs(formData.endDate).isValid() && dayjs(formData.endDate).isBefore(newEndRegisterDate, "day")) {
          updatedFormData.endDate = ""
        }
      } catch (error) {
        console.error("Error processing endRegisterDate change:", error)
      }
    } else if (field === "startDate" && value) {
      // If startDate changes, reset endDate if it becomes invalid
      try {
        const newStartDate = dayjs(value)
        if (formData.endDate && dayjs(formData.endDate).isValid() && dayjs(formData.endDate).isBefore(newStartDate, "day")) {
          updatedFormData.endDate = ""
        }
      } catch (error) {
        console.error("Error processing startDate change:", error)
      }
    } else if (field === "endDate" && value && formData.submissionDeadline) {
      // If endDate changes, reset submissionDeadline if it becomes invalid
      try {
        const newEndDate = dayjs(value)
        if (dayjs(formData.submissionDeadline).isValid() && 
            (dayjs(formData.submissionDeadline).isAfter(newEndDate, "day") || dayjs(formData.submissionDeadline).isSame(newEndDate, "day"))) {
          updatedFormData.submissionDeadline = ""
        }
      } catch (error) {
        console.error("Error processing endDate change:", error)
      }
    }

    // Validate all dates
    const errors = validateDates(updatedFormData)
    setDateErrors(errors)
    setFormData(updatedFormData)
  }

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoạt động")
      return
    }
    if (!formData.description?.trim()) {
      toast.error("Vui lòng nhập mô tả hoạt động")
      return
    }
    if (!formData.subType) {
      toast.error("Vui lòng chọn phân loại hoạt động")
      return
    }
    if (!formData.location?.trim()) {
      toast.error("Vui lòng nhập địa điểm")
      return
    }
    if (!formData.organizer?.trim()) {
      toast.error("Vui lòng nhập đơn vị tổ chức")
      return
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Vui lòng nhập thời gian diễn ra")
      return
    }
    if (!formData.registerDate || !formData.endRegisterDate) {
      toast.error("Vui lòng nhập thời gian đăng ký")
      return
    }
    
    // Validate date order before publishing
    const dateValidationErrors = validateDates(formData)
    const hasDateErrors = Object.values(dateValidationErrors).some(error => error !== "")
    if (hasDateErrors) {
      // Show first error found
      const firstError = Object.values(dateValidationErrors).find(error => error !== "")
      toast.error(firstError || "Vui lòng kiểm tra lại thứ tự các ngày")
      setDateErrors(dateValidationErrors)
      return
    }
    
    // Validate maxParticipants (nếu có nhập thì phải > 0, không bắt buộc)
    if (formData.maxParticipants && formData.maxParticipants.trim() !== "") {
      const maxParticipantsNum = parseInt(formData.maxParticipants)
      if (isNaN(maxParticipantsNum) || maxParticipantsNum <= 0) {
        toast.error("Số người tham gia tối đa phải lớn hơn 0")
      return
      }
    }
    if (!formData.rules || formData.rules.length === 0 || formData.rules.every(r => !r.trim())) {
      toast.error("Vui lòng nhập ít nhất một quy định")
      return
    }
    if (formData.subType === "SportsFestival" && formData.sportsCategories.length === 0) {
      toast.error("Hội thao cần có ít nhất một môn thi đấu")
      return
    }
    // Date order validation (including submissionDeadline) is already done above with validateDates()
    // No need to validate again as it's already included in the dateValidationErrors check above
    
    // Validate grading settings if enabled
    if (gradingEnabled) {
      if (!gradingCriteria || gradingCriteria.length === 0) {
        toast.error("Vui lòng chọn hoặc thêm ít nhất 1 tiêu chí chấm điểm")
        return
      }
    }

    if (formData.subType === "CreativeContest") {
      const minMembers = parseInt(formData.registrationSettings?.groupRegistration?.minMembers, 10) || 1
      const maxMembersRaw = formData.registrationSettings?.groupRegistration?.maxMembers
      const maxMembers =
        maxMembersRaw === "" || maxMembersRaw === null || maxMembersRaw === undefined
          ? null
          : parseInt(maxMembersRaw, 10)
      if (minMembers < 1) {
        toast.error("Số thành viên tối thiểu phải lớn hơn 0")
        return
      }
      if (maxMembers && maxMembers < minMembers) {
        toast.error("Số thành viên tối đa phải lớn hơn hoặc bằng tối thiểu")
        return
      }
    }

    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    
    try {
      // Upload ảnh lên BE nếu có file mới được chọn
      let thumbnailUrl = formData.thumbnail // Giữ URL cũ nếu đã có (khi edit)
      
      if (thumbnailFile) {
        setIsUploadingThumbnail(true)
        try {
          thumbnailUrl = await uploadImage(thumbnailFile)
          if (!thumbnailUrl) {
            toast.error("Không thể upload ảnh. Vui lòng thử lại.")
            setIsSubmitting(false)
            setIsUploadingThumbnail(false)
            return
          }
          // Cleanup preview URL sau khi upload thành công
          if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview)
            setThumbnailPreview("")
          }
          setThumbnailFile(null)
          setFormData({ ...formData, thumbnail: thumbnailUrl })
        } catch (error) {
          toast.error(error.message || "Có lỗi xảy ra khi upload ảnh")
          setIsSubmitting(false)
          setIsUploadingThumbnail(false)
          return
        } finally {
          setIsUploadingThumbnail(false)
        }
      } else if (!thumbnailUrl) {
        toast.error("Vui lòng chọn ảnh đại diện cho hoạt động")
        setIsSubmitting(false)
        return
      }

      // Map formData to API format
      // Convert category string to enum number: "activity" -> 1 (Activity), "event" -> 2 (Event)
      const categoryMap = {
        "activity": 1, // ActivityType.Activity
        "event": 2    // ActivityType.Event
      };
      const categoryValue = categoryMap[formData.category] || 1; // Default to Activity (1)
      
      const sportsConfigurationsPayload =
        formData.subType === "SportsFestival"
          ? formData.sportsCategories.map((sport) => {
              const cfg = formData.sportsConfigurations.find((item) => item.sportName === sport)
              const maxMembersValue = cfg?.maxMembers
              return {
                sportName: sport,
                maxMembers:
                  maxMembersValue === "" || maxMembersValue === undefined || maxMembersValue === null
                    ? null
                    : parseInt(maxMembersValue, 10),
              }
            })
          : []

      const registrationSettingsPayload =
        formData.subType === "CreativeContest" && registrationType === "group"
          ? {
              groupRegistration: {
                minMembers: parseInt(formData.registrationSettings?.groupRegistration?.minMembers, 10) || 1,
                maxMembers:
                  formData.registrationSettings?.groupRegistration?.maxMembers === "" ||
                  formData.registrationSettings?.groupRegistration?.maxMembers === null ||
                  formData.registrationSettings?.groupRegistration?.maxMembers === undefined
                    ? null
                    : parseInt(formData.registrationSettings?.groupRegistration?.maxMembers, 10),
                requireLeader: !!formData.registrationSettings?.groupRegistration?.requireLeader,
              },
            }
          : null

      const activityData = {
        title: formData.title,
        description: formData.description,
        category: categoryValue,
        subType: formData.subType,
        location: formData.location,
        organizer: formData.organizer,
        thumbnailUrl: thumbnailUrl,
        // Convert VN time (UTC+7) to UTC before sending to BE
        // Start dates: 00:00:00 UTC, End dates: 23:59:59 UTC
        // Wrap in try-catch to prevent RangeError: Invalid time value
        startDate: (() => {
          try {
            if (formData.startDate && dayjs(formData.startDate).isValid()) {
              return vnTimeToUTC(formData.startDate, false)
            }
            return null
          } catch (error) {
            console.error("Error processing startDate:", error)
            return null
          }
        })(),
        endDate: (() => {
          try {
            if (formData.endDate && dayjs(formData.endDate).isValid()) {
              return vnTimeToUTC(formData.endDate, true)
            }
            return null
          } catch (error) {
            console.error("Error processing endDate:", error)
            return null
          }
        })(),
        registerDate: (() => {
          try {
            if (formData.registerDate && dayjs(formData.registerDate).isValid()) {
              return vnTimeToUTC(formData.registerDate, false)
            }
            return null
          } catch (error) {
            console.error("Error processing registerDate:", error)
            return null
          }
        })(),
        endRegisterDate: (() => {
          try {
            if (formData.endRegisterDate && dayjs(formData.endRegisterDate).isValid()) {
              return vnTimeToUTC(formData.endRegisterDate, true)
            }
            return null
          } catch (error) {
            console.error("Error processing endRegisterDate:", error)
            return null
          }
        })(),
        // maxParticipants: null = không giới hạn, có giá trị = giới hạn số người
        maxParticipants: (formData.maxParticipants && formData.maxParticipants.trim() !== "") 
          ? parseInt(formData.maxParticipants) 
          : null,
        rules: formData.rules.filter(r => r.trim()),
        // SportsFestival fields
        sportsCategories: formData.subType === "SportsFestival" ? formData.sportsCategories : [],
        sportsConfigurations: formData.subType === "SportsFestival" ? sportsConfigurationsPayload : [],
        competitionType: formData.subType === "SportsFestival" ? formData.competitionType : null,
        // CreativeContest fields
        theme: formData.subType === "CreativeContest" ? formData.theme : null,
        genre: formData.subType === "CreativeContest" ? formData.genre : null,
        paperSize: formData.subType === "CreativeContest" ? formData.paperSize : null,
        drawingMedium: formData.subType === "CreativeContest" ? formData.drawingMedium : null,
        submissionFormat: formData.subType === "CreativeContest" ? formData.submissionFormat : null,
        // Problem/Submission fields - chỉ áp dụng cho CreativeContest
        problemText: formData.subType === "CreativeContest" ? formData.problemText : null,
        problemFileUrl: formData.subType === "CreativeContest" ? formData.problemFileUrl : null,
        submissionDeadline: (() => {
          try {
            if (formData.subType === "CreativeContest" && formData.submissionDeadline) {
              const deadline = dayjs(formData.submissionDeadline)
              if (deadline.isValid()) {
                return vnTimeToUTC(formData.submissionDeadline, true)
              }
            }
            return null
          } catch (error) {
            console.error("Error processing submissionDeadline:", error)
            return null
          }
        })(),
        // SeminarWorkshop fields
        speakers: formData.subType === "SeminarWorkshop" ? formData.speakers.map((s, index) => ({
          name: s.name,
          title: s.title,
          bio: s.bio,
          imageUrl: s.image,
          order: index
        })) : [],
        programItems: formData.subType === "SeminarWorkshop" ? formData.programItems.map((p, index) => ({
          title: p.title,
          time: p.time,
          description: p.description,
          order: index
        })) : [],
        // StarPoint Rewards - map from frontend format to backend format
        starPointRewards: {
          registration: formData.starPointRewards.registration || "",
          awards: formData.starPointRewards.awards || []
        },
        // Grading Settings (only criteria, enabled is stored in IsGrade column)
        gradingSettings:
          gradingEnabled && gradingCriteria && gradingCriteria.length > 0
            ? {
                criteria: gradingCriteria,
              }
            : null,
        // Registration Settings
        onlyTeacherCanRegister: onlyTeacherCanRegister,
        registrationSettings: registrationSettingsPayload,
      }

      const response = await executeApiCall(
        activityService.createActivity.bind(activityService),
        [activityData, token],
        { setError: () => {} }
      )

      if (response?.data) {
        toast.success("Hoạt động mới đã được xuất bản thành công.")
        navigate("/admin/activities")
      }
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi tạo hoạt động")
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleSaveAsTemplate = async () => {
    try {
      if (!templateName.trim()) {
        toast.error("Vui lòng nhập tên mẫu")
        return
      }

      if (!formData.subType) {
        toast.error("Vui lòng chọn phân loại hoạt động trước khi lưu mẫu")
        return
      }

      setIsSubmitting(true)
      
      // Upload thumbnail nếu có file mới được chọn (chưa upload)
      let thumbnailUrl = formData.thumbnail // Giữ URL cũ nếu đã có
      
      if (thumbnailFile) {
    try {
          thumbnailUrl = await uploadImage(thumbnailFile)
          if (!thumbnailUrl) {
            toast.error("Không thể upload ảnh. Vui lòng thử lại.")
            setIsSubmitting(false)
            return
          }
          // Cleanup preview URL sau khi upload thành công
          if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview)
            setThumbnailPreview("")
          }
          setThumbnailFile(null)
          // Cập nhật formData với URL mới
          setFormData(prevFormData => ({ ...prevFormData, thumbnail: thumbnailUrl }))
    } catch (error) {
          toast.error(error.message || "Có lỗi xảy ra khi upload ảnh")
          setIsSubmitting(false)
          return
        }
      }
      
      // Đảm bảo formData.thumbnail được cập nhật với URL mới nhất
      const finalFormData = { ...formData, thumbnail: thumbnailUrl }
      
      const token = localStorage.getItem("token")
      const templateDto = formDataToTemplateDto(
        templateName.trim(),
        templateDescription.trim() || null,
        templateChecklistItems,
        finalFormData // Pass finalFormData với thumbnail đã upload
      )
      
        const response = await executeApiCall(
        activityService.saveAsTemplate.bind(activityService),
        [templateDto, token],
          { setLoading: setIsSubmitting, setError: () => {} }
        )
        
      
      // Response format từ handleApiResponse: { statusCode: 200, message: "...", data: {...} }
      // Hoặc có thể wrap: { data: { statusCode: 200, message: "...", data: {...} } }
      // Check if response is successful (statusCode 200)
      const isSuccess = response?.statusCode === 200 || 
                       (response?.data && response?.data?.statusCode === 200) ||
                       (response?.data && response?.data?.data) // Fallback: có data thì coi là success
      
      if (isSuccess) {
        // Success - show success toast (màu xanh)
        const successMessage = response?.message || 
                              response?.data?.message || 
                              "Đã lưu mẫu hoạt động thành công. Bạn có thể sử dụng lại sau."
        toast.success(successMessage)
        
        // Close dialog and reset form
        setIsSaveTemplateDialogOpen(false)
        setTemplateName("")
        setTemplateDescription("")
        setTemplateChecklistItems([""])
      } else {
        // Error case
        const errorMessage = response?.message || 
                            response?.data?.message || 
                            "Không thể lưu mẫu. Vui lòng thử lại."
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error(error?.message || error?.data?.message || "Không thể lưu mẫu. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // File upload handlers
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh (PNG, JPG, JPEG)")
        return
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File ảnh không được vượt quá 10MB")
        return
      }
      
      // Cleanup preview URL cũ nếu có
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
      
      // Chỉ lưu file và tạo preview, không upload ngay
      setThumbnailFile(file)
      
      // Tạo preview URL từ local file
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
      
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh (PNG, JPG, JPEG)")
        return
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File ảnh không được vượt quá 10MB")
        return
      }
      
      // Cleanup preview URL cũ nếu có
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
      
      // Chỉ lưu file và tạo preview, không upload ngay
      setThumbnailFile(file)
      
      // Tạo preview URL từ local file
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
      
    }
  }

  const handleRemoveImage = () => {
    // Cleanup preview URL để tránh memory leak
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailFile(null)
    setThumbnailPreview("")
    setFormData({ ...formData, thumbnail: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Cleanup preview URL khi component unmount hoặc khi thay đổi file
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])


  // Apply template to form
  const handleApplyTemplate = async (template) => {
    try {
      if (!template.prefillData) {
        toast.error("Mẫu này không có dữ liệu để áp dụng")
        return
      }

      const prefillData = template.prefillData
      
      // Parse starPointRewards và registrationSettings nếu là string (JSON)
      let starPointRewards = null
      if (prefillData.starPointRewards) {
        try {
          starPointRewards = typeof prefillData.starPointRewards === 'string'
            ? JSON.parse(prefillData.starPointRewards)
            : prefillData.starPointRewards
        } catch (e) {
          starPointRewards = null
        }
      }

      let registrationSettings = null
      if (prefillData.registrationSettings) {
        try {
          registrationSettings = typeof prefillData.registrationSettings === 'string'
            ? JSON.parse(prefillData.registrationSettings)
            : prefillData.registrationSettings
        } catch (e) {
          registrationSettings = null
        }
      }

      // Apply prefill data to form
      setFormData(prevFormData => {
        const merged = deepMerge(prevFormData, {
          title: prefillData.title || "",
          description: prefillData.description || "",
          category: prefillData.category === 1 ? "activity" : "event",
          subType: template.subType || "",
          location: prefillData.location || "",
          organizer: prefillData.organizer || "",
          thumbnail: prefillData.thumbnailUrl || "",
          startDate: prefillData.startDate || "",
          endDate: prefillData.endDate || "",
          registerDate: prefillData.registerDate || "",
          endRegisterDate: prefillData.endRegisterDate || "",
          maxParticipants: prefillData.maxParticipants || "",
          competitionType: prefillData.competitionType || "",
          theme: prefillData.theme || "",
          genre: prefillData.genre || "",
          paperSize: prefillData.paperSize || "",
          drawingMedium: prefillData.drawingMedium || "",
          submissionFormat: prefillData.submissionFormat || "",
          problemText: prefillData.problemText || "",
          problemFileUrl: prefillData.problemFileUrl || "",
          submissionDeadline: prefillData.submissionDeadline || "",
          rules: prefillData.rules && Array.isArray(prefillData.rules) ? prefillData.rules : [""],
          sportsCategories: prefillData.sportsCategories || [],
          sportsConfigurations: prefillData.sportsConfigurations || [],
          speakers: prefillData.speakers || [],
          programItems: prefillData.programItems || [],
          // Map starPointRewards và registrationSettings
          starPointRewards: starPointRewards || prevFormData.starPointRewards,
          registrationSettings: registrationSettings || prevFormData.registrationSettings,
        })
        return merged
      })

      // Set other states
      if (prefillData.isGrade !== undefined) {
        setGradingEnabled(prefillData.isGrade)
      }
      if (prefillData.gradingSettings) {
        try {
          const gradingSettings = typeof prefillData.gradingSettings === 'string'
            ? JSON.parse(prefillData.gradingSettings)
            : prefillData.gradingSettings
          if (gradingSettings?.criteria) {
            setGradingCriteria(gradingSettings.criteria)
          }
        } catch (e) {
        }
      }
      if (prefillData.onlyTeacherCanRegister !== undefined) {
        setOnlyTeacherCanRegister(prefillData.onlyTeacherCanRegister)
      }
      // Load thumbnail khi apply template
      if (prefillData.thumbnailUrl) {
        setThumbnailPreview(prefillData.thumbnailUrl)
        // Cập nhật vào formData.thumbnail để lưu vào form
        setFormData(prevFormData => ({
          ...prevFormData,
          thumbnail: prefillData.thumbnailUrl
        }))
      }

      // Apply checklist if available
      if (template.checklist && Array.isArray(template.checklist)) {
        setTemplateChecklist(template.checklist)
      }

      // Increment usage count
      try {
        const token = localStorage.getItem("token")
        await executeApiCall(
          activityService.incrementTemplateUsage.bind(activityService),
          [template.id, token],
          { setLoading: () => {}, setError: () => {} }
        )
      } catch (error) {
      }

      setSelectedTemplate(template)
      setShowTemplateList(false)
      toast.success(`Đã áp dụng mẫu "${template.name}" thành công`)
    } catch (error) {
      toast.error("Không thể áp dụng mẫu. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading Overlay for Publishing */}
      <LoadingOverlay isLoading={isSubmitting} text="Đang xuất bản hoạt động..." />

      {/* Template Selection UI (when mode=template and showTemplateList=true) */}
      {mode === "template" && showTemplateList && !selectedTemplate && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chọn mẫu hoạt động</h2>
                <p className="text-gray-600 mt-1">Chọn một mẫu để tạo hoạt động mới nhanh chóng</p>
              </div>
              <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN.ACTIVITIES)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>

            {isLoadingTemplates ? (
              <LoadingCard isLoading={true} text="Đang tải danh sách mẫu..." />
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chưa có mẫu nào</p>
                <p className="text-gray-500 text-sm mt-2">Bạn có thể tạo mẫu mới sau khi tạo hoạt động</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?fromLanding=true`)
                  }}
                >
                  Tạo hoạt động mới
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                        {template.isSystemTemplate && (
                          <Badge variant="secondary" className="text-xs">Hệ thống</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{getSubTypeLabel(template.subType)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Đã dùng {template.usageCount || 0} lần</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyTemplate(template)
                        }}
                      >
                        Sử dụng mẫu này
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show form only if template is selected or mode is not template */}
      {(mode !== "template" || selectedTemplate) && (
        <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link to={ROUTES.ADMIN.ACTIVITIES}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Tạo hoạt động mới</h1>
          <p className="text-gray-600 mt-1">Tạo hoạt động ngoại khóa, sự kiện hoặc cuộc thi cho học sinh</p>
        </div>
      </div>

      {/* Template Checklist - Hiển thị ở đầu form */}
      {templateChecklist.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Label className="text-base font-semibold text-purple-900 mb-2 block">
                  Checklist từ mẫu đã được áp dụng:
                </Label>
                <ul className="space-y-2">
                  {templateChecklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-purple-700 mt-2 italic">
                  Checklist này được áp dụng từ mẫu "{selectedTemplate?.name}". Bạn có thể tiếp tục điền thông tin hoạt động bên dưới.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onClick={() => {
                    // Allow clicking on completed steps or current step
                    if (currentStep >= step.number || currentStep === step.number) {
                      setCurrentStep(step.number)
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white scale-110 shadow-lg"
                        : currentStep > step.number
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step.number ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 cursor-pointer transition-colors ${
                      currentStep > step.number ? "bg-blue-500" : "bg-gray-200"
                    }`}
                    onClick={() => {
                      // Click vào line cũng chuyển đến step tiếp theo
                      if (currentStep <= step.number) {
                        setCurrentStep(step.number + 1)
                      } else {
                        setCurrentStep(step.number)
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Current Step Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Bước <span className="font-semibold text-blue-600">{currentStep}</span> / {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="grid gap-6">
              <InputField
                label="Tiêu đề hoạt động"
                placeholder="Ví dụ: Hội thao Liên trường 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <TextareaField
                label="Mô tả chi tiết"
                placeholder="Mô tả chi tiết về hoạt động..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Địa điểm"
                  placeholder="Ví dụ: Sân vận động FPT"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />

                <InputField
                  label="Đơn vị tổ chức"
                  placeholder="Ví dụ: Đoàn trường"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Ảnh đại diện</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {(thumbnailPreview || formData.thumbnail) ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview || formData.thumbnail}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {isUploadingThumbnail ? (
                        <div className="bg-white/90 rounded-lg px-3 py-2 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-700">Đang upload...</span>
                        </div>
                      ) : (
                        <>
                          {thumbnailFile && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                              <span className="text-sm text-blue-700">Ảnh sẽ được upload khi tạo hoạt động</span>
                            </div>
                          )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => fileInputRef.current?.click()}
                        title="Thay đổi ảnh"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="bg-white/90 hover:bg-white"
                        onClick={handleRemoveImage}
                        title="Xóa ảnh"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors ${
                      isUploadingThumbnail ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                    onClick={() => !isUploadingThumbnail && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {isUploadingThumbnail ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Đang upload ảnh...</p>
                      </>
                    ) : (
                      <>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 10MB</p>
                        {thumbnailFile && (
                          <p className="text-xs text-blue-600 mt-2 font-medium">
                            ⓘ Ảnh sẽ được upload khi bạn tạo hoạt động
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Mở đăng ký"
                  type="date"
                  value={formData.registerDate}
                  onChange={handleDateChange("registerDate", "Ngày mở đăng ký")}
                  error={dateErrors.registerDate}
                  required
                  min={getMinDate("registerDate")}
                />

                <InputField
                  label="Đóng đăng ký"
                  type="date"
                  value={formData.endRegisterDate}
                  onChange={handleDateChange("endRegisterDate", "Ngày đóng đăng ký")}
                  error={dateErrors.endRegisterDate}
                  required
                  min={getMinDate("endRegisterDate")}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Ngày bắt đầu hoạt động"
                  type="date"
                  value={formData.startDate}
                  onChange={handleDateChange("startDate", "Ngày bắt đầu hoạt động")}
                  error={dateErrors.startDate}
                  required
                  min={getMinDate("startDate")}
                />

                <InputField
                  label="Ngày kết thúc hoạt động"
                  type="date"
                  value={formData.endDate}
                  onChange={handleDateChange("endDate", "Ngày kết thúc hoạt động")}
                  error={dateErrors.endDate}
                  required
                  min={getMinDate("endDate")}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Thứ tự ngày phải đúng: Ngày hiện tại ≤ Mở đăng ký ≤ Đóng đăng ký ≤ Bắt đầu hoạt động ≤ Kết thúc hoạt động.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Type-specific fields */}
          {currentStep === 3 && (
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label>
                  Phân loại hoạt động <span className="text-red-500">*</span>
                </Label>
                <SimpleSelect
                  value={formData.subType}
                  onValueChange={(value) => setFormData({ ...formData, subType: value })}
                  placeholder="Chọn phân loại"
                  options={subTypes}
                />
              </div>

              {formData.subType === "SportsFestival" && (
                <>
                  <div className="grid gap-2">
                    <Label>
                      Môn thi đấu <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {sportsOptions.map((sport) => (
                        <div
                          key={sport}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                          <Checkbox
                            id={sport}
                            checked={formData.sportsCategories.includes(sport)}
                            onChange={() => handleSportToggle(sport)}
                          />
                            <Label htmlFor={sport} className="cursor-pointer font-medium">
                            {sport}
                          </Label>
                          </div>
                          {formData.sportsCategories.includes(sport) && (
                            <Input
                              type="number"
                              min={1}
                              className="w-24"
                              placeholder="Tối đa"
                              value={getSportMaxMembers(sport)}
                              onChange={(e) => handleSportMaxMembersChange(sport, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thêm môn tự do */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">Môn thi đấu tùy chỉnh</Label>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="VD: Cầu lông, Bơi lội, Đấu vật..."
                        value={customSportInput}
                        onChange={(e) => setCustomSportInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddCustomSport()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleAddCustomSport}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm
                      </Button>
                    </div>

                    {/* Danh sách môn tự do đã thêm */}
                    {formData.sportsCategories.filter((sport) => !sportsOptions.includes(sport)).length > 0 && (
                      <div className="grid md:grid-cols-3 gap-3">
                        {formData.sportsCategories
                          .filter((sport) => !sportsOptions.includes(sport))
                          .map((sport, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`custom-${sport}`}
                                  checked={formData.sportsCategories.includes(sport)}
                                  onChange={() => handleSportToggle(sport)}
                                />
                                <Label htmlFor={`custom-${sport}`} className="cursor-pointer font-medium">
                                  {sport}
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {formData.sportsCategories.includes(sport) && (
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-20"
                                    placeholder="Tối đa"
                                    value={getSportMaxMembers(sport)}
                                    onChange={(e) => handleSportMaxMembersChange(sport, e.target.value)}
                                  />
                                )}
                                <Button variant="outline" size="icon" onClick={() => handleRemoveCustomSport(sport)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>
                      Hình thức thi đấu <span className="text-red-500">*</span>
                    </Label>
                    <SimpleSelect
                      value={formData.competitionType}
                      onValueChange={(value) => setFormData({ ...formData, competitionType: value })}
                      placeholder="Chọn hình thức"
                      options={competitionTypes}
                    />
                  </div>
                </>
              )}

              {formData.subType === "CreativeContest" && (
                <div className="grid gap-4">
                  <InputField
                    label="Chủ đề"
                    placeholder="Ví dụ: Mùa xuân, Tuổi trẻ và ước mơ..."
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    required
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Loại hình sáng tạo</Label>
                      <Input
                        placeholder="VD: Vẽ tranh, Sáng tác văn học, Nhiếp ảnh, Video..."
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Kích thước / Độ dài</Label>
                      <Input
                        placeholder="VD: A4, A3, 500-1000 từ, Tối đa 5 trang..."
                        value={formData.paperSize}
                        onChange={(e) => setFormData({ ...formData, paperSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Chất liệu / Thể loại</Label>
                    <Input
                      placeholder="VD: Màu nước, Chì màu, Truyện ngắn, Thơ, Digital..."
                      value={formData.drawingMedium}
                      onChange={(e) => setFormData({ ...formData, drawingMedium: e.target.value })}
                    />
                  </div>

                    <div className="grid gap-2">
                      <Label>Format nộp bài</Label>
                      <Input
                      placeholder="VD: File số (JPG, PNG, PDF, Word), Bản giấy, Cả hai..."
                        value={formData.submissionFormat}
                        onChange={(e) => setFormData({ ...formData, submissionFormat: e.target.value })}
                      />
                  </div>

                  {/* Problem/Submission Section - Chỉ hiển thị cho CreativeContest */}
                  <div className="border rounded-lg p-4 space-y-4 bg-blue-50">
                    <div>
                      <Label className="text-base font-semibold">Đề bài và hạn nộp bài</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Đề bài sẽ được mở vào thời điểm bắt đầu hoạt động (StartDate). Hạn cuối nộp bài phải sau StartDate và trước EndDate.
                      </p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Đề bài (Text) <span className="text-red-500">*</span></Label>
                        <Textarea
                          placeholder="Nhập đề bài chi tiết cho cuộc thi..."
                          value={formData.problemText}
                          onChange={(e) => setFormData({ ...formData, problemText: e.target.value })}
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          Đề bài sẽ được hiển thị sau khi đến thời điểm bắt đầu hoạt động.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>File đề bài (Tùy chọn)</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="URL hoặc path đến file đề bài (PDF, DOCX, etc.)"
                              value={formData.problemFileUrl}
                              onChange={(e) => setFormData({ ...formData, problemFileUrl: e.target.value })}
                              readOnly={!!formData.problemFileUrl}
                            />
                            <input
                              type="file"
                              id="problem-file-upload"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                
                                // Validate file size (10MB max)
                                const maxSize = 10 * 1024 * 1024
                                if (file.size > maxSize) {
                                  toast.error("File không được vượt quá 10MB")
                                  return
                                }
                                
                                // Validate file type
                                const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]
                                const fileExtension = "." + file.name.split(".").pop().toLowerCase()
                                if (!allowedTypes.includes(fileExtension)) {
                                  toast.error("Chỉ chấp nhận file PDF, DOC, DOCX, JPG, PNG")
                                  return
                                }
                                
                                setIsUploadingThumbnail(true)
                                try {
                                  const { uploadFile } = await import("@/common/utils/upload")
                                  const fileUrl = await uploadFile(file)
                                  if (fileUrl) {
                                    setFormData({ ...formData, problemFileUrl: fileUrl })
                                  } else {
                                    toast.error("Upload file thất bại. Vui lòng thử lại.")
                                  }
                                } catch (err) {
                                  toast.error("Upload file thất bại: " + (err?.message || "Lỗi không xác định"))
                                } finally {
                                  setIsUploadingThumbnail(false)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (formData.problemFileUrl) {
                                  // Clear file URL
                                  setFormData({ ...formData, problemFileUrl: "" })
                                  toast.info("Đã xóa file đề bài")
                                } else {
                                  // Trigger file input
                                  document.getElementById("problem-file-upload")?.click()
                                }
                              }}
                              disabled={isUploadingThumbnail}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.problemFileUrl ? "Xóa" : isUploadingThumbnail ? "Đang upload..." : "Upload"}
                            </Button>
                          </div>
                          {formData.problemFileUrl && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-800">Đã upload file đề bài</span>
                              <a
                                href={formData.problemFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline ml-auto"
                              >
                                Xem file
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Có thể upload file PDF, DOCX, JPG, PNG (tối đa 10MB). File sẽ được hiển thị sau khi đến thời điểm bắt đầu hoạt động.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Hạn cuối nộp bài <span className="text-red-500">*</span></Label>
                        <Input
                          type="datetime-local"
                          value={formData.submissionDeadline}
                        onChange={handleDateChange("submissionDeadline", "Hạn cuối nộp bài")}
                          min={formData.startDate || ""}
                          max={formData.endDate || ""}
                        />
                      {dateErrors.submissionDeadline && (
                        <p className="text-xs text-red-500 mt-1">
                          {dateErrors.submissionDeadline}
                        </p>
                      )}
                        <p className="text-xs text-gray-500">
                          Hạn cuối nộp bài phải sau thời điểm bắt đầu (StartDate) và trước thời điểm kết thúc (EndDate).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Cài đặt đăng ký</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Chọn hình thức đăng ký cho cuộc thi.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <RadioGroup
                        value={registrationType}
                        onValueChange={(value) => {
                          setRegistrationType(value)
                          // Reset group registration settings when switching to individual
                          if (value === "individual") {
                            setFormData((prev) => ({
                              ...prev,
                              registrationSettings: {
                                groupRegistration: {
                                  minMembers: 1,
                                  maxMembers: null,
                                  requireLeader: false,
                                },
                              },
                            }))
                          } else {
                            // Initialize group settings when switching to group
                            setFormData((prev) => ({
                              ...prev,
                              registrationSettings: {
                                groupRegistration: {
                                  minMembers: prev.registrationSettings?.groupRegistration?.minMembers || 3,
                                  maxMembers: prev.registrationSettings?.groupRegistration?.maxMembers || 6,
                                  requireLeader: prev.registrationSettings?.groupRegistration?.requireLeader ?? true,
                                },
                              },
                            }))
                          }
                        }}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="reg-individual" />
                          <Label htmlFor="reg-individual" className="cursor-pointer font-normal">
                            Cá nhân
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="group" id="reg-group" />
                          <Label htmlFor="reg-group" className="cursor-pointer font-normal">
                            Theo nhóm
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {registrationType === "group" && (
                        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                          <InputField
                            label="Số thành viên tối thiểu"
                            type="number"
                            min={1}
                            value={formData.registrationSettings?.groupRegistration?.minMembers}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                registrationSettings: {
                                  ...prev.registrationSettings,
                                  groupRegistration: {
                                    ...prev.registrationSettings?.groupRegistration,
                                    minMembers: e.target.value,
                                  },
                                },
                              }))
                            }
                            required
                          />
                          <InputField
                            label="Số thành viên tối đa"
                            type="number"
                            min={1}
                            placeholder="Không giới hạn nếu để trống"
                            value={formData.registrationSettings?.groupRegistration?.maxMembers ?? ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                registrationSettings: {
                                  ...prev.registrationSettings,
                                  groupRegistration: {
                                    ...prev.registrationSettings?.groupRegistration,
                                    maxMembers: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                          <div className="flex items-center gap-3 border rounded-lg px-4 py-3">
                            <div className="flex-1">
                              <Label className="text-sm font-medium">Yêu cầu nhóm trưởng</Label>
                              <p className="text-xs text-gray-500">
                                Người tạo nhóm sẽ được chọn làm nhóm trưởng mặc định.
                              </p>
                            </div>
                            <Switch
                              checked={!!formData.registrationSettings?.groupRegistration?.requireLeader}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  registrationSettings: {
                                    ...prev.registrationSettings,
                                    groupRegistration: {
                                      ...prev.registrationSettings?.groupRegistration,
                                      requireLeader: checked,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(formData.subType === "SeminarWorkshop" || formData.subType === "Seminar") && (
                <div className="grid gap-6">
                  {/* Diễn giả - có thể có hoặc không */}
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Diễn giả (Tùy chọn)</Label>
                      <Button variant="outline" size="sm" onClick={() => handleOpenSpeakerDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm diễn giả
                      </Button>
                    </div>
                    {formData.speakers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Chưa có diễn giả nào. Nhấn "Thêm diễn giả" để thêm (không bắt buộc).</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.speakers.map((speaker, index) => (
                          <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {speaker.image && (
                              <img
                                src={speaker.image}
                                alt={speaker.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            {!speaker.image && (
                              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-base">{speaker.name || "Chưa có tên"}</p>
                                  {speaker.title && (
                                    <p className="text-sm text-gray-600 mt-1">{speaker.title}</p>
                                  )}
                                  {speaker.bio && (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{speaker.bio}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleOpenSpeakerDialog(index)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveSpeaker(index)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chương trình - có thể có hoặc không */}
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Chương trình (Tùy chọn)</Label>
                      <Button variant="outline" size="sm" onClick={() => handleOpenProgramDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mục chương trình
                      </Button>
                    </div>
                    {formData.programItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Chưa có mục chương trình nào. Nhấn "Thêm mục chương trình" để thêm (không bắt buộc).</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.programItems.map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">{item.time || "Chưa có giờ"}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-base">{item.title || "Chưa có tiêu đề"}</p>
                                  {item.description && (
                                    <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleOpenProgramDialog(index)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveProgram(index)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* StarPoint Rewards Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <Label className="text-lg font-semibold">Cài đặt điểm thưởng StarPoint</Label>
                </div>

                <div className="grid gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Điểm StarPoint sẽ được tự động cộng vào tài khoản của người tham gia khi họ đăng ký hoặc đạt giải trong hoạt động này.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Điểm thưởng khi đăng ký tham gia</Label>
                    <Input
                      type="number"
                      placeholder="VD: 10 điểm"
                      value={formData.starPointRewards.registration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          starPointRewards: {
                            ...formData.starPointRewards,
                            registration: e.target.value,
                          },
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Điểm sẽ được cộng ngay khi người tham gia đăng ký thành công{" "}
                      <span className="relative inline-block group">
                        <Info className="w-4 h-4 text-blue-500 cursor-help inline-block ml-1 align-middle" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                          <p>
                            Đăng ký tham gia đồng nghĩa với cam kết tham gia nghiêm túc vào hoạt động. Điểm thưởng chỉ được cộng khi người tham gia thực sự tham dự hoạt động theo quy định. Việc đăng ký nhưng không tham gia có thể bị xử lý theo quy định của nhà trường.
                          </p>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </span>
                    </p>
                  </div>

                  {/* Chỉ hiển thị phần giải thưởng nếu không phải Hội thảo/Workshop */}
                  {formData.subType !== "SeminarWorkshop" && formData.subType !== "Seminar" && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <Label className="font-semibold">Điểm thưởng theo giải thưởng</Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddAward}>
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm giải
                        </Button>
                      </div>

                      {formData.starPointRewards.awards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>Chưa có giải thưởng nào. Nhấn "Thêm giải" để thêm giải thưởng mới.</p>
                        </div>
                      ) : (
                      <div className="grid gap-3">
                        {formData.starPointRewards.awards.map((award, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`award-name-${index}`}>Tên giải</Label>
                                <Input
                                  id={`award-name-${index}`}
                                  placeholder="VD: Giải Nhất, Giải Nhì, Giải Đặc biệt..."
                                  value={award.name}
                                  onChange={(e) => handleAwardChange(index, "name", e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`award-points-${index}`}>Điểm thưởng</Label>
                                <Input
                                  id={`award-points-${index}`}
                                  type="number"
                                  placeholder="VD: 500 điểm"
                                  value={award.points}
                                  onChange={(e) => handleAwardChange(index, "points", e.target.value)}
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveAward(index)}
                              className="mt-7"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  )}
                  
                  {(formData.subType === "SeminarWorkshop" || formData.subType === "Seminar") && (
                    <div className="border-t pt-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          <strong>Lưu ý:</strong> Hội thảo/Workshop không có giải thưởng, chỉ có điểm thưởng khi đăng ký tham gia.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grading Criteria Section */}
              <GradingCriteriaSection
                enabled={gradingEnabled}
                onEnabledChange={(newEnabled) => {
                  setGradingEnabled(newEnabled)
                  // Clear criteria when disabled
                  if (!newEnabled) {
                    setGradingCriteria([])
                  }
                }}
                onCriteriaChange={setGradingCriteria}
                initialCriteria={gradingCriteria}
              />

              {!formData.subType && (
                <div className="text-center py-12 text-gray-500">Vui lòng chọn phân loại hoạt động ở trên</div>
              )}
            </div>
          )}

          {/* Step 4: Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">

              <div>
                <Label htmlFor="maxParticipants">Số người tham gia tối đa</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="Để trống = không giới hạn (ví dụ: 500)"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống nếu không muốn giới hạn số người tham gia
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Quy định tham gia *</Label>
                  <Button variant="outline" size="sm" onClick={handleAddRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm quy định
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Quy định ${index + 1}`}
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                      />
                      {formData.rules.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => handleRemoveRule(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Settings */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">Cài đặt đăng ký</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Chỉ giáo viên chủ nhiệm mới được đăng ký đại diện lớp
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="only-teacher-register" className="cursor-pointer text-sm font-medium">
                      Chỉ giáo viên
                    </Label>
                    <Switch 
                      id="only-teacher-register" 
                      checked={onlyTeacherCanRegister} 
                      onCheckedChange={setOnlyTeacherCanRegister}
                      className={onlyTeacherCanRegister ? "!bg-blue-500 focus-visible:!ring-blue-500" : "bg-gray-200"}
                    />
                  </div>
                </div>
                {onlyTeacherCanRegister && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Khi bật tùy chọn này, chỉ có giáo viên mới có thể đăng ký tham gia hoạt động. Học sinh/sinh viên sẽ không thể đăng ký.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-semibold">Hoàn tất! Kiểm tra lại thông tin trước khi xuất bản</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tiêu đề</p>
                      <p className="font-semibold">{formData.title || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phân loại</p>
                      <p className="font-semibold">
                        {subTypes.find((s) => s.value === formData.subType)?.label || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa điểm</p>
                      <p className="font-semibold">{formData.location || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Đơn vị tổ chức</p>
                      <p className="font-semibold">{formData.organizer || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lịch trình</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Thời gian diễn ra</p>
                      <p className="font-semibold">
                        {formData.startDate} - {formData.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian đăng ký</p>
                      <p className="font-semibold">
                        {formData.registerDate} - {formData.endRegisterDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quy định</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    Số người tham gia tối đa: <span className="font-semibold">{formData.maxParticipants}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Quy định:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {formData.rules
                      .filter((r) => r)
                      .map((rule, index) => (
                        <li key={index} className="text-sm">
                          {rule}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Hiển thị Diễn giả và Chương trình nếu là Seminar/Workshop */}
              {(formData.subType === "SeminarWorkshop" || formData.subType === "Seminar") && (
                <>
                  {formData.speakers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-500" />
                          Diễn giả
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {formData.speakers.map((speaker, index) => (
                            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                              {speaker.image && (
                                <img
                                  src={speaker.image}
                                  alt={speaker.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              {!speaker.image && (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-semibold">{speaker.name || "Chưa có tên"}</p>
                                {speaker.title && (
                                  <p className="text-sm text-gray-600 mt-1">{speaker.title}</p>
                                )}
                                {speaker.bio && (
                                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{speaker.bio}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {formData.programItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          Chương trình
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {formData.programItems.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">{item.time || "Chưa có giờ"}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{item.title || "Chưa có tiêu đề"}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Điểm thưởng StarPoint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Điểm khi đăng ký tham gia:</p>
                      <p className="font-semibold text-lg">
                        {formData.starPointRewards.registration ? (
                          <span className="text-blue-600">{formData.starPointRewards.registration} điểm</span>
                        ) : (
                          <span className="text-gray-400">Chưa cài đặt</span>
                        )}
                      </p>
                    </div>

                    {/* Chỉ hiển thị phần giải thưởng nếu không phải Hội thảo/Workshop */}
                    {formData.subType !== "SeminarWorkshop" && formData.subType !== "Seminar" && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-3 text-gray-700">Điểm thưởng theo giải:</p>
                        {formData.starPointRewards.awards.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">Chưa có giải thưởng nào được cài đặt</p>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {formData.starPointRewards.awards.map((award, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-600">{award.name || `Giải ${index + 1}`}</p>
                                  <p className="font-semibold">
                                    {award.points ? (
                                      <span className="text-blue-600">{award.points} điểm</span>
                                    ) : (
                                      <span className="text-gray-400">Chưa cài đặt</span>
                                    )}
                                  </p>
                                </div>
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {formData.subType === "SportsFestival" && formData.sportsCategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Môn thi đấu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.sportsCategories.map((sport) => (
                      <div key={sport} className="flex items-center justify-between">
                        <span className="font-medium">{sport}</span>
                        <span className="text-sm text-gray-600">
                          Giới hạn{" "}
                          {getSportMaxMembers(sport) && getSportMaxMembers(sport) !== ""
                            ? `${getSportMaxMembers(sport)} người`
                            : "không giới hạn"}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {formData.subType === "CreativeContest" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt đăng ký theo nhóm</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Số thành viên tối thiểu</p>
                      <p className="font-semibold">
                        {formData.registrationSettings?.groupRegistration?.minMembers || 1} người
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số thành viên tối đa</p>
                      <p className="font-semibold">
                        {formData.registrationSettings?.groupRegistration?.maxMembers
                          ? `${formData.registrationSettings.groupRegistration.maxMembers} người`
                          : "Không giới hạn"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Yêu cầu nhóm trưởng</p>
                      <p className="font-semibold">
                        {formData.registrationSettings?.groupRegistration?.requireLeader ? "Có" : "Không"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grading Settings */}
              {gradingEnabled && gradingCriteria && gradingCriteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      Cài đặt chấm điểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">Tiêu chí chấm điểm:</p>
                      {gradingCriteria.map((criterion, index) => (
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
              {onlyTeacherCanRegister && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Cài đặt đăng ký
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        Chỉ giáo viên chủ nhiệm mới được đăng ký đại diện lớp
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(true)}>
                <Save className="w-4 h-4 mr-2" />
                Lưu làm mẫu
              </Button>
            </div>

            {currentStep < 5 ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                Tiếp theo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem trước
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Xem trước hoạt động</DialogTitle>
                      <DialogDescription>
                        Kiểm tra cách hoạt động sẽ hiển thị với người dùng
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Thumbnail */}
                      {(thumbnailPreview || formData.thumbnail) && (
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <img
                            src={thumbnailPreview || formData.thumbnail || "/placeholder.svg"}
                            alt={formData.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-xl mb-1">{formData.title || "Chưa có tiêu đề"}</h3>
                          <p className="text-sm text-gray-600">
                            {subTypes.find((s) => s.value === formData.subType)?.label || "-"}
                          </p>
                        </div>

                        {formData.description && (
                          <p className="text-gray-700 leading-relaxed">{formData.description}</p>
                        )}
                      </div>

                      {/* Info Grid - tương tự RewardStore.jsx */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Thời gian diễn ra:</span>
                          <span className="font-semibold text-sm">
                            {formData.startDate && formData.endDate
                              ? `${formData.startDate} - ${formData.endDate}`
                              : "Chưa cài đặt"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Địa điểm:</span>
                          <span className="font-semibold text-sm">{formData.location || "Chưa cài đặt"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Đơn vị tổ chức:</span>
                          <span className="font-semibold text-sm">{formData.organizer || "Chưa cài đặt"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Số người tham gia tối đa:</span>
                          <span className="font-semibold text-sm">
                            {formData.maxParticipants && formData.maxParticipants.trim() !== "" 
                              ? formData.maxParticipants 
                              : "Không giới hạn"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Thời gian đăng ký:</span>
                          <span className="font-semibold text-sm">
                            {formData.registerDate && formData.endRegisterDate
                              ? `${formData.registerDate} - ${formData.endRegisterDate}`
                              : "Chưa cài đặt"}
                          </span>
                        </div>
                      </div>

                      {/* StarPoint Rewards - tương tự RewardStore.jsx */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <p className="font-semibold">Điểm thưởng StarPoint</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Điểm khi đăng ký tham gia:</span>
                          <span className="font-bold text-orange-600">
                            {formData.starPointRewards.registration ? `${formData.starPointRewards.registration} điểm` : "0 điểm"}
                          </span>
                        </div>

                        {formData.subType !== "SeminarWorkshop" && formData.subType !== "Seminar" && formData.starPointRewards.awards.length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-semibold mb-2 text-gray-700">Điểm thưởng theo giải:</p>
                            <div className="space-y-2">
                              {formData.starPointRewards.awards.map((award, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">{award.name || `Giải ${index + 1}`}:</span>
                                  <span className="font-bold text-blue-600">
                                    {award.points ? `${award.points} điểm` : "0 điểm"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Diễn giả và Chương trình - chỉ hiển thị nếu là Seminar/Workshop */}
                      {(formData.subType === "SeminarWorkshop" || formData.subType === "Seminar") && (
                        <>
                          {formData.speakers.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <User className="w-5 h-5 text-blue-500" />
                                <p className="font-semibold">Diễn giả</p>
                              </div>
                              <div className="space-y-2">
                                {formData.speakers.map((speaker, index) => (
                                  <div key={index} className="flex gap-2 items-start">
                                    {speaker.image && (
                                      <img
                                        src={speaker.image}
                                        alt={speaker.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold">{speaker.name || "Chưa có tên"}</p>
                                      {speaker.title && (
                                        <p className="text-xs text-gray-600">{speaker.title}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.programItems.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-5 h-5 text-purple-500" />
                                <p className="font-semibold">Chương trình</p>
                              </div>
                              <div className="space-y-2">
                                {formData.programItems.map((item, index) => (
                                  <div key={index} className="flex gap-2 items-start">
                                    <span className="text-xs font-medium text-blue-600 min-w-[80px]">{item.time || "Chưa có giờ"}</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold">{item.title || "Chưa có tiêu đề"}</p>
                                      {item.description && (
                                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Grading Settings */}
                      {gradingEnabled && gradingCriteria && gradingCriteria.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            <p className="font-semibold">Cài đặt chấm điểm</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Tiêu chí chấm điểm:</p>
                            <div className="space-y-2">
                              {gradingCriteria.map((criterion, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span className="text-sm text-gray-700">{criterion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rules */}
                      {formData.rules.filter((r) => r).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold mb-2 text-gray-700">Quy định tham gia:</p>
                          <ul className="space-y-1">
                            {formData.rules
                              .filter((r) => r)
                              .map((rule, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-orange-600 mt-1">•</span>
                                  <span>{rule}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Registration Settings */}
                      {onlyTeacherCanRegister && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <p className="font-semibold">Cài đặt đăng ký</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">
                              Chỉ giáo viên chủ nhiệm mới được đăng ký đại diện lớp
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                        Đóng
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          setIsPreviewOpen(false)
                          handlePublish()
                        }}
                        disabled={isSubmitting}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Đang xuất bản..." : "Xác nhận xuất bản"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang xuất bản..." : "Xuất bản"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Lưu làm mẫu */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lưu làm mẫu hoạt động</DialogTitle>
            <DialogDescription>
              Lưu mẫu này để bạn có thể tái sử dụng sau này khi tạo hoạt động mới.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="templateName">Tên mẫu *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ví dụ: Hội thao mùa xuân 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Mô tả mẫu</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về mẫu này..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Checklist (tùy chọn)</Label>
              <div className="space-y-2 mt-1">
                {templateChecklistItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...templateChecklistItems]
                        newItems[index] = e.target.value
                        setTemplateChecklistItems(newItems)
                      }}
                      placeholder={`Mục ${index + 1}`}
                    />
                    {templateChecklistItems.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTemplateChecklistItems(
                            templateChecklistItems.filter((_, i) => i !== index)
                          )
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateChecklistItems([...templateChecklistItems, ""])}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm mục checklist
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAsTemplate} disabled={isSubmitting || !templateName.trim()}>
              {isSubmitting ? "Đang lưu..." : "Lưu mẫu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm/sửa Diễn giả */}
      <Dialog open={isSpeakerDialogOpen} onOpenChange={setIsSpeakerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSpeakerIndex !== null ? "Chỉnh sửa diễn giả" : "Thêm diễn giả"}</DialogTitle>
            <DialogDescription>
              {editingSpeakerIndex !== null ? "Cập nhật thông tin diễn giả" : "Nhập thông tin diễn giả mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>
                Tên diễn giả <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="VD: Nguyễn Văn A"
                value={speakerForm.name}
                onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Chức danh</Label>
              <Input
                placeholder="VD: Giáo sư, Tiến sĩ, Chuyên gia..."
                value={speakerForm.title}
                onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tiểu sử</Label>
              <Textarea
                placeholder="Mô tả về diễn giả..."
                rows={4}
                value={speakerForm.bio}
                onChange={(e) => setSpeakerForm({ ...speakerForm, bio: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Ảnh đại diện</Label>
              <input
                type="file"
                ref={speakerImageInputRef}
                accept="image/*"
                onChange={handleSpeakerImageChange}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {(speakerImagePreview || speakerForm.image) && (
                  <div className="relative">
                  <img
                      src={speakerImagePreview || speakerForm.image}
                    alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                    {speakerImageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSpeakerImageFile(null)
                          setSpeakerImagePreview(speakerForm.image || "")
                          if (speakerImageInputRef.current) {
                            speakerImageInputRef.current.value = ""
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                </div>
              )}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => speakerImageInputRef.current?.click()}
                    disabled={isUploadingSpeakerImage}
                    className="w-full"
                  >
                    {isUploadingSpeakerImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {speakerImagePreview || speakerForm.image ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn file ảnh (JPG, PNG) - Tối đa 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpeakerDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveSpeaker} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editingSpeakerIndex !== null ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm/sửa Mục chương trình */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProgramIndex !== null ? "Chỉnh sửa mục chương trình" : "Thêm mục chương trình"}</DialogTitle>
            <DialogDescription>
              {editingProgramIndex !== null ? "Cập nhật thông tin mục chương trình" : "Nhập thông tin mục chương trình mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>
                Tên mục <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="VD: Khai mạc hội thảo, Coffee Break, Thảo luận..."
                value={programForm.title}
                onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Thời gian</Label>
              <Input
                placeholder="VD: 08:00 - 08:30, 14:00 - 15:00"
                value={programForm.time}
                onChange={(e) => setProgramForm({ ...programForm, time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả chi tiết về mục chương trình..."
                rows={4}
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveProgram} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editingProgramIndex !== null ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}

// InputField helper component - tương tự RewardManagement
function InputField({ label, placeholder, type = "text", value, onChange, className = "", required = false, error, min }) {
  return (
    <div className="grid gap-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        min={min}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}

// TextareaField helper component
function TextareaField({ label, placeholder, value, onChange, rows = 5, className = "", required = false }) {
  return (
    <div className="grid gap-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={className}
      />
    </div>
  )
}
