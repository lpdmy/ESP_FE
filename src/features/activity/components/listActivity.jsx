import { useState } from "react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Plus,
  BookOpen,
  Trophy,
  Music,
  Palette,
  Code,
  Heart,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
// Import mock data từ JSON
import mockEvents from "@/mock_data/activity.json"

const categoryIcons = {
  workshop: BookOpen,
  competition: Trophy,
  entertainment: Music,
  art: Palette,
  tech: Code,
  social: Heart,
}
const categoryLabels = {
  workshop: "Hội thảo",
  competition: "Cuộc thi",
  entertainment: "Giải trí",
  art: "Nghệ thuật",
  tech: "Công nghệ",
  social: "Xã hội",
};

const categoryColors = {
  workshop: "bg-blue-100 text-blue-700 border-blue-200",
  competition: "bg-yellow-100 text-yellow-700 border-yellow-200",
  entertainment: "bg-purple-100 text-purple-700 border-purple-200",
  art: "bg-pink-100 text-pink-700 border-pink-200",
  tech: "bg-green-100 text-green-700 border-green-200",
  social: "bg-red-100 text-red-700 border-red-200",
}

export default function ListActivity() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDate, setSelectedDate] = useState(null)

  const filteredEvents = mockEvents.filter((event) => {
    if (selectedCategory !== "all" && event.category !== selectedCategory) {
      return false
    }
    if (selectedDate && event.date !== selectedDate) {
      return false
    }
    return true
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Sự kiện</h1>
                <p className="text-gray-600">
                  Khám phá và tham gia các sự kiện thú vị tại FPT School
                </p>
              </div>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Tạo sự kiện
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="glass hover-lift">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Sự kiện sắp tới</h3>
                  <p className="text-2xl font-bold gradient-text">{mockEvents.length}</p>
                </CardContent>
              </Card>
              <Card className="glass hover-lift">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Đã đăng ký</h3>
                  <p className="text-2xl font-bold gradient-text">3</p>
                </CardContent>
              </Card>

            </div>

            {/* Tabs */}
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="list">Danh sách sự kiện</TabsTrigger>
                <TabsTrigger value="calendar">Lịch sự kiện</TabsTrigger>
              </TabsList>

              {/* List View */}
              <TabsContent value="list">
                <Card className="mb-6 glass">
                  <CardContent className="p-4 flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className={selectedCategory === "all" ? "btn-primary" : "bg-white/50"}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Tất cả
                    </Button>
                    {Object.entries(categoryIcons).map(([category, Icon]) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? "btn-primary" : "bg-white/50"}
                      >
                        <Icon className="w-4 h-4 mr-1" />
                        {categoryLabels[category] || category}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Events list */}
                <div className="space-y-6">
                  {filteredEvents.map((event) => {
                    const IconComponent = categoryIcons[event.category]
                    return (
                      <Card key={event.id} className="glass hover-lift card-shine">
                        <CardContent className="p-6 flex flex-col lg:flex-row gap-6">
                          <div className="lg:w-48 h-32 bg-gradient-orange rounded-lg flex items-center justify-center">
                            <IconComponent className="w-12 h-12 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {event.title}
                                </h3>
                                <p className="text-gray-600 mb-3">{event.description}</p>
                              </div>
                              <Badge className={`${categoryColors[event.category]} whitespace-nowrap flex items-center`}>
  <IconComponent className="w-5 h-5 mr-3" />
  {categoryLabels[event.category] || event.category}
</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {event.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {event.location}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                {event.participants}/{event.maxParticipants} người tham gia
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {event.organizer.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600">
                                  Tổ chức bởi {event.organizer}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-white/50"
                                 onClick={() => navigate(`/activity/detail/${event.id}`)}
                                >
                                  Chi tiết
                                </Button>
                                <Button size="sm" className="btn-primary">
                                  Đăng ký
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {event.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}