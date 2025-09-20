import { useState,useEffect } from "react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar"
import { useToast } from "@/common/hooks/useToast"
import { LoadingOverlay } from '@/common/components/ui/loading';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Plus,
  BookOpen,
  Trophy, 
} from "lucide-react"
import { useNavigate } from "react-router-dom"
// Import mock data từ JSON
import { useActivityApi } from "../../../hooks/useActivityApi"
const categoryLabels = {
  1: "Cuộc thi",
  2: "Hoạt động",
};

const categoryColors = {
  1: "bg-yellow-100 text-yellow-700 border-yellow-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
}
const categoryMap = {
  1: {
     label: "Cuộc thi",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  2: {
   label: "Hoạt động",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};


export default function ListActivity() {
  const toast = useToast();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDate, setSelectedDate] = useState(null)
  const { activityLoading, error, getAllActivity } = useActivityApi();
  const [activity, setActivity] = useState([]);
  const [search,setSearch] = useState("");
  const filteredEvents = activity.filter((event) => {
    if (selectedCategory !== "all" && String(event.category) !== String(selectedCategory)) {
      return false
    }
    if (selectedDate && event.startDate !== selectedDate) {
      return false
    }
    return true
  })
useEffect(() => {
  const loadActivity = async () => {
    try {
      const response = await getAllActivity(pageNumber, pageSize, search);
      const activityData = response.data.data;
      setActivity(activityData);
      setTotalPages(Math.ceil(response.data.totalCount / pageSize));
      console.log(response);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.activityLoadFailed();
    }
  };

  loadActivity();
}, [pageNumber, pageSize, search]); 
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
    <div className="w-full">
           {activityLoading && <LoadingOverlay isLoading={true} />}
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
            <Card className="mb-6 glass">
              <CardContent className="!p-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            </div>
            {/* Tabs */}
            <Tabs defaultValue="list" className="w-full">
              {/* List View */}
              <TabsContent value="list">
               <Card className="mb-6 glass">
                  <CardContent className="!p-2 flex flex-wrap gap-2 pt-2">
                    {/* Nút Tất cả */}
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className={selectedCategory === "all" ? "btn-primary" : "bg-white/50"}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Tất cả
                    </Button>

                    {/* Render category từ categoryMap */}
                    {Object.entries(categoryMap).map(([key, { label, icon: Icon }]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(key)}
                        className={selectedCategory === key ? "btn-primary" : "bg-white/50"}
                      >
                        <Icon className="w-4 h-4 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
                {/* Events list */}
                <div className="space-y-6">
                  {filteredEvents.map((event) => {
                    const cat = categoryMap[event.category] || categoryMap[1]
                    const IconComponent = cat.icon
                    return (
                      <Card key={event.id} className="glass hover-lift card-shine">
                        <CardContent className="p-6 flex flex-col lg:flex-row gap-6 bg-white pt-6">
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
                              <Badge className={`${categoryColors[event.category]} whitespace-nowrap flex items-center !p-2.5`}>
                                  <IconComponent className="w-5 h-5 mr-3" />
                                  {categoryLabels[event.category] || event.category}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-4 mb-4 text-gray-600">
                              <div className="flex items-center text-gray-600">
                              <Calendar className="w-5 h-5 mr-3 " />
                              <div>
                              <p className="text-sm font-medium">Ngày đăng ký</p>
                              <p className="text-sm">{formatDate(event.registerDate)} - {formatDate(event.endRegisterDate)}</p>
                              </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <div>
                                    <p className="text-sm font-medium">Địa điểm tổ chức</p>
                                    <p className="text-sm">{event.location}</p>
                                    </div>
                              </div>
                              <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    {event.numberOfParticipants}/{event.maxParticipants} người tham gia
                              </div>
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
                                <div className="flex gap-2">
                                  {new Date(event.endRegisterDate) > new Date() ? (
                                    <Button size="sm" className="btn-primary">
                                      Đăng ký
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled>
                                      Hết thời gian
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex flex-wrap gap-2 mt-3">
                              {event.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div> */}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
      
      <div className="flex justify-center items-center mt-6 gap-2">
  <Button
    size="sm"
    variant="outline"
    disabled={pageNumber === 1}
    onClick={() => setPageNumber((prev) => prev - 1)}
  >
    Trước
  </Button>

  <span>
    Trang {pageNumber} / {totalPages}
  </span>

  <Button
    size="sm"
    variant="outline"
    disabled={pageNumber === totalPages}
    onClick={() => setPageNumber((prev) => prev + 1)}
  >
    Sau
  </Button>
</div>
    </div>
  )
}