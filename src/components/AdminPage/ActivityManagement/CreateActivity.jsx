import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { SimpleSelect } from "@/common/components/ui/select"
import { Checkbox } from "@/common/components/ui/checkbox"
import { toast } from "react-toastify"
import { ArrowLeft, ArrowRight, Save, Upload, Plus, X, CheckCircle } from "lucide-react"
import { ROUTES } from "@/common/constants/routes"

export default function CreateActivity() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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
    rules: [""],
  })

  const steps = [
    { number: 1, title: "Thông tin cơ bản", description: "Tiêu đề, mô tả, loại hoạt động" },
    { number: 2, title: "Lịch trình", description: "Thời gian diễn ra và đăng ký" },
    { number: 3, title: "Chi tiết hoạt động", description: "Thông tin chuyên biệt theo loại" },
    { number: 4, title: "Quy định", description: "Quy định và yêu cầu tham gia" },
    { number: 5, title: "Xem lại & Xuất bản", description: "Kiểm tra và xuất bản" },
  ]

  const categories = [
    { value: "activity", label: "Hoạt động ngoại khóa" },
    { value: "event", label: "Sự kiện" },
  ]

  const subTypes = [
    { value: "SportsFestival", label: "Hội thao" },
    { value: "DrawingContest", label: "Cuộc thi vẽ" },
    { value: "CreativeWriting", label: "Sáng tác" },
    { value: "Seminar", label: "Hội thảo" },
    { value: "Workshop", label: "Workshop" },
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

  const handlePublish = () => {
    toast.success("Hoạt động mới đã được xuất bản thành công.")
    navigate("/activities")
  }

  const handleSaveDraft = () => {
    toast.info("Bạn có thể tiếp tục chỉnh sửa sau.")
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
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white"
                        : currentStep > step.number
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}`} />
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
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Tiêu đề hoạt động *</Label>
                <Input
                  id="title"
                  placeholder="Ví dụ: Hội thao Liên trường 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả chi tiết *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về hoạt động..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Loại hoạt động *</Label>
                  <div className="mt-2">
                    <SimpleSelect
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      placeholder="Chọn loại hoạt động"
                      options={categories}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subType">Phân loại *</Label>
                  <div className="mt-2">
                    <SimpleSelect
                      value={formData.subType}
                      onValueChange={(value) => setFormData({ ...formData, subType: value })}
                      placeholder="Chọn phân loại"
                      options={subTypes}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    placeholder="Ví dụ: Sân vận động FPT"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="organizer">Đơn vị tổ chức *</Label>
                  <Input
                    id="organizer"
                    placeholder="Ví dụ: Đoàn trường"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Ảnh đại diện</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 10MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Ngày kết thúc *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registerDate">Mở đăng ký *</Label>
                  <Input
                    id="registerDate"
                    type="date"
                    value={formData.registerDate}
                    onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="endRegisterDate">Đóng đăng ký *</Label>
                  <Input
                    id="endRegisterDate"
                    type="date"
                    value={formData.endRegisterDate}
                    onChange={(e) => setFormData({ ...formData, endRegisterDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
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
            <div className="space-y-6">
              {formData.subType === "SportsFestival" && (
                <>
                  <div>
                    <Label>Môn thi đấu *</Label>
                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                      {sportsOptions.map((sport) => (
                        <div key={sport} className="flex items-center space-x-2">
                          <Checkbox
                            id={sport}
                            checked={formData.sportsCategories.includes(sport)}
                            onCheckedChange={() => handleSportToggle(sport)}
                          />
                          <Label htmlFor={sport} className="cursor-pointer">
                            {sport}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="competitionType">Hình thức thi đấu *</Label>
                    <div className="mt-2">
                      <SimpleSelect
                        value={formData.competitionType}
                        onValueChange={(value) => setFormData({ ...formData, competitionType: value })}
                        placeholder="Chọn hình thức"
                        options={competitionTypes}
                      />
                    </div>
                  </div>
                </>
              )}

              {(formData.subType === "DrawingContest" || formData.subType === "CreativeWriting") && (
                <div>
                  <Label htmlFor="theme">Chủ đề *</Label>
                  <Input
                    id="theme"
                    placeholder="Ví dụ: Mùa xuân, Tuổi trẻ và ước mơ..."
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}

              {formData.subType === "Seminar" && (
                <div className="space-y-4">
                  <div>
                    <Label>Diễn giả</Label>
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm diễn giả
                    </Button>
                  </div>
                  <div>
                    <Label>Chương trình</Label>
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm mục chương trình
                    </Button>
                  </div>
                </div>
              )}

              {!formData.subType && (
                <div className="text-center py-12 text-gray-500">Vui lòng chọn phân loại hoạt động ở bước 1</div>
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
                      <p className="text-sm text-gray-600">Loại hoạt động</p>
                      <p className="font-semibold">
                        {categories.find((c) => c.value === formData.category)?.label || "-"}
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
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Xuất bản
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
