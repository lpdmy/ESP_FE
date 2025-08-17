"use client"

import { useState } from "react"
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined, EyeOutlined, BookOutlined } from "@ant-design/icons"
import { Button, Card, Badge, Modal } from "antd"
import EventRegistrationModal from "./EventRegistrationModal"

export default function EventCard({
  title,
  description,
  date,
  time,
  location,
  participants,
  maxParticipants,
  category,
  image,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Công nghệ":
        return "blue"
      case "Nghệ thuật":
        return "purple"
      case "Thể thao":
        return "green"
      case "Học thuật":
        return "orange"
      default:
        return "default"
    }
  }

  const spotsLeft = maxParticipants - participants
  const isFull = spotsLeft === 0
  const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0

  return (
    <>
      <Card
        className="h-full hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-orange-100"
        cover={
          <div className="relative h-48 overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Badge color={getCategoryColor(category)}>
                {category}
              </Badge>
            </div>
            {isAlmostFull && (
              <div className="absolute top-3 left-3">
                <Badge color="warning" text={`Còn ${spotsLeft} chỗ!`} />
              </div>
            )}
            {isFull && (
              <div className="absolute top-3 left-3">
                <Badge color="error" text="Hết chỗ" />
              </div>
            )}
          </div>
        }
        actions={[
          <Button
            key="view"
            type="text"
            size="small"
            icon={<EyeOutlined className="h-4 w-4" />}
            onClick={() => setShowDetails(true)}
          >
            Chi tiết
          </Button>,
          <Button
            key="register"
            type="primary"
            size="small"
            disabled={isFull}
            icon={<BookOutlined className="h-4 w-4" />}
            onClick={() => setShowRegistration(true)}
            className={isFull ? "opacity-50" : ""}
          >
            {isFull ? "Hết chỗ" : "Đăng ký"}
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {title}
            </h3>
          }
          description={
            <div className="space-y-3">
              <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CalendarOutlined className="h-4 w-4 text-orange-500" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ClockCircleOutlined className="h-4 w-4 text-orange-500" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <EnvironmentOutlined className="h-4 w-4 text-orange-500" />
                  <span className="line-clamp-1">{location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <TeamOutlined className="h-4 w-4 text-orange-500" />
                  <span>
                    {participants}/{maxParticipants} người tham gia
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Đã đăng ký</span>
                  <span>{Math.round((participants / maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(participants / maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          }
        />
      </Card>

      {/* Event Details Modal */}
      <Modal
        title={title}
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)}>
            Đóng
          </Button>,
          <Button
            key="register"
            type="primary"
            disabled={isFull}
            onClick={() => {
              setShowDetails(false)
              setShowRegistration(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 border-0"
          >
            {isFull ? "Hết chỗ" : "Đăng ký ngay"}
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p className="text-gray-700 leading-relaxed">{description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="h-5 w-5 text-orange-500" />
              <span className="text-gray-700">{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined className="h-5 w-5 text-orange-500" />
              <span className="text-gray-700">{time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EnvironmentOutlined className="h-5 w-5 text-orange-500" />
              <span className="text-gray-700">{location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TeamOutlined className="h-5 w-5 text-orange-500" />
              <span className="text-gray-700">
                {participants}/{maxParticipants} người tham gia
              </span>
            </div>
          </div>

          {isAlmostFull && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Chỉ còn {spotsLeft} suất tham gia! Hãy đăng ký sớm.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Event Registration Modal */}
      {showRegistration && (
        <EventRegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          event={{
            title,
            description,
            date,
            time,
            location,
            maxParticipants,
            currentParticipants: participants,
            category,
          }}
        />
      )}
    </>
  )
}
