import { useState } from "react"
import { Calendar, Clock, MapPin, Users, X } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"

export default function EventRegistrationModal({ isOpen, onClose, event }) {
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    class: "",
    email: "",
    phone: "",
    reason: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    onClose()
    // Show success message
    alert("Đăng ký sự kiện thành công! Bạn sẽ nhận được email xác nhận.")
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isOpen) return null

  const spotsLeft = event.maxParticipants - event.currentParticipants

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <Badge className="bg-orange-100 text-orange-700">{event.category}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Event Details */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-4">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-orange-500" />
                <span>
                  {event.currentParticipants}/{event.maxParticipants} người tham gia
                </span>
              </div>
            </div>

            {spotsLeft <= 10 && spotsLeft > 0 && (
              <div className="mt-3 p-2 bg-yellow-100 rounded-md">
                <p className="text-sm text-yellow-800">⚠️ Chỉ còn {spotsLeft} suất tham gia!</p>
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="studentId">Mã số học sinh *</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Lớp *</Label>
                <Input
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="VD: 12A1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="reason">Lý do tham gia</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="mt-1"
                rows={3}
                placeholder="Chia sẻ lý do bạn muốn tham gia sự kiện này..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                disabled={isSubmitting || spotsLeft === 0}
              >
                {isSubmitting ? "Đang đăng ký..." : spotsLeft === 0 ? "Hết chỗ" : "Đăng ký ngay"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
