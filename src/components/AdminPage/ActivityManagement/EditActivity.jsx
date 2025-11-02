import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { SimpleSelect } from "@/common/components/ui/select"
import { Badge } from "@/common/components/ui/badge"
import { ArrowLeft, Save, X, Upload, Calendar, MapPin, Users, Award } from "lucide-react"
import { toast } from "react-toastify"
import { ROUTES } from "@/common/constants/routes"

export default function EditActivity() {
  const params = useParams()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "Hội thao Liên trường 2024",
    description: "Hội thao thể thao liên trường lần thứ 15 với nhiều môn thi đấu hấp dẫn",
    category: "sports",
    subType: "athletics",
    location: "Sân vận động Quận 1",
    organizer: "Ban Giám hiệu",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    registrationStart: "2024-02-15",
    registrationEnd: "2024-03-10",
    maxParticipants: "200",
    rules: "- Học sinh phải mang theo thẻ học sinh\n- Trang phục thể thao\n- Có mặt trước 15 phút",
  })

  const categories = [
    { value: "sports", label: "Thể thao" },
    { value: "competition", label: "Cuộc thi" },
    { value: "event", label: "Sự kiện" },
    { value: "volunteer", label: "Tình nguyện" },
  ]

  const subTypes = [
    { value: "athletics", label: "Điền kinh" },
    { value: "football", label: "Bóng đá" },
    { value: "volleyball", label: "Bóng chuyền" },
    { value: "basketball", label: "Bóng rổ" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Thông tin hoạt động đã được cập nhật")

    setIsSaving(false)
    navigate(`/activities/${params.id}`)
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa hoạt động</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin hoạt động</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">Chế độ chỉnh sửa</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Tên hoạt động *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên hoạt động"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về hoạt động"
                rows={4}
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
                <Label htmlFor="subType">Phân loại chi tiết</Label>
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

            <div>
              <Label htmlFor="thumbnail">Ảnh bìa</Label>
              <div className="mt-2 flex items-center gap-4">
                <Button type="button" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Tải ảnh lên
                </Button>
                <span className="text-sm text-gray-500">hoặc kéo thả ảnh vào đây</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Lịch trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
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
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationStart">Mở đăng ký *</Label>
                <Input
                  id="registrationStart"
                  type="date"
                  value={formData.registrationStart}
                  onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="registrationEnd">Đóng đăng ký *</Label>
                <Input
                  id="registrationEnd"
                  type="date"
                  value={formData.registrationEnd}
                  onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Organizer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Địa điểm & Ban tổ chức
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Địa điểm *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Nhập địa điểm tổ chức"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="organizer">Ban tổ chức *</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Nhập tên ban tổ chức"
                required
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rules & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Quy định & Yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxParticipants">Số lượng tối đa</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="Nhập số lượng tối đa"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="rules">Quy định tham gia</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Nhập các quy định tham gia"
                rows={6}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to={`/activities/${params.id}`}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Link>
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  )
}
