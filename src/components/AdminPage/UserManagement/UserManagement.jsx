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
  const [openDropdownId, setOpenDropdownId] = useState(null)

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
      toast.success(USER_MESSAGES.CREATE_SUCCESS);
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
          <CardContent className="mt-4 p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-4 p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</div>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-4 p-4">
            <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "Student").length}</div>
            <p className="text-sm text-gray-600">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-4 p-4">
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
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
              className="w-full sm:w-[180px] !bg-white/15 !backdrop-blur-lg !border-white/30 hover:!bg-white/25 transition-all duration-300 !rounded-xl !shadow-lg focus-visible:!border-white/30 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              placeholder="Filter by status"
            >
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </Select>
            <Select 
              value={roleFilter} 
              onValueChange={setRoleFilter}
              className="w-full sm:w-[180px] !bg-white/15 !backdrop-blur-lg !border-white/30 hover:!bg-white/25 transition-all duration-300 !rounded-xl !shadow-lg focus-visible:!border-white/30 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              placeholder="Filter by role"
            >
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </Select>
          </div>

          {/* Users Table */}
          <div>
            <Table variant="admin">
              <TableHeader variant="admin">
                <TableRow variant="admin">
                  <TableHead variant="admin">Name</TableHead>
                  <TableHead variant="admin">Email</TableHead>
                  <TableHead variant="admin">Role</TableHead>
                  <TableHead variant="admin">Status</TableHead>
                  <TableHead variant="admin">Club</TableHead>
                  <TableHead variant="admin">Join Date</TableHead>
                  <TableHead variant="admin">Last Active</TableHead>
                  <TableHead variant="admin" className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody variant="admin">
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} variant="admin">
                    <TableCell variant="admin" className="font-medium">{user.name}</TableCell>
                    <TableCell variant="admin" className="text-gray-600">{user.email}</TableCell>
                    <TableCell variant="admin">{getRoleBadge(user.role)}</TableCell>
                    <TableCell variant="admin">{getStatusBadge(user.status)}</TableCell>
                    <TableCell variant="admin" className="text-gray-600">{user.club}</TableCell>
                    <TableCell variant="admin" className="text-gray-600">{user.joinDate}</TableCell>
                    <TableCell variant="admin" className="text-gray-600">{user.lastActive}</TableCell>
                    <TableCell variant="admin" className="text-center">
                      <DropdownMenu onOpenChange={(open) => {
                        console.log(`Dropdown for user ${user.id} is ${open ? 'opening' : 'closing'}`)
                        setOpenDropdownId(open ? user.id : null)
                      }}>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            className="h-14 w-14 p-2 hover:bg-gray-100 focus:bg-gray-100"
                          >
                            <span className="sr-only">Open menu</span>
                            {openDropdownId === user.id ? (
                              // Icon minus khi mở
                              <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                            ) : (
                              // Icon plus khi đóng
                              <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={8}
                        >
                          <DropdownMenuItem className="gap-2 px-2.5 py-2">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-2.5 py-2">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M12.4445 19.6875H20.9445M14.4443 5.68747L5.44587 14.6859C4.78722 15.3446 4.26719 16.1441 4.10888 17.062C3.94903 17.9888 3.89583 19.139 4.44432 19.6875C4.99281 20.236 6.14299 20.1828 7.0698 20.0229C7.98772 19.8646 8.78722 19.3446 9.44587 18.6859L18.4443 9.68747M14.4443 5.68747C14.4443 5.68747 17.4443 2.68747 19.4443 4.68747C21.4443 6.68747 18.4443 9.68747 18.4443 9.68747M14.4443 5.68747L18.4443 9.68747" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-2.5 py-2 text-red-600" onClick={() => handleDeleteUser(user.id)}>
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M8 6H19C19.5523 6 20 6.44772 20 7V17C20 17.5523 19.5523 18 19 18H8L2 12L5 9M16 9L13.0001 11.9999M13.0001 11.9999L10 15M13.0001 11.9999L10.0002 9M13.0001 11.9999L16.0002 15" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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