import { Users, Trophy, Clock } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"

export default function ContestCard({
  title,
  description,
  deadline,
  participants,
  prize,
  status,
  image,
}) {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Đang diễn ra</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">Sắp diễn ra</Badge>
      case "ended":
        return <Badge className="bg-gray-500 text-white">Đã kết thúc</Badge>
    }
  }

  return (
    <Card className="overflow-hidden hover-lift card-shine bg-white/90 backdrop-blur-sm border border-orange-100">
      {image && (
        <div className="h-48 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
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

        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Hạn nộp: {deadline}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{participants} người tham gia</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Trophy className="h-4 w-4" />
            <span>Giải thưởng: {prize}</span>
          </div>
        </div>

        <Button className="w-full btn-primary" disabled={status === "ended"}>
          {status === "active" ? "Tham gia ngay" : status === "upcoming" ? "Đăng ký" : "Đã kết thúc"}
        </Button>
      </div>
    </Card>
  )
}
