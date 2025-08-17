"use client"

import { CalendarOutlined, TeamOutlined, TrophyOutlined, EyeOutlined, CrownOutlined } from "@ant-design/icons"
import { Button, Card, Badge, Progress } from "antd"

export default function ContestCard({
  title,
  description,
  deadline,
  participants,
  prize,
  status,
  image,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "processing"
      case "Sắp diễn ra":
        return "warning"
      case "Đã kết thúc":
        return "default"
      default:
        return "default"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "Đang diễn ra"
      case "Sắp diễn ra":
        return "Sắp diễn ra"
      case "Đã kết thúc":
        return "Đã kết thúc"
      default:
        return status
    }
  }

  const isActive = status === "Đang diễn ra"
  const isUpcoming = status === "Sắp diễn ra"

  return (
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
            <Badge color={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          </div>
          {isActive && (
            <div className="absolute top-3 left-3">
              <Badge color="success" text="Hot" />
            </div>
          )}
          {isUpcoming && (
            <div className="absolute top-3 left-3">
              <Badge color="warning" text="Sắp mở" />
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
        >
          Chi tiết
        </Button>,
        <Button
          key="participate"
          type="primary"
          size="small"
          disabled={!isActive}
          icon={<CrownOutlined className="h-4 w-4" />}
          className={
            isActive
              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
              : "opacity-50"
          }
        >
          {isActive ? "Tham gia" : "Chưa mở"}
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
                <CalendarOutlined className="h-4 w-4 text-purple-500" />
                <span>Hạn nộp: {deadline}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TeamOutlined className="h-4 w-4 text-purple-500" />
                <span>{participants} người tham gia</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrophyOutlined className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-600">{prize}</span>
              </div>
            </div>

            {/* Participation Progress */}
            {isActive && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Đã tham gia</span>
                  <span>{participants} người</span>
                </div>
                <Progress
                  percent={Math.min((participants / 100) * 100, 100)}
                  size="small"
                  strokeColor={{
                    "0%": "#f97316",
                    "100%": "#eab308",
                  }}
                  showInfo={false}
                />
              </div>
            )}

            {/* Prize Highlight */}
            <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-2">
                <TrophyOutlined className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Giải thưởng: {prize}
                </span>
              </div>
            </div>
          </div>
        }
      />
    </Card>
  )
}
