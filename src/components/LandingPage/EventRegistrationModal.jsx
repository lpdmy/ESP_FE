"use client"

import { useState } from "react"
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined, CloseOutlined } from "@ant-design/icons"
import { Button, Card, Input, Form, Badge } from "antd"

const { TextArea } = Input

export default function EventRegistrationModal({ isOpen, onClose, event }) {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    onClose()
    // Show success message
    alert("Đăng ký sự kiện thành công! Bạn sẽ nhận được email xác nhận.")
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
            <Button type="text" size="small" onClick={onClose}>
              <CloseOutlined className="h-5 w-5" />
            </Button>
          </div>

          {/* Event Details */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-4">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarOutlined className="h-4 w-4 text-orange-500" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClockCircleOutlined className="h-4 w-4 text-orange-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <EnvironmentOutlined className="h-4 w-4 text-orange-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TeamOutlined className="h-4 w-4 text-orange-500" />
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
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="studentId"
                label="Mã số học sinh"
                rules={[{ required: true, message: 'Vui lòng nhập mã số học sinh!' }]}
              >
                <Input />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="class"
                label="Lớp"
                rules={[{ required: true, message: 'Vui lòng nhập lớp!' }]}
              >
                <Input placeholder="VD: 12A1" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>
            </div>

            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>

            <Form.Item name="reason" label="Lý do tham gia">
              <TextArea
                rows={3}
                placeholder="Chia sẻ lý do bạn muốn tham gia sự kiện này..."
              />
            </Form.Item>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                disabled={isSubmitting || spotsLeft === 0}
                loading={isSubmitting}
              >
                {spotsLeft === 0 ? "Hết chỗ" : "Đăng ký ngay"}
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  )
}
