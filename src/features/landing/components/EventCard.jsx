import { useState } from "react"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import EventRegistrationModal from "./EventRegistrationModal"

export default function EventCard({
  title,
  description,
  date,
  time,
  location,
  maxParticipants,
  currentParticipants,
  category,
  image,
  status,
}) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  const getStatusBadge = () => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">Sắp diễn ra</Badge>
      case "ongoing":
        return <Badge className="bg-green-500 text-white">Đang diễn ra</Badge>
      case "ended":
        return <Badge className="bg-gray-500 text-white">Đã kết thúc</Badge>
    }
  }

  const spotsLeft = maxParticipants - currentParticipants

  return (
    <>
      <Card className="overflow-hidden hover-lift card-shine bg-white/90 backdrop-blur-sm border border-orange-100">
        {image && (
          <div className="h-48 overflow-hidden">
            <img
              src={image || "/placeholder.svg?height=200&width=400&query=workshop event"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900 gradient-text">{title}</h3>
            {getStatusBadge()}
          </div>

          <Badge variant="secondary" className="bg-orange-100 text-orange-700 mb-3">
            {category}
          </Badge>

          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>
                {currentParticipants}/{maxParticipants} người tham gia
              </span>
            </div>
          </div>

          {spotsLeft <= 10 && spotsLeft > 0 && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">⚠️ Chỉ còn {spotsLeft} suất!</p>
            </div>
          )}

          <Button
            className="w-full btn-primary"
            disabled={status === "ended" || spotsLeft === 0}
            onClick={() => setShowRegistrationModal(true)}
          >
            {status === "ended" ? "Đã kết thúc" : spotsLeft === 0 ? "Hết chỗ" : "Đăng ký tham gia"}
          </Button>
        </div>
      </Card>

      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        event={{
          title,
          description,
          date,
          time,
          location,
          maxParticipants,
          currentParticipants,
          category,
        }}
      />
    </>
  )
}
