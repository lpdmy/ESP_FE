const formatDate = (dateString) => {
  if (!dateString) return "Đang cập nhật"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch {
    return dateString
  }
}

const SUB_TYPE_LABELS = {
  all: "Tất cả loại hoạt động",
  SeminarWorkshop: "Workshop / Seminar",
  CreativeContest: "Cuộc thi nộp bài",
  SportsFestival: "Hội thao",
}

function ActivitiesCarousel({ activities }) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 2

  // Chia activities thành các nhóm 2 items
  const pages = []
  for (let i = 0; i < activities.length; i += itemsPerPage) {
    pages.push(activities.slice(i, i + itemsPerPage))
  }

  const totalPages = pages.length
  const maxPage = Math.max(totalPages - 1, 0)

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0))
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, maxPage))

  if (activities.length === 0) return null

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sự kiện nổi bật gần đây</h2>
          <p className="text-sm text-gray-600 mt-1">{activities.length} hoạt động đang diễn ra</p>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border-2 border-orange-200 bg-white p-3 text-orange-500 transition hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              onClick={handlePrev}
              disabled={currentPage === 0}
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-orange-200 bg-white p-3 text-orange-500 transition hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              onClick={handleNext}
              disabled={currentPage >= maxPage}
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden rounded-3xl w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-0">
              {page.map((activity) => (
                <Link
                  key={`carousel-${activity.id}`}
                  to={ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", activity.id)}
                  className="group"
                >
              <div className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={activity.thumbnailUrl || activity.thumbnail || "/placeholder.svg"}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                  {/* Badge */}
                  <div className="mb-4">
                    <Badge className="bg-orange-500/90 text-white border-0 text-xs px-3 py-1 mb-3 backdrop-blur-sm">
                      {activity.status || "Đang diễn ra"}
                    </Badge>
                    {activity.subType && (
                      <Badge
                        variant="outline"
                        className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 ml-2 backdrop-blur-sm"
                      >
                        {SUB_TYPE_LABELS[activity.subType] || activity.subType}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-orange-300 transition-colors">
                    {activity.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-gray-200 line-clamp-2 mb-4 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-300" />
                      <span>{formatDate(activity.startDate)} - {formatDate(activity.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-300" />
                      <span>{activity.location || "Đang cập nhật"}</span>
                    </div>
                    {activity.numberOfParticipants !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-300" />
                        <span>{activity.numberOfParticipants} người tham gia</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-orange-300 font-semibold group-hover:text-orange-200 transition-colors">
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all ${
                currentPage === i ? "w-8 bg-orange-500" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Input } from "@/common/components/ui/input"
import { LoadingCard } from "@/common/components/ui/loading"
import { useToast } from "@/common/hooks/useToast"
import { executeApiCall } from "@/common/utils/executeApiCall"
import { activityService } from "@/features/activities/services/activity.service"
import { ROUTES } from "@/common/constants/routes"
import { Calendar, MapPin, Users, CheckCircle, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react"

const PAGE_SIZE = 30

const SUB_TYPE_OPTIONS = Object.entries(SUB_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const STATUS_BADGE = {
  ended: "bg-red-100 text-red-700 border-red-200",
  ongoing: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Đã kết thúc":
      return STATUS_BADGE.ended
    case "Đang diễn ra":
      return STATUS_BADGE.ongoing
    case "Sắp diễn ra":
    case "Đang đăng ký":
      return STATUS_BADGE.upcoming
    default:
      return STATUS_BADGE.default
  }
}

export default function ActivitiesList() {
  const toast = useToast()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [subTypeFilter, setSubTypeFilter] = useState("all")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [minParticipantsFilter, setMinParticipantsFilter] = useState("")
  const [maxParticipantsFilter, setMaxParticipantsFilter] = useState("")
  const [organizerFilter, setOrganizerFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token")
      try {
        const response = await executeApiCall(
          activityService.getAllActivities.bind(activityService),
          [1, PAGE_SIZE, null, token],
          { setLoading, setError }
        )
        // Handle different response formats
        let list = []
        if (response?.data) {
          // Try different possible response structures
          if (Array.isArray(response.data)) {
            list = response.data
          } else if (Array.isArray(response.data.data)) {
            list = response.data.data
          } else if (Array.isArray(response.data.items)) {
            list = response.data.items
          } else if (response.data.data && Array.isArray(response.data.data.items)) {
            list = response.data.data.items
          } else if (response.data.data && Array.isArray(response.data.data.data)) {
            list = response.data.data.data
          }
        }
        console.log("Activities loaded:", list.length, list)
        setActivities(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error("Không thể tải danh sách hoạt động:", err)
        toast.error(err?.message || "Không thể tải danh sách hoạt động.")
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        !search ||
        activity?.title?.toLowerCase().includes(search.toLowerCase()) ||
        activity?.description?.toLowerCase().includes(search.toLowerCase())
      const matchesSubType = subTypeFilter === "all" || activity?.subType === subTypeFilter

      const startDate = activity?.startDate
      const endDate = activity?.endDate
      const matchesDateFrom = !dateFromFilter || (startDate && startDate >= dateFromFilter)
      const matchesDateTo = !dateToFilter || (endDate && endDate <= dateToFilter)

      const participants = activity?.numberOfParticipants ?? activity?.currentParticipants ?? 0
      const matchesMin = !minParticipantsFilter || participants >= Number(minParticipantsFilter)
      const matchesMax = !maxParticipantsFilter || participants <= Number(maxParticipantsFilter)

      const matchesOrganizer =
        !organizerFilter ||
        (activity?.organizer || "")
          .toLowerCase()
          .includes(organizerFilter.toLowerCase())

      return (
        matchesSearch &&
        matchesSubType &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesMin &&
        matchesMax &&
        matchesOrganizer
      )
    })
  }, [
    activities,
    dateFromFilter,
    dateToFilter,
    maxParticipantsFilter,
    minParticipantsFilter,
    organizerFilter,
    search,
    subTypeFilter,
  ])

  const hasActiveFilters = useMemo(() => {
    return (
      subTypeFilter !== "all" ||
      dateFromFilter ||
      dateToFilter ||
      minParticipantsFilter ||
      maxParticipantsFilter ||
      organizerFilter
    )
  }, [subTypeFilter, dateFromFilter, dateToFilter, minParticipantsFilter, maxParticipantsFilter, organizerFilter])

  const handleResetFilters = () => {
    setSubTypeFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinParticipantsFilter("")
    setMaxParticipantsFilter("")
    setOrganizerFilter("")
  }

  const appliedFilterTags = useMemo(() => {
    const tags = []
    if (subTypeFilter !== "all") tags.push({ key: "type", label: SUB_TYPE_LABELS[subTypeFilter] })
    if (dateFromFilter) tags.push({ key: "dateFrom", label: `Từ ${dateFromFilter}` })
    if (dateToFilter) tags.push({ key: "dateTo", label: `Đến ${dateToFilter}` })
    if (organizerFilter) tags.push({ key: "organizer", label: organizerFilter })
    if (minParticipantsFilter) tags.push({ key: "min", label: `≥ ${minParticipantsFilter} người` })
    if (maxParticipantsFilter) tags.push({ key: "max", label: `≤ ${maxParticipantsFilter} người` })
    return tags
  }, [dateFromFilter, dateToFilter, maxParticipantsFilter, minParticipantsFilter, organizerFilter, subTypeFilter])

  const handleRemoveTag = (key) => {
    switch (key) {
      case "type":
        setSubTypeFilter("all")
        break
      case "dateFrom":
        setDateFromFilter("")
        break
      case "dateTo":
        setDateToFilter("")
        break
      case "organizer":
        setOrganizerFilter("")
        break
      case "min":
        setMinParticipantsFilter("")
        break
      case "max":
        setMaxParticipantsFilter("")
        break
      default:
        break
    }
  }

  const runningActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const status = (activity?.status || "").toLowerCase()
        return status.includes("đang") || status.includes("sắp")
      }),
    [activities]
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingCard text="Đang tải danh sách hoạt động..." />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="glass bg-red-50 border-red-100">
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="bg-orange-100 text-orange-700">Hoạt động</Badge>
        <h1 className="text-3xl font-bold text-gray-900">Khám phá sự kiện nổi bật</h1>
        <p className="text-gray-600">
          Danh sách workshop, cuộc thi sáng tạo và hội thao bạn có thể tham gia ngay hôm nay.
        </p>
      </div>

      {(runningActivities.length > 0 || activities.length > 0) && (
        <ActivitiesCarousel activities={runningActivities.length > 0 ? runningActivities.slice(0, 10) : activities.slice(0, 10)} />
      )}

      <Card className="glass overflow-visible">
        <CardContent className="py-6 space-y-4 overflow-visible">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
            <Input
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border-orange-200 md:col-span-2 lg:col-span-1"
            />
            <FilterSelect
              value={subTypeFilter}
              onChange={setSubTypeFilter}
              options={SUB_TYPE_OPTIONS}
              className="md:w-full"
            />
            <Button
              type="button"
              variant="outline"
              className="border-orange-200 text-orange-600 h-12 rounded-xl"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              {showFilters ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                className="text-orange-600 h-12 rounded-xl"
                onClick={handleResetFilters}
              >
                Xóa lọc
              </Button>
            )}
          </div>

          {appliedFilterTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {appliedFilterTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/60 px-3 py-1 text-xs font-medium text-orange-700 transition hover:border-orange-300"
                  onClick={() => handleRemoveTag(tag.key)}
                >
                  <span>{tag.label}</span>
                  <span className="text-orange-500">×</span>
                </button>
              ))}
            </div>
          )}

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FilterField label="Ngày bắt đầu từ">
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Ngày kết thúc đến">
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Đơn vị tổ chức">
                <Input
                  placeholder="Ví dụ: Phòng Đoàn"
                  value={organizerFilter}
                  onChange={(e) => setOrganizerFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Số người tham gia tối thiểu">
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 10"
                  value={minParticipantsFilter}
                  onChange={(e) => setMinParticipantsFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              <FilterField label="Số người tham gia tối đa">
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 100"
                  value={maxParticipantsFilter}
                  onChange={(e) => setMaxParticipantsFilter(e.target.value)}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FilterField>
              </div>
          )}
        </CardContent>
      </Card>

      {filteredActivities.length === 0 ? (
        <Card className="glass bg-gray-50 border-dashed">
          <CardContent className="py-10 text-center text-gray-500">
            Không tìm thấy hoạt động phù hợp với bộ lọc hiện tại.
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
          {filteredActivities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityListItem({ activity }) {
  const navigate = useNavigate()
  const participationCount = activity?.numberOfParticipants ?? activity?.currentParticipants ?? 0
  const maxParticipants = activity?.maxParticipants ?? activity?.capacity ?? "∞"
  const categoryLabel = activity?.category === 1 ? "Hoạt động" : "Sự kiện"
  const detailLink = ROUTES.ACTIVITY.VIEW_ACTIVITY.replace(":id", activity.id)
  const participationRate =
    maxParticipants === "∞" ? null : Math.min(participationCount / (maxParticipants || 1), 1)

  return (
    <div className="flex flex-col gap-4 p-5 !mhover:bg-orange-50/50 transition-colors md:flex-row md:items-stretch">
      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 md:w-32 md:h-32">
        <img
          src={activity.thumbnailUrl || activity.thumbnail || "/placeholder.svg"}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-stretch">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(activity.status)}`}>
              {activity.status || "Đang cập nhật"}
            </Badge>
            {activity.subType && (
              <Badge variant="outline" className="text-xs border-gray-200">
                {SUB_TYPE_LABELS[activity.subType] || activity.subType}
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">{activity.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>

          <div className="mt-3 grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {activity.location || "Đang cập nhật"}
            </span>
            <span className="flex items-center gap-1 text-orange-600">
              <Users className="h-3 w-3" />
              {participationCount}/{maxParticipants} người
            </span>
          </div>

          {participationRate !== null && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tiến độ đăng ký</span>
                <span className="font-medium text-orange-600">{Math.round(participationRate * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                  style={{ width: `${Math.round(participationRate * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-3 md:w-48">
          <Button className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate(detailLink)}>
            Xem chi tiết
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={() => navigate(ROUTES.ACTIVITY.REGISTER_ACTIVITY.replace(":id", activity.id))}
          >
            Đăng ký
          </Button>
          <Link to={detailLink} className="text-center text-xs text-orange-500 hover:underline">
            Sao chép link →
          </Link>
        </div>
      </div>
    </div>
  )
}

function FilterField({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      {children}
    </div>
  )
}

function FilterSelect({ value, onChange, options, className }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selected = options.find((option) => option.value === value)

  return (
    <div ref={containerRef} className={`relative z-10 ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-lg border px-4 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
          open ? "border-orange-400 ring-2 ring-orange-500" : "border-orange-200"
        }`}
      >
        <span className="truncate">
          {selected ? selected.label : "Loại hoạt động"}
        </span>
        <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-orange-100 bg-white shadow-xl overflow-hidden">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                value === option.value
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

