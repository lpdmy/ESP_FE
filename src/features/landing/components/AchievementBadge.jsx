import { Award, Star, Trophy } from "lucide-react"

export default function AchievementBadge({
  type,
  title,
  description,
  icon = "award",
  glowing = false,
}) {
  const getBadgeStyle = () => {
    switch (type) {
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case "bronze":
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
      case "special":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      default:
        return "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
    }
  }

  const getIcon = () => {
    switch (icon) {
      case "star":
        return <Star className="h-4 w-4" />
      case "trophy":
        return <Trophy className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  return (
    <div
      className={`
      inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
      ${getBadgeStyle()}
      ${glowing ? "achievement-glow" : ""}
      hover-lift cursor-pointer
    `}
    >
      {getIcon()}
      <div className="text-left">
        <div className="font-semibold">{title}</div>
        <div className="text-xs opacity-90">{description}</div>
      </div>
    </div>
  )
}
