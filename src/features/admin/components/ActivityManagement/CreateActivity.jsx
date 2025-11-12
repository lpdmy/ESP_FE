import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { SimpleSelect } from "@/common/components/ui/select"
import { Checkbox } from "@/common/components/ui/checkbox"
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
import { ArrowLeft, ArrowRight, Save, Upload, Plus, X, CheckCircle, Star, Trophy, Eye, Calendar, MapPin, Users, User, Clock, Edit2, Trash2, Info } from "lucide-react"
import { ROUTES } from "@/common/constants/routes"
import { uploadImage } from "@/common/utils/upload"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"

export default function CreateActivity() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSpeakerDialogOpen, setIsSpeakerDialogOpen] = useState(false)
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState(null)
  const [editingProgramIndex, setEditingProgramIndex] = useState(null)
  const [speakerForm, setSpeakerForm] = useState({ name: "", title: "", bio: "", image: "" })
  const [programForm, setProgramForm] = useState({ title: "", time: "", description: "" })
  const [customSportInput, setCustomSportInput] = useState("")
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
    competitionType: "",
    theme: "",
    // CreativeContest fields (gộp DrawingContest và CreativeWriting)
    paperSize: "",
    drawingMedium: "",
    timeLimit: "",
    submissionFormat: "",
    genre: "",
    wordLimit: "",
    writingFormat: "",
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
    const newSports = formData.sportsCategories.includes(sport)
      ? formData.sportsCategories.filter((s) => s !== sport)
      : [...formData.sportsCategories, sport]
    setFormData({ ...formData, sportsCategories: newSports })
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
    setFormData({
      ...formData,
      sportsCategories: [...formData.sportsCategories, sportName],
    })
    setCustomSportInput("")
    toast.success("Đã thêm môn thể thao")
  }

  const handleRemoveCustomSport = (sport) => {
    const newSports = formData.sportsCategories.filter((s) => s !== sport)
    setFormData({ ...formData, sportsCategories: newSports })
    toast.success("Đã xóa môn thể thao")
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
      setSpeakerForm({ ...formData.speakers[index] })
    } else {
      setEditingSpeakerIndex(null)
      setSpeakerForm({ name: "", title: "", bio: "", image: "" })
    }
    setIsSpeakerDialogOpen(true)
  }

  const handleSaveSpeaker = () => {
    if (!speakerForm.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả")
      return
    }
    const newSpeakers = [...formData.speakers]
    if (editingSpeakerIndex !== null) {
      newSpeakers[editingSpeakerIndex] = { ...speakerForm }
    } else {
      newSpeakers.push({ ...speakerForm })
    }
    setFormData({ ...formData, speakers: newSpeakers })
    setIsSpeakerDialogOpen(false)
    setSpeakerForm({ name: "", title: "", bio: "", image: "" })
    setEditingSpeakerIndex(null)
    toast.success(editingSpeakerIndex !== null ? "Cập nhật diễn giả thành công" : "Thêm diễn giả thành công")
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
    if (!formData.maxParticipants) {
      toast.error("Vui lòng nhập số người tham gia tối đa")
      return
    }
    if (!formData.rules || formData.rules.length === 0 || formData.rules.every(r => !r.trim())) {
      toast.error("Vui lòng nhập ít nhất một quy định")
      return
    }

    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    
    try {
      // Map formData to API format
      const activityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category || "activity", // Default to "activity"
        subType: formData.subType,
        location: formData.location,
        organizer: formData.organizer,
        thumbnailUrl: formData.thumbnail,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        registerDate: formData.registerDate ? new Date(formData.registerDate).toISOString() : null,
        endRegisterDate: formData.endRegisterDate ? new Date(formData.endRegisterDate).toISOString() : null,
        maxParticipants: parseInt(formData.maxParticipants) || 0,
        rules: formData.rules.filter(r => r.trim()),
        // SportsFestival fields
        sportsCategories: formData.subType === "SportsFestival" ? formData.sportsCategories : [],
        competitionType: formData.subType === "SportsFestival" ? formData.competitionType : null,
        // CreativeContest fields
        theme: formData.subType === "CreativeContest" ? formData.theme : null,
        genre: formData.subType === "CreativeContest" ? formData.genre : null,
        paperSize: formData.subType === "CreativeContest" ? formData.paperSize : null,
        drawingMedium: formData.subType === "CreativeContest" ? formData.drawingMedium : null,
        timeLimit: formData.subType === "CreativeContest" ? formData.timeLimit : null,
        submissionFormat: formData.subType === "CreativeContest" ? formData.submissionFormat : null,
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
        }
      }

      const response = await executeApiCall(
        activityService.createActivity.bind(activityService),
        [activityData, token],
        { setError: () => {} }
      )

      if (response?.data) {
        toast.success("Hoạt động mới đã được xuất bản thành công.")
        navigate("/activities")
      }
    } catch (err) {
      console.error("Error creating activity:", err)
      toast.error(err?.message || "Có lỗi xảy ra khi tạo hoạt động")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    toast.info("Bạn có thể tiếp tục chỉnh sửa sau.")
  }

  // File upload handlers
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
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
      
      // Upload file directly
      setIsUploadingThumbnail(true)
      try {
        const uploadedUrl = await uploadImage(file)
        if (uploadedUrl) {
          setFormData({ ...formData, thumbnail: uploadedUrl })
          toast.success("Đã upload ảnh thành công")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error(error.message || "Có lỗi xảy ra khi upload ảnh")
      } finally {
        setIsUploadingThumbnail(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
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
      
      // Upload file directly
      setIsUploadingThumbnail(true)
      try {
        const uploadedUrl = await uploadImage(file)
        if (uploadedUrl) {
          setFormData({ ...formData, thumbnail: uploadedUrl })
          toast.success("Đã upload ảnh thành công")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error(error.message || "Có lỗi xảy ra khi upload ảnh")
      } finally {
        setIsUploadingThumbnail(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, thumbnail: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Đã xóa ảnh")
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
          <h1 className="text-3xl font-bold text-gray-900">Tạo hoạt động mới</h1>
          <p className="text-gray-600 mt-1">Tạo hoạt động ngoại khóa, sự kiện hoặc cuộc thi cho học sinh</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white scale-110"
                        : currentStep > step.number
                        ? "bg-green-500 text-white hover:bg-green-600"
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
                      currentStep > step.number ? "bg-green-500" : "bg-gray-200"
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
                {formData.thumbnail ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnail}
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
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />

                <InputField
                  label="Ngày kết thúc"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Mở đăng ký"
                  type="date"
                  value={formData.registerDate}
                  onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })}
                  required
                />

                <InputField
                  label="Đóng đăng ký"
                  type="date"
                  value={formData.endRegisterDate}
                  onChange={(e) => setFormData({ ...formData, endRegisterDate: e.target.value })}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Ngày kết thúc phải sau ngày bắt đầu. Ngày đóng đăng ký phải trước ngày bắt
                  đầu hoạt động.
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
                          <div className="w-10"></div>
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
                              <Button variant="outline" size="icon" onClick={() => handleRemoveCustomSport(sport)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Chất liệu / Thể loại</Label>
                      <Input
                        placeholder="VD: Màu nước, Chì màu, Truyện ngắn, Thơ, Digital..."
                        value={formData.drawingMedium}
                        onChange={(e) => setFormData({ ...formData, drawingMedium: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Thời gian làm bài</Label>
                      <Input
                        placeholder="VD: 90 phút, 2 giờ, Tự do..."
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                      />
                    </div>
                  </div>

                    <div className="grid gap-2">
                      <Label>Format nộp bài</Label>
                      <Input
                      placeholder="VD: File số (JPG, PNG, PDF, Word), Bản giấy, Cả hai..."
                        value={formData.submissionFormat}
                        onChange={(e) => setFormData({ ...formData, submissionFormat: e.target.value })}
                      />
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

              {!formData.subType && (
                <div className="text-center py-12 text-gray-500">Vui lòng chọn phân loại hoạt động ở trên</div>
              )}
            </div>
          )}

          {/* Step 4: Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="maxParticipants">Số người tham gia tối đa *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="Ví dụ: 500"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="mt-2"
                />
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
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-800">
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
                          <span className="text-green-600">{formData.starPointRewards.registration} điểm</span>
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
                                      <span className="text-green-600">{award.points} điểm</span>
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
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </Button>
            </div>

            {currentStep < 5 ? (
              <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white">
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
                      {formData.thumbnail && (
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <img
                            src={formData.thumbnail || "/placeholder.svg"}
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
                          <span className="font-semibold text-sm">{formData.maxParticipants || "Chưa cài đặt"}</span>
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
                                  <span className="font-bold text-green-600">
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
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                        Đóng
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
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
                <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang xuất bản..." : "Xuất bản"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <Label>Ảnh đại diện (URL)</Label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={speakerForm.image}
                onChange={(e) => setSpeakerForm({ ...speakerForm, image: e.target.value })}
              />
              {speakerForm.image && (
                <div className="mt-2">
                  <img
                    src={speakerForm.image}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpeakerDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveSpeaker} className="bg-green-600 hover:bg-green-700 text-white">
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
            <Button onClick={handleSaveProgram} className="bg-green-600 hover:bg-green-700 text-white">
              {editingProgramIndex !== null ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// InputField helper component - tương tự RewardManagement
function InputField({ label, placeholder, type = "text", value, onChange, className = "", required = false }) {
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
      />
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
