import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Textarea } from "@/common/components/ui/textarea"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu"
import {
  Users2,
  GraduationCap,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Search,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const mockClubsClasses = [
  {
    id: 1,
    name: "Câu lạc bộ Lập trình",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 45,
    leader: "Nguyễn Văn An",
    teacher: "TS. Trần Minh Tuấn",
    description: "Học các ngôn ngữ lập trình và xây dựng dự án cùng nhau",
    category: "Công nghệ",
    meetingTime: "Thứ 6 hàng tuần 2:00 PM",
  },
  {
    id: 2,
    name: "Câu lạc bộ Thiết kế",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 32,
    leader: "Lê Thị Bình",
    teacher: "ThS. Nguyễn Hồng Nhung",
    description: "Thiết kế UI/UX, đồ họa và các dự án sáng tạo",
    category: "Thiết kế",
    meetingTime: "Thứ 3 hàng tuần 3:00 PM",
  },
  {
    id: 3,
    name: "Câu lạc bộ Âm nhạc",
    type: "Câu lạc bộ",
    status: "Tạm ngưng",
    members: 18,
    leader: "Hoàng Thu Dung",
    teacher: "ThS. Phạm Văn Long",
    description: "Thưởng thức âm nhạc, học nhạc cụ và biểu diễn",
    category: "Nghệ thuật",
    meetingTime: "Thứ 7 hàng tuần 4:00 PM",
  },
  {
    id: 4,
    name: "Câu lạc bộ Thể thao",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 67,
    leader: "Trần Văn Mạnh",
    teacher: "ThS. Lê Thị Hoa",
    description: "Các hoạt động thể thao và rèn luyện sức khỏe",
    category: "Thể thao",
    meetingTime: "Thứ 2, 4, 6 5:00 PM",
  },
  {
    id: 5,
    name: "Câu lạc bộ Văn học",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 23,
    leader: "Phạm Thị Mai",
    teacher: "TS. Hoàng Văn Đức",
    description: "Đọc sách, viết văn và thảo luận văn học",
    category: "Văn học",
    meetingTime: "Thứ 5 hàng tuần 3:00 PM",
  },
]

export default function ClubClassManagement() {
  const [clubsClasses, setClubsClasses] = useState(mockClubsClasses)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [formData, setFormData] = useState({
    name: "",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 0,
    leader: "",
    teacher: "",
    description: "",
    category: "",
    meetingTime: "",
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedItems = clubsClasses
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      }
      return 0
    })

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingItem) {
      setClubsClasses(clubsClasses.map((item) => (item.id === editingItem.id ? { ...formData, id: editingItem.id } : item)))
    } else {
      const newItem = { ...formData, id: Date.now() }
      setClubsClasses([...clubsClasses, newItem])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Câu lạc bộ",
      status: "Hoạt động",
      members: 0,
      leader: "",
      teacher: "",
      description: "",
      category: "",
      meetingTime: "",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    setClubsClasses(clubsClasses.filter((item) => item.id !== id))
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      "Hoạt động": "bg-green-100 text-green-800 hover:bg-green-100",
      "Tạm ngưng": "bg-red-100 text-red-800 hover:bg-red-100",
      "Đã hoàn thành": "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return <Badge className={statusColors[status] || statusColors["Hoạt động"]}>{status}</Badge>
  }

  const SortHeader = ({ field, children }) => (
    <TableHead className="cursor-pointer hover:bg-gray-50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Câu lạc bộ</h1>
          <p className="text-gray-600 mt-1">Quản lý các câu lạc bộ học sinh</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa Câu lạc bộ" : "Tạo Câu lạc bộ mới"}</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết cho câu lạc bộ.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                      <SelectItem value="Tạm ngưng">Tạm ngưng</SelectItem>
                      <SelectItem value="Đã hoàn thành">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="leader">Chủ nhiệm</Label>
                  <Input id="leader" value={formData.leader} onChange={(e) => setFormData({ ...formData, leader: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher">Giáo viên phụ trách</Label>
                  <Input id="teacher" value={formData.teacher} onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="meetingTime">Thời gian họp</Label>
                  <Input id="meetingTime" value={formData.meetingTime} onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })} required />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingItem ? "Cập nhật" : "Tạo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{clubsClasses.length}</div>
            <p className="text-sm text-gray-600">Tổng CLB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{clubsClasses.filter((i) => i.status === "Hoạt động").length}</div>
            <p className="text-sm text-gray-600">CLB hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{clubsClasses.filter((i) => i.status === "Tạm ngưng").length}</div>
            <p className="text-sm text-gray-600">CLB tạm ngưng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {clubsClasses.reduce((sum, item) => sum + item.members, 0)}
            </div>
            <p className="text-sm text-gray-600">Tổng số thành viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Danh sách Câu lạc bộ</CardTitle>
          <CardDescription>Quản lý tất cả CLB học sinh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="hoạt động">Hoạt động</SelectItem>
                <SelectItem value="tạm ngưng">Tạm ngưng</SelectItem>
                <SelectItem value="đã hoàn thành">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader field="name">Tên</SortHeader>
                  <SortHeader field="status">Trạng thái</SortHeader>
                  <SortHeader field="category">Danh mục</SortHeader>
                  <SortHeader field="leader">Chủ nhiệm</SortHeader>
                  <SortHeader field="teacher">Giáo viên phụ trách</SortHeader>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-gray-600">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.leader}</TableCell>
                    <TableCell>{item.teacher}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
