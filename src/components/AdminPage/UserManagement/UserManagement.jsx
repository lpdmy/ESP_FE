import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Upload } from "lucide-react"
import AddUserDialog from "./AddUserDialog"
import { useAuthApi } from "@/hooks/useAuthApi"
import { USER_MESSAGES } from "@/common/constants/messages"
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
  const { createUser } = useAuthApi();
  const [isDropdownOpen, setDropdownOpen] = useState(false)

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
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
    )

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      Moderator: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      Student: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return <Badge className={roleColors[role] || roleColors.Student}>{role}</Badge>
  }

  const handleExcelImport = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      alert(`Selected file: ${file.name}. Excel import functionality would be implemented here.`)
      event.target.value = ""
    }
  }

  const handleCreateUser = async (newUser) => {
    setIsLoading(true);
    try {
      await createUser(newUser);
      setIsSuccess(true);
      setUsers([...users, newUser])
      setIsModalOpen(false)
      toast.success(USER_MESSAGES.CREATE_SUCCESS);s
    } catch (err) {
      toast.error(USER_MESSAGES.SYSTEM_ERROR +  err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="excel-import"
            />
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Import from Excel
            </Button>
          </div>
          <AddUserDialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onCreateUser={handleCreateUser}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</div>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "Student").length}</div>
            <p className="text-sm text-gray-600">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "Admin" || u.role === "Moderator").length}
            </div>
            <p className="text-sm text-gray-600">Staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Users</CardTitle>
          <CardDescription>Search and filter users by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-gray-600">{user.club}</TableCell>
                    <TableCell className="text-gray-600">{user.joinDate}</TableCell>
                    <TableCell className="text-gray-600">{user.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                         <DropdownMenuTrigger onClick={() => setDropdownOpen(!isDropdownOpen)}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}