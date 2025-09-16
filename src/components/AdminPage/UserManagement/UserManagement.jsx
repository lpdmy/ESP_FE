import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Upload, ChevronDown } from "lucide-react"
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
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 rounded-full px-2 py-1 text-xs font-medium">Inactive</Badge>
    )

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      Moderator: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      Student: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return <Badge className={`${roleColors[role] || roleColors.Student} rounded-full px-2 py-1 text-xs font-medium`}>{role}</Badge>
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
      toast.success(USER_MESSAGES.CREATE_SUCCESS);
    } catch (err) {
      toast.error(USER_MESSAGES.SYSTEM_ERROR +  err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
        <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="!bg-blue-600 hover:!bg-blue-600 !text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add New User
            </Button>
      </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm pt-6">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              <p className="text-sm text-gray-500 mt-1">Total Users</p>
          </CardContent>
        </Card>
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm pt-6">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</div>
              <p className="text-sm text-gray-500 mt-1">Active Users</p>
          </CardContent>
        </Card>
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm pt-6">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === "Student").length}</div>
              <p className="text-sm text-gray-500 mt-1">Students</p>
          </CardContent>
        </Card>
          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm pt-6">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === "Admin" || u.role === "Moderator").length}
            </div>
              <p className="text-sm text-gray-500 mt-1">Staff</p>
          </CardContent>
        </Card>
      </div>

        {/* Users Table Section */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Users</CardTitle>
            <CardDescription className="text-gray-600">Search and filter users by various criteria</CardDescription>
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
                  className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
              
              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-[180px] h-10 justify-between !text-gray-600 !border-gray-300 hover:!text-blue-600 hover:!border-blue-600 hover:!bg-blue-50"
                  >
                    {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Role Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-[180px] h-10 justify-between !text-gray-600 !border-gray-300 hover:!text-blue-600 hover:!border-blue-600 hover:!bg-blue-50"
                  >
                    {roleFilter === "all" ? "All Roles" : 
                     roleFilter === "student" ? "Student" :
                     roleFilter === "moderator" ? "Moderator" : "Admin"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("student")}>
                    Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("moderator")}>
                    Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                    Admin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>

          {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Name</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Email</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Role</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Status</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Club</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Join Date</th>
                    <th className="text-left font-medium text-gray-900 py-3 px-4">Last Active</th>
                    <th className="text-center font-medium text-gray-900 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{user.name}</td>
                      <td className="py-4 px-4 text-gray-600">{user.email}</td>
                      <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-4 px-4 text-gray-600">{user.club}</td>
                      <td className="py-4 px-4 text-gray-600">{user.joinDate}</td>
                      <td className="py-4 px-4 text-gray-600">{user.lastActive}</td>
                <td className="py-4 px-4 text-center">
                  <DropdownMenu onOpenChange={(open) => setOpenActionDropdownId(open ? user.id : null)}>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer hover:bg-blue-100 rounded-full p-2 transition-colors">
                        {openActionDropdownId === user.id ? (
                          <svg className="h-6 w-6 text-blue-600 hover:text-blue-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" />
                            <line x1="6" y1="10" x2="14" y2="10" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-blue-600 hover:text-blue-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" />
                            <line x1="10" y1="5" x2="10" y2="15" />
                            <line x1="5" y1="10" x2="15" y2="10" />
                          </svg>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-600 focus:text-red-600" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                    </tr>
                ))}
                </tbody>
              </table>
          </div>

          {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No users found matching your criteria.</p>
              </div>
          )}
        </CardContent>
      </Card>

        {/* Add User Dialog */}
        <AddUserDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onCreateUser={handleCreateUser}
        />
    </div>
  )
}