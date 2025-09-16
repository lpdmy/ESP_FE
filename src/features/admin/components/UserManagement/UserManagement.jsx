import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/common/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Upload, ChevronDown } from "lucide-react"
import AddUserDialog from "./AddUserDialog"
import { useAuthApi } from "@/features/auth/hooks/useAuthApi"
import { toast } from "react-toastify";

const mockUsers = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@fpt.edu.vn", role: "Student", status: "Active", joinDate: "2024-01-15", lastActive: "2024-03-20", club: "Programming Club" },
  { id: 2, name: "Trần Thị Bình", email: "binh.tran@fpt.edu.vn", role: "Student", status: "Active", joinDate: "2024-02-10", lastActive: "2024-03-19", club: "Design Club" },
  { id: 3, name: "Lê Minh Cường", email: "cuong.le@fpt.edu.vn", role: "Admin", status: "Active", joinDate: "2023-09-01", lastActive: "2024-03-20", club: "Admin" },
  { id: 4, name: "Phạm Thu Dung", email: "dung.pham@fpt.edu.vn", role: "Student", status: "Inactive", joinDate: "2024-01-20", lastActive: "2024-02-15", club: "Music Club" },
  { id: 5, name: "Hoàng Văn Em", email: "em.hoang@fpt.edu.vn", role: "Moderator", status: "Active", joinDate: "2023-11-05", lastActive: "2024-03-18", club: "Sports Club" },
]

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openActionDropdownId, setOpenActionDropdownId] = useState(null)
  const { createUser } = useAuthApi();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const getStatusBadge = (status) =>
    status === "Active" ? (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full px-2 py-1 text-xs font-medium">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 rounded-full px-2 py-1 text-xs font-medium">Inactive</Badge>
    )

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "bg-purple-100 text-purple-800",
      Moderator: "bg-blue-100 text-blue-800",
      Student: "bg-green-100 text-green-800",
    }
    return (
      <Badge className={`${roleColors[role] || "bg-gray-100 text-gray-800"} rounded-full px-2 py-1 text-xs font-medium`}>
        {role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản học sinh và giáo viên</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="student">Học sinh</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Hoạt động cuối</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-medium text-sm">
                            {user.name.split(' ').pop().charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.joinDate}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.lastActive}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.club}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setOpenActionDropdownId(openActionDropdownId === user.id ? null : user.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
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

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateUser={createUser}
      />
    </div>
  )
}
